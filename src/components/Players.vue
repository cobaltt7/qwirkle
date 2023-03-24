<template>
	<section>
		<div v-for="player in Object.entries(players)">
			<img
				:src="`https://api.dicebear.com/5.x/fun-emoji/png?backgroundType=gradientLinear,solid&seed=${player}`"
				:alt="`${player[0]}\`'s avatar'`"
			/>
			<p>{{ player[0] }}</p>
		</div>
	</section>
</template>
<script lang="ts">
	import { Vue } from "vue-class-component";
	import type { PlayersList } from "../common/types.js";
	import type App from "./App.vue";
	import type Game from "./Game.vue";
	import type Lobby from "./Lobby.vue";

	export default class Players extends Vue {
		// Data
		players: PlayersList = {};

		// Refs
		declare readonly $refs: {};
		declare readonly $parent: Game | Lobby;
		declare readonly $root: App;

		// Hooks
		override mounted() {
			this.$root.socket.on("playersUpdate", (players) => {
				this.players = players;
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

	div {
		display: flex;
		flex-wrap: nowrap;
		flex-direction: column;
		justify-content: space-around;
		margin: 0 5px;
		background: #555;
		align-items: center;
		color: white;
		padding: 5px;
		border-radius: 10px;
		min-width: 200px;
		height: 100%;
	}

	img {
		height: 90px;
		width: 90px;
	}

	p {
		margin: 0;
	}
</style>
