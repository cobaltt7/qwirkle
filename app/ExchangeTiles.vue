<template>
	<dialog>
		<form method="dialog">
			<Hand
				class="hand"
				:selectTile="selectTile"
				:getClasses="(index: number) => ({ selected: selectedTiles.has(index) })"
			/>
			<button @click="reset()">Cancel</button>
			<button @click="submit">Exchange Tiles</button>
		</form>
	</dialog>
</template>
<script lang="ts">
import { Component, Vue } from "vue-facing-decorator";
import socket from "./common/socket.js";
import useStore from "./common/store.js";
import Hand from "./Hand.vue";
import { ExchangeError } from "../common/constants.js";

@Component({ components: { Hand } })
export default class ExchangeTiles extends Vue {
	selectedTiles = new Set<number>();

	selectTile(index: number) {
		this.selectedTiles[this.selectedTiles.has(index) ? "delete" : "add"](index);
	}
	submit() {
		socket.emit("exchangeTiles", Array.from(this.selectedTiles), (response) => {
			const state = useStore();

			if (typeof response === "number") alert(ExchangeError[response]);
			else state.hand = response;
		});
		this.reset();
	}
	reset() {
		this.$el.close();
		this.selectedTiles.clear();
	}
}
</script>
<style scoped>
dialog {
	justify-content: center;
	align-items: center;
	min-width: 500px;
}

dialog[open] {
	display: flex;
}

form {
	width: 100%;
	height: 100%;
}

form > :not(section) {
	display: flex;
	flex-wrap: wrap;
	align-content: center;
	justify-content: center;
	width: 100%;
	height: 40px;
}

.hand {
	height: 80px;
}
</style>
