import http from "node:http";
import path from "node:path";
import url from "node:url";

import { Server } from "socket.io";
import serve from "serve-handler";

import type {
	ClientToServerEvents,
	InterServerEvents,
	ServerToClientEvents,
	SocketData,
} from "./types";

const server = http
	.createServer((request, response) => {
		serve(request, response, {
			directoryListing: false,
			public: path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "../"),
		}).catch(console.error);
	})
	.listen(3000, () => {
		console.log("listening on *:3000");
	});

const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
	server,
);
io.on("connection", (socket) => {
	console.log("a user connected");
	socket.on("disconnect", () => {
		console.log("user disconnected");
	});
	socket.on("hello", console.log);
});
