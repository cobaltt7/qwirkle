import http from "node:http";
import url from "node:url";
import path from "node:path";
import fileSystem from "node:fs/promises";

import { Server } from "socket.io";
import serve from "serve-handler";
import generateError from "serve-handler/src/error.js";
import { ROOM_PARAMETER, TILE_COLORS, TILE_SHAPES } from "./common/constants.js";
import mime from "mime-types";

import type { SocketId } from "socket.io-adapter";
import type {
	ClientToServerEvents,
	InterServerEvents,
	PlacedTile,
	Rooms,
	ServerToClientEvents,
	SocketData,
	Tile,
} from "./common/types.js";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

mime.types.ts = "text/plain";
const PACKAGE_RESOLVES: Record<string, string> = {
	"/css/normalize.css": "modern-normalize",
	"/js/twemoji.js": "twemoji/dist/twemoji.esm.js",
	"/js/vue.js": "vue/dist/vue.esm-browser.js",
	"/js/vue-class-component.js": "vue-class-component/dist/vue-class-component.esm-browser.js",
};

const server = http
	.createServer((request, response) => {
		try {
			const requestUrl = new URL(request.url ?? "", `https://${request.headers.host}`);

			const packageName = PACKAGE_RESOLVES[requestUrl.pathname];
			if (packageName) {
				const resolved = require.resolve(packageName);

				return fileSystem.readFile(resolved, "utf8").then((file) => {
					if (path.extname(resolved) === ".js") {
						file = file.replaceAll(
							/import\s+(?<importedNames>.+?)\s+from\s+['"`](?<moduleName>[^.].*?)['"`]/gms,
							'import $<importedNames> from "./$<moduleName>.js"',
						);
					}

					response
						.writeHead(200, {
							"Content-Type": mime.lookup(resolved) || "text/plain",
						})
						.end(file);
				});
			}

			serve(request, response, {
				directoryListing: false,
				public: url.fileURLToPath(new URL("../", import.meta.url).toString()),
				headers: [
					{
						headers: [{ key: "Content-Type", value: "text/plain" }],
						source: "**.ts",
					},
				],
			});
		} catch (error) {
			response.writeHead(500).end(
				generateError({
					statusCode: 500,
					message: error.name + ": " + error.message,
				}),
			);
		}
	})
	.listen(3000, () => {
		console.log("Server up!");
	});

const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
	server,
);

const rooms: Rooms = {};

const hands: Record<SocketId, Tile[]> = {};
io.on("connection", (socket) => {
	const roomId = new URL(
		socket.request.url ?? "",
		`http://${socket.request.headers.host}`,
	).searchParams.get(ROOM_PARAMETER);
	if (!roomId) {
		socket.emit("roomsListUpdate", rooms);
		return;
	}
	socket.join(roomId);
	const deck = rooms[roomId]?.deck ?? Array.from(fullDeck);
	const room = (rooms[roomId] ??= {
		deck,
		board: { [0]: { [0]: { ...getRandomTile(deck, true), x: 0, y: 0 } } },
		host: socket.id,
		players: [],
	});

	rooms[roomId]?.players.push(socket.id);

	socket.emit("roomJoined", (hands[socket.id] ??= generateHand(deck)));
	io.emit("roomsListUpdate", rooms);
	Object.values(room.board)
		.flatMap((column) => Object.values(column))
		.forEach((tile) => socket.emit("tilePlaced", tile));

	socket
		.on("disconnect", () => {
			// TODO
		})
		.on("placeTile", (location, index, callback) => {
			// STEP 1: Gather base information.
			const hand = hands[socket.id] ?? generateHand(deck);
			const tile = hand[Number(index)];
			if (!tile) return callback("MISSING_TILE");
			const placed = { ...tile, ...location };

			// STEP 2: Check for collisions.
			const row = room.board[Number(location.y)] ?? {};
			if (row[location.x]) return callback("ALREADY_PLACED");

			// STEP 3: Check for neighbors.
			let top = room.board[location.y - 1]?.[Number(location.x)],
				bottom = room.board[location.y + 1]?.[Number(location.x)],
				right = row[location.x + 1],
				left = row[location.x - 1];
			if (!top && !bottom && !right && !left) return callback("NO_NEIGHBORS");

			// STEP 4: Check neighborhood to verify consistency.
			const neighborhood: { row: PlacedTile[]; column: PlacedTile[] } = {
				row: [],
				column: [],
			};
			//Step 4.0-4.3: Get neighborhood
			if (right || left) {
				if (left) {
					do neighborhood.row.unshift(left);
					while ((left = row[left.x - 1]));
				}
				neighborhood.row.push(placed);
				if (right) {
					do neighborhood.row.push(right);
					while ((right = row[right.x + 1]));
				}
			}
			if (top || bottom) {
				if (top) {
					do neighborhood.column.unshift(top);
					while ((top = room.board[top.y - 1]?.[Number(location.x)]));
				}
				neighborhood.column.push(placed);
				if (bottom) {
					do neighborhood.column.push(bottom);
					while ((bottom = room.board[bottom.y + 1]?.[Number(location.x)]));
				}
			}
			// Step 4.4: Check that the color OR the shape of each row item is the same
			// Step 4.5: Check that the other has no duplicates
			// Steps 4.6-4.7: Repeat for columns
			const rowResult = verifyLine(neighborhood.row);
			if (rowResult) return callback(`${rowResult}_ROW_ITEMS`);
			const columnResult = verifyLine(neighborhood.column);
			if (columnResult) return callback(`${columnResult}_COLUMN_ITEMS`);

			// STEP 5: Place the tile.
			row[Number(location.x)] = placed;
			room.board[Number(location.y)] = row;
			io.to(roomId).emit("tilePlaced", placed);

			// STEP 6: Update the user's hand.
			const newTile = getRandomTile(deck);
			if (newTile) hand[Number(index)] = newTile;
			else hand.splice(index, 1);
			callback((hands[socket.id] = sortHand(hand)));
		});
});

const fullDeck = TILE_COLORS.map((color) => {
	return TILE_SHAPES.map((shape) => {
		return Array<Tile>(3).fill({ color, shape });
	});
}).flat(2);

function getRandomTile(deck: Tile[], required: true): Tile;
function getRandomTile(deck: Tile[], required?: false): Tile | undefined;
function getRandomTile(deck: Tile[], required = false): Tile | undefined {
	const index = Math.floor(Math.random() * deck.length);
	const tile = deck[index];
	if (!tile && required) throw new RangeError("Deck is empty");
	deck.splice(index, 1);
	return tile;
}

function generateHand(deck: Tile[]) {
	const hand = [];
	while (deck.length > 0 && hand.length < 6) {
		hand.push(getRandomTile(deck, true));
	}
	return sortHand(hand);
}

function sortHand(hand: Tile[]) {
	return hand.sort(
		(one, two) =>
			TILE_COLORS.indexOf(one.color) - TILE_COLORS.indexOf(two.color) ||
			TILE_SHAPES.indexOf(one.shape) - TILE_SHAPES.indexOf(two.shape),
	);
}

function verifyLine(line: PlacedTile[]) {
	const isSameColor = line.every((tile) => tile.color === line[0]?.color);
	const isSameShape = line.every((tile) => tile.shape === line[0]?.shape);
	if (!(isSameColor || isSameShape)) return "INCONSISTENT";

	return (
		line.some((tile, index) => {
			const key = isSameColor ? tile.shape : tile.color;
			return (
				line.findIndex((item) => item[isSameColor ? "shape" : "color"] === key) !== index
			);
		}) && "DUPLICATE"
	);
}
