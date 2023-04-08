<template>
	<TitleBar />
	<main>
		<RoomsList v-if="!status" />
		<Lobby v-else-if="status === 'joined'" />
		<Game v-else-if="status === 'started'" :centerTile="centerTile" />
		<Leaderboard v-else />
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
		PublicRoom,
	} from "../common/types.ts";
	import Game from "./Game.vue";
	import RoomsList from "./RoomsList.vue";
	import TitleBar from "./TitleBar.vue";
	import Lobby from "./Lobby.vue";
	import Leaderboard from "./Leaderboard.vue";
	import io from "socket.io-client";
	import { EndReason } from "../common/constants.ts";

	@Options({ components: { TitleBar, Game, RoomsList, Lobby, Leaderboard } })
	export default class App extends Vue {
		// Data
		hand: (Tile & { placed?: true })[] = [];
		room: PublicRoom | null = null;
		socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();
		status: null | "joined" | "started" | "ended" = null;
		centerTile?: PlacedTile;
		endReason?: EndReason;

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

			this.socket
				.on("gameStart", (hand, tile) => {
					this.centerTile = tile;
					this.hand = hand;
					this.status = "started";
				})
				.on("gameEnd", (reason) => {
					this.endReason = reason;
					this.status = "ended";
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
