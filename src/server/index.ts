import connectIo from "./socket.js";
import dotenv from "dotenv";
await dotenv.config();

const { default: server } =
	process.env.NODE_ENV === "production"
		? await import("./server.js")
		: await import("./dev-server.js");

connectIo(server);
server.listen(3000, () => {
	console.log("Server up!");
});

process.on("uncaughtException", (error) => {
	console.error(error);
});
