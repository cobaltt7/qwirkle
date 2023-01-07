import "/socket.io/socket.io.min.js";
import { createApp } from "./vue.js";
import { Options, Vue } from "./vue-class-component.js";

import { generateTileUrl, ROOM_PARAMETER } from "./common/constants.js";

import type { Socket, io as transport } from "socket.io-client";
import type {
	ClientToServerEvents,
	Location,
	PlacedTile,
	ServerToClientEvents,
	Tile,
} from "./common/types.js";
declare const io: typeof transport;

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io({
	query: { room: new URL(location.href).searchParams.get(ROOM_PARAMETER) },
});

@Options({ template: document.body.innerHTML })
class App extends Vue {
	// Data
	heldTiles: Tile[] = [];
	selectedTile = -1;
	boardSize: { rows: [number, number]; columns: [number, number] } = {
		rows: [0, 0],
		columns: [0, 0],
	};
	placedTiles: Record<Location["y"], Record<Location["x"], PlacedTile>> = {};

	// Refs
	declare readonly $refs: { board: HTMLElement; hand: HTMLElement };

	// Hooks
	override mounted() {
		socket
			.on("place", (tile) => {
				if (tile.x < this.boardSize.columns[0]) this.boardSize.columns[0] = tile.x;
				else if (tile.x > this.boardSize.columns[1]) this.boardSize.columns[1] = tile.x;

				if (tile.y < this.boardSize.rows[0]) this.boardSize.rows[0] = tile.y;
				else if (tile.y > this.boardSize.rows[1]) this.boardSize.rows[1] = tile.y;

				(this.placedTiles[tile.y] ??= {})[tile.x] = tile;
			})
			.on("hand", (tiles) => {
				this.heldTiles = tiles;
			});
	}

	// Methods
	generateTileUrl = generateTileUrl;
	selectTile(event: Event) {
		if (!(event.target instanceof HTMLImageElement)) return; // Ignore, user didn't click on tile

		this.selectedTile = Array.prototype.indexOf.call(this.$refs.hand.children, event.target);
	}
	placeTile(event: Event) {
		if (!(event.target instanceof HTMLDivElement && event.target.parentElement?.parentElement))
			return; // Ignore, user didn't click on tile

		if (this.selectedTile === -1) return; // Warn, user didn't select tile

		const { row, column } = this.parseRawIndexes(
			Array.prototype.indexOf.call(event.target.parentElement.children, event.target) + 1,
			Array.prototype.indexOf.call(
				event.target.parentElement.parentElement.children,
				event.target.parentElement,
			) + 1,
		);

		socket.emit("turn", { y: row, x: column }, this.selectedTile);
		this.selectedTile = -1;
	}
	parseRawIndexes(rawColumn: number, rawRow: number) {
		return {
			row: this.boardSize.rows[0] + rawRow - 2,
			column: this.boardSize.columns[0] + rawColumn - 2,
		};
	}
	getFromBoard(rawColumn: number, rawRow: number) {
		const locations = this.parseRawIndexes(rawColumn, rawRow);
		return this.placedTiles[locations.row]?.[locations.column];
	}
}

createApp(App).mount(document.body);

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
