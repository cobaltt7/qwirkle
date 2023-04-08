<template>
	<PlayersList :scores="true" />
	<section id="board" v-dragscroll :style="{ '--scale': scale }">
		<div id="rows">
			<div class="row" v-for="rowIndex in boardSize.rows[1] - boardSize.rows[0] + 3">
				<Tile
					ref="tiles"
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
			:class="{ selected: index === selectedTile || tile.placed, placed: tile.placed }"
			:title="`${tile.color} ${tile.shape}`"
			type="button"
		>
			<img :src="generateTileUrl(tile)" :title="`${tile.color} ${tile.shape}`" />
		</button>
		<section id="buttons" v-if="score">
			<p>
				<b>{{ score }}</b> points
				<i v-if="endingGame"><br />Will end game</i>
			</p>
			<button @click="reset" type="button">Reset Hand</button>
			<button @click="place" type="button">Place Tiles</button>
		</section>
	</section>
	<div id="deck" :style="{ '--deck-size': deckSize }" :title="`${deckLength} tiles left`"></div>
</template>
<script lang="ts">
	import { Vue, Component, Prop, Ref, Hook } from "vue-facing-decorator";
	import type { Board, PlacedTile } from "../common/types.ts";
	import type App from "./App.vue";
	import PlayersList from "./PlayersList.vue";
	import Tile from "./Tile.vue";
	import { generateDeck, generateTileUrl } from "../common/util.ts";
	import { dragscroll } from "vue-dragscroll";
	import { calculatePoints } from "../common/util.ts";
	import { GO_OUT_BONUS } from "../common/constants.ts";

	@Component({ directives: { dragscroll }, components: { PlayersList, Tile } })
	export default class Game extends Vue {
		@Prop({ required: true }) centerTile!: PlacedTile;

		boardSize: { rows: [number, number]; columns: [number, number] } = {
			rows: [0, 0],
			columns: [0, 0],
		};
		board: Board = {};
		selectedTile = -1;
		scale = 1;
		SCALE_BOUNDS = [0.35, 1.5] as const;
		SCALE_INCREMENT = 0.05 as const;
		score = 0;
		deckSize = 1;
		deckLength = generateDeck().length;
		endingGame = false;

		@Ref readonly tiles!: Tile[];
		declare readonly $root: App;

		@Hook mounted() {
			const fullDeck = this.deckLength;
			this.$root.socket.on("tilesPlaced", (tiles, deckLength) => {
				tiles.map((tile) => {
					(this.board[tile.y] ??= {})[tile.x] = tile;
				});
				this.deckSize = deckLength / fullDeck;
				this.deckLength = deckLength;
				this.onBoardUpdate();
			});

			(this.board[0] ??= {})[0] = this.centerTile;
			this.onBoardUpdate();
		}

		generateTileUrl = generateTileUrl;
		selectTile(event: Event) {
			if (!(event.target instanceof Element)) return;
			const button = event.target.closest("button");
			if (!button) return;

			const index = Array.prototype.indexOf.call(button.parentNode?.children ?? [], button);
			const tile = this.$root.hand[index];
			if (tile && !tile?.placed) this.selectedTile = index;
		}
		onBoardUpdate() {
			const tiles = Object.values(this.board)
				.map((row) => Object.values(row))
				.flat()
				.filter((tile) => tile.temporary !== "ignore");

			this.boardSize = tiles.reduce(
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
				{ rows: [0, 0], columns: [0, 0] } as typeof this.boardSize,
			);
			this.tiles.map((tile) => {
				tile.tile = this.board[tile.y]?.[tile.x] ?? null;
				if (tile.tile?.temporary === "ignore") tile.tile = null;
			});
			const placed = tiles.filter((tile) => tile.temporary);
			this.endingGame = placed.length === this.$root.hand.length && this.deckLength === 0;
			this.score = calculatePoints(placed, this.board) + GO_OUT_BONUS * +this.endingGame;
		}
		zoomIn() {
			this.scale = Math.min(this.SCALE_BOUNDS[1], this.scale + this.SCALE_INCREMENT);
		}
		zoomOut() {
			this.scale = Math.max(this.SCALE_BOUNDS[0], this.scale - this.SCALE_INCREMENT);
		}
		place() {
			const tiles = Object.values(this.board)
				.map((row) => Object.values(row))
				.flat()
				.filter((tile) => tile.temporary === true)
				.map((tile) => ({ ...tile, temporary: undefined }));

			this.$root.socket.emit("placeTile", tiles, (response) => {
				if (typeof response === "number") alert(response);
				else this.$root.hand = response;

				this.reset();
			});
		}
		reset() {
			this.selectedTile = -1;
			for (const index in this.board) {
				if (!this.board.hasOwnProperty(index)) continue;

				const row = this.board[index];
				if (!row) continue;

				const filtered = Object.entries(row).filter(([, tile]) => !tile.temporary);
				this.board[index] = Object.fromEntries(filtered);
			}

			this.onBoardUpdate();
			this.$root.hand = this.$root.hand.map((tile) => ({ ...tile, placed: undefined }));
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

	#hand > button {
		height: 100%;
		border: none;
		margin: 5px;
		padding: 0;
		width: 125px;
		background: #eee;
	}

	#buttons p {
		margin: 0 0 0 8px;
	}

	.placed {
		filter: contrast(0.5);
	}

	.selected {
		cursor: not-allowed;
	}

	.selected img {
		box-shadow: 0 0 5px 0 #000000;
		height: 100px;
		margin: auto;
	}

	#deck {
		height: 10px;
		width: calc(100% * var(--deck-size));
		background: #61afef;
	}

	:global(main:has(#board)) {
		height: calc(100% - 100px);
	}
</style>
