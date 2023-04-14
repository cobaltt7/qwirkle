import http from "node:http";
import url from "node:url";
import path from "node:path";
import fileSystem from "node:fs/promises";
import { createServer as createViteServer } from "vite";
import preload from "./preload.js";

const dirname = path.dirname(url.fileURLToPath(import.meta.url));
const vite = await createViteServer({
	publicDir: "app/public",
	build: {
		target: "esnext",
		minify: false,
		rollupOptions: { output: { validate: true }, preserveEntrySignatures: "strict" },
	},
	esbuild: { logLimit: 0 },
	server: { cors: false, middlewareMode: true },
	logLevel: "error",
	appType: "custom",
	mode: "development",
});
export default http.createServer(async (request, response) => {
	try {
		if (request.url === "/main.ts") request.url = "/app/main.ts";
		vite.middlewares(request, response, serveHtml(request, response));
	} catch (error) {
		response
			.writeHead(500)
			.setHeader("Content-Type", "text/json")
			.end(JSON.stringify(error, undefined, "\t"));
		throw error;
	}
});

function serveHtml(_: http.IncomingMessage, response: http.ServerResponse) {
	return async function (error?: Error) {
		if (error) throw error;
		const html = await fileSystem.readFile(
			path.resolve(dirname, "../../app/index.html"),
			"utf-8",
		);

		response.writeHead(200).end(await preload(html));
	};
}
