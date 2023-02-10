const base = require("@redguy12/prettier-config");

/** @type {typeof base} */
module.exports = {
	...base,
	overrides: [...base.overrides, { files: "**.html", options: { parser: "vue" } }],
};
//todo htmlWhitespaceSensitivity
