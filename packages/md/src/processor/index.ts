import * as anchor from "./plugin/anchor.js";
import * as table from "./plugin/table-overflow.js";
import { Stream, snapshot } from "./stream.js";
import {
	type HighlighterCore,
	type HighlighterCoreOptions,
	createCssVariablesTheme,
	createHighlighterCoreSync,
} from "@shikijs/core";
import { createJavaScriptRegexEngine } from "@shikijs/engine-javascript";
import langMd from "@shikijs/langs/md";
import { fromHighlighter } from "@shikijs/markdown-it";
import { transformerMetaHighlight } from "@shikijs/transformers";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { load } from "js-yaml";
import MarkdownIt, {
	type MarkdownIt as Markdown,
	type MarkdownItOptions,
} from "markdown-it";

export interface Heading {
	/** The heading's `id` (lowercase name separated by dashes). */
	id: string;

	/** Heading level - ex: h4 is level 4. */
	level: number;

	/** The text content of the heading element. */
	name: string;
}

export interface Result<T extends StandardSchemaV1 = StandardSchemaV1> {
	/** The complete, unmodified markdown source. */
	source: string;

	/** The markdown content, without the frontmatter if it is parsed. */
	article: string;

	/** An array of headings with `id`, `level` and `name`. */
	headings: Heading[];

	/** The generated HTML. */
	html: string;

	/** The parsed frontmatter inferred from the passed in schema. */
	frontmatter: StandardSchemaV1.InferOutput<T>;
}

/** Processor options */
export interface Options {
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

	/** Set to `false` to disable heading anchors. */
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
	plugins?: ((md: Markdown) => void)[];
}

/**
 * Markdown processor with frontmatter parsing, heading extraction, and
 * streaming-safe HTML rendering.
 */
export class Processor extends MarkdownIt {
	#highlighter?: HighlighterCore;
	#compatible: () => boolean;

	/** Matches fenced code blocks while extracting headings. */
	static #codeBlockPattern = /```[\s\S]*?```/g;

	/** Matches headings while extracting them from markdown. */
	static #headingExtractPattern = /^(#{1,6})\s+(.+)$/gm;

	/**
	 * Creates a markdown processor with optional plugins, anchor support, and
	 * syntax highlighting.
	 *
	 * @param options processor options
	 */
	constructor(options: Options = {}) {
		options.markdownIt ??= {};
		options.markdownIt.typographer ??= true;
		options.markdownIt.linkify ??= true;
		options.markdownIt.html ??= true;
		options.anchor ??= true;
		options.plugins ??= [];

		super(options.markdownIt);

		const custom = options.plugins.length > 0 || !!options.markdownIt.highlight;
		const plugins = [...options.plugins, table.plugin];

		if (options.anchor) plugins.push(anchor.plugin);

		if (options.highlighter?.langs) {
			this.#highlighter = createHighlighterCoreSync({
				themes: [createCssVariablesTheme()],
				langs: [langMd, ...options.highlighter.langs],
				engine: createJavaScriptRegexEngine(),
				...(options.highlighter.langAlias == null
					? {}
					: { langAlias: options.highlighter.langAlias }),
			});
			plugins.push(
				fromHighlighter(this.#highlighter, {
					theme: "css-variables",
					transformers: [transformerMetaHighlight()],
					defaultLanguage: "md",
					fallbackLanguage: "md",
				}),
			);
		}

		for (const plugin of plugins) this.use(plugin);
		this.#compatible = custom ? () => false : snapshot(this);
	}

	/**
	 * @param md markdown string to process
	 * @param FrontmatterSchema optional frontmatter [Standard Schema](https://github.com/standard-schema/standard-schema)
	 * @returns source, article, headings, html, frontmatter
	 */
	async process<T extends StandardSchemaV1>(
		md: string,
		FrontmatterSchema?: T,
	): Promise<Result<T>> {
		const [, yaml, ...articleSegments] = md.split("---");
		const processFrontmatter = yaml && FrontmatterSchema;

		const article = processFrontmatter ? articleSegments.join("---") : md;

		return {
			source: md,
			article,
			headings: this.headings(article),
			html: this.render(article),
			frontmatter: processFrontmatter
				? await this.frontmatter(yaml, FrontmatterSchema)
				: {},
		};
	}

	/**
	 * Renders HTML incrementally, including top-level code lines and table rows.
	 * Concatenate chunks into one HTML response; chunks may contain open containers.
	 * Ambiguous Markdown and custom plugins are buffered to preserve correctness.
	 *
	 * @param mdIterable Markdown iterable
	 */
	async *generate(mdIterable: Iterable<string> | AsyncIterable<string>) {
		const stream = new Stream(this, this.#compatible(), this.#highlighter);

		for await (const chunk of mdIterable) {
			const html = stream.push(chunk);
			if (html) yield html;
		}

		const html = stream.flush();
		if (html) yield html;
	}

	/**
	 * @param mdStream `ReadableStream<string>` of markdown
	 * @returns HTML stream; incremental chunks may contain open containers.
	 */
	stream(mdStream: ReadableStream<string>) {
		const stream = new Stream(this, this.#compatible(), this.#highlighter);

		return mdStream.pipeThrough<string>(
			new TransformStream<string>({
				transform: (chunk, controller) => {
					const html = stream.push(chunk);
					if (html) controller.enqueue(html);
				},
				flush: (controller) => {
					const html = stream.flush();
					if (html) controller.enqueue(html);
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
	headings(md: string) {
		const headings: Heading[] = [];

		for (const match of md
			// removes content inside code blocks
			.replace(Processor.#codeBlockPattern, "")
			.matchAll(Processor.#headingExtractPattern)) {
			const level = match.at(1)?.length;
			const name = match.at(2)?.trim();

			if (level && name) {
				headings.push({ id: anchor.slug(name), level, name });
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
	async frontmatter<T extends StandardSchemaV1>(
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
