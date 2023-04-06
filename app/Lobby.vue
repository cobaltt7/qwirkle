<template>
	<PlayersList />
	<button @click="startGame" v-if="$root.room?.host === username">Start Game</button>
</template>
<script lang="ts">
	import { Vue, Options } from "vue-class-component";
	import type App from "./App.vue";
	import PlayersList from "./PlayersList.vue";
	import { getUsername } from "../common/util.js";

	@Options({ components: { PlayersList } })
	export default class Lobby extends Vue {
		// Data
		host?: string;
		username = getUsername();

		// Refs
		declare readonly $refs: {};
		declare readonly $root: App;

		// Hooks

		// Methods
		startGame() {
			this.$root.socket.emit("startGame", alert);
		}
	}
</script>
<style scoped></style>
