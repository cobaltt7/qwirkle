import "/socket.io/socket.io.min.js";
import twemoji from "./lib/twemoji.js";
import { createApp } from "./lib/vue.js";
import { Options, Vue } from "./lib/vue-class-component.js";

import { generateTileUrl, ROOM_PARAMETER } from "./common/constants.js";

import type { Socket, io as transport } from "socket.io-client";
import type {
	ClientToServerEvents,
	Location,
	PlacedTile,
	Rooms,
	ServerToClientEvents,
	Tile,
} from "./common/types.js";
declare const io: typeof transport;

twemoji.parse(document.body);

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();
if (true) {
	// TODO: drop in prod
	socket.on("connect", () =>
		socket.io.on("open", () => {
			setTimeout(() => (location.href = location.href), 2000);
		}),
	);
}

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
	roomId: string | null = null;
	publicRooms: Rooms = {};

	// Refs
	declare readonly $refs: {
		createRoomDialog: HTMLDialogElement;
		createRoomInput: HTMLInputElement;
		joinRoomDialog: HTMLDialogElement;
		joinRoomInput: HTMLInputElement;
	};

	// Hooks
	override mounted() {
		socket
			.on("tilePlaced", (tile) => {
				if (tile.x < this.boardSize.columns[0]) this.boardSize.columns[0] = tile.x;
				else if (tile.x > this.boardSize.columns[1]) this.boardSize.columns[1] = tile.x;

				if (tile.y < this.boardSize.rows[0]) this.boardSize.rows[0] = tile.y;
				else if (tile.y > this.boardSize.rows[1]) this.boardSize.rows[1] = tile.y;

				(this.placedTiles[tile.y] ??= {})[tile.x] = tile;
			})
			.on("roomsListUpdate", (rooms) => {
				this.publicRooms = rooms;
			});

		const roomId = new URL(location.href).searchParams.get(ROOM_PARAMETER);
		if (roomId) this.joinRoom(roomId);
	}

	// Methods
	generateTileUrl = generateTileUrl;
	selectTile(event: Event) {
		if (!(event.target instanceof Element)) return; // Idk how this could happen but TS says it can
		const button = event.target.closest("button");
		if (!button) return; // Ignore, user didn't click on tile

		this.selectedTile = Array.prototype.indexOf.call(button.parentNode?.children ?? [], button);
	}
	tilePlaced(event: Event) {
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

		socket.emit("placeTile", { y: row, x: column }, this.selectedTile, (response) => {
			if (typeof response === "string") alert(response);
			else this.heldTiles = response;
		});
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
	joinRoom(roomId: string) {
		this.roomId = roomId;
		const url = new URL(location.toString());
		url.searchParams.set("roomId", roomId);
		window.history.replaceState(undefined, "", url.toString());
		socket.emit("joinRoom", roomId, (response) => {
			if (typeof response === "string") this.createRoom(roomId); //alert(response);
			else this.heldTiles = response;
		});
	}
	createRoom(roomId: string) {
		socket.emit("createRoom", roomId, (response) => {
			if (response) this.joinRoom(roomId);
			else alert(response);
		});
	}
}
const app = createApp(App).mount(document.body);
if (true) (window as any).vue = app;
