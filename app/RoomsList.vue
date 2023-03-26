<template>
	<section id="rooms">
		<section id="rooms">
			<button
				@click="joinRoom(id)"
				type="button"
				class="room"
				v-for="(room, id) of publicRooms"
			>
				<h2>Room {{ id }}</h2>
				<p>Host: {{ room.host }}</p>
				<div>👥 {{ Object.keys(room.players).length }}</div>
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
			<input
				type="text"
				placeholder="Username"
				required
				ref="username"
				:value="defaultUsername"
			/>
			<button type="submit">Join</button>
		</form>
	</dialog>
</template>
<script lang="ts">
	import { Vue, Options } from "vue-class-component";
	import type App from "./App.vue";
	import { ROOM_PARAMETER } from "../common/constants.ts";
	import type { Rooms } from "../common/types.ts";
	import CreateRoom from "./CreateRoom.vue";
	import { getUsername } from "../common/util.ts";

	@Options({ components: { CreateRoom } })
	export default class RoomsList extends Vue {
		// Data
		publicRooms: Rooms = {};
		defaultUsername = getUsername();

		// Refs
		declare readonly $refs: {
			createRoomDialog: CreateRoom;
			joinRoomDialog: HTMLDialogElement;
			joinRoomInput: HTMLInputElement;
			username: HTMLInputElement;
		};
		declare readonly $root: App;

		// Hooks
		override mounted() {
			const roomId = new URL(location.href).searchParams.get(ROOM_PARAMETER);
			if (roomId) this.joinRoom(roomId);
			this.$root.socket.on("roomsUpdate", (rooms) => {
				this.publicRooms = rooms;
			});
		}

		// Methods
		joinRoom(roomId: string, username = this.$refs.username.value) {
			const jwt = localStorage.getItem("auth");
			this.$root.socket.emit(
				"joinRoom",
				roomId,
				username === this.defaultUsername && jwt ? { jwt } : { username },
				(response) => {
					if (typeof response === "number") alert(response);
					else {
						this.$root.roomId = roomId;
						const url = new URL(location.toString());
						url.searchParams.set("roomId", roomId);
						window.history.replaceState(undefined, "", url.toString());
						this.$root.status = "joined";
					}
				},
			);
		}
	}
</script>
<style scoped>
	#rooms {
		width: 70%;
		margin: auto;
	}

	.room {
		width: 100%;
		height: 70px;
		padding: 10px;
		align-content: space-between;
		justify-content: space-between;
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
		align-content: space-between;
		justify-content: space-between;
		padding: 10px;
	}

	#manage h2 {
		margin: auto;
		width: 100%;
	}
</style>
