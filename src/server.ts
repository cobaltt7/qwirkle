import http from "node:http";
import url from "node:url";
import path from "node:path";
import fileSystem from "node:fs/promises";

import { Server } from "socket.io";
import serve from "serve-handler";
import generateError from "serve-handler/src/error.js";
import { TILE_COLORS, TILE_SHAPES } from "./common/constants.js";
import mime from "mime-types";

import type { SocketId } from "socket.io-adapter";
import type {
	ClientToServerEvents,
	InterServerEvents,
	Location,
	PlacedTile,
	ServerToClientEvents,
	SocketData,
	Tile,
} from "./common/types.js";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

mime.types.ts = "text/plain";
const PACKAGE_RESOLVES: Record<string, string> = {
	"/css/normalize.css": "modern-normalize",
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
						.writeHead(200, { "Content-Type": mime.lookup(resolved) || "text/plain" })
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

/** Y by X. */
const board: Record<Location["y"], Record<Location["x"], PlacedTile>> = {};

const hands: Record<SocketId, Tile[]> = {};
io.on("connection", (socket) => {
	socket.emit("hand", (hands[socket.id] ??= generateHand()));
	Object.values(board)
		.flatMap((column) => Object.values(column))
		.forEach((tile) => socket.emit("place", tile));

	socket.on("disconnect", () => {
		// console.log("user disconnected");
	});
	socket.on("turn", (location, index) => {
		// STEP 1: Gather base information.
		const hand = hands[socket.id] ?? generateHand();
		const tile = hand[Number(index)];
		if (!tile) return socket.emit("error", "MISSING_TILE", location);
		const placed = { ...tile, ...location };

		// STEP 2: Check for collisions.
		const row = board[Number(location.y)] ?? {};
		if (row[location.x]) return socket.emit("error", "ALREADY_PLACED", location);

		// STEP 3: Check for neighbors.
		let top = board[location.y - 1]?.[Number(location.x)],
			bottom = board[location.y + 1]?.[Number(location.x)],
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
				while ((top = board[top.y - 1]?.[Number(location.x)]));
			}
			neighborhood.column.push(placed);
			if (bottom) {
				do neighborhood.column.push(bottom);
				while ((bottom = board[bottom.y + 1]?.[Number(location.x)]));
			}
		}
		console.log(neighborhood);
		// Step 4.4: Check that the color OR the shape of each row item is the same
		// Step 4.5: Check that the other has no duplicates
		// Steps 4.6-4.7: Repeat for columns
		const rowResult = verifyLine(neighborhood.row);
		if (rowResult) return socket.emit("error", `${rowResult}_ROW_ITEMS`, location);
		const columnResult = verifyLine(neighborhood.column);
		if (columnResult) return socket.emit("error", `${columnResult}_COLUMN_ITEMS`, location);

		// STEP 5: Place the tile.
		row[Number(location.x)] = placed;
		board[Number(location.y)] = row;
		io.emit("place", placed);

		// STEP 6: Update the user's hand.
		const newTile = getRandomTile();
		if (newTile) hand[Number(index)] = newTile;
		else hand.splice(index, 1);
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

(board[0] ??= {})[0] = { ...getRandomTile(true), x: 0, y: 0 };

function generateHand() {
	const hand = [];
	while (deck.length > 0 && hand.length < 6) {
		hand.push(getRandomTile(true));
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
