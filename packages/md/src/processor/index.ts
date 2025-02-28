import { tableOverflow } from "../table-overflow/index.js";
import { fromHighlighter } from "@shikijs/markdown-it/core";
import { transformerMetaHighlight } from "@shikijs/transformers";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { load } from "js-yaml";
import MarkdownIt from "markdown-it";
import type { Options as MarkdownItOptions } from "markdown-it";
import Anchor from "markdown-it-anchor";
import {
	createCssVariablesTheme,
	createHighlighterCoreSync,
	type HighlighterGeneric,
	type HighlighterCoreOptions,
} from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine-javascript.mjs";

export type Heading = {
	/** The heading's `id` (lowercase name separated by dashes). */
	id: string;

	/** Heading level - ex: h4 is level 4. */
	level: number;

	/** The text content of the heading element. */
	name: string;
};

export type Result<T extends StandardSchemaV1> = {
	/** The markdown content, without the frontmatter if it is parsed. */
	article: string;

	/** An array of headings with `id`, `level` and `name`. */
	headings: Heading[];

	/** The generated HTML. */
	html: string;

	/** The parsed frontmatter inferred from the passed in schema. */
	frontmatter: StandardSchemaV1.InferOutput<T>;
};

export type Options = {
	/**
	 * MarkdownIt options
	 *
	 * @default
	 *
	 * ```ts
	 * {
	 * 	typographer: true,
	 * 	linkify: true,
	 * 	html: true,
	 * }
	 * ```
	 */
	markdownIt?: MarkdownItOptions;

	/** Shiki highlighter options. */
	highlighter?: {
		/** Custom shiki grammars to load */
		langs: HighlighterCoreOptions<true>["langs"];

		/**
		 * Define custom aliases used
		 *
		 * @default undefined
		 */
		langAlias?: HighlighterCoreOptions<true>["langAlias"];
	};
};

export class Processor extends MarkdownIt {
	constructor(options: Options = {}) {
		super(
			(options.markdownIt ??= {
				typographer: true,
				linkify: true,
				html: true,
			}),
		);

		this.use(Anchor, {
			permalink: Anchor.permalink.headerLink(),
		}).use(tableOverflow);

		if (options.highlighter?.langs) {
			this.use(
				fromHighlighter(
					createHighlighterCoreSync({
						themes: [createCssVariablesTheme()],
						langs: options.highlighter?.langs,
						engine: createJavaScriptRegexEngine(),
						langAlias: options.highlighter?.langAlias,
					}) as HighlighterGeneric<any, any>,
					{
						theme: "css-variables",
						transformers: [transformerMetaHighlight()],
					},
				),
			);
		}
	}

	/**
	 * @param md markdown string to process
	 * @param frontmatterSchema optional frontmatter [Standard Schema](https://github.com/standard-schema/standard-schema)
	 * @returns headings, article, frontmatter, html
	 */
	async process<T extends StandardSchemaV1>(
		md: string,
		frontmatterSchema?: T,
	): Promise<Result<T>> {
		const [, yaml, ...articleSegments] = md.split("---");
		const processFrontmatter = yaml && frontmatterSchema;
		const article = processFrontmatter ? articleSegments.join("---") : md;

		const frontmatter = processFrontmatter
			? await this.getFrontmatter(yaml, frontmatterSchema)
			: {};

		const headings = this.getHeadings(article);

		// render markdown to HTML
		const html = this.render(article);

		return { article, headings, html, frontmatter };
	}

	/**
	 * Extracts headings from markdown content, skipping code blocks
	 *
	 * @param md
	 * @returns heading objects with level, name, and id
	 */
	getHeadings(md: string) {
		const headings: Heading[] = [];
		// removes content inside code blocks
		const withoutCodeBlocks = md.replace(/```[\s\S]*?```/g, "");
		const matches = withoutCodeBlocks.matchAll(/^(#{1,6})\s+(.+)$/gm);

		for (const match of matches) {
			const level = match.at(1)?.length;
			const name = match.at(2)?.trim();

			if (level && name) {
				headings.push({
					id: name
						.toLowerCase()
						.replaceAll(" ", "-")
						.replace(/[^\w-]+/g, ""),
					level,
					name,
				});
			}
		}

		return headings;
	}

	/**
	 * Extracts and validates frontmatter using the provided schema.
	 * If frontmatter is invalid, throws an error.
	 *
	 * @param yaml the frontmatter string of yaml without ---
	 * @param frontmatterSchema schema to validate frontmatter with
	 * - if no `frontmatterSchema` is provided, return type is `unknown`
	 * @returns parsed frontmatter object
	 */
	async getFrontmatter<T extends StandardSchemaV1>(
		yaml: string,
		frontmatterSchema: T,
	) {
		let result = frontmatterSchema["~standard"].validate(load(yaml));
		if (result instanceof Promise) result = await result;

		if (result.issues) {
			throw new Error(
				`Invalid frontmatter, please correct or update schema:\n\n${JSON.stringify(
					result.issues,
					null,
					4,
				)}`,
			);
		}

		return result.value;
	}
}
