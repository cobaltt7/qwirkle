import { Server as SocketServer } from "socket.io";
import type { Server as HTTPServer } from "node:http";
import {
	JoinError,
	ExchangeError,
	PlaceError,
	StartError,
	EndReason,
	GO_OUT_BONUS,
} from "../common/constants.js";
import {
	calculatePoints,
	countTiles,
	generateDeck,
	generateHand,
	generateRoomId,
	getCurrentTurn,
	getPublicRooms,
	getRandomTile,
	sortHand,
	tilesInLine,
	verifyTile,
	type JWTClaims,
} from "../common/util.js";
import type {
	ClientToServerEvents,
	InterServerEvents,
	Rooms,
	ServerToClientEvents,
	SocketData,
	Tile,
	Room,
} from "../common/types.js";
import { SignJWT, jwtVerify } from "jose-node-esm-runtime";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

const fullDeck = generateDeck();
const rooms: Rooms = {};
const hands: Record<string, Tile[]> = {};

export default function connectIo(server: HTTPServer) {
	const io = new SocketServer<
		ClientToServerEvents,
		ServerToClientEvents,
		InterServerEvents,
		SocketData
	>(server);

	io.on("connection", (socket) => {
		socket.emit("roomsUpdate", getPublicRooms(rooms));
		const roomId = [...socket.rooms.values()][1];
		if (roomId) {
			const room = rooms[roomId];
			if (room) socket.emit("playersUpdate", room.players);
		}
		socket
			.on("createRoom", async (roomData, callback) => {
				const jwt = await new SignJWT({ username: roomData.username } as JWTClaims)
					.setProtectedHeader({ alg: "HS256" })
					.setIssuedAt()
					.sign(secret);
				socket.data.username = roomData.username;

				const roomId = generateRoomId();
				if (rooms[roomId]) return callback(jwt);
				const deck = Array.from(fullDeck);
				const room: Room = {
					deck,
					board: {},
					host: roomData.username,
					players: {},
					auth: roomData.auth,
					private: roomData.private,
					started: false,
					id: roomId,
				};

				room.players[roomData.username] = { index: 0, score: 0 };
				rooms[roomId] = room;

				socket.join(roomId);
				io.emit("roomsUpdate", getPublicRooms(rooms));
				io.to(roomId).emit("playersUpdate", room.players);

				callback(jwt, room);
			})
			.on("joinRoom", async (roomId, auth, callback) => {
				const { username } =
					"jwt" in auth
						? ((await jwtVerify(auth.jwt, secret)).payload as JWTClaims)
						: auth;
				socket.data.username = username;

				const room = rooms[roomId];
				if (!room) return callback(JoinError.UndefinedRoom);

				if (room?.players[username]) return callback(JoinError.DuplicateUsername);
				room.players[username] = { index: 0, score: 0 };

				if (room.started) return callback(JoinError.AlreadyStarted);
				socket.join(roomId);
				callback();
				io.emit("roomsUpdate", getPublicRooms(rooms));
				io.to(roomId).emit("playersUpdate", room.players);
			})
			.on("startGame", async (callback) => {
				const roomId = [...socket.rooms.values()][1];
				if (!roomId) return callback(StartError.NotInRoom);
				const room = rooms[roomId];
				if (!room) return callback(StartError.UndefinedRoom);
				if (room.started) return callback(StartError.AlreadyStarted);
				if (room.host !== socket.data.username) return callback(StartError.NoPermissions);

				room.started = true;

				room.board[0] = {};
				room.board[0][0] = { ...getRandomTile(room.deck, true), x: 0, y: 0 };
				io.to(roomId).emit("tilesPlaced", [room.board[0][0]], room.deck.length);

				const allPlayers = await io.in(roomId).fetchSockets();
				for (const player of allPlayers) {
					player.emit(
						"gameStart",
						(hands[player.data.username] = generateHand(room.deck)),
						room.board[0][0],
					);
				}

				const sortedPlayers = Object.entries(room.players)
					.map(([username]) => [username, countTiles(hands[username] ?? [])] as const)
					.sort(([, one], [, two]) => two - one);
				for (const [index, [username]] of sortedPlayers.entries()) {
					const player = room.players[username];
					if (!player) continue;
					player.index = index;
					room.players[username] = player;
				}

				io.to(roomId).emit("playersUpdate", room.players);
				io.emit("roomsUpdate", getPublicRooms(rooms));
			})
			.on("placeTiles", async (tiles, callback) => {
				const roomId = [...socket.rooms.values()][1];
				if (!roomId || !socket.data.username) return callback(PlaceError.NotInRoom);
				const room = rooms[roomId];
				if (!room) return callback(PlaceError.UndefinedRoom);

				const currentTurn = getCurrentTurn(room.players);
				if (socket.data.username !== currentTurn) return callback(PlaceError.NotYourTurn);

				const hand = [...(hands[socket.data.username] ?? [])];

				const board = structuredClone(room.board);
				const deck = structuredClone(room.deck);
				for (const tile of tiles) {
					if (board[tile.y]?.[tile.x]) return callback(PlaceError.AlreadyPlaced);
					(board[tile.y] ??= {})[tile.x] = tile;

					const index = hand.findIndex(
						(heldTile) =>
							heldTile.color === tile.color && heldTile.shape === tile.shape,
					);
					if (index === -1) return callback(PlaceError.MissingTile);

					const newTile = getRandomTile(deck);
					if (newTile) hand[index] = newTile;
					else hand.splice(index, 1);
				}

				for (const tile of tiles) {
					const error = verifyTile(tile, board);
					if (error) return callback(error);
				}

				if (!tilesInLine(tiles, board)) return callback(PlaceError.NotInLine);

				room.board = board;
				room.deck = deck;
				const player = room.players[socket.data.username];
				room.players[socket.data.username] = {
					index: (player?.index ?? 0) + Object.keys(room.players).length,
					score:
						(player?.score ?? 0) +
						calculatePoints(tiles, board) +
						GO_OUT_BONUS * +!hand.length,
				};
				io.to(roomId).emit("tilesPlaced", tiles, room.deck.length);
				io.to(roomId).emit("playersUpdate", room.players);
				callback((hands[socket.data.username] = sortHand(hand)));
				if (!hand.length) io.to(roomId).emit("gameEnd", EndReason.NoTiles);
			})
			.on("exchangeTiles", async (indexes, callback) => {
				const roomId = [...socket.rooms.values()][1];
				if (!roomId || !socket.data.username) return callback(ExchangeError.NotInRoom);
				const room = rooms[roomId];
				if (!room) return callback(ExchangeError.UndefinedRoom);

				const currentTurn = getCurrentTurn(room.players);
				if (socket.data.username !== currentTurn)
					return callback(ExchangeError.NotYourTurn);

				const hand = [...(hands[socket.data.username] ?? [])];
				const deck = structuredClone(room.deck);

				for (const index of indexes) {
					const newTile = getRandomTile(deck);
					if (!newTile) return callback(ExchangeError.DeckEmpty);

					hand[index] = newTile;
				}

				const tiles = indexes
					.map((index) => hand[index])
					.filter((tile): tile is Tile => !!tile);
				if (tiles.length !== indexes.length) return callback(ExchangeError.MissingTile);
				deck.push(...tiles);

				room.deck = deck;
				const player = room.players[socket.data.username];
				room.players[socket.data.username] = {
					index: (player?.index ?? 0) + Object.keys(room.players).length,
					score: player?.score ?? 0,
				};
				io.to(roomId).emit("playersUpdate", room.players);
				callback((hands[socket.data.username] = sortHand(hand)));
			});
	});
}
