import { type Options, Processor } from "../processor/index.js";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { Plugin } from "vite";

/**
 * @param options processor options
 * @returns Vite plugins for Markdown and frontmatter imports
 */
export const md = (
	options?: Options & {
		/** Optional frontmatter [Standard Schema](https://github.com/standard-schema/standard-schema) */
		FrontmatterSchema?: StandardSchemaV1;
	},
): Plugin[] => {
	const processor = new Processor(options);

	/**
	 * Compiles values into named ESM exports.
	 *
	 * @param values export names and values
	 * @returns Vite transform result
	 */
	const compile = (values: object) => ({
		code: Object.entries(values)
			.map(
				([name, value]) => `export const ${name} = ${JSON.stringify(value)};`,
			)
			.join("\n"),
		map: null,
	});

	return [
		{
			name: "@robino/md:frontmatter",
			transform: {
				filter: { id: /\.md\?frontmatter$/ },
				async handler(source) {
					if (!options?.FrontmatterSchema) {
						throw new Error(
							"The `?frontmatter` query requires a `FrontmatterSchema` option.",
						);
					}

					const [, yaml] = source.split("---");

					return compile({
						frontmatter: yaml
							? await processor.frontmatter(yaml, options.FrontmatterSchema)
							: {},
					});
				},
			},
		},
		{
			name: "@robino/md",
			transform: {
				filter: { id: /\.md$/ },
				async handler(source) {
					return compile(
						await processor.process(source, options?.FrontmatterSchema),
					);
				},
			},
		},
	];
};
