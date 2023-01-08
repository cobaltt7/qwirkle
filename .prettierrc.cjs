const base = require("@redguy12/prettier-config");

module.exports = {
	...base,
	overrides: [...base.overrides, { files: "**.html", options: { parser: "vue" } }],
	plugins: [...base.plugins, require.resolve("prettier-plugin-vue")],
};
