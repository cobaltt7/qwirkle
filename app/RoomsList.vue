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
			<button type="button" @click="createRoomDialog.$el.showModal()">
				<h2>Create New Room</h2>
			</button>
			<button type="button" @click="joinRoomDialog.showModal()">
				<h2>Join Private Room</h2>
			</button>
		</section>
	</section>
	<CreateRoom ref="createRoomDialog" />
	<dialog ref="joinRoomDialog">
		<form method="dialog" @submit="joinRoom(joinRoomInput.value)">
			<h3>Join private room</h3>
			<input placeholder="Room ID" ref="joinRoomInput" required />
			<input
				type="text"
				placeholder="Username"
				required
				ref="usernameInput"
				:value="defaultUsername"
			/>
			<button type="submit">Join</button>
		</form>
	</dialog>
</template>
<script lang="ts">
	import { Vue, Component, Ref, Hook } from "vue-facing-decorator";
	import { ROOM_PARAMETER } from "../common/constants.ts";
	import CreateRoom from "./CreateRoom.vue";
	import useStore from "../common/store.ts";
	import socket from "../common/socket.ts";

	@Component({ components: { CreateRoom } })
	export default class RoomsList extends Vue {
		defaultUsername: string | null = null;

		get publicRooms() {
			const state = useStore();
			return state.publicRooms;
		}

		@Ref readonly createRoomDialog!: CreateRoom;
		@Ref readonly joinRoomDialog!: HTMLDialogElement;
		@Ref readonly joinRoomInput!: HTMLInputElement;
		@Ref readonly usernameInput!: HTMLInputElement;

		@Hook mounted() {
			const state = useStore();
			this.defaultUsername = state.username;
			const roomId = new URL(location.href).searchParams.get(ROOM_PARAMETER);
			if (roomId) this.joinRoom(roomId);
		}

		joinRoom(roomId: string, username = this.usernameInput.value) {
			const state = useStore();
			state.username = username;

			const jwt = localStorage.getItem("auth");
			socket.emit(
				"joinRoom",
				roomId,
				username === this.defaultUsername && jwt ? { jwt } : { username },
				(response) => {
					if (typeof response === "number") alert(response);
					else {
						state.room = this.publicRooms[roomId] ?? null;
						const url = new URL(location.toString());
						url.searchParams.set("roomId", roomId);
						window.history.replaceState(undefined, "", url.toString());
						state.status = "joined";
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
