<template>
	<div @click="tilePlaced"><TileImage v-if="tile" :color="tile.color" :shape="tile.shape" /></div>
</template>
<script lang="ts">
import { Prop, Vue, Component } from "vue-facing-decorator";
import { getCurrentTurn, tilesInLine } from "../common/util.ts";
import type { PlacedTile } from "../common/types.ts";
import { verifyTile } from "../common/util.ts";
import { PlaceError } from "../common/constants.ts";
import useStore from "./common/store.ts";
import { toRaw } from "vue";
import TileImage from "./TileImage.vue.ts";

@Component({ components: { TileImage } })
export default class Tile extends Vue {
	@Prop({ required: true }) columnIndex!: number;
	@Prop({ required: true }) rowIndex!: number;
	@Prop({ default: 1 }) scale!: number;

	get y() {
		const state = useStore();
		return state.boardSize.rows[0] + this.rowIndex - 2;
	}
	get x() {
		const state = useStore();
		return state.boardSize.columns[0] + this.columnIndex - 2;
	}
	get tile() {
		const state = useStore();
		return state.board[this.y]?.[this.x] ?? null;
	}

	tilePlaced() {
		const state = useStore();
		const heldTile = state.hand[state.selectedTile];
		if (!heldTile) return alert(PlaceError.MissingTile);
		const board = Object.fromEntries(
			Object.entries(toRaw(state.board)).map(([y, value]) => [
				y,
				Object.fromEntries(
					Object.entries(toRaw(value)).map(([x, value]) => [x, toRaw(value)]),
				),
			]),
		);

		if (board[this.y]?.[this.x]) return alert(PlaceError.AlreadyPlaced);

		if (!state.room) return alert(PlaceError.NotInRoom);

		const currentTurn = getCurrentTurn(state.room?.players);
		if (state.username !== currentTurn) return alert(PlaceError.NotYourTurn);

		const tile: PlacedTile = { ...heldTile, x: this.x, y: this.y, temporary: true };
		(board[tile.y] ??= {})[tile.x] = tile;

		const error = verifyTile(tile, board);
		if (error) return alert(error);

		if (!tilesInLine([...state.placedTiles, tile], board)) return alert(PlaceError.NotInLine);

		heldTile.placed = true;
		state.board = board;
		state.selectedTile = -1;
	}
}
</script>
<style scoped>
div {
	display: inline-block;
	cursor: pointer;
	width: calc(100px * var(--scale));
	height: calc(100px * var(--scale));
}

img {
	cursor: var(--cursor);
	width: 100%; /* TODO: higher quality images */
}
</style>
