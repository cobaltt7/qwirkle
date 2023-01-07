import type { ERRORS, TILE_COLORS, TILE_SHAPES } from "./constants";

// Socket.io
export interface ServerToClientEvents {
	place: (tile: PlacedTile) => void;
	error: (error: ErrorName, location: Location) => void;
	hand: (tiles: Tile[]) => void;
}
export interface ClientToServerEvents {
	turn: (location: Location, tile: number) => void;
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
export type ErrorName = typeof ERRORS[number];
/** Y by X. */
export type Board = Record<Location["y"], Record<Location["x"], PlacedTile>>;
