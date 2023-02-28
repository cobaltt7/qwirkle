<template>
	<section>
		<div v-for="player in players">
			<img
				:src="`https://api.dicebear.com/5.x/fun-emoji/png?backgroundType=gradientLinear,solid&seed=${player}`"
				:alt="`${player}\`'s avatar'`"
			/>
			<p>{{ player }}</p>
		</div>
	</section>
</template>
<script lang="ts">
	import { Vue } from "vue-class-component";
	import type { Player } from "../common/types.js";
	import type App from "./App.vue";
	import type Game from "./Game.vue";

	export default class Players extends Vue {
		// Data
		players: Player[] = [];

		// Refs
		declare readonly $refs: {};
		declare readonly $parent: Game;
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
<style scoped>section {
	display: flex;
	align-items: center;
	height: 130px;
	overflow: auto;
	padding-bottom: 5px;
	margin-bottom: 5px;
}

div {
	display: flex;
	height: 100%;
	flex-wrap: nowrap;
	flex-direction: column;
	justify-content: space-around;
	margin: 0 5px;
	background: #555;
	align-items: center;
	color: white;
	padding: 5px;
	border-radius: 10px;
}

img {
	height: 90px;
	width: 90px;
}

p {
	margin: 0;
}
</style>
