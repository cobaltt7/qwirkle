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
	<PlayersList :players="orderedPlayers"/>
</template>
<script lang="ts">
	import { Options, Vue } from "vue-class-component";
	import type App from "./App.vue";
	import PlayerCard from "./PlayerCard.vue";
	import PlayersList from "./PlayersList.vue";
	import { Player } from "../common/types.js";

	@Options({ components: { PlayersList, PlayerCard } })
	export default class Leaderboard extends Vue {
		// Data
		orderedPlayers?: [string, Player][];

		// Refs
		declare readonly $refs: {};
		declare readonly $root: App;

		// Hooks
		override mounted() {
			this.orderedPlayers = Object.entries(this.$root.room?.players || {}).sort(
				([, one], [, two]) => two.score - one.score,
			);
		}

		// Methods
	}
</script>
<style scoped></style>
