<template>
	<section>
		<PlayerCard
			:scores="scores"
			:player="{ ...player[1], username: player[0] }"
			:active="player[0] === username"
			:data-index="typeof countFrom === 'number' ? '#' + (countFrom + index) : undefined"
			v-for="(player, index) in Object.entries(players).sort(
				([, one], [, two]) => one.index - two.index,
			)"
		/>
	</section>
</template>
<script lang="ts">
import { Component, Vue, Prop } from "vue-facing-decorator";
import type { Players } from "../common/types.ts";
import PlayerCard from "./PlayerCard.vue";
import useStore from "./common/store.ts";

@Component({ components: { PlayerCard } })
export default class PlayersList extends Vue {
	@Prop scores?: boolean;
	@Prop({ required: true }) players!: Players;
	@Prop countFrom?: number;

	get username() {
		const state = useStore();
		return state.username;
	}
}
</script>
<style scoped>
section {
	display: flex;
	flex-shrink: 0;
	align-items: center;
	margin-bottom: 20px;
	padding-bottom: 10px;
	height: 150px;
	overflow: auto;
}
[data-index]::before {
	position: absolute;
	top: 0.5em;
	right: 0.5em;
	z-index: 2;
	content: attr(data-index);
}
[data-index] {
	position: relative;
	z-index: 1;
}
</style>
