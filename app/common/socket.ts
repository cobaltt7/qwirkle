import type { Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "../../common/types";
import io from "socket.io-client";
import useStore from "./store.ts";

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io({
	autoConnect: false,
});

if (true) {
	socket.on("connect", () =>
		socket.io.on("open", () => {
			setTimeout(() => (location.href = location.href), 2000);
		}),
	);
}

socket
	.on("roomsUpdate", (rooms) => {
		const state = useStore();
		state.publicRooms = rooms;
	})
	.on("gameStart", (hand, centerTile) => {
		const state = useStore();
		state.$patch({ hand, status: "started", centerTile });
	})
	.on("playersUpdate", (players) => {
		const state = useStore();
		if (state.room) state.room.players = players;
	})
	.on("tilesPlaced", (tiles, deckLength) => {
		const state = useStore();
		tiles.map((tile) => {
			(state.board[tile.y] ??= {})[tile.x] = tile;
		});
		state.deckLength = deckLength;
		state.selectedTile = -1;
	})
	.on("gameEnd", (endReason) => {
		const state = useStore();
		state.$patch({ endReason, status: "ended" });
	});

export default socket;
