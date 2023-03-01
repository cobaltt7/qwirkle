<template>
	<dialog>
		<form method="dialog" @submit="createRoom($refs.roomId.value)">
			<h3>Create New Room</h3>
			<input type="text" placeholder="Room ID" required ref="roomId" />
			<p>
				<label>
					Require login to join
					<input
						type="checkbox"
						ref="authSwitch"
						@change="toggleAuth"
						:checked="authOn"
					/>
				</label>
				<label>
					Discord login
					<input
						type="checkbox"
						checked
						:disabled="!authOn"
						ref="discordAuth"
						@change="toggleAuthService('discord')"
					/>
				</label>
				<label>
					GitHub login
					<input
						type="checkbox"
						checked
						:disabled="!authOn"
						ref="githubAuth"
						@change="toggleAuthService('github')"
					/>
				</label>
			</p>
			<label>Hide game from homepage <input type="checkbox" ref="privateSwitch" /></label>
			<button type="submit">Create Room</button>
		</form>
	</dialog>
</template>
<script lang="ts">
	import { Vue } from "vue-class-component";
	import type RoomsList from "./RoomsList.vue";
	import type App from "./App.vue";

	export default class CreateRoom extends Vue {
		// Data
		authOn = false;

		// Refs
		declare readonly $refs: {
			roomId: HTMLInputElement;
			authSwitch: HTMLInputElement;
			discordAuth: HTMLInputElement;
			githubAuth: HTMLInputElement;
			privateSwitch: HTMLInputElement;
		};
		declare readonly $root: App;
		declare readonly $parent: RoomsList;

		// Hooks

		// Methods
		createRoom(roomId: string) {
			this.$root.socket.emit(
				"createRoom",
				{
					roomId: roomId,
					auth: this.authOn
						? {
								discord: this.$refs.discordAuth.checked,
								github: this.$refs.githubAuth.checked,
						  }
						: false,
					private: this.$refs.privateSwitch.checked,
				},
				(response) => {
					if (response) this.$parent.joinRoom(roomId);
					else alert(response);
				},
			);
		}

		toggleAuth() {
			this.authOn = this.$refs.authSwitch.checked;
		}
		toggleAuthService(service: "discord" | "github") {
			if (!this.$refs.discordAuth.checked && !this.$refs.githubAuth.checked) {
				this.authOn = false;
				this.$refs[`${service}Auth`].checked = true;
			}
		}
	}
</script>
<style>
	dialog {
		justify-content: center;
		align-items: center;
		padding: 1.5em 2.5em;
		width: 500px;
	}

	dialog[open] {
		display: flex;
	}

	form > * {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-content: center;
		height: 40px;
		width: 100%;
	}
	form label {
		display: flex;
		align-items: center;
	}

	form input[type="checkbox"] {
		margin: 0.25em;
	}

	form p > :first-child {
		width: 100%;
		justify-content: center;
	}

	form p > * {
		margin: 0 20px;
	}
</style>
