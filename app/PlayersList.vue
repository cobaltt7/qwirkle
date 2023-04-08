<template>
	<section>
		<PlayerCard
			:scores="scores"
			:player="{ ...player[1], username: player[0] }"
			:active="player[0] === username"
			v-for="player in Object.entries(computedPlayers).sort(
				([, one], [, two]) => one.index - two.index,
			)"
		/>
	</section>
</template>
<script lang="ts">
	import { Options, Vue, prop } from "vue-class-component";
	import type { Players } from "../common/types.ts";
	import type App from "./App.vue";
	import type Game from "./Game.vue";
	import type Lobby from "./Lobby.vue";
	import PlayerCard from "./PlayerCard.vue";
	import { getUsername } from "../common/util.ts";

	@Options({ components: { PlayerCard } })
	export default class PlayersList extends Vue.with(
		class Props {
			scores?: boolean;
			players = prop<Players>({ default: {} });
		},
	) {
		// Data
		username = getUsername();
		computedPlayers=this.players

		// Refs
		declare readonly $refs: {};
		declare readonly $parent: Game | Lobby;
		declare readonly $root: App;

		// Hooks
		override mounted() {
			this.$root.socket.on("playersUpdate", (players) => {
				this.computedPlayers = players;
			});
		}

		// Methods
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
</style>
