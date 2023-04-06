import {
	DUPLICATE_TILES,
	HAND_SIZE,
	PlaceError,
	QWIRKLE_LENGTH,
	TILE_COLORS,
	TILE_SHAPES,
	TileColor,
	TileShape,
} from "./constants.js";
import type { Tile, Board, Location, PlacedTile, Rooms, PublicRooms } from "./types.js";

export function getUsername() {
	try {
		const jwt = localStorage.getItem("auth");
		if (!jwt) return null;
		const encoded = jwt?.split(".")[1];
		if (!encoded) throw new SyntaxError("Invalid JWT");
		const { username } = JSON.parse(window.atob(encoded)) as JWTClaims;
		if (!username || typeof username !== "string")
			throw new TypeError("Username must be a string");
		return username;
	} catch (error) {
		console.error(error);
		return null;
	}
}
export type JWTClaims = { username: string };

export function verifyTile(location: Location, board: Board): PlaceError | undefined {
	const tile = board[location.y]?.[location.x];
	if (!tile) return PlaceError.UnknownTile;

	const neighborhood = getNeighborhood(tile, board);
	if (neighborhood.row.length < 2 && neighborhood.column.length < 2)
		return PlaceError.NoNeighbors;

	const rowResult = verifyLine(neighborhood.row);
	if (rowResult) return PlaceError[`${rowResult}RowItems`];
	const columnResult = verifyLine(neighborhood.column);
	if (columnResult) return PlaceError[`${columnResult}ColumnItems`];
}
function verifyLine(line: PlacedTile[]) {
	const isSameColor = line.every((tile) => tile.color === line[0]?.color);
	const isSameShape = line.every((tile) => tile.shape === line[0]?.shape);
	if (!(isSameColor || isSameShape)) return "Inconsistent";

	return (
		line.some((tile, index) => {
			const key = isSameColor ? tile.shape : tile.color;
			return (
				line.findIndex((item) => item[isSameColor ? "shape" : "color"] === key) !== index
			);
		}) && "Duplicate"
	);
}

export function calculatePoints(tiles: PlacedTile[], board: Board) {
	return getNeighborhoods(tiles, board).reduce(
		(acc, { length }) => acc + length * (Number(length === QWIRKLE_LENGTH) + 1),
		0,
	);
}
function getNeighborhoods(tiles: PlacedTile[], board: Board) {
	return tiles
		.map((tile) => {
			const { column, row } = getNeighborhood(tile, board);
			return [column, row];
		})
		.flat()
		.filter(
			(line, index, lines) =>
				line.length > 1 &&
				lines.findIndex(
					(foundLine) => foundLine[0] === line[0] && foundLine.at(-1) === line.at(-1),
				) === index,
		);
}
function getNeighborhood(tile: PlacedTile, board: Board) {
	let top = board[tile.y - 1]?.[tile.x],
		bottom = board[tile.y + 1]?.[tile.x],
		right = board[tile.y]?.[tile.x + 1],
		left = board[tile.y]?.[tile.x - 1];

	const neighborhood: { row: PlacedTile[]; column: PlacedTile[] } = { row: [], column: [] };

	if (left) {
		do {
			if (left.temporary === "ignore") break;
			neighborhood.row.unshift(left);
		} while ((left = board[tile.y]?.[left.x - 1]));
	}
	neighborhood.row.push(tile);
	if (right) {
		do {
			if (right.temporary === "ignore") break;
			neighborhood.row.push(right);
		} while ((right = board[tile.y]?.[right.x + 1]));
	}

	if (top) {
		do {
			if (top.temporary === "ignore") break;
			neighborhood.column.unshift(top);
		} while ((top = board[top.y - 1]?.[tile.x]));
	}
	neighborhood.column.push(tile);
	if (bottom) {
		do {
			if (bottom.temporary === "ignore") break;
			neighborhood.column.push(bottom);
		} while ((bottom = board[bottom.y + 1]?.[tile.x]));
	}

	return neighborhood;
}

export function countTiles(tiles: Tile[]) {
	return Math.max(count(tiles, "color"), count(tiles, "shape"));
}
function count(tiles: Tile[], key: "color" | "shape") {
	const counts: Partial<Record<TileColor | TileShape, number>> = {};
	let largestFound = 0;

	for (const tile of tiles.filter(
		(tile, index) =>
			tiles.findIndex(
				(foundTile) => foundTile.color === tile.color && foundTile.shape === tile.shape,
			) === index,
	)) {
		const value = tile[key];

		const count = (counts[value] ?? 0) + 1;
		if (count > largestFound) largestFound = count;

		counts[value] = count;
	}

	return largestFound * (Number(largestFound === QWIRKLE_LENGTH) + 1);
}

export function generateTileUrl({ color, shape }: Tile) {
	return `./tiles/${color}-${shape}.png`;
}

export function getPublicRooms(rooms: Rooms): PublicRooms {
	return Object.fromEntries(
		Object.entries(rooms)
			.filter(([, room]) => !room.private && !room.started)
			.map(([id, room]) => [
				id,
				{
					auth: room.auth,
					host: room.host,
					players: room.players,
					started: room.started,
					id: room.id,
				},
			]),
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

export function sortHand(hand: Tile[]) {
	return hand.sort(
		(one, two) =>
			TILE_COLORS.indexOf(one.color) - TILE_COLORS.indexOf(two.color) ||
			TILE_SHAPES.indexOf(one.shape) - TILE_SHAPES.indexOf(two.shape),
	);
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

export function generateHand(deck: Tile[], hand: Tile[] = []) {
	while (deck.length && hand.length < HAND_SIZE) hand.push(getRandomTile(deck, true));
	return sortHand(hand);
}

export function generateDeck() {
	return TILE_COLORS.map((color) => {
		return TILE_SHAPES.map((shape) => {
			return Array<Tile>(DUPLICATE_TILES).fill({ color, shape });
		});
	}).flat(2);
}
