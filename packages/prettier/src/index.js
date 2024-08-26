/** @type {import("prettier").Config} */
export default {
	useTabs: true,
	htmlWhitespaceSensitivity: "ignore",
	plugins: [
		"@trivago/prettier-plugin-sort-imports",
		"prettier-plugin-css-order",
	],
};
