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
	import useStore from "../common/store.ts";

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
		align-items: center;
		height: 150px;
		overflow: auto;
		padding-bottom: 10px;
		margin-bottom: 20px;
		flex-shrink: 0;
	}
	[data-index]::before {
		content: attr(data-index);
		position: absolute;
		right: 0.5em;
		z-index: 2;
		top: 0.5em;
	}
	[data-index] {
		position: relative;
		z-index: 1;
	}
</style>
