import type { Tile } from "./types";

export const TILE_COLORS = ["red", "orange", "yellow", "green", "blue", "purple"] as const;
export const TILE_SHAPES = ["circle", "clover", "diamond", "square", "star", "triangle"] as const;
export const PLACING_ERRORS = [
	"ALREADY_PLACED",
	"MISSING_TILE",
	"NO_NEIGHBORS",
	"INCONSISTENT_ROW_ITEMS",
	"DUPLICATE_ROW_ITEMS",
	"INCONSISTENT_COLUMN_ITEMS",
	"DUPLICATE_COLUMN_ITEMS",
	"NOT_IN_ROOM",
	"UNDEFINED_ROOM",
] as const;
export const JOIN_ERRORS = ["UNDEFINED_ROOM"] as const;
export function generateTileUrl({ color, shape }: Tile) {
	return `./tiles/${color}-${shape}.png`;
}
export const ROOM_PARAMETER = "roomId";
