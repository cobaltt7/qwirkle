<template>
	<div v-if="orderedPlayers?.[0]" class="winner">
		<PlayerCard
			:scores="true"
			:player="{ ...orderedPlayers[0][1], username: orderedPlayers[0][0] }"
		/>
		<img draggable="false" alt="🥇" src="https://twemoji.maxcdn.com/v/14.0.2/svg/1f947.svg" />
	</div>
	<div v-if="orderedPlayers?.[1]" class="winner">
		<PlayerCard
			:scores="true"
			:player="{ ...orderedPlayers[1][1], username: orderedPlayers[1][0] }"
		/>
		<img draggable="false" alt="🥈" src="https://twemoji.maxcdn.com/v/14.0.2/svg/1f948.svg" />
	</div>
	<div v-if="orderedPlayers?.[2]" class="winner">
		<PlayerCard
			:scores="true"
			:player="{ ...orderedPlayers[2][1], username: orderedPlayers[2][0] }"
		/>
		<img draggable="false" alt="🥉" src="https://twemoji.maxcdn.com/v/14.0.2/svg/1f949.svg" />
	</div>
	<PlayersList
		:players="Object.fromEntries(orderedPlayers.slice(3))"
		:scores="true"
		:count-from="4"
	/>
</template>
<script lang="ts">
	import { Component, Vue } from "vue-facing-decorator";
	import PlayerCard from "./PlayerCard.vue";
	import PlayersList from "./PlayersList.vue";
	import useStore from "../common/store.js";

	@Component({ components: { PlayersList, PlayerCard } })
	export default class Leaderboard extends Vue {
		get orderedPlayers() {
			const state = useStore();
			return Object.entries(state.room?.players || {}).sort(
				([, one], [, two]) => two.score - one.score,
			);
		}
	}
</script>
<style scoped>
	.winner {
		position: relative;
		width: max-content;
	}
	.winner:first-child {
		left: calc(50% - 100px);
	}
	.winner:nth-child(2) {
		left: calc(30% - 100px);
		top: -150px;
	}
	.winner:nth-child(3) {
		left: calc(70% - 100px);
		top: -300px;
		margin-bottom: -100%;
	}
	.winner > img {
		width: 180px;
		margin: 0 15px;
	}
	section {
		position: fixed;
		bottom: 0;
		margin: 0 auto;
		justify-content: center;
		width: 100%;
	}
</style>
