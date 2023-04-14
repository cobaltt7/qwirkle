<template @board-update="boardUpdate">
	<div @click="tilePlaced">
		<img
			v-if="tile && tile.temporary !== 'ignore'"
			:src="generateTileUrl(tile)"
			:alt="`${tile.color} ${tile.shape}`"
		/>
	</div>
</template>
<script lang="ts">
	import { Prop, Vue, Component } from "vue-facing-decorator";
	import { generateTileUrl, getCurrentTurn } from "../common/util.ts";
	import type { PlacedTile } from "../common/types.ts";
	import { verifyTile } from "../common/util.ts";
	import { PlaceError } from "../common/constants.ts";
	import useStore from "./common/store.ts";

	@Component
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
			if (
				state.board[this.y]?.[this.x] &&
				state.board[this.y]?.[this.x]?.temporary !== "ignore"
			)
				return alert(PlaceError.AlreadyPlaced);

			if (!state.room) return alert(PlaceError.NotInRoom);

			const currentTurn = getCurrentTurn(state.room?.players);
			if (state.username !== currentTurn) return alert(PlaceError.NotYourTurn);

			const tile: PlacedTile = { ...heldTile, x: this.x, y: this.y, temporary: "ignore" };
			(state.board[tile.y] ??= {})[tile.x] = tile;

			const error = verifyTile(tile, state.board);
			if (error) return alert(error);

			heldTile.placed = true;
			tile.temporary = true;
			state.selectedTile = -1;
		}
		generateTileUrl = generateTileUrl;
	}
</script>
<style scoped>
	div {
		height: calc(100px * var(--scale));
		width: calc(100px * var(--scale));
		display: inline-block;
		cursor: pointer;
	}

	img {
		width: 100%; /* TODO: higher quality images */
		cursor: var(--cursor);
	}
</style>
