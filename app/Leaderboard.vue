<template>
	<div v-if="orderedPlayers?.[0]">
		<div>🥇</div>
		<PlayerCard
			:scores="true"
			:player="{ ...orderedPlayers[0][1], username: orderedPlayers[0][0] }"
		/>
	</div>
	<div v-if="orderedPlayers?.[1]">
		<div>🥈</div>
		<PlayerCard
			:scores="true"
			:player="{ ...orderedPlayers[1][1], username: orderedPlayers[1][0] }"
		/>
	</div>
	<div v-if="orderedPlayers?.[2]">
		<div>🥉</div>
		<PlayerCard
			:scores="true"
			:player="{ ...orderedPlayers[2][1], username: orderedPlayers[2][0] }"
		/>
	</div>
	<PlayersList :players="orderedPlayers" />
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
<style scoped></style>
