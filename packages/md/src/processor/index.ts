import * as anchor from "./plugin/anchor.js";
import * as table from "./plugin/table-overflow.js";
import {
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
import {
	default as MarkdownIt,
	type Options as MarkdownItOptions,
	type PluginSimple,
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
	plugins?: PluginSimple[];
}

/** Mutable streaming scanner state reused across markdown chunks. */
class StreamState {
	/** End index of the stable prefix in the current buffer. */
	end = 0;

	/** Start index of the current unmatched fenced code block. */
	fence = -1;

	/** Fence marker for the current unmatched fenced code block. */
	marker = "";

	/** Current scan position in the buffered markdown. */
	pos = 0;

	/**
	 * Shifts the scan state after the rendered prefix has been removed from the
	 * buffer.
	 *
	 * @param end end of the rendered prefix
	 */
	shift(end: number) {
		if (!this.marker) {
			this.end = 0;
			this.fence = -1;
			this.marker = "";
			this.pos = 0;
			return;
		}

		this.end = 0;
		this.pos -= end;
		this.fence = 0;
	}
}

/**
 * Markdown processor with frontmatter parsing, heading extraction, and
 * streaming-safe HTML rendering.
 */
export class Processor extends MarkdownIt {
	/** Matches a fenced code block closing line. */
	static #fenceClosePattern = /^[ \t]{0,3}(`{3,})[ \t]*\n$/;

	/** Matches the opening marker of a fenced code block. */
	static #fenceOpenPattern = /^[ \t]{0,3}(`{3,})/;

	/** Matches a complete hash-style heading line. */
	static #headingPattern = /^[ \t]{0,3}#{1,6}(?!#)(?:[ \t]+.*)?\n$/;

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

		options.plugins.push(table.plugin);

		if (options.anchor) options.plugins.push(anchor.plugin);

		if (options.highlighter?.langs) {
			options.plugins.push(
				fromHighlighter(
					createHighlighterCoreSync({
						themes: [createCssVariablesTheme()],
						langs: [langMd, ...options.highlighter.langs],
						engine: createJavaScriptRegexEngine(),
						...(options.highlighter.langAlias == null
							? {}
							: { langAlias: options.highlighter.langAlias }),
					}),
					{
						theme: "css-variables",
						transformers: [transformerMetaHighlight()],
						defaultLanguage: "md",
						fallbackLanguage: "md",
					},
				),
			);
		}

		for (const plugin of options.plugins) this.use(plugin);
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

		return {
			article,
			headings: this.headings(article),
			html: this.render(article),
			frontmatter: processFrontmatter
				? await this.frontmatter(yaml, FrontmatterSchema)
				: {},
		};
	}

	/**
	 * Only render complete elements.
	 *
	 * @param md markdown to render
	 * @returns rendered markdown and remaining to be highlight in the next run
	 */
	#processCompleteElements(md: string, state: StreamState) {
		const incomplete = { html: "", remaining: md };

		if (!md.trim()) return incomplete;

		const end = this.#findStableEnd(md, state);
		if (!end) return incomplete;

		const remaining = md.slice(end);
		state.shift(end);

		return { html: this.render(md.slice(0, end)), remaining };
	}

	/**
	 * Finds the end of the prefix that is safe to render during streaming.
	 * If a fenced code block is still open, returns the start of that fence so
	 * everything before it can flush while the unmatched tail stays buffered.
	 *
	 * @param md markdown buffer collected so far
	 * @returns end index of the stable prefix
	 */
	#findStableEnd(md: string, state: StreamState) {
		while (true) {
			const end = md.indexOf("\n", state.pos);
			if (end < 0) break;

			const next = end + 1;
			const line = md.slice(state.pos, next);

			if (state.marker) {
				const close = line.match(Processor.#fenceClosePattern);

				if (close) {
					const [, marker = ""] = close;

					if (marker.length >= state.marker.length) {
						state.marker = "";
						state.end = next;
					}
				}
			} else {
				const open = line.match(Processor.#fenceOpenPattern);

				if (open) {
					[, state.marker = ""] = open;
					state.fence = state.pos;
				} else if (!line.trim() || Processor.#headingPattern.test(line)) {
					state.end = next;
				}
			}

			state.pos = next;
		}

		return state.marker ? state.fence : state.end;
	}

	/**
	 * @param mdIterable Markdown iterable
	 * @returns `AsyncGenerator<string>` of HTML
	 */
	async *generate(mdIterable: Iterable<string> | AsyncIterable<string>) {
		let buffer = "";
		const state = new StreamState();

		for await (const chunk of mdIterable) {
			buffer += chunk;
			let result;

			while ((result = this.#processCompleteElements(buffer, state)).html) {
				yield result.html;
				if (!(buffer = result.remaining)) break;
			}
		}

		if (buffer) yield this.render(buffer);
	}

	/**
	 * @param mdStream `ReadableStream<string>` of markdown
	 * @returns `ReadableStream<string>` of syntax highlighted HTML
	 */
	stream(mdStream: ReadableStream<string>) {
		let buffer = "";
		const state = new StreamState();

		return mdStream.pipeThrough<string>(
			new TransformStream<string>({
				transform: (chunk, c) => {
					buffer += chunk;
					let result;

					while ((result = this.#processCompleteElements(buffer, state)).html) {
						c.enqueue(result.html);
						if (!(buffer = result.remaining)) break;
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
