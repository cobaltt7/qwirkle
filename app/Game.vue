<template>
	<PlayersList :scores="true" :players />
	<section id="board" :style="{ '--scale': scale }">
		<div id="rows" v-dragscroll>
			<div class="row" v-for="rowIndex in boardSize.rows[1] - boardSize.rows[0] + 3">
				<Tile
					v-for="columnIndex in boardSize.columns[1] - boardSize.columns[0] + 3"
					:rowIndex
					:columnIndex
					:scale
				/>
			</div>
		</div>
		<div id="zoom">
			<button :disabled="scale === SCALE_BOUNDS[1]" @click="zoomIn"><span>+</span></button>
			<button :disabled="scale === SCALE_BOUNDS[0]" @click="zoomOut"><span>-</span></button>
		</div>
	</section>
	<Hand
		class="hand"
		:selectTile
		:getClasses="
			(index: number, tile: HeldTile) => ({
				selected: index === selectedTile || tile.placed,
				placed: tile.placed,
			})
		"
	>
		<template v-if="workingScore">
			<p>
				<b>{{ workingScore }}</b> points <i v-if="endingGame"><br />Will end game</i>
			</p>
			<button @click="reset" type="button">Reset Hand</button>
			<button @click="place" type="button">Place Tiles</button>
		</template>
		<template v-else>
			<button @click="exchange.$el.showModal()" type="button">Exchange Tiles</button>
		</template>
	</Hand>
	<div
		id="deck"
		:style="{ '--deck-size': deckLength / fullDeckSize }"
		:title="`${deckLength} tiles left`"
	></div>
	<ExchangeTiles ref="exchange" />
</template>
<script lang="ts">
import { Vue, Component, Ref, toNative } from "vue-facing-decorator";
import PlayersList from "./PlayersList.vue";
import Tile from "./Tile.vue";
import { dragscroll } from "vue-dragscroll";
import useStore from "./common/store.js";
import { DUPLICATE_TILES, TILE_COLORS, TILE_SHAPES, PlaceError } from "../common/constants.js";
import socket from "./common/socket.js";
import ExchangeTiles from "./ExchangeTiles.vue";
import Hand from "./Hand.vue";
import { HeldTile } from "../common/types";

@Component({ directives: { dragscroll }, components: { PlayersList, Tile, ExchangeTiles, Hand } })
class Game extends Vue {
	scale = 1;
	SCALE_BOUNDS = [0.35, 1.5] as const;
	SCALE_INCREMENT = 0.05 as const;
	fullDeckSize = TILE_COLORS.length * TILE_SHAPES.length * DUPLICATE_TILES;

	get endingGame() {
		const state = useStore();
		return state.endingGame;
	}
	get boardSize() {
		const state = useStore();
		return state.boardSize;
	}
	get hand() {
		const state = useStore();
		return state.hand;
	}
	get players() {
		const state = useStore();
		return state.room?.players ?? {};
	}
	get selectedTile() {
		const state = useStore();
		return state.selectedTile;
	}
	get workingScore() {
		const state = useStore();
		return state.workingScore;
	}
	get deckLength() {
		const state = useStore();
		return state.deckLength;
	}

	@Ref readonly exchange!: InstanceType<typeof ExchangeTiles>;

	selectTile(index: number) {
		const state = useStore();
		const tile = this.hand[index];
		if (tile && !tile?.placed) state.selectedTile = index;
	}
	zoomIn() {
		this.scale = Math.min(this.SCALE_BOUNDS[1], this.scale + this.SCALE_INCREMENT);
	}
	zoomOut() {
		this.scale = Math.max(this.SCALE_BOUNDS[0], this.scale - this.SCALE_INCREMENT);
	}
	place() {
		const state = useStore();
		const tiles = Object.values(state.board)
			.map((row) => Object.values(row))
			.flat()
			.filter((tile) => tile.temporary === true)
			.map((tile) => ({ ...tile, temporary: undefined }));

		socket.emit("placeTiles", tiles, (response) => {
			if (typeof response === "number") alert(PlaceError[response]);
			else state.hand = response;

			this.reset();
		});
	}
	reset() {
		const state = useStore();
		for (const index in state.board) {
			if (!state.board.hasOwnProperty(index)) continue;

			const row = state.board[index];
			if (!row) continue;

			const filtered = Object.entries(row).filter(([, tile]) => !tile.temporary);
			state.board[index] = Object.fromEntries(filtered);
		}

		state.selectedTile = -1;
		state.hand = this.hand.map((tile) => ({ ...tile, placed: undefined }));
	}
}
export default toNative(Game);
</script>
<style scoped>
#board {
	display: flex;
	position: relative;
	justify-content: flex-start;
	align-items: flex-start;
	border: 1px solid #000;
	height: 100%;
	min-height: 0;
}

#board::-webkit-scrollbar {
	display: none;
}

#rows {
	margin: auto;
	max-height: 100%;
	overflow: auto;
	scrollbar-width: none;
	--cursor: grab;
	cursor: var(--cursor);
}

.row {
	display: flex;
}

#zoom {
	position: absolute;
	right: 0;
	bottom: 0;
	user-select: none;
}

#zoom button {
	align-content: center;
	justify-content: center;
	margin: 10px;
	border-radius: 100%;
	width: 50px;
	height: 50px;
	font-size: 40px;
}

#zoom button span {
	height: 10.5px;
	line-height: 0;
}

.hand {
	width: 100%;
	height: 125px;
	overflow-x: auto;
	scrollbar-width: none;
}

#buttons p {
	margin: 0 0 0 8px;
}

#deck {
	background: #61afef;
	width: calc(100% * var(--deck-size));
	height: 10px;
}

:global(main:has(#board)) {
	height: calc(100% - 100px);
}
</style>
