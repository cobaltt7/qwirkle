import dotenv from "dotenv";

import connectIo from "./socket.js";

dotenv.config();

const { default: server } =
	process.env.NODE_ENV === "production" ?
		await import("./server.js")
	:	await import("./dev-server.js");

connectIo(server);
server.listen(process.env.PORT ?? 3000, () => {
	console.log("Server up!");
});

process.on("warning", console.warn).on("uncaughtException", console.error);
