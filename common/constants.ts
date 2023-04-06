export const TILE_COLORS = ["red", "orange", "yellow", "green", "blue", "purple"] as const;
export type TileColor = typeof TILE_COLORS[number];
export const TILE_SHAPES = ["circle", "clover", "diamond", "square", "star", "triangle"] as const;
export type TileShape = typeof TILE_SHAPES[number];

export const QWIRKLE_LENGTH = 6;
export const HAND_SIZE = 6;
export const DUPLICATE_TILES = 3;

export enum PlaceError {
	UndefinedRoom,
	NotInRoom,
	AlreadyPlaced,
	MissingTile,
	NoNeighbors,
	InconsistentRowItems,
	DuplicateRowItems,
	InconsistentColumnItems,
	DuplicateColumnItems,
	UnknownTile,
}
export enum JoinError {
	UndefinedRoom,
	DuplicateUsername,
	AlreadyStarted,
}
export enum StartError {
	UndefinedRoom,
	NotInRoom,
	AlreadyStarted,
	NoPermissions,
}

export const ROOM_PARAMETER = "roomId";
