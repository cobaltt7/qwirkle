import "/socket.io/socket.io.min.js";
import twemoji from "./lib/twemoji.js";
import { createApp } from "./lib/vue.js";
import { Options, Vue } from "./lib/vue-class-component.js";
import Game from "./components/game.js";

import { ROOM_PARAMETER } from "./common/constants.js";

import type { Socket, io as transport } from "socket.io-client";
import type { ClientToServerEvents, Rooms, ServerToClientEvents, Tile } from "./common/types.js";
declare const io: typeof transport;

twemoji.parse(document.body);

@Options({ template: document.body.innerHTML, components: { game: Game } })
export class App extends Vue {
	// Data
	heldTiles: Tile[] = [];
	roomId: string | null = null;
	publicRooms: Rooms = {};
	socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();

	// Refs
	declare readonly $refs: {
		createRoomDialog: HTMLDialogElement;
		createRoomInput: HTMLInputElement;
		joinRoomDialog: HTMLDialogElement;
		joinRoomInput: HTMLInputElement;
	};

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
		this.socket.on("roomsListUpdate", (rooms) => {
			this.publicRooms = rooms;
		});

		const roomId = new URL(location.href).searchParams.get(ROOM_PARAMETER);
		if (roomId) this.joinRoom(roomId);
	}

	// Methods
	joinRoom(roomId: string) {
		this.roomId = roomId;
		const url = new URL(location.toString());
		url.searchParams.set("roomId", roomId);
		window.history.replaceState(undefined, "", url.toString());
		this.socket.emit("joinRoom", roomId, (response) => {
			if (typeof response === "string") this.createRoom(roomId); //alert(response);
			else this.heldTiles = response;
		});
	}
	createRoom(roomId: string) {
		this.socket.emit("createRoom", roomId, (response) => {
			if (response) this.joinRoom(roomId);
			else alert(response);
		});
	}
}
const app = createApp(App).mount(document.body);
if (true) (window as any).vue = app;
