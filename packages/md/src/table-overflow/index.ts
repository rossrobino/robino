import MarkdownIt from "markdown-it";
import type { PluginSimple } from "markdown-it";
import type { RenderRule } from "markdown-it/lib/renderer.mjs";

/**
 * Markdown-it plugin that wraps table elements in a container with horizontal overflow.
 *
 * @param md markdown-it instance
 */
export const tableOverflow: PluginSimple = (md: MarkdownIt) => {
	// Store reference to the original renderer rules
	const originalTableOpenRenderer: RenderRule =
		md.renderer.rules.table_open ??
		((tokens, idx, options, _env, self) =>
			self.renderToken(tokens, idx, options));

	const originalTableCloseRenderer: RenderRule =
		md.renderer.rules.table_close ??
		((tokens, idx, options, _env, self) =>
			self.renderToken(tokens, idx, options));

	md.renderer.rules.table_open = (tokens, idx, options, env, self) => {
		return (
			`<div style="overflow-x: auto;">` +
			originalTableOpenRenderer(tokens, idx, options, env, self)
		);
	};

	md.renderer.rules.table_close = (tokens, idx: number, options, env, self) => {
		return (
			originalTableCloseRenderer(tokens, idx, options, env, self) + "</div>"
		);
	};
};
