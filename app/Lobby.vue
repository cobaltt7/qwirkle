<template>
	<PlayersList />
	<button @click="startGame" v-if="$root.room?.host === username">Start Game</button>
</template>
<script lang="ts">
	import { Vue, Component } from "vue-facing-decorator";
	import type App from "./App.vue";
	import PlayersList from "./PlayersList.vue";
	import { getUsername } from "../common/util.js";

	@Component({ components: { PlayersList } })
	export default class Lobby extends Vue {
		host?: string;
		username = getUsername();

		declare readonly $root: App;

		startGame() {
			this.$root.socket.emit("startGame", alert);
		}
	}
</script>
<style scoped></style>
