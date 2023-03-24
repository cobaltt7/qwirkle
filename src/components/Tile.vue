<template @board-update="boardUpdate">
	<div @click="tilePlaced">
		<img v-if="tile" :src="generateTileUrl(tile)" :alt="`${tile.color} ${tile.shape}`" />
	</div>
</template>
<script lang="ts">
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

		// Refs
		declare readonly $refs: {};
		declare readonly $parent: Game;
		declare readonly $root: App;

		// Hooks

		// Methods
		override mounted() {
			this.tile = this.$parent.board[this.y]?.[this.x] ?? null;
		}
		boardUpdate() {
			this.tile = this.$parent.board[this.y]?.[this.x] ?? null;
		}
		tilePlaced() {
			if (this.$parent.selectedTile === -1) return; // TODO: Warn, user didn't select tile

			const tile = this.$root.hand[this.$parent.selectedTile];
			if (!tile) return alert("MISSING_TILE2");
			if (
				this.$parent.board[this.y]?.[this.x] &&
				this.$parent.board[this.y]?.[this.x]?.temporary !== "ignore"
			)
				return alert("ALREADY_PLACED");

			const placed: PlacedTile = { ...tile, x: this.x, y: this.y, temporary: "ignore" };
			(this.$parent.board[placed.y] ??= {})[placed.x] = placed;

			const error = verifyTile(placed, this.$parent.board);
			if (error) return alert(error);

			tile.placed = true;
			this.$parent.selectedTile = -1;
			placed.temporary = true;
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
	}

	img {
		width: 100%; /* TODO: higher quality images */
		cursor: var(--cursor);
	}
</style>
