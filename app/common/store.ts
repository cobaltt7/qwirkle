import { defineStore } from "pinia";

import { EndReason, GO_OUT_BONUS } from "../../common/constants.ts";
import { Board, HeldTile, PlacedTile, PublicRoom, PublicRooms } from "../../common/types";
import { calculatePoints, generateDeck, JWTClaims } from "../../common/util.ts";

function getUsername() {
	try {
		const jwt = localStorage.getItem("auth");
		if (!jwt) return null;
		const encoded = jwt.split(".")[1];
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

const useStore = defineStore("state", {
	state: () => ({
		username: getUsername(),
		status: null as null | "joined" | "started" | "ended",
		hand: [] as HeldTile[],
		room: null as PublicRoom | null,
		publicRooms: {} as PublicRooms,
		endReason: null as null | EndReason,
		board: {} as Board,
		selectedTile: -1,
		deckLength: generateDeck().length,
		centerTile: null as PlacedTile | null,
	}),
	getters: {
		boardSize(): { rows: [number, number]; columns: [number, number] } {
			return Object.values(this.board)
				.map((row) => Object.values(row))
				.flat()
				.reduce<{ rows: [number, number]; columns: [number, number] }>(
					({ rows: [smallestY, largestY], columns: [smallestX, largestX] }, tile) => ({
						rows: [
							tile.y < smallestY ? tile.y : smallestY,
							tile.y > largestY ? tile.y : largestY,
						],
						columns: [
							tile.x < smallestX ? tile.x : smallestX,
							tile.x > largestX ? tile.x : largestX,
						],
					}),
					{ rows: [0, 0], columns: [0, 0] },
				);
		},
		placedTiles(): PlacedTile[] {
			return Object.values(this.board)
				.map((row) => Object.values(row))
				.flat()
				.filter((tile) => tile.temporary);
		},
		endingGame(): boolean {
			return this.placedTiles.length === this.hand.length && this.deckLength === 0;
		},
		workingScore(): number {
			return calculatePoints(this.placedTiles, this.board) + GO_OUT_BONUS * +this.endingGame;
		},
	},
});

export default useStore;
