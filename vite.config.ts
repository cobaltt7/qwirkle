import vue from "@vitejs/plugin-vue";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import htmlnano from "htmlnano";
import posthtml from "posthtml";
import type { UserConfigExport } from "vite";
import preload from "./src/server/preload";

process.env.NODE_ENV = "production";

export default {
	publicDir: "src/public",
	build: {
		target: "es2020",
		minify: "terser",
		rollupOptions: { output: { compact: true }, preserveEntrySignatures: "strict" },
		terserOptions: {
			compress: {
				arguments: true,
				booleans_as_integers: true,
				hoist_funs: true,
				hoist_vars: true,
				keep_fargs: false,
				keep_infinity: true,
				passes: 3,
				unsafe_Function: true,
				unsafe_comps: true,
				unsafe_methods: true,
				unsafe_proto: true,
				unsafe_undefined: true,
			},
			ecma: 2020,
			format: {
				comments: false,
				indent_level: 0,
				inline_script: false,
				semicolons: false,
				webkit: true,
			},
			module: true,
			parse: { html5_comments: false },
		},
	},
	css: {
		postcss: {
			map: true,
			plugins: [
				cssnano({
					autoprefixer: false,
					discardUnused: true,
					mergeIdents: true,
					reduceIdents: true,
					zindex: true,
				}),
				autoprefixer({ grid: "no-autoplace" }),
			],
		},
	},
	esbuild: { logLimit: 0, treeShaking: true },
	plugins: [
		vue(),
		{ enforce: "post", name: "preload", transformIndexHtml: preload },
		{
			enforce: "post",
			name: "htmlnano",
			async transformIndexHtml(input) {
				const { html } = await posthtml([
					htmlnano({
						collapseAttributeWhitespace: true,
						collapseBooleanAttributes: true,
						collapseWhitespace: true,
						deduplicateAttributeValues: true,
						mergeScripts: true,
						mergeStyles: true,
						minifyJs: false,
						minifyJson: true,
						minifySvg: {
							cleanupListOfValues: true,
							convertStyleToAttrs: true,
							reusePaths: true,
							sortAttrs: true,
						},
						normalizeAttributeValues: true,
						removeAttributeQuotes: true,
						removeComments: "all",
						removeEmptyAttributes: true,
						removeRedundantAttributes: true,
						sortAttributes: "frequency",
						sortAttributesWithLists: "frequency",
					}),
				]).process(input);
				return html;
			},
		},
	],
	logLevel: "error",
	appType: "custom",
} satisfies UserConfigExport;
