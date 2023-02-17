import { COMPONENTS, generateTileUrl, TILE_COLORS, TILE_SHAPES } from "./common/constants.js";
document.head.append(
	...COMPONENTS.map((component) => [
		Object.assign(document.createElement("link"), {
			as: "script",
			href: `./js/components/${component}.js`,
			rel: "preload",
			crossOrigin: "anonymous",
		}),
		Object.assign(document.createElement("link"), {
			as: "style",
			href: `./components/${component}.css`,
			rel: "preload",
			crossOrigin: "anonymous",
		}),
		Object.assign(document.createElement("link"), {
			as: "fetch",
			href: `./components/${component}`,
			rel: "preload",
			crossOrigin: "anonymous",
		}),
	]).flat(),
	...TILE_COLORS.map((color) =>
		TILE_SHAPES.map((shape) =>
			Object.assign(document.createElement("link"), {
				as: "image",
				href: generateTileUrl({ color, shape }),
				rel: "preload",
				crossOrigin: "anonymous",
			}),
		),
	).flat(),
);
