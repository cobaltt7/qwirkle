import { describe, expect, it } from "vitest";
import {
	verifyTile,
	calculatePoints,
	countTiles,
	generateTileUrl,
	generateRoomId,
	getPublicRooms,
	sortHand,
	getRandomTile,
	generateDeck,
} from "../common/util.ts";
import { PlaceError, TileColor, TileShape } from "../common/constants.ts";
import { Board, PlacedTile, Tile } from "../common/types";
import { generateHand } from "../common/util.ts";

describe("verifyTile", () => {
	it("should fail without neighbors", () =>
		expect(
			verifyTile({ x: 0, y: 0 }, [[{ x: 0, y: 0, color: "blue", shape: "circle" }]]),
		).toEqual(PlaceError.NoNeighbors));

	it("should fail on inconsistent row items", () =>
		expect(
			verifyTile({ x: 0, y: 0 }, [
				[
					{ x: 0, y: 0, color: "blue", shape: "circle" },
					{ x: 1, y: 0, color: "green", shape: "triangle" },
				],
			]),
		).toEqual(PlaceError.InconsistentRowItems));

	it("should fail on duplicate row items", () =>
		expect(
			verifyTile({ x: 0, y: 0 }, [
				[
					{ x: 0, y: 0, color: "blue", shape: "circle" },
					{ x: 1, y: 0, color: "blue", shape: "circle" },
				],
			]),
		).toEqual(PlaceError.DuplicateRowItems));

	it("should fail on inconsistent column items", () =>
		expect(
			verifyTile({ x: 0, y: 0 }, [
				[{ x: 0, y: 0, color: "blue", shape: "circle" }],
				[{ x: 0, y: 1, color: "green", shape: "triangle" }],
			]),
		).toEqual(PlaceError.InconsistentColumnItems));

	it("should fail on duplicate column items", () =>
		expect(
			verifyTile({ x: 0, y: 0 }, [
				[{ x: 0, y: 0, color: "blue", shape: "circle" }],
				[{ x: 0, y: 1, color: "blue", shape: "circle" }],
			]),
		).toEqual(PlaceError.DuplicateColumnItems));

	it("should fail on a missing tile", () =>
		expect(verifyTile({ x: 0, y: 0 }, [])).toEqual(PlaceError.UnknownTile));

	it("should pass with a matching color in the row", () =>
		expect(
			verifyTile({ x: 0, y: 0 }, [
				[
					{ x: 0, y: 0, color: "blue", shape: "circle" },
					{ x: 1, y: 0, color: "blue", shape: "clover" },
				],
			]),
		).toBeUndefined());

	it("should pass with a matching shape in the row", () =>
		expect(
			verifyTile({ x: 0, y: 0 }, [
				[
					{ x: 0, y: 0, color: "green", shape: "clover" },
					{ x: 1, y: 0, color: "blue", shape: "clover" },
				],
			]),
		).toBeUndefined());

	it("should pass with a matching color in the column", () =>
		expect(
			verifyTile({ x: 0, y: 0 }, [
				[{ x: 0, y: 0, color: "blue", shape: "circle" }],
				[{ x: 0, y: 1, color: "blue", shape: "clover" }],
			]),
		).toBeUndefined());

	it("should pass with a matching shape in the column", () =>
		expect(
			verifyTile({ x: 0, y: 0 }, [
				[{ x: 0, y: 0, color: "green", shape: "clover" }],
				[{ x: 0, y: 1, color: "blue", shape: "clover" }],
			]),
		).toBeUndefined());
});

describe("calculatePoints", () => {
	it("should count the tiles when extending a line", () => {
		const board: Board = { [0]: { [0]: { color: "red", shape: "square", x: 0, y: 0 } } };

		const tiles: PlacedTile[] = [
			{ color: "yellow", shape: "square", y: -2, x: 0, temporary: true },
			{ color: "blue", shape: "square", y: -1, x: 0, temporary: true },
		];
		tiles.forEach((tile) => ((board[tile.y] ??= {})[tile.x] = tile));

		expect(calculatePoints(tiles, board)).toEqual(3);
	});

	it("should count both lines when creating a T shape", () => {
		const board: Board = { [0]: { [0]: { color: "red", shape: "square", x: 0, y: 0 } } };

		const tiles: PlacedTile[] = [
			{ color: "yellow", shape: "clover", y: -1, x: -1, temporary: true },
			{ color: "yellow", shape: "square", y: -1, x: 0, temporary: true },
			{ color: "yellow", shape: "star", y: -1, x: 1, temporary: true },
		];
		tiles.forEach((tile) => ((board[tile.y] ??= {})[tile.x] = tile));

		expect(calculatePoints(tiles, board)).toEqual(5);
	});

	it("should count all lines when adding an adjacent line", () => {
		const board: Board = {
			[0]: { [0]: { color: "purple", shape: "triangle", x: 0, y: 0 } },
			[1]: { [0]: { color: "purple", shape: "square", x: 0, y: 1 } },
		};

		const tiles: PlacedTile[] = [
			{ color: "blue", shape: "clover", x: 1, y: -1 },
			{ color: "blue", shape: "triangle", x: 1, y: 0 },
			{ color: "blue", shape: "square", x: 1, y: 1 },
			{ color: "blue", shape: "circle", x: 1, y: 2 },
		];
		tiles.forEach((tile) => ((board[tile.y] ??= {})[tile.x] = tile));

		expect(calculatePoints(tiles, board)).toEqual(8);
	});

	it("should count applicable lines when extending an adjacent line", () => {
		const board: Board = {
			[0]: { [0]: { color: "purple", shape: "triangle", x: 0, y: 0 } },
			[1]: {
				[0]: { color: "purple", shape: "square", x: 0, y: 1 },
				[1]: { color: "blue", shape: "square", x: 1, y: 1 },
			},
		};

		const tiles: PlacedTile[] = [
			{ color: "blue", shape: "triangle", x: 1, y: 0 },
			{ color: "blue", shape: "circle", x: 1, y: 2 },
			{ color: "blue", shape: "clover", x: 1, y: 3 },
		];
		tiles.forEach((tile) => ((board[tile.y] ??= {})[tile.x] = tile));

		expect(calculatePoints(tiles, board)).toEqual(6);
	});

	it("should give a bonus when playing a Qwirkle", () => {
		const board: Board = {
			[0]: {
				[0]: { color: "purple", shape: "clover", x: 0, y: 0 },
				[-1]: { color: "blue", shape: "clover", x: -1, y: 0 },
				[-2]: { color: "green", shape: "clover", x: -2, y: 0 },
			},
		};

		const tiles: PlacedTile[] = [
			{ color: "yellow", shape: "clover", x: 1, y: 0 },
			{ color: "orange", shape: "clover", x: 2, y: 0 },
			{ color: "red", shape: "clover", x: 3, y: 0 },
		];
		tiles.forEach((tile) => ((board[tile.y] ??= {})[tile.x] = tile));

		expect(calculatePoints(tiles, board)).toEqual(12);
	});

	it("should give a bonus when playing an adjcant Qwirkle", () => {
		const board: Board = { [0]: { [0]: { color: "purple", shape: "star", x: 0, y: 0 } } };

		const tiles: PlacedTile[] = [
			{ color: "purple", shape: "clover", x: 0, y: 1 },
			{ color: "blue", shape: "clover", x: -1, y: 1 },
			{ color: "green", shape: "clover", x: -2, y: 1 },
			{ color: "yellow", shape: "clover", x: -3, y: 1 },
			{ color: "orange", shape: "clover", x: -4, y: 1 },
			{ color: "red", shape: "clover", x: -5, y: 1 },
		];
		tiles.forEach((tile) => ((board[tile.y] ??= {})[tile.x] = tile));

		expect(calculatePoints(tiles, board)).toEqual(14);
	});
});

describe("countTiles", () => {
	it("should count by color", () =>
		expect(
			countTiles([
				{ color: "blue", shape: "diamond" },
				{ color: "blue", shape: "square" },
				{ color: "orange", shape: "triangle" },
				{ color: "red", shape: "clover" },
				{ color: "green", shape: "circle" },
				{ color: "purple", shape: "star" },
			]),
		).toEqual(2));

	it("should count by shape", () =>
		expect(
			countTiles([
				{ color: "red", shape: "square" },
				{ color: "yellow", shape: "star" },
				{ color: "orange", shape: "triangle" },
				{ color: "green", shape: "diamond" },
				{ color: "blue", shape: "diamond" },
				{ color: "purple", shape: "clover" },
			]),
		).toEqual(2));

	it("should count by both", () =>
		expect(
			countTiles([
				{ color: "red", shape: "square" },
				{ color: "orange", shape: "star" },
				{ color: "orange", shape: "triangle" },
				{ color: "green", shape: "diamond" },
				{ color: "blue", shape: "diamond" },
				{ color: "purple", shape: "clover" },
			]),
		).toEqual(2));

	it("should ignore duplicates", () =>
		expect(
			countTiles([
				{ color: "red", shape: "square" },
				{ color: "yellow", shape: "star" },
				{ color: "orange", shape: "triangle" },
				{ color: "blue", shape: "diamond" },
				{ color: "blue", shape: "diamond" },
				{ color: "purple", shape: "clover" },
			]),
		).toEqual(1));

	it("should return 1 without matches", () =>
		expect(
			countTiles([
				{ color: "blue", shape: "clover" },
				{ color: "orange", shape: "diamond" },
				{ color: "purple", shape: "circle" },
				{ color: "green", shape: "square" },
				{ color: "red", shape: "star" },
				{ color: "yellow", shape: "triangle" },
			]),
		).toEqual(1));

	it("should fallback to 0", () => expect(countTiles([])).toEqual(0));

	it("should count full Qwirkles", () =>
		expect(
			countTiles([
				{ color: "blue", shape: "clover" },
				{ color: "blue", shape: "diamond" },
				{ color: "blue", shape: "circle" },
				{ color: "blue", shape: "square" },
				{ color: "blue", shape: "star" },
				{ color: "blue", shape: "triangle" },
			]),
		).toEqual(12));
});

describe("generateTileUrl", () => {
	it("should generate a tile url", () =>
		expect(generateTileUrl({ color: "blue", shape: "circle" })).toEqual(
			"./tiles/blue-circle.png",
		));
});

describe("getPublicRooms", () => {
	const baseRoom = { auth: false, board: {}, deck: [], host: "foobar", id: "a", players: {} };

	it("should remove private unstarted rooms", () =>
		expect(getPublicRooms({ a: { ...baseRoom, private: true, started: false } })).toEqual({}));

	it("should remove public started rooms", () =>
		expect(getPublicRooms({ a: { ...baseRoom, private: false, started: true } })).toEqual({}));

	it("should remove private started rooms", () =>
		expect(getPublicRooms({ a: { ...baseRoom, private: true, started: true } })).toEqual({}));

	it("should not remove public unstarted rooms", () =>
		expect(getPublicRooms({ a: { ...baseRoom, private: false, started: false } })).toEqual({
			a: { auth: false, host: "foobar", id: "a", players: {}, started: false },
		}));
});

describe("generateRoomId", () => {
	it("should be 8 characters long", () => expect(generateRoomId().length).toEqual(8));
});

describe("sortHand", () => {
	it("should sort colors", () =>
		expect(
			sortHand([
				{ color: "red", shape: "star" },
				{ color: "blue", shape: "star" },
				{ color: "green", shape: "star" },
				{ color: "orange", shape: "star" },
				{ color: "purple", shape: "star" },
				{ color: "yellow", shape: "star" },
			]),
		).toEqual([
			{ color: "red", shape: "star" },
			{ color: "orange", shape: "star" },
			{ color: "yellow", shape: "star" },
			{ color: "green", shape: "star" },
			{ color: "blue", shape: "star" },
			{ color: "purple", shape: "star" },
		]));

	it("should sort shapes", () =>
		expect(
			sortHand([
				{ color: "red", shape: "star" },
				{ color: "red", shape: "circle" },
				{ color: "red", shape: "triangle" },
				{ color: "red", shape: "diamond" },
				{ color: "red", shape: "clover" },
				{ color: "red", shape: "square" },
			]),
		).toEqual([
			{ color: "red", shape: "circle" },
			{ color: "red", shape: "clover" },
			{ color: "red", shape: "diamond" },
			{ color: "red", shape: "square" },
			{ color: "red", shape: "star" },
			{ color: "red", shape: "triangle" },
		]));

	it("should sort both", () =>
		expect(
			sortHand([
				{ color: "green", shape: "triangle" },
				{ color: "yellow", shape: "triangle" },
				{ color: "yellow", shape: "diamond" },
				{ color: "purple", shape: "star" },
				{ color: "purple", shape: "clover" },
				{ color: "red", shape: "star" },
			]),
		).toEqual([
			{ color: "red", shape: "star" },
			{ color: "yellow", shape: "diamond" },
			{ color: "yellow", shape: "triangle" },
			{ color: "green", shape: "triangle" },
			{ color: "purple", shape: "clover" },
			{ color: "purple", shape: "star" },
		]));
});

describe("getRandomTile", () => {
	it("should remove it from the deck", () => {
		const deck: Tile[] = [{ color: "red", shape: "star" }];
		getRandomTile(deck);
		expect(deck.length).toEqual(0);
	});

	it("should throw an error without a tile", () =>
		expect(() => getRandomTile([], true)).toThrowError(new RangeError("Deck is empty")));

	it("should not throw an error without a tile", () =>
		expect(getRandomTile([])).toEqual(undefined));

	it("should get a tile", () =>
		expect(getRandomTile([{ color: "red", shape: "square" }])).toEqual({
			color: "red",
			shape: "square",
		}));
});

describe("generateHand", () => {
	it("should not error with an empty deck", () => expect(generateHand([])).toEqual([]));

	it("should give 6 tiles with a full deck", () =>
		expect(generateHand(generateDeck()).length).toEqual(6));

	it("should remove tiles from the deck", () => {
		const deck: Tile[] = [{ color: "red", shape: "star" }];
		generateHand(deck);
		expect(deck.length).toEqual(0);
	});

	it("should have tiles", () => {
		const deck: Tile[] = [{ color: "red", shape: "star" }];
		expect(generateHand([...deck])).toEqual(deck);
	});
});

describe("generateDeck", () => {
	it("should have 3 of a tile", () =>
		expect(
			generateDeck().filter((tile) => tile.color === "red" && tile.shape === "circle").length,
		).toEqual(3));

	it("should have 6 shapes", () =>
		expect(
			generateDeck().reduce((acc, tile) => acc.add(tile.shape), new Set<TileShape>()).size,
		).toEqual(6));

	it("should have 6 colors", () =>
		expect(
			generateDeck().reduce((acc, tile) => acc.add(tile.color), new Set<TileColor>()).size,
		).toEqual(6));
});
