<template @board-update="boardUpdate">
	<div @click="tilePlaced">
		<!-- <img v-if="tile" :src="generateTileUrl(tile)" :alt="`${tile.color} ${tile.shape}`" /> -->
		{{ tile?.color }} {{ tile?.shape }}
		<br />
		X: {{ x }}; Y: {{ y }}
		<br>
		{{ i }}
	</div>
</template>
<script lang="ts">
	import { toRaw } from "vue";
	import { Vue } from "vue-class-component";
	import { generateTileUrl } from "../common/constants.js";
	import type { PlacedTile } from "../common/types.js";
	import { verifyTile } from "../common/util.js";
	import type App from "./App.vue";
	import type Game from "./Game.vue";

	export default class Tile extends Vue.with(
		class Props {
			columnIndex!: number;
			rowIndex!: number;
		},
	) {
		// Data
		tile: PlacedTile | null = null;
		ind=0

		// Computed
		get y() {
			return this.$parent.boardSize.rows[0] + this.$props.rowIndex - 2;
		}
		get x() {
			return this.$parent.boardSize.columns[0] + this.$props.columnIndex - 2;
		}
		get scale() {
			return this.$parent.scale;
		}
		get i() {
			return this.ind++
		}

		// Refs
		declare readonly $refs: {};
		declare readonly $parent: Game;
		declare readonly $root: App;

		// Hooks

		// Methods
		boardUpdate() {
			this.tile = this.$parent.board[this.y]?.[this.x] ?? null;
		}
		tilePlaced() {
			if (this.$parent.selectedTile === -1) return; // TODO: Warn, user didn't select tile

			const tile = this.$root.hand[this.$parent.selectedTile];
			if (!tile) return alert("MISSING_TILE2");

			const placed = { ...tile, x: this.x, y: this.y, temporary: true };

			const board = toRaw(this.$parent.board);

			if (board[placed.y]?.[placed.x]) return alert("ALREADY_PLACED");
			(board[placed.y] ??= {})[placed.x] = placed;

			const error = verifyTile(placed, board);
			if (error) return alert(error);

			tile.placed = true;
			this.$parent.selectedTile = -1;

			(this.$parent.board[placed.y] ??= {})[placed.x] = placed;
			this.$parent.onBoardUpdate();
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
		border: solid;
	}

	img {
		width: 100%; /* TODO: higher quality images */
		cursor: var(--cursor);
	}
</style>
