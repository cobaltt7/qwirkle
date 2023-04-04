import type { PlaceError, JoinError, StartError, TileColor, TileShape } from "./constants.js";
import { JWTClaims } from "./util.js";

// Socket.io
export interface ServerToClientEvents {
	tilesPlaced: (tiles: PlacedTile[], deckLength: number) => void;
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
export interface SocketData {
	username: string;
}

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

// Game
export type Room = {
	board: Board;
	deck: Tile[];
	host: string;
	players: Players;
	auth: boolean | { discord: boolean; github: boolean };
	private: boolean;
	started: boolean;
	id: string;
};
export type Rooms = Record<string, Room>;
/** Rows by columns. */
export type Board = { [y: number]: { [x: number]: PlacedTile } };
export type Players = Record<string, { index: number; score: number }>;
