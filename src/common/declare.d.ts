declare module "serve-handler/src/error.js" {
	function error(it: { statusCode: number; message: string }): string;
	export = error;
}
