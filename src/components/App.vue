<template>
	<TitleBar></TitleBar>
	<main>
		<Game v-if="roomId"></Game>
		<Lobby v-else></Lobby>
	</main>
</template>
<script lang="ts">
	import { Options, Vue } from "vue-class-component";
	import twemoji from "twemoji";

	import type { Socket } from "socket.io-client";
	import type { ClientToServerEvents, ServerToClientEvents, Tile } from "../common/types";
	import Game from "./Game.vue";
	import Lobby from "./Lobby.vue";
	import TitleBar from "./TitleBar.vue";
	import io from "socket.io-client";

	@Options({ components: { TitleBar, Game, Lobby } })
	export default class App extends Vue {
		// Data
		heldTiles: Tile[] = [];
		roomId: string | null = null;
		socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();

		// Refs
		declare readonly $refs: {};

		// Hooks
		override mounted() {
			if (true) {
				// TODO: drop in prod
				this.socket.on("connect", () =>
					this.socket.io.on("open", () => {
						setTimeout(() => (location.href = location.href), 2000);
					}),
				);
			}
			this.socket.emit("mounted");
		}

		override updated() {
			twemoji.parse(document.body);
		}

		// Methods
	}
</script>
<style scoped>
	main {
		padding-top: 20px;
	}
</style>
