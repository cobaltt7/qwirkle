<template @board-update="boardUpdate">
	<div @click="tilePlaced">
		<img v-if="tile" :src="generateTileUrl(tile)" :alt="`${tile.color} ${tile.shape}`" />
	</div>
</template>
<script lang="ts">
	import { Prop, Vue, Hook, Component } from "vue-facing-decorator";
	import { generateTileUrl } from "../common/util.ts";
	import type { PlacedTile } from "../common/types.ts";
	import { verifyTile } from "../common/util.ts";
	import type App from "./App.vue";
	import type Game from "./Game.vue";
	import { PlaceError } from "../common/constants.ts";

	@Component
	export default class Tile extends Vue {
		@Prop({ required: true }) columnIndex!: number;
		@Prop({ required: true }) rowIndex!: number;

		tile: PlacedTile | null = null;

		get y() {
			return this.$parent.boardSize.rows[0] + this.rowIndex - 2;
		}
		get x() {
			return this.$parent.boardSize.columns[0] + this.columnIndex - 2;
		}
		get scale() {
			return this.$parent.scale;
		}

		declare readonly $parent: Game;
		declare readonly $root: App;

		@Hook mounted() {
			this.tile = this.$parent.board[this.y]?.[this.x] ?? null;
		}
		boardUpdate() {
			this.tile = this.$parent.board[this.y]?.[this.x] ?? null;
		}
		tilePlaced() {
			const tile = this.$root.hand[this.$parent.selectedTile];
			if (!tile) return alert(PlaceError.MissingTile);
			if (
				this.$parent.board[this.y]?.[this.x] &&
				this.$parent.board[this.y]?.[this.x]?.temporary !== "ignore"
			)
				return alert(PlaceError.AlreadyPlaced);

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
