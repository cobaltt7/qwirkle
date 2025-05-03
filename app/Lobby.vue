<template>
	<PlayersList :players="players" />
	<button v-if="host === username" @click="startGame">Start Game</button>
</template>
<script lang="ts">
import { Vue, Component } from "vue-facing-decorator";
import PlayersList from "./PlayersList.vue";
import useStore from "./common/store.js";
import socket from "./common/socket.js";

@Component({ components: { PlayersList } })
export default class Lobby extends Vue {
	get username() {
		const state = useStore();
		return state.username;
	}
	get host() {
		const state = useStore();
		return state.room?.host;
	}
	get players() {
		const state = useStore();
		return state.room?.players;
	}

	startGame() {
		socket.emit("startGame", alert);
	}
}
</script>
<style scoped></style>
