<template>
	<TitleBar />
	<main>
		<RoomsList v-if="!status" />
		<Lobby v-else-if="status === 'joined'" />
		<Game v-else :centerTile="centerTile" />
	</main>
</template>
<script lang="ts">
	import { Options, Vue } from "vue-class-component";
	import twemoji from "twemoji";

	import type { Socket } from "socket.io-client";
	import type {
		ClientToServerEvents,
		ServerToClientEvents,
		Tile,
		PlacedTile,
	} from "../common/types.ts";
	import Game from "./Game.vue";
	import RoomsList from "./RoomsList.vue";
	import TitleBar from "./TitleBar.vue";
	import Lobby from "./Lobby.vue";
	import io from "socket.io-client";

	@Options({ components: { TitleBar, Game, RoomsList, Lobby } })
	export default class App extends Vue {
		// Data
		hand: (Tile & { placed?: true })[] = [];
		roomId: string | null = null;
		socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();
		status: null | "joined" | "started" = null;
		centerTile?: PlacedTile;

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

			this.socket.on("gameStart", (hand, tile) => {
				this.centerTile = tile;
				this.hand = hand;
				this.status = "started";
			});
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
