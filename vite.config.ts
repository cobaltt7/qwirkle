import vue from "@vitejs/plugin-vue";
import autoprefixer from "autoprefixer";
import type { UserConfigExport } from "vite";
import preload from "./server/preload.ts";

process.env.NODE_ENV = "production";

export default {
	publicDir: "app/public",
	build: {
		target: "es2020",
		minify: "terser",
		cssMinify: true,
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
	css: { postcss: { map: true, plugins: [autoprefixer({ grid: "no-autoplace" })] } },
	esbuild: { logLimit: 0, treeShaking: true },
	plugins: [vue(), { enforce: "post", name: "preload", transformIndexHtml: preload }],
	logLevel: "error",
	appType: "custom",
	test: { coverage: { all: true, reporter: ["text", "text-summary"] } },
} satisfies UserConfigExport;
