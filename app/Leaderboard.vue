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
	import { Component, Vue, Hook } from "vue-facing-decorator";
	import type App from "./App.vue";
	import PlayerCard from "./PlayerCard.vue";
	import PlayersList from "./PlayersList.vue";
	import { Player } from "../common/types.js";

	@Component({ components: { PlayersList, PlayerCard } })
	export default class Leaderboard extends Vue {
		orderedPlayers?: [string, Player][];

		declare readonly $root: App;

		@Hook mounted() {
			this.orderedPlayers = Object.entries(this.$root.room?.players || {}).sort(
				([, one], [, two]) => two.score - one.score,
			);
		}
	}
</script>
<style scoped></style>
