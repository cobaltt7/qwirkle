<template>
	<Players />
	<section id="board" v-dragscroll :style="{ '--scale': scale }">
		<div id="rows">
			<div class="row" v-for="rowIndex in boardSize.rows[1] - boardSize.rows[0] + 3">
				<Tile
					v-for="columnIndex in boardSize.columns[1] - boardSize.columns[0] + 3"
					:rowIndex="rowIndex"
					:columnIndex="columnIndex"
				/>
			</div>
		</div>
		<div id="zoom">
			<button :disabled="scale === SCALE_BOUNDS[1]" @click="zoomIn"><span>+</span></button>
			<button :disabled="scale === SCALE_BOUNDS[0]" @click="zoomOut"><span>-</span></button>
		</div>
	</section>
	<section id="hand">
		<button
			v-for="[index, tile] in $root.hand.entries()"
			@click="selectTile"
			:class="{ selected: index === selectedTile }"
			:title="`${tile.color} ${tile.shape}`"
			type="button"
		>
			<img :src="generateTileUrl(tile)" :title="`${tile.color} ${tile.shape}`" />
		</button>
	</section>
</template>
<script lang="ts">
	import { Vue, Options } from "vue-class-component";
	import type { Location, PlacedTile } from "../common/types";
	import type App from "./App.vue";
	import Players from "./Players.vue";
	import Tile from "./Tile.vue";
	import { generateTileUrl } from "../common/constants";
	import { dragscroll } from "vue-dragscroll";

	@Options({ directives: { dragscroll }, components: { Players, Tile } })
	export default class Game extends Vue.with(
		class Props {
			centerTile!: PlacedTile;
		},
	) {
		// Data
		boardSize: { rows: [number, number]; columns: [number, number] } = {
			rows: [0, 0],
			columns: [0, 0],
		};
		placedTiles: Record<Location["y"], Record<Location["x"], PlacedTile>> = {};
		selectedTile = -1;
		scale = 1;
		SCALE_BOUNDS = [0.35, 1.5] as const;
		SCALE_INCREMENT = 0.05 as const;

		// Refs
		declare readonly $refs: {};
		declare readonly $root: App;

		// Hooks
		override mounted() {
			this.$root.socket.on("tilePlaced", this.tilePlaced);
			this.tilePlaced(this.$props.centerTile);
		}

		// Methods
		generateTileUrl = generateTileUrl;
		selectTile(event: Event) {
			if (!(event.target instanceof Element)) return; // Idk how this could happen but TS says it can
			const button = event.target.closest("button");
			if (!button) return; // Ignore, user didn't click on tile

			this.selectedTile = Array.prototype.indexOf.call(
				button.parentNode?.children ?? [],
				button,
			);
		}
		tilePlaced(tile: PlacedTile) {
			if (tile.x < this.boardSize.columns[0]) this.boardSize.columns[0] = tile.x;
			else if (tile.x > this.boardSize.columns[1]) this.boardSize.columns[1] = tile.x;

			if (tile.y < this.boardSize.rows[0]) this.boardSize.rows[0] = tile.y;
			else if (tile.y > this.boardSize.rows[1]) this.boardSize.rows[1] = tile.y;

			(this.placedTiles[tile.y] ??= {})[tile.x] = tile;
		}
		zoomIn() {
			this.scale = Math.min(this.SCALE_BOUNDS[1], this.scale + this.SCALE_INCREMENT);
		}
		zoomOut() {
			this.scale = Math.max(this.SCALE_BOUNDS[0], this.scale - this.SCALE_INCREMENT);
		}
	}
</script>
<style scoped>
	#board {
		height: 100%;
		overflow: auto;
		border: 1px solid #000;
		scrollbar-width: none;
		--cursor: grab;
		cursor: var(--cursor);
		position: relative;
		display: flex;
		justify-content: flex-start;
		align-items: flex-start;
	}

	#board::-webkit-scrollbar {
		display: none;
	}

	#rows {
		margin: auto;
	}

	.row {
		display: flex;
	}

	#zoom {
		bottom: 0;
		position: absolute;
		right: 0;
	}

	#zoom button {
		border-radius: 100%;
		font-size: 40px;
		height: 50px;
		width: 50px;
		align-content: center;
		justify-content: center;
		margin: 10px;
	}

	#zoom button span {
		height: 10.5px;
		line-height: 0;
	}

	#hand {
		display: flex;
		height: 125px;
		align-items: center;
		margin: 10px 0;
		flex-shrink: 0;
	}

	#hand button {
		height: 100%;
		border: none;
		margin: 5px;
		padding: 0;
		width: 125px;
		background: #eee;
	}

	.selected {
		cursor: not-allowed;
	}

	.selected img {
		box-shadow: 0 0 5px 0 #000000;
		height: 100px;
		margin: auto;
	}

	:global(main:has(#board)) {
		height: calc(100% - 100px);
	}
</style>
