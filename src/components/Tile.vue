<template>
	<div @click="tilePlaced">
		<img v-if="tile" :src="generateTileUrl(tile)" :alt="`${tile?.color} ${tile?.shape}`" />
	</div>
</template>
<script lang="ts">
	import { Vue } from "vue-class-component";
	import { generateTileUrl } from "../common/constants.js";
	import type App from "./App.vue";
	import type Game from "./Game.vue";

	export default class Tile extends Vue.with(
		class Props {
			columnIndex!: number;
			rowIndex!: number;
		},
	) {
		// Data
		row!: number;
		column!: number;

		// Refs
		declare readonly $refs: {};
		declare readonly $parent: Game;
		declare readonly $root: App;

		// Hooks
		override created() {
			this.row = this.$parent.boardSize.rows[0] + this.$props.rowIndex - 2;
			this.column = this.$parent.boardSize.columns[0] + this.$props.columnIndex - 2;
		}

		// Methods
		get tile() {
			return this.$parent.placedTiles[this.row]?.[this.column];
		}
		get scale() {
			console.log(this.$parent.scale)
			return this.$parent.scale;
		}
		tilePlaced() {
			if (this.$parent.selectedTile === -1) return; // TODO: Warn, user didn't select tile

			this.$root.socket.emit(
				"placeTile",
				{ y: this.row, x: this.column },
				this.$parent.selectedTile,
				(response) => {
					if (typeof response === "string") alert(response);
					else this.$root.hand = response;
				},
			);
			this.$parent.selectedTile = -1;
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
