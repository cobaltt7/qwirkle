<template>
	<section>
		<div
			:class="{ active: player[0] === username }"
			v-for="player in Object.entries(players).sort(
				([, one], [, two]) => one.index - two.index,
			)"
		>
			<img
				:src="`https://api.dicebear.com/5.x/fun-emoji/png?backgroundType=gradientLinear,solid&seed=${player[0]}`"
				:alt="`${player[0]}'s avatar`"
			/>
			<p>
				{{ player[0] }} <span v-if="scores">{{ player[1].score }}</span>
			</p>
		</div>
	</section>
</template>
<script lang="ts">
	import { Vue } from "vue-class-component";
	import type { Players } from "../common/types.ts";
	import type App from "./App.vue";
	import type Game from "./Game.vue";
	import type Lobby from "./Lobby.vue";
	import { getUsername } from "../common/util.ts";

	export default class PlayersList extends Vue.with(
		class Props {
			scores?: boolean;
		},
	) {
		// Data
		players: Players = {};
		username = getUsername();

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

	.active {
		background-color: rgb(43, 43, 43);
	}

	img {
		height: 90px;
		width: 90px;
	}

	p {
		margin: 0;
	}

	span {
		align-items: center;
		background-color: orange;
		border-radius: 25px;
		color: #000;
		display: inline-flex;
		justify-content: center;
		padding: 0 5px;
	}
</style>
