import { describe, expect, it } from "vitest";
import { countTiles, generateTileUrl } from "../common/util.ts";

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
	it("should generate a tile url", () => {
		expect(generateTileUrl({ color: "blue", shape: "circle" })).toBe("./tiles/blue-circle.png");
	});
});
