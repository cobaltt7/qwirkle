<template>
	<PlayersList />
	<button @click="startGame">Start Game</button>
</template>
<script lang="ts">
	import { Vue, Options } from "vue-class-component";
	import type App from "./App.vue";
	import PlayersList from "./PlayersList.vue";

	@Options({ components: { PlayersList } })
	export default class Lobby extends Vue {
		// Data

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
