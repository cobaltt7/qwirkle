import type { Board, JWTClaims, Location, PlacedTile, PlaceError } from "./types.js";

export function getUsername() {
	try {
		const jwt = localStorage.getItem("auth");
		if (!jwt) throw new ReferenceError("Missing JWT");
		const encoded = jwt?.split(".")[1];
		if (!encoded) throw new SyntaxError("Invalid JWT");
		const { username } = JSON.parse(window.atob(encoded)) as JWTClaims;
		if (!username || typeof username !== "string")
			throw new TypeError("Username must be a string");
		return username;
	} catch (error) {
		console.error(error);
		return null;
	}
}

export function verifyTile(location: Location, board: Board): PlaceError | undefined {
	const row = board[location.y] ?? {};
	const tile = board[location.y]?.[location.x];
	if (!tile) return "UNKNOWN_TILE";

	let top = board[location.y - 1]?.[location.x],
		bottom = board[location.y + 1]?.[location.x],
		right = row[location.x + 1],
		left = row[location.x - 1];
	if (!top && !bottom && !right && !left) return "NO_NEIGHBORS";

	const neighborhood: { row: PlacedTile[]; column: PlacedTile[] } = { row: [], column: [] };
	if (right || left) {
		if (left) {
			do neighborhood.row.unshift(left);
			while ((left = row[left.x - 1]));
		}
		neighborhood.row.push(tile);
		if (right) {
			do neighborhood.row.push(right);
			while ((right = row[right.x + 1]));
		}
	}
	if (top || bottom) {
		if (top) {
			do neighborhood.column.unshift(top);
			while ((top = board[top.y - 1]?.[location.x]));
		}
		neighborhood.column.push(tile);
		if (bottom) {
			do neighborhood.column.push(bottom);
			while ((bottom = board[bottom.y + 1]?.[location.x]));
		}
	}

	const rowResult = verifyLine(neighborhood.row);
	if (rowResult) return `${rowResult}_ROW_ITEMS`;
	const columnResult = verifyLine(neighborhood.column);
	if (columnResult) return `${columnResult}_COLUMN_ITEMS`;
}

export function verifyLine(line: PlacedTile[]) {
	const isSameColor = line.every((tile) => tile.color === line[0]?.color);
	const isSameShape = line.every((tile) => tile.shape === line[0]?.shape);
	if (!(isSameColor || isSameShape)) return "INCONSISTENT";

	return (
		line.some((tile, index) => {
			const key = isSameColor ? tile.shape : tile.color;
			return (
				line.findIndex((item) => item[isSameColor ? "shape" : "color"] === key) !== index
			);
		}) && "DUPLICATE"
	);
}
