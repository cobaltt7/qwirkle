import type { JOIN_ERRORS, PLACING_ERRORS, TILE_COLORS, TILE_SHAPES } from "./constants";

// Socket.io
export interface ServerToClientEvents {
	tilePlaced: (tile: PlacedTile) => void;
	roomsUpdate: (rooms: Rooms) => void;
	playersUpdate: (players: Players) => void;
}
export interface ClientToServerEvents {
	placeTile: (
		location: Location,
		tile: number,
		callback: (response: PlacingError | Tile[]) => void,
	) => void;
	joinRoom: (roomId: string, callback: (response: JoinError | Tile[]) => void) => void;
	createRoom: (
		roomData: { roomId: string } & Pick<Room, "auth" | "private">,
		callback: (response: false | Room) => void,
	) => void;
	mounted: () => void;
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
export type Room = {
	board: Board;
	deck: Tile[];
	host: string;
	players: Player[];
	auth: boolean | { discord: boolean; github: boolean };
	private: boolean;
};
export type Rooms = Record<string, Room>;
export type Player = string;
export type Players = Player[];
