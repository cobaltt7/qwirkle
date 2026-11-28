<template>
	<div @click="tilePlaced"><TileImage v-if="tile" :color="tile.color" :shape="tile.shape" /></div>
</template>
<script lang="ts">
import { Prop, Vue, Component, toNative } from "vue-facing-decorator";
import { getCurrentTurn, tilesInLine } from "../common/util.js";
import type { PlacedTile } from "../common/types.js";
import { verifyTile } from "../common/util.js";
import { PlaceError } from "../common/constants.js";
import useStore from "./common/store.js";
import { toRaw } from "vue";
import TileImage from "./TileImage.vue";

@Component({ components: { TileImage } })
class Tile extends Vue {
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
		if (!heldTile) return alert(PlaceError[PlaceError.MissingTile]);
		const board = Object.fromEntries(
			Object.entries(toRaw(state.board)).map(([y, value]) => [
				y,
				Object.fromEntries(
					Object.entries(toRaw(value)).map(([x, value]) => [x, toRaw(value)]),
				),
			]),
		);

		if (board[this.y]?.[this.x]) return alert(PlaceError[PlaceError.AlreadyPlaced]);

		if (!state.room) return alert(PlaceError[PlaceError.NotInRoom]);

		const currentTurn = getCurrentTurn(state.room?.players);
		if (state.username !== currentTurn) return alert(PlaceError[PlaceError.NotYourTurn]);

		const tile: PlacedTile = { ...heldTile, x: this.x, y: this.y, temporary: true };
		(board[tile.y] ??= {})[tile.x] = tile;

		const error = verifyTile(tile, board);
		if (error) return alert(PlaceError[error]);

		if (!tilesInLine([...state.placedTiles, tile], board))
			return alert(PlaceError[PlaceError.NotInLine]);

		heldTile.placed = true;
		state.board = board;
		state.selectedTile = -1;
	}
}
export default toNative(Tile);
</script>
<style scoped>
div {
	display: inline-block;
	cursor: pointer;
	aspect-ratio: 1;
	width: calc(100px * var(--scale));
	height: calc(100px * var(--scale));
}
</style>
