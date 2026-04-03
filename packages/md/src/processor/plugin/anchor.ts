import type { PluginSimple } from "markdown-it";
import type { RenderRule } from "markdown-it/lib/renderer.mjs";

/** Matches non-word characters while generating heading ids. */
const slugPattern = /[^\w-]+/g;

/**
 * Creates a heading id from text content.
 *
 * @param text heading text
 * @returns heading id
 */
export const slug = (text: string) => {
	return text.toLowerCase().replaceAll(" ", "-").replace(slugPattern, "");
};

/**
 * Markdown-it plugin that adds linked ids to headings.
 */
export const plugin: PluginSimple = (mdIt) => {
	const proxy: RenderRule = (tokens, i, options, _env, self) =>
		self.renderToken(tokens, i, options);
	const originalHeadingOpen = mdIt.renderer.rules.heading_open ?? proxy;
	const originalHeadingClose = mdIt.renderer.rules.heading_close ?? proxy;

	mdIt.core.ruler.push("anchor", (state) => {
		for (let i = 0; i < state.tokens.length - 1; i++) {
			const open = state.tokens[i];
			const inline = state.tokens[i + 1];

			if (open?.type !== "heading_open" || inline?.type !== "inline") continue;

			const id = slug(inline.content);

			if (!id) continue;

			open.attrSet("id", id);
			open.attrSet("tabindex", "-1");
		}
	});

	mdIt.renderer.rules.heading_open = (...args) => {
		const [tokens, i] = args;
		const id = tokens[i]?.attrGet("id");

		return id
			? originalHeadingOpen(...args) + `<a class="header-anchor" href="#${id}">`
			: originalHeadingOpen(...args);
	};

	mdIt.renderer.rules.heading_close = (...args) => {
		const [tokens, i] = args;
		const id = tokens[i - 2]?.attrGet("id");

		return id
			? `</a>` + originalHeadingClose(...args)
			: originalHeadingClose(...args);
	};
};
