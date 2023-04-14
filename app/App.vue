<template>
	<TitleBar />
	<main>
		<RoomsList v-if="!status" />
		<Lobby v-else-if="status === 'joined'" />
		<Game v-else-if="status === 'started'" />
		<Leaderboard v-else />
	</main>
</template>
<script lang="ts">
	import { Component, Hook, Vue } from "vue-facing-decorator";
	import twemoji from "twemoji";

	import Game from "./Game.vue";
	import RoomsList from "./RoomsList.vue";
	import TitleBar from "./TitleBar.vue";
	import Lobby from "./Lobby.vue";
	import Leaderboard from "./Leaderboard.vue";
	import useStore from "./common/store.js";
	import socket from "./common/socket.js";

	@Component({ components: { TitleBar, Game, RoomsList, Lobby, Leaderboard } })
	export default class App extends Vue {
		get status() {
			const store = useStore();
			return store.status;
		}

		@Hook mounted() {
			socket.connect();
		}

		@Hook updated() {
			twemoji.parse(document.body);
		}
	}
</script>
<style scoped>
	main {
		padding-top: 20px;
	}
</style>
