import "/socket.io/socket.io.min.js";
import { generateTileUrl } from "./constants.js";
import type { Socket, io as transport } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "./types.js";

declare const io: typeof transport;
const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();

const game = document.querySelector("main");
if (!game) throw new ReferenceError("Could not find game");
const hand = document.querySelector("footer");
if (!hand) throw new ReferenceError("Could not find hand");

let selected: number = -1;

hand.addEventListener("click", (event) => {
	if (!(event.target instanceof HTMLImageElement)) return; // Ignore, user didn't click on tile

	selected = Array.prototype.indexOf.call(event.target.parentElement?.children, event.target);
	const oldSelected = document.getElementById("selected");
	if (oldSelected) oldSelected.id = "";
	event.target.id = "selected";
});

game.addEventListener("click", function (event) {
	const cell =
		event.target instanceof HTMLDivElement && event.target.classList.contains("tile")
			? event.target
			: undefined;
	if (!cell?.parentElement?.parentElement) return; // Ignore, user didn't click on tile
	if (selected === -1) return; // Warn, user didn't select tile

	socket.emit(
		"turn",
		{
			y: Array.prototype.indexOf.call(
				cell.parentElement.parentElement.children,
				cell.parentElement,
			),
			x: Array.prototype.indexOf.call(cell.parentElement.children, cell),
		},
		selected,
	);
	selected = -1;
});

socket.on("place", (tile, location) => {
	const tileElement = game.children[location.y]?.children[location.x];
	if (!(tileElement instanceof HTMLDivElement)) return; // Error, invalid location

	const image = Object.assign(document.createElement("img"), {
		src: generateTileUrl(tile),
		alt: `${tile.color} ${tile.shape}`,
	});

	tileElement.append(image);
});
socket.on("hand", (tiles) => {
	hand.replaceChildren(
		...tiles.map((tile) =>
			Object.assign(document.createElement("img"), {
				src: generateTileUrl(tile),
				alt: `${tile.color} ${tile.shape}`,
			}),
		),
	);
	const oldSelected = document.getElementById("selected");
	if (oldSelected) oldSelected.id = "";
});
socket.on("error", (error) => {
	alert(error);
});

if (true) {
	// TODO: drop in prod
	socket.on("disconnect", () => {
		location.href = location.href;
	});
}
