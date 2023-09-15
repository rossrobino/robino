import type { Config } from "prettier";

const prettier = {
	useTabs: true,
	printWidth: 80,
	htmlWhitespaceSensitivity: "ignore",
} satisfies Config;

export default prettier;
