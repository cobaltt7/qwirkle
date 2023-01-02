import "/socket.io/socket.io.min.js";
import type { io as lookup, Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "./types";

declare const io: typeof lookup;

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();
const game = document.getElementById("game");
if (!game) throw new ReferenceError("Could not find game");
game.addEventListener("click", function (event) {
	if (!(event.target instanceof Element)) return;
	const cell = event.target.closest("td");
	if (!cell?.parentElement?.parentElement) return;
	socket.emit(
		"hello",
		`${Array.from(cell.parentElement.parentElement.children).indexOf(
			cell.parentElement,
		)}:${Array.from(cell.parentElement.children).indexOf(cell)}`,
	);
});
