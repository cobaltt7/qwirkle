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
	import { Component, Vue, Hook, Prop } from "vue-facing-decorator";
	import type { Players } from "../common/types.ts";
	import type App from "./App.vue";
	import type Game from "./Game.vue";
	import type Lobby from "./Lobby.vue";
	import PlayerCard from "./PlayerCard.vue";
	import { getUsername } from "../common/util.ts";

	@Component({ components: { PlayerCard } })
	export default class PlayersList extends Vue {
		@Prop scores?: boolean;
		@Prop({ default: {} }) players!: Players;

		username = getUsername();
		computedPlayers = this.players;

		declare readonly $parent: Game | Lobby;
		declare readonly $root: App;

		@Hook mounted() {
			this.$root.socket.on("playersUpdate", (players) => {
				this.computedPlayers = players;
			});
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
</style>
