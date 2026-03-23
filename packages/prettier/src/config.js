/** @import {Config} from "prettier" */

/** @type {Config} */
export const config = {
	useTabs: true,
	htmlWhitespaceSensitivity: "ignore",
	objectWrap: "collapse",
	importOrderSortSpecifiers: true,
	plugins: [
		"@trivago/prettier-plugin-sort-imports",
		"prettier-plugin-css-order",
	],
};
