import { createElementBlock, Fragment, openBlock, renderList } from "vue";
import { renderToString } from "vue/server-renderer";

import { TILE_SHAPES, TileShape } from "../common/constants.js";

export default async function preload(input: string) {
	openBlock();
	const preloadTags = createElementBlock(Fragment, null, [
		(openBlock(true),
		createElementBlock(Fragment, null, renderList(TILE_SHAPES, createLinks), 256)),
	]);
	return input.replace("</head>", `${await renderToString(preloadTags)}</head>`);

	function createLinks(shape: TileShape) {
		openBlock();
		return createElementBlock(
			Fragment,
			null,
			[
				(openBlock(),
				createElementBlock(
					"link",
					{
						rel: "preload",
						as: "image",
						crossorigin: "anonymous",
						href: `./assets/${shape}.svg`,
					},
					null,
					8,
				)),
			],
			64,
		);
	}
}
