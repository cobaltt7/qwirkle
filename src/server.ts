import http from "node:http";
import url from "node:url";
import fileSystem from "node:fs/promises";

import { Server } from "socket.io";
import serve from "serve-handler";
import generateError from "serve-handler/src/error.js";
import { TILE_COLORS, TILE_SHAPES } from "./constants.js";

import type { SocketId } from "socket.io-adapter";
import type {
	ClientToServerEvents,
	InterServerEvents,
	Location,
	PlacedTile,
	ServerToClientEvents,
	SocketData,
	Tile,
} from "./types.js";

const server = http
	.createServer((request, response) => {
		try {
			const requestUrl = new URL(request.url ?? "", `https://${request.headers.host}`);

			if (requestUrl.pathname === "/normalize.css") {
				fileSystem
					.readFile(
						new URL(
							"../../node_modules/modern-normalize/modern-normalize.css",
							import.meta.url,
						),
					)
					.then((css) => {
						response.writeHead(200, { "Content-Type": "text/css" }).end(css);
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
			response
				.writeHead(500)
				.end(
					generateError({ statusCode: 500, message: error.name + ": " + error.message }),
				);
		}
	})
	.listen(3000, () => {
		console.log("listening on *:3000");
	});

const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
	server,
);

/** Rows by columns. */
const board: Record<Location["y"], Record<Location["x"], PlacedTile>> = {};

const hands: Record<SocketId, Tile[]> = {};
io.on("connection", (socket) => {
	socket.emit("hand", (hands[socket.id] ??= generateHand()));
	Object.values(board)
		.flatMap((column) => Object.values(column))
		.forEach((tile) => socket.emit("place", tile, tile));

	socket.on("disconnect", () => {
		// console.log("user disconnected");
	});
	socket.on("turn", (location, index) => {
		// STEP 1: Gather base information.
		const hand = hands[socket.id] ?? generateHand();
		const tile = hand[index];
		if (!tile) return socket.emit("error", "MISSING_TILE", location);
		const placed = { ...tile, ...location };

		// STEP 2: Check for collisions.
		const row = board[location.y] ?? {};
		if (row[location.x]) return socket.emit("error", "ALREADY_PLACED", location);

		// STEP 3: Check for neighbors.
		let top = board[location.y - 1]?.[location.x],
			bottom = board[location.y + 1]?.[location.x],
			right = row[location.x + 1],
			left = row[location.x - 1];
		if (!top && !bottom && !right && !left)
			return socket.emit("error", "NO_NEIGHBORS", location);

		// STEP 4: Check neighborhood to verify consistency.
		const neighborhood: { row: PlacedTile[]; column: PlacedTile[] } = { row: [], column: [] };
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
				while ((top = board[top.y - 1]?.[location.x]));
			}
			neighborhood.column.push(placed);
			if (bottom) {
				do neighborhood.column.push(bottom);
				while ((bottom = board[bottom.y + 1]?.[location.x]));
			}
		}
		console.log(neighborhood);
		// Step 4.4: Check that the color OR the shape of each row item is the same
		// Step 4.5: Check that the other has no duplicates
		// Steps 4.6-4.7: Repeat for columns
		const rowResult = verifyStreet(neighborhood.row);
		if (rowResult) return socket.emit("error", `${rowResult}_ROW_ITEMS`, location);
		const columnResult = verifyStreet(neighborhood.column);
		if (columnResult) return socket.emit("error", `${columnResult}_COLUMN_ITEMS`, location);

		// STEP 5: Place the tile.
		row[location.x] = placed;
		board[location.y] = row;
		io.emit("place", tile, location);

		// STEP 6: Update the user's hand.
		const newTile = getRandomTile();
		if (newTile) hand[index] = newTile;
		else hand.slice(index, 1);
		socket.emit("hand", (hands[socket.id] = sortHand(hand)));
	});
});

const deck = TILE_COLORS.map((color) => {
	return TILE_SHAPES.map((shape) => {
		return Array<Tile>(3).fill({ color, shape });
	});
}).flat(2);

function getRandomTile(required: true): Tile;
function getRandomTile(required?: false): Tile | undefined;
function getRandomTile(required = false): Tile | undefined {
	const index = Math.floor(Math.random() * deck.length);
	const tile = deck[index];
	if (!tile && required) throw new RangeError("Deck is empty");
	deck.splice(index, 1);
	return tile;
}

(board[1] ??= {})[1] = { ...getRandomTile(true), x: 1, y: 1 };

function generateHand() {
	return sortHand(
		Array.from({ length: 6 }, () => getRandomTile(true)) as [
			Tile,
			Tile,
			Tile,
			Tile,
			Tile,
			Tile,
		],
	);
}

function sortHand<Tiles extends Tile[]>(hand: Tiles) {
	return hand.sort(
		(one, two) =>
			TILE_COLORS.indexOf(one.color) - TILE_COLORS.indexOf(two.color) ||
			TILE_SHAPES.indexOf(one.shape) - TILE_SHAPES.indexOf(two.shape),
	);
}

function verifyStreet(street: PlacedTile[]) {
	const isSameColor = street.every((tile) => tile.color === street[0]?.color);
	const isSameShape = street.every((tile) => tile.shape === street[0]?.shape);
	if (!(isSameColor || isSameShape)) return "INCONSISTENT";

	return (
		street.some((tile, index) => {
			const key = isSameColor ? tile.shape : tile.color;
			return (
				street.findIndex((item) => item[isSameColor ? "shape" : "color"] === key) !== index
			);
		}) && "DUPLICATE"
	);
}
