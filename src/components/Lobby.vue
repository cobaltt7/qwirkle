<template>
	<section id="lobby">
		<section id="rooms">
			<button
				@click="joinRoom(id)"
				type="button"
				class="room"
				v-for="(room, id) of publicRooms"
			>
				<h2>Room {{ id }}</h2>
				<p>Host: {{ room.host }}</p>
				<div>👥 {{ room.players.length }}</div>
			</button>
		</section>
		<section id="manage">
			<button type="button" @click="$refs.createRoomDialog.$el.showModal()">
				<h2>Create New Room</h2>
			</button>
			<button type="button" @click="$refs.joinRoomDialog.showModal()">
				<h2>Join Private Room</h2>
			</button>
		</section>
	</section>
	<CreateRoom ref="createRoomDialog" />
	<dialog ref="joinRoomDialog">
		<form method="dialog" @submit="joinRoom($refs.joinRoomInput.value)">
			<h3>Join private room</h3>
			<input placeholder="Room ID" ref="joinRoomInput" required />
			<button type="submit">Join</button>
		</form>
	</dialog>
</template>
<script lang="ts">
	import { Vue, Options } from "vue-class-component";
	import type App from "./App.vue";
	import { ROOM_PARAMETER } from "../common/constants";
	import type { Rooms } from "../common/types";
	import CreateRoom from "./CreateRoom.vue";

	@Options({ components: { CreateRoom } })
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
			this.$root.socket.emit("mounted");
		}

		// Methods
		public joinRoom(roomId: string) {
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
</script>
<style scoped>
	#lobby {
		width: 70%;
		margin: auto;
	}

	.room {
		width: 100%;
		height: 70px;
	}

	.room * {
		margin: 0;
	}

	.room > :last-child {
		line-height: 100%;
		font-size: 46px;
	}

	#manage {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-evenly;
	}

	#manage button {
		height: 60px;
		width: 40%;
	}

	#manage h2 {
		margin: auto;
		width: 100%;
	}
</style>
<style>
	button {
		background: transparent;
		margin: 10px 0;
		padding: 10px;
		display: flex;
		justify-content: space-between;
		align-content: space-between;
		flex-direction: column;
		border-radius: 15px;
		flex-wrap: wrap;
	}

	button:hover {
		background: #f0f0f0;
	}
</style>
