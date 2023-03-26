import { describe, expect, it } from "vitest";
import { verifyTile, calculatePoints, countTiles, generateTileUrl } from "../common/util.ts";
import { PlaceError } from "../common/constants.ts";
import { Board, PlacedTile } from "../common/types";

describe("verifyTile", () => {
	it("should fail without neighbors", () =>
		expect(verifyTile({ x: 0, y: 0 }, [[{ x: 0, y: 0, color: "blue", shape: "circle" }]])).toBe(
			PlaceError.NoNeighbors,
		));

	it("should fail on inconsistent row items", () =>
		expect(
			verifyTile({ x: 0, y: 0 }, [
				[
					{ x: 0, y: 0, color: "blue", shape: "circle" },
					{ x: 1, y: 0, color: "green", shape: "triangle" },
				],
			]),
		).toBe(PlaceError.InconsistentRowItems));

	it("should fail on duplicate row items", () =>
		expect(
			verifyTile({ x: 0, y: 0 }, [
				[
					{ x: 0, y: 0, color: "blue", shape: "circle" },
					{ x: 1, y: 0, color: "blue", shape: "circle" },
				],
			]),
		).toBe(PlaceError.DuplicateRowItems));

	it("should fail on inconsistent column items", () =>
		expect(
			verifyTile({ x: 0, y: 0 }, [
				[{ x: 0, y: 0, color: "blue", shape: "circle" }],
				[{ x: 0, y: 1, color: "green", shape: "triangle" }],
			]),
		).toBe(PlaceError.InconsistentColumnItems));

	it("should fail on duplicate column items", () =>
		expect(
			verifyTile({ x: 0, y: 0 }, [
				[{ x: 0, y: 0, color: "blue", shape: "circle" }],
				[{ x: 0, y: 1, color: "blue", shape: "circle" }],
			]),
		).toBe(PlaceError.DuplicateColumnItems));

	it("should fail on a missing tile", () =>
		expect(verifyTile({ x: 0, y: 0 }, [])).toBe(PlaceError.UnknownTile));

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

		expect(calculatePoints(tiles, board)).toBe(3);
	});

	it("should count both lines when creating a T shape", () => {
		const board: Board = { [0]: { [0]: { color: "red", shape: "square", x: 0, y: 0 } } };

		const tiles: PlacedTile[] = [
			{ color: "yellow", shape: "clover", y: -1, x: -1, temporary: true },
			{ color: "yellow", shape: "square", y: -1, x: 0, temporary: true },
			{ color: "yellow", shape: "star", y: -1, x: 1, temporary: true },
		];
		tiles.forEach((tile) => ((board[tile.y] ??= {})[tile.x] = tile));

		expect(calculatePoints(tiles, board)).toBe(5);
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

		expect(calculatePoints(tiles, board)).toBe(8);
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

		expect(calculatePoints(tiles, board)).toBe(6);
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

		expect(calculatePoints(tiles, board)).toBe(12);
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

		expect(calculatePoints(tiles, board)).toBe(14);
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
		).toBe(2));

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
		).toBe(2));

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
		).toBe(2));

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
		).toBe(1));

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
		).toBe(1));

	it("should fallback to 0", () => expect(countTiles([])).toBe(0));

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
		).toBe(12));
});

describe("generateTileUrl", () => {
	it("should generate a tile url", () =>
		expect(generateTileUrl({ color: "blue", shape: "circle" })).toBe(
			"./tiles/blue-circle.png",
		));
});
