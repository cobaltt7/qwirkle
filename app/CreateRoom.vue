<template>
	<dialog>
		<form method="dialog" @submit="createRoom">
			<h3>Create New Room</h3>
			<input
				type="text"
				placeholder="Username"
				required
				ref="usernameInput"
				:value="defaultUsername"
			/>
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
	import { Component, Hook, Ref, Vue } from "vue-facing-decorator";
	import useStore from "./common/store.ts";
	import socket from "./common/socket.ts";

	@Component
	export default class CreateRoom extends Vue {
		authOn = false;
		defaultUsername: string | null = null;

		@Ref readonly usernameInput!: HTMLInputElement;
		@Ref readonly authSwitch!: HTMLInputElement;
		@Ref readonly discordAuth!: HTMLInputElement;
		@Ref readonly githubAuth!: HTMLInputElement;
		@Ref readonly privateSwitch!: HTMLInputElement;

		@Hook mounted() {
			const state = useStore();
			this.defaultUsername = state.username;
		}

		createRoom() {
			const state = useStore();
			if (this.usernameInput.value) state.username = this.usernameInput.value;
			if (!state.username) return;

			socket.emit(
				"createRoom",
				{
					auth: this.authOn
						? {
								discord: this.discordAuth.checked,
								github: this.githubAuth.checked,
						  }
						: false,
					private: this.privateSwitch.checked,
					username: state.username,
				},
				(jwt, room) => {
					localStorage.setItem("auth", jwt);
					if (!room) return alert("Error");

					state.room = room;
					const url = new URL(location.toString());
					url.searchParams.set("roomId", room.id);
					window.history.replaceState(undefined, "", url.toString());
					state.status = "joined";
				},
			);
		}

		toggleAuth() {
			this.authOn = this.authSwitch.checked;
		}
		toggleAuthService(service: "discord" | "github") {
			if (!this.discordAuth.checked && !this.githubAuth.checked) {
				this.authOn = false;
				this[`${service}Auth`].checked = true;
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
