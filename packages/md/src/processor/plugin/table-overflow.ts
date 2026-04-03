import type { PluginSimple } from "markdown-it";
import type { RenderRule } from "markdown-it/lib/renderer.mjs";

/**
 * Markdown-it plugin that wraps table elements in a container with horizontal overflow.
 */
export const tableOverflow: PluginSimple = (mdIt) => {
	const proxy: RenderRule = (tokens, i, options, _env, self) =>
		self.renderToken(tokens, i, options);

	const originalTableOpen = mdIt.renderer.rules.table_open ?? proxy;
	const originalTableClose = mdIt.renderer.rules.table_close ?? proxy;

	mdIt.renderer.rules.table_open = (...args) =>
		`<div style="overflow-x: auto">` + originalTableOpen(...args);

	mdIt.renderer.rules.table_close = (...args) =>
		originalTableClose(...args) + "</div>";
};
