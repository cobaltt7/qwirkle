import type { JOIN_ERRORS, PLACING_ERRORS, TILE_COLORS, TILE_SHAPES } from "./constants";

// Socket.io
export interface ServerToClientEvents {
	init: (handOrError: JoinError | Tile[]) => void;
	place: (tile: PlacedTile) => void;
}
export interface ClientToServerEvents {
	turn: (
		location: Location,
		tile: number,
		callback: (response: PlacingError | Tile[]) => void,
	) => void;
}
export interface InterServerEvents {}
export interface SocketData {}

// Game
export interface Location {
	x: number;
	y: number;
}
export interface Tile {
	color: TileColor;
	shape: TileShape;
}
export interface PlacedTile extends Tile, Location {}
export type TileColor = typeof TILE_COLORS[number];
export type TileShape = typeof TILE_SHAPES[number];
export type PlacingError = typeof PLACING_ERRORS[number];
export type JoinError = typeof JOIN_ERRORS[number];
/** Y by X. */
export type Board = Record<Location["y"], Record<Location["x"], PlacedTile>>;
