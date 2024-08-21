import type { Config } from "prettier";

export default {
	useTabs: true,
	htmlWhitespaceSensitivity: "ignore",
	plugins: ["@trivago/prettier-plugin-sort-imports"],
} satisfies Config;
