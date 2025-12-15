import { type Options, Processor } from "../processor/index.js";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { Plugin } from "vite";

/**
 * @param options
 * @returns vite plugin
 */
export const md = (
	options?: Options & {
		/** Optional frontmatter [Standard Schema](https://github.com/standard-schema/standard-schema) */
		FrontmatterSchema?: StandardSchemaV1;
	},
): Plugin => {
	const processor = new Processor(options);

	return {
		name: "@robino/md",
		transform: {
			filter: { id: /\.md$/ },
			async handler(md) {
				const { html, article, headings, frontmatter } =
					await processor.process(md, options?.FrontmatterSchema);

				return {
					code: `
				export const html = ${JSON.stringify(html)};
				export const article = ${JSON.stringify(article)};
				export const headings = ${JSON.stringify(headings)};
				export const frontmatter = ${JSON.stringify(frontmatter)};
			`.trim(),
					map: null,
				};
			},
		},
	};
};
