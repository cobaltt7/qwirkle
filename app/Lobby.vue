<template>
	<PlayersList :players />
	<button v-if="host === username" @click="startGame">Start Game</button>
</template>
<script lang="ts">
import { Vue, Component, toNative } from "vue-facing-decorator";
import PlayersList from "./PlayersList.vue";
import { StartError } from "../common/constants.js";
import useStore from "./common/store.js";
import socket from "./common/socket.js";

@Component({ components: { PlayersList } })
class Lobby extends Vue {
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
		socket.emit("startGame", (error) => alert(StartError[error]));
	}
}
export default toNative(Lobby);
</script>
<style scoped></style>
