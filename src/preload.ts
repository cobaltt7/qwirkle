import { COMPONENTS, generateTileUrl, TILE_COLORS, TILE_SHAPES } from "./common/constants.js";

for (const color of TILE_COLORS) {
	for (const shape of TILE_SHAPES) {
		document.head.append(
			Object.assign(document.createElement("link"), {
				as: "image",
				href: generateTileUrl({ color, shape }),
				rel: "preload",
			}),
		);
	}
}
for (const component of COMPONENTS) {
	document.head.append(
		Object.assign(document.createElement("link"), {
			as: "image",
			href: `./components/${component}.js`,
			rel: "preload",
		}),
		Object.assign(document.createElement("link"), {
			as: "image",
			href: `./components/${component}.css`,
			rel: "preload",
		}),
		Object.assign(document.createElement("link"), {
			as: "image",
			href: `./components/${component}.html`,
			rel: "preload",
		}),
	);
}
