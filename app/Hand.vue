<template>
	<section id="hand">
		<button
			v-for="[index, tile] in hand.entries()"
			@click="selectTile(index)"
			:class="getClasses(index, tile)"
			:title="`${tile.color} ${tile.shape}`"
			type="button"
		>
			<TileImage v-if="tile" :color="tile.color" :shape="tile.shape" />
		</button>
		<section id="buttons">
			<slot></slot>
		</section>
	</section>
</template>
<script lang="ts">
import { Vue, Component, Prop } from "vue-facing-decorator";
import { dragscroll } from "vue-dragscroll";
import useStore from "./common/store.ts";
import { HeldTile } from "../common/types";
import TileImage from "./TileImage.vue";

@Component({ directives: { dragscroll }, components: { TileImage } })
export default class Hand extends Vue {
	@Prop selectTile!: (index: number) => void;
	@Prop getClasses!: (index: number, tile: HeldTile) => { selected?: boolean; placed?: boolean };

	get hand() {
		const state = useStore();
		return state.hand;
	}
}
</script>
<style scoped>
#hand {
	display: flex;
	flex-shrink: 0;
	align-items: center;
	margin: 10px 0;
}

#hand > button {
	margin: 5px;
	border: none;
	background: #eee;
	padding: 0;
	aspect-ratio: 1;
	height: 100%;
}

.placed {
	filter: contrast(0.5);
}

.selected {
	cursor: not-allowed;
}

.selected img {
	margin: auto;
	box-shadow: 0 0 5px 0 #000000;
	height: 80%;
}
</style>
