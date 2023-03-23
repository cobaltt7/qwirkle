import type {
	START_ERRORS,
	JOIN_ERRORS,
	PLACE_ERRORS,
	TILE_COLORS,
	TILE_SHAPES,
} from "./constants";

// Socket.io
export interface ServerToClientEvents {
	tilesPlaced: (tiles: PlacedTile[]) => void;
	roomsUpdate: (rooms: Rooms) => void;
	playersUpdate: (players: Players) => void;
	gameStart: (hand: Tile[], start: PlacedTile) => void;
}
export interface ClientToServerEvents {
	placeTile: (tiles: PlacedTile[], callback: (hand: PlaceError | Tile[]) => void) => void;
	joinRoom: (
		roomId: string,
		auth: { jwt: string } | JWTClaims,
		callback: (response?: JoinError) => void,
	) => void;
	createRoom: (
		roomData: JWTClaims & Pick<Room, "auth" | "private">,
		callback: { (room?: never, jwt?: never): void; (room: Room, jwt: string): void },
	) => void;
	mounted: () => void;
	startGame: (callback: (response: StartError) => void) => void;
}
export interface InterServerEvents {}
export interface SocketData {}

// Tiles
export interface Location {
	x: number;
	y: number;
}
export interface Tile {
	color: TileColor;
	shape: TileShape;
}
export interface PlacedTile extends Tile, Location {
	temporary?: boolean | "ignore";
}
export type TileColor = typeof TILE_COLORS[number];
export type TileShape = typeof TILE_SHAPES[number];

// Errors
export type PlaceError = typeof PLACE_ERRORS[number];
export type JoinError = typeof JOIN_ERRORS[number];
export type StartError = typeof START_ERRORS[number];

// Game
export type Room = {
	board: Board;
	deck: Tile[];
	host: string;
	players: Player[];
	auth: boolean | { discord: boolean; github: boolean };
	private: boolean;
	started: boolean;
	id: string;
};
export type Rooms = Record<string, Room>;
/** Rows by columns. */
export type Board = Record<Location["y"], Record<Location["x"], PlacedTile>>;
export type Player = string;
export type Players = Player[];

// Auth
export type JWTClaims = { username: string };
