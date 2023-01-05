import { generateTileUrl, TILE_COLORS, TILE_SHAPES } from "./common/constants.js";

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
