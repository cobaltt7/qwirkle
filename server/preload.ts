import { TILE_COLORS, TILE_SHAPES } from "../common/constants.js";
import { renderList, Fragment, openBlock, createElementBlock } from "vue";
import { renderToString } from "vue/server-renderer";
import { generateTileUrl } from "../common/util.js";
import { TileShape } from "../common/constants.js";
import { TileColor } from "../common/constants.js";

export default async function preload(input: string) {
	openBlock();
	const preloadTags = createElementBlock(Fragment, null, [
		(openBlock(true),
		createElementBlock(Fragment, null, renderList(TILE_COLORS, createLinksForColor), 256)),
	]);
	return input.replace("</head>", `${await renderToString(preloadTags)}</head>`);

	function createLinksForColor(color: TileColor) {
		openBlock();
		return createElementBlock(
			Fragment,
			null,
			[
				(openBlock(true),
				createElementBlock(
					Fragment,
					null,
					renderList(TILE_SHAPES, createLinkElement),
					128,
				)),
			],
			64,
		);

		function createLinkElement(shape: TileShape) {
			openBlock();
			return createElementBlock(
				"link",
				{
					rel: "preload",
					as: "image",
					crossorigin: "anonymous",
					key: color + "-" + shape,
					href: generateTileUrl({
						color,
						shape,
					}),
				},
				null,
				8,
			);
		}
	}
}
