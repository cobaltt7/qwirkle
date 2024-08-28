<template>
	<dialog>
		<form method="dialog">
			<Hand
				:selectTile="selectTile"
				:getClasses="(index:number) => ({ selected: selectedTiles.has(index) })"
			/>
			<button @click="reset()">Cancel</button>
			<button @click="submit">Exchange Tiles</button>
		</form>
	</dialog>
</template>
<script lang="ts">
	import { Component, Vue } from "vue-facing-decorator";
	import socket from "./common/socket.ts";
	import useStore from "./common/store.ts";
	import Hand from "./Hand.vue";

	@Component({ components: { Hand } })
	export default class ExchangeTiles extends Vue {
		selectedTiles = new Set<number>();

		get hand() {
			const state = useStore();
			return state.hand;
		}

		selectTile(index: number) {
			this.selectedTiles[this.selectedTiles.has(index) ? "delete" : "add"](index);
		}
		submit() {
			socket.emit("exchangeTiles", Array.from(this.selectedTiles), (response) => {
				const state = useStore();

				if (typeof response === "number") alert(response);
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
<style scoped></style>
