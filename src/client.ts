import "/socket.io/socket.io.min.js";
import { generateTileUrl } from "./common/constants.js";
import type { Socket, io as transport } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "./common/types.js";
import { createApp } from "./vue.js";
declare const io: typeof transport;
const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();

const App = createApp({
	data() {
		return {
			hand: [],
			selected: -1,
			board: { rows: [-1, 1], columns: [-1, 1] },
		};
	},
	mounted() {
		const { board, hand } = this.$refs;

		if (!(board instanceof Element)) throw new ReferenceError("Could not find board");
		if (!(hand instanceof Element)) throw new ReferenceError("Could not find hand");

		socket.on("place", (tile, location) => {
			const tileElement = board.children[location.y]?.children[location.x];
			if (!(tileElement instanceof HTMLDivElement)) return; // Error, invalid location

			const image = Object.assign(document.createElement("img"), {
				src: generateTileUrl(tile),
				alt: `${tile.color} ${tile.shape}`,
			});

			tileElement.append(image);
		});
		socket.on("hand", (tiles) => {
			this.hand = tiles;
		});
		socket.on("error", (error) => {
			alert(error);
		});

		if (true) {
			// TODO: drop in prod
			socket.on("connect", () =>
				socket.io.on("open", () => {
					setTimeout(() => (location.href = location.href), 2000);
				}),
			);
		}
	},
	methods: {
		generateTileUrl,
		selectTile(event: Event) {
			if (!(event.target instanceof HTMLImageElement)) return; // Ignore, user didn't click on tile

			this.selected = Array.prototype.indexOf.call(this.$refs.hand.children, event.target);
		},
		placeTile(event: Event) {
			const cell =
				event.target instanceof HTMLDivElement && event.target.classList.contains("tile")
					? event.target
					: undefined;
			if (!cell?.parentElement?.parentElement) return; // Ignore, user didn't click on tile
			if (this.selected === -1) return; // Warn, user didn't select tile

			socket.emit(
				"turn",
				{
					y: Array.prototype.indexOf.call(
						cell.parentElement.parentElement.children,
						cell.parentElement,
					),
					x: Array.prototype.indexOf.call(cell.parentElement.children, cell),
				},
				this.selected,
			);
			this.selected = -1;
		},
	},
});
App.mount("body");
