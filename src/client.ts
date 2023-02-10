import "/socket.io/socket.io.min.js";
import twemoji from "./lib/twemoji.js";
import { createApp, defineAsyncComponent } from "./lib/vue.js";
import { Options, Vue, VueBase, VueConstructor } from "./lib/vue-class-component.js";

import type { Socket, io as transport } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents, Tile } from "./common/types.js";
declare const io: typeof transport;

twemoji.parse(document.body);

const COMPONENTS = ["Game", "Lobby", "Header"];

const components = Object.fromEntries(
	COMPONENTS.map((name) => [
		name,
		defineAsyncComponent(
			async (): Promise<VueConstructor<VueBase>> =>
				(await import(`./components/${name}.js`)).default,
		),
	]),
);

@Options({
	template: document.body.innerHTML,
	components,
})
export class App extends Vue {
	// Data
	heldTiles: Tile[] = [];
	roomId: string | null = null;
	socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();

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
	}

	// Methods
}
const app = createApp(App).mount(document.body);
if (true) (window as any).vue = app;
function cacheAsyncComponent<C extends object = {}>(component: C): Promise<C> {
	return "__asyncLoader" in component && typeof component.__asyncLoader === "function"
		? component.__asyncLoader()?.then(component)
		: component;
}

await Promise.all(Object.values(components).map(cacheAsyncComponent));
