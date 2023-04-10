import type {
	PlaceError,
	JoinError,
	StartError,
	TileColor,
	TileShape,
	EndReason,
} from "./constants.js";
import { JWTClaims } from "./util.js";

export interface ServerToClientEvents {
	tilesPlaced: (tiles: PlacedTile[], deckLength: number) => void;
	roomsUpdate: (rooms: PublicRooms) => void;
	playersUpdate: (players: Players) => void;
	gameStart: (hand: Tile[], start: PlacedTile) => void;
	gameEnd: (reason: EndReason) => void;
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
		callback: { (jwt: string, room?: Room): void },
	) => void;
	mounted: () => void;
	startGame: (callback: (response: StartError) => void) => void;
}
export interface InterServerEvents {}
export interface SocketData {
	username: string;
}

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
export type PublicRoom = Pick<Room, "host" | "players" | "auth" | "started" | "id">;
export type PublicRooms = Record<string, PublicRoom>;
export type Board = { [y: number]: { [x: number]: PlacedTile } };
export type Player = { index: number; score: number };
export type Players = Record<string, Player>;
