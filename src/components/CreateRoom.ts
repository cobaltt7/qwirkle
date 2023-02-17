import { Vue } from "../lib/vue-class-component.js";
import type Lobby from "./Lobby.js";
import Component from "../lib/Component.js";
import type { App } from "../client.js";

@Component()
export default class CreateRoom extends Vue {
	// Data
	authOn = false;

	// Refs
	declare readonly $refs: {
		roomId: HTMLInputElement;
		authSwitch: HTMLInputElement;
		discordAuth: HTMLInputElement;
		githubAuth: HTMLInputElement;
	};
	declare readonly $root: App;
	declare readonly $parent: Lobby;

	// Hooks
	override mounted() {}

	// Methods
	createRoom(roomId: string) {
		this.$root.socket.emit("createRoom", roomId, (response) => {
			if (response) this.$parent.joinRoom(roomId);
			else alert(response);
		});
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
