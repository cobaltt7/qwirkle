import { TILE_COLORS, TILE_SHAPES } from "./constants.js";
import type { Board, JWTClaims, PlacedTile, PlaceError, Rooms, Tile } from "./types.js";

export function getUsername() {
	const jwt = localStorage.getItem("auth");
	if (!jwt) return null;
	const encoded = jwt?.split(".")[1];
	if (!encoded) return null;
	return (JSON.parse(window.atob(encoded)) as JWTClaims).username;
}

export function placeTile(tile: PlacedTile, board: Board): PlaceError | undefined {
	const row = board[tile.y] ?? {};
	if (row[tile.x]) return "ALREADY_PLACED";

	let top = board[tile.y - 1]?.[tile.x],
		bottom = board[tile.y + 1]?.[tile.x],
		right = row[tile.x + 1],
		left = row[tile.x - 1];
	if (!top && !bottom && !right && !left) return "NO_NEIGHBORS";

	const neighborhood: { row: PlacedTile[]; column: PlacedTile[] } = { row: [], column: [] };
	if (right || left) {
		if (left) {
			do neighborhood.row.unshift(left);
			while ((left = row[left.x - 1]));
		}
		neighborhood.row.push(tile);
		if (right) {
			do neighborhood.row.push(right);
			while ((right = row[right.x + 1]));
		}
	}
	if (top || bottom) {
		if (top) {
			do neighborhood.column.unshift(top);
			while ((top = board[top.y - 1]?.[tile.x]));
		}
		neighborhood.column.push(tile);
		if (bottom) {
			do neighborhood.column.push(bottom);
			while ((bottom = board[bottom.y + 1]?.[tile.x]));
		}
	}

	const rowResult = verifyLine(neighborhood.row);
	if (rowResult) return `${rowResult}_ROW_ITEMS`;
	const columnResult = verifyLine(neighborhood.column);
	if (columnResult) return `${columnResult}_COLUMN_ITEMS`;
}

export function getRandomTile(deck: Tile[], required: true): Tile;
export function getRandomTile(deck: Tile[], required?: false): Tile | undefined;
export function getRandomTile(deck: Tile[], required = false): Tile | undefined {
	const index = Math.floor(Math.random() * deck.length);
	const tile = deck[index];
	if (!tile && required) throw new RangeError("Deck is empty");
	deck.splice(index, 1);
	return tile;
}

export function generateHand(deck: Tile[]) {
	const hand = [];
	while (deck.length > 0 && hand.length < 6) {
		hand.push(getRandomTile(deck, true));
	}
	return sortHand(hand);
}

export function sortHand(hand: Tile[]) {
	return hand.sort(
		(one, two) =>
			TILE_COLORS.indexOf(one.color) - TILE_COLORS.indexOf(two.color) ||
			TILE_SHAPES.indexOf(one.shape) - TILE_SHAPES.indexOf(two.shape),
	);
}

export function verifyLine(line: PlacedTile[]) {
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

export function getPublicRooms(rooms: Rooms) {
	return Object.fromEntries(
		Object.entries(rooms).filter(([, room]) => !room.private && !room.started),
	);
}

export function generateRoomId() {
	const factor = 6;
	const power = 10 ** factor;
	const dateSalt = Date.now() % power;
	return (
		Math.floor(Math.random() * power + dateSalt).toString(36) +
		Math.floor(Math.random() * power + dateSalt).toString(36)
	).substring(0, 8);
}
