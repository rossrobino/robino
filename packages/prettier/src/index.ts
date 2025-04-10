import type { Config } from "prettier";

const config: Config = {
	useTabs: true,
	htmlWhitespaceSensitivity: "ignore",
	objectWrap: "collapse",
	plugins: [
		"@trivago/prettier-plugin-sort-imports",
		"prettier-plugin-css-order",
	],
};

export default config;
