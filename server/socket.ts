import { Server as SocketServer } from "socket.io";
import type { Server as HTTPServer } from "node:http";
import {
	DUPLICATE_TILES,
	HAND_SIZE,
	JoinError,
	PlaceError,
	StartError,
	TILE_COLORS,
	TILE_SHAPES,
} from "../common/constants.js";
import { verifyTile, calculatePoints, JWTClaims, countTiles } from "../common/util.js";
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

const fullDeck = TILE_COLORS.map((color) => {
	return TILE_SHAPES.map((shape) => {
		return Array<Tile>(DUPLICATE_TILES).fill({ color, shape });
	});
}).flat(2);
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
		socket
			.once("mounted", () => {
				socket.emit("roomsUpdate", getPublicRooms());
				const roomId = [...socket.rooms.values()][1];
				if (!roomId) return;
				const room = rooms[roomId];
				if (!room) return;
				socket.emit("playersUpdate", room.players);
			})
			.on("createRoom", async (roomData, callback) => {
				const roomId = generateRoomId();
				if (rooms[roomId]) return callback();
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

				socket.data.username = roomData.username;
				room.players[roomData.username] = { index: 0, score: 0 };
				rooms[roomId] = room;

				io.emit("roomsUpdate", getPublicRooms());
				io.to(roomId).emit("playersUpdate", room.players);

				const jwt = await new SignJWT({ username: roomData.username } as JWTClaims)
					.setProtectedHeader({ alg: "HS256" })
					.setIssuedAt()
					.sign(secret);

				callback(room, jwt);
			})
			.on("joinRoom", async (roomId, auth, callback) => {
				const { username } =
					"jwt" in auth
						? ((await jwtVerify(auth.jwt, secret)).payload as JWTClaims)
						: auth;
				socket.data.username = username;

				const room = rooms[roomId];
				if (!room) return callback(JoinError.UndefinedRoom);

				if (room?.host !== username) {
					if (room?.players[username]) return callback(JoinError.DuplicateUsername);
					room.players[username] = { index: 0, score: 0 };
				}
				if (room.started) return callback(JoinError.AlreadyStarted);
				socket.join(roomId);
				callback();
				io.emit("roomsUpdate", getPublicRooms());
				io.to(roomId).emit("playersUpdate", room.players);
			})
			.on("startGame", async (callback) => {
				const roomId = [...socket.rooms.values()][1];
				if (!roomId) return callback(StartError.NotInRoom);
				const room = rooms[roomId];
				if (!room) return callback(StartError.UndefinedRoom);
				if (room.started) return callback(StartError.AlreadyStarted);

				room.started = true;

				room.board[0] = {};
				room.board[0][0] = { ...getRandomTile(room.deck, true), x: 0, y: 0 };
				io.to(roomId).emit("tilesPlaced", [room.board[0][0]]);

				const allPlayers = await io.in(roomId).fetchSockets();
				for (const player of allPlayers) {
					player.emit(
						"gameStart",
						(hands[player.data.username] ??= generateHand(room.deck)),
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
				io.emit("roomsUpdate", getPublicRooms());
			})
			.on("placeTile", async (tiles, callback) => {
				const roomId = [...socket.rooms.values()][1];
				if (!roomId || !socket.data.username) return callback(PlaceError.NotInRoom);
				const room = rooms[roomId];
				if (!room) return callback(PlaceError.UndefinedRoom);

				const hand = [...(hands[socket.data.username] ?? [])];

				const board = structuredClone(room.board);
				for (const tile of tiles) {
					if (board[tile.y]?.[tile.x]) return callback(PlaceError.AlreadyPlaced);
					(board[tile.y] ??= {})[tile.x] = tile;

					const index = hand.findIndex(
						(heldTile) =>
							heldTile.color === tile.color && heldTile.shape === tile.shape,
					);
					if (index === -1) return callback(PlaceError.MissingTile);

					const newTile = getRandomTile(room.deck);
					if (newTile) hand[index] = newTile;
					else hand.splice(index, 1);
				}

				for (const tile of tiles) {
					const error = verifyTile(tile, board);
					if (error) return callback(error);
				}

				room.board = board;
				const player = room.players[socket.data.username];
				room.players[socket.data.username] = {
					index: player?.index ?? 0,
					score: (player?.score ?? 0) + calculatePoints(tiles, board),
				};
				io.to(roomId).emit("tilesPlaced", tiles);
				io.to(roomId).emit("playersUpdate", room.players);
				callback((hands[socket.data.username] = sortHand(hand)));
			})
			.on("disconnect", () => {
				// TODO
			});
	});
}

function getPublicRooms() {
	return Object.fromEntries(
		Object.entries(rooms).filter(([, room]) => !room.private && !room.started),
	);
}

function generateRoomId() {
	const factor = 6;
	const power = 10 ** factor;
	const dateSalt = Date.now() % power;
	return (
		Math.floor(Math.random() * power + dateSalt).toString(36) +
		Math.floor(Math.random() * power + dateSalt).toString(36)
	).substring(0, 8);
}

function sortHand(hand: Tile[]) {
	return hand.sort(
		(one, two) =>
			TILE_COLORS.indexOf(one.color) - TILE_COLORS.indexOf(two.color) ||
			TILE_SHAPES.indexOf(one.shape) - TILE_SHAPES.indexOf(two.shape),
	);
}

function getRandomTile(deck: Tile[], required: true): Tile;
function getRandomTile(deck: Tile[], required?: false): Tile | undefined;
function getRandomTile(deck: Tile[], required = false): Tile | undefined {
	const index = Math.floor(Math.random() * deck.length);
	const tile = deck[index];
	if (!tile && required) throw new RangeError("Deck is empty");
	deck.splice(index, 1);
	return tile;
}

function generateHand(deck: Tile[], hand: Tile[] = []) {
	while (deck.length && hand.length < HAND_SIZE) hand.push(getRandomTile(deck, true));
	return sortHand(hand);
}
