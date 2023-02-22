import { generateTileUrl, TILE_COLORS, TILE_SHAPES } from "./common/constants";
document.head.append(
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
// todo vite
