import { Vue } from "../lib/vue-class-component.js";
import Component from "../lib/Component.js";
import type { App } from "../client.js";
import { ROOM_PARAMETER } from "../common/constants.js";
import type { Rooms } from "../common/types.js";
import type CreateRoom from "./CreateRoom.js";

@Component()
export default class Lobby extends Vue {
	// Data
	publicRooms: Rooms = {};

	// Refs
	declare readonly $refs: {
		createRoomDialog: CreateRoom;
		joinRoomDialog: HTMLDialogElement;
		joinRoomInput: HTMLInputElement;
	};
	declare readonly $root: App;

	// Hooks
	override mounted() {
		const roomId = new URL(location.href).searchParams.get(ROOM_PARAMETER);
		if (roomId) this.joinRoom(roomId);
		this.$root.socket.on("roomsListUpdate", (rooms) => {
			this.publicRooms = rooms;
		});
		console.log(this)
	}

	// Methods
	joinRoom(roomId: string) {
		this.$root.socket.emit("joinRoom", roomId, (response) => {
			if (typeof response === "string") alert(response);
			else {
				this.$root.roomId = roomId;
				const url = new URL(location.toString());
				url.searchParams.set("roomId", roomId);
				window.history.replaceState(undefined, "", url.toString());
				this.$root.heldTiles = response;
			}
		});
	}
}
