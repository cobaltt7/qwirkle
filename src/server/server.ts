import http from "node:http";
import url from "node:url";
import path from "node:path";

import serve from "serve-handler";
import generateError from "serve-handler/src/error.js";

const dirname = path.dirname(url.fileURLToPath(import.meta.url));
export default http.createServer(async (request, response) => {
	try {
		serve(request, response, {
			directoryListing: false,
			public: path.resolve(dirname, "../"),
		});
	} catch (error) {
		response.writeHead(500).end(
			generateError({
				statusCode: 500,
				message: error.name + ": " + error.message,
			}),
		);
		throw error;
	}
});
