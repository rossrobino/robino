import { tableOverflow } from "../table-overflow/index.js";
import {
	createCssVariablesTheme,
	createHighlighterCoreSync,
	type HighlighterGeneric,
	type HighlighterCoreOptions,
} from "@shikijs/core";
import { createJavaScriptRegexEngine } from "@shikijs/engine-javascript";
import langMd from "@shikijs/langs/md";
import { fromHighlighter } from "@shikijs/markdown-it/core";
import { transformerMetaHighlight } from "@shikijs/transformers";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { load } from "js-yaml";
import MarkdownIt from "markdown-it";
import type { Options as MarkdownItOptions, PluginSimple } from "markdown-it";
import Anchor from "markdown-it-anchor";

export type Heading = {
	/** The heading's `id` (lowercase name separated by dashes). */
	id: string;

	/** Heading level - ex: h4 is level 4. */
	level: number;

	/** The text content of the heading element. */
	name: string;
};

export type Result<T extends StandardSchemaV1 = StandardSchemaV1> = {
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

	/** Set to `false` to disable the markdown-it-anchor plugin for headings. */
	anchor?: boolean;

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

	/** Plugins to apply. */
	plugins?: PluginSimple[];
};

export class Processor extends MarkdownIt {
	#highlighter;

	constructor(options: Options = {}) {
		options.markdownIt ??= {};
		options.markdownIt.typographer ??= true;
		options.markdownIt.linkify ??= true;
		options.markdownIt.html ??= true;
		options.plugins ??= [];

		super(options.markdownIt);

		for (const plugin of options.plugins) {
			this.use(plugin);
		}

		this.#highlighter = createHighlighterCoreSync({
			themes: [createCssVariablesTheme()],
			langs: [langMd, ...(options.highlighter?.langs ?? [])],
			engine: createJavaScriptRegexEngine(),
			langAlias: options.highlighter?.langAlias,
		}) as HighlighterGeneric<any, any>;

		if (options.anchor !== false) {
			// true or undefined ok
			this.use(Anchor, { permalink: Anchor.permalink.headerLink() });
		}

		this.use(tableOverflow);

		if (options.highlighter?.langs) {
			this.use(
				fromHighlighter(this.#highlighter, {
					theme: "css-variables",
					transformers: [transformerMetaHighlight()],
					defaultLanguage: "md",
					fallbackLanguage: "md",
				}),
			);
		}
	}

	/**
	 * @param md markdown string to process
	 * @param FrontmatterSchema optional frontmatter [Standard Schema](https://github.com/standard-schema/standard-schema)
	 * @returns headings, article, frontmatter, html
	 */
	async process<T extends StandardSchemaV1>(
		md: string,
		FrontmatterSchema?: T,
	): Promise<Result<T>> {
		const [, yaml, ...articleSegments] = md.split("---");
		const processFrontmatter = yaml && FrontmatterSchema;

		const article = processFrontmatter ? articleSegments.join("---") : md;
		const frontmatter = processFrontmatter
			? await this.getFrontmatter(yaml, FrontmatterSchema)
			: {};
		const headings = this.getHeadings(article);
		const html = this.render(article);

		return { article, headings, html, frontmatter };
	}

	/**
	 * Only render complete elements.
	 *
	 * @param md markdown to render
	 * @returns rendered markdown and remaining to be highlight in the next run
	 */
	#processCompleteElements(md: string) {
		const notComplete = { html: "", remaining: md };

		if (!md.trim()) return notComplete;

		if (md.includes("```")) {
			const codeBlockMatch = md.match(
				/^```\s*(\w+)?\n([\s\S]*?)\n```(?:\n|$)/m,
			);

			if (!codeBlockMatch) return notComplete;

			const endPos = codeBlockMatch.index! + codeBlockMatch[0].length;

			return {
				html: this.render(md.slice(0, endPos)),
				remaining: md.slice(endPos),
			};
		}

		const double = "\n\n";
		const parts = md.split(double);
		let html = "";

		for (let i = 0; i < parts.length - 1; i++)
			html += this.render(parts[i]! + double);

		return { html, remaining: parts.at(-1) ?? "" };
	}

	/**
	 * @param mdStream `ReadableStream<string>` of markdown
	 * @returns `ReadableStream<string>` of syntax highlighted HTML
	 */
	renderStream(mdStream: ReadableStream<string>) {
		let buffer = "";

		return mdStream.pipeThrough<string>(
			new TransformStream<string>({
				transform: (chunk, c) => {
					buffer += chunk;
					let result = this.#processCompleteElements(buffer);

					while (result.html) {
						c.enqueue(result.html);
						buffer = result.remaining;
						if (!buffer) break;
						result = this.#processCompleteElements(buffer);
					}
				},
				flush: (c) => {
					if (buffer) c.enqueue(this.render(buffer)); // last
				},
			}),
		);
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
