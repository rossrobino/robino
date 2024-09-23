import { fromHighlighter } from "@shikijs/markdown-it/core";
import { transformerMetaHighlight } from "@shikijs/transformers";
import { load } from "js-yaml";
import MarkdownIt from "markdown-it";
import type { Options as MarkdownItOptions } from "markdown-it";
import Anchor from "markdown-it-anchor";
import {
	createCssVariablesTheme,
	createHighlighterCoreSync,
	type HighlighterGeneric,
	createJavaScriptRegexEngine,
	type HighlighterCoreOptions,
} from "shiki/core";
import type { z } from "zod";

export interface MdHeading {
	/** The heading's `id` (lowercase name separated by dashes). */
	id: string;

	/** Heading level - ex: h4 is level 4. */
	level: number;

	/** The text content of the heading element. */
	name: string;
}

export interface MdData<T extends z.ZodTypeAny> {
	/** The markdown content, without the frontmatter if it is parsed. */
	article: string;

	/** An array of headings with `id`, `level` and `name`. */
	headings: MdHeading[];

	/** The generated HTML. */
	html: string;

	/** The parsed frontmatter inferred from the passed in schema. */
	frontmatter: z.infer<T>;
}

export type MarkdownProcessorOptions = {
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
	highlighter: {
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

/**
 * - Processes markdown strings with optional frontmatter and syntax highlighting.
 * - Pass custom language options for syntax highlighting, import from `"shiki/langs/..."`.
 *
 * ```ts
 * import { MarkdownProcessor } from "@robino/md";
 * import langHtml from "shiki/langs/html.mjs";
 *
 * const frontmatterSchema = z.object({
 *   title: z.string(),
 *   description: z.string(),
 *   keywords: z.string().transform((val) => val.split(",").map((s) => s.trim().toLowerCase())),
 *   date: z.string(),
 * }).strict();
 *
 * const processor = new MarkdownProcessor({
 * 	highlighter: {
 * 		langs: [langHtml],
 * 		langAlias: {
 * 			svelte: "html",
 * 		},
 * 	},
 * });
 *
 * const data = processor.process(md, frontmatterSchema);
 * ```
 */
export class MarkdownProcessor {
	/** MarkdownIt instance */
	markdownIt: MarkdownIt;

	constructor(options: MarkdownProcessorOptions) {
		if (!options.markdownIt) {
			// default MarkdownIt options
			options.markdownIt = {
				typographer: true,
				linkify: true,
				html: true,
			};
		}

		this.markdownIt = MarkdownIt(options.markdownIt);

		// Configure MarkdownIt with syntax highlighting
		this.markdownIt
			.use(
				fromHighlighter(
					// Create the highlighter core with provided languages
					createHighlighterCoreSync({
						themes: [createCssVariablesTheme()],
						langs: options.highlighter.langs,
						engine: createJavaScriptRegexEngine(),
						langAlias: options.highlighter.langAlias,
					}) as HighlighterGeneric<any, any>,
					{
						theme: "css-variables",
						transformers: [transformerMetaHighlight()],
					},
				),
			)
			.use(Anchor, { permalink: Anchor.permalink.headerLink() });
	}

	/**
	 * @param md Markdown string to process.
	 * @param frontmatterSchema Optional Zod frontmatter schema
	 * @returns headings, article, frontmatter, html
	 */
	process<T extends z.ZodTypeAny>(
		md: string,
		frontmatterSchema?: T,
	): MdData<T> {
		const split = md.split("---");

		const yaml = split.at(1);
		const shouldProcessFrontmatter = yaml && frontmatterSchema;

		const article = shouldProcessFrontmatter ? split.slice(2).join("---") : md;

		// Process frontmatter based on option
		const frontmatter = shouldProcessFrontmatter
			? this.getFrontmatter(yaml, frontmatterSchema)
			: {};

		const headings = this.getHeadings(article);

		// Render markdown to HTML
		const html = this.markdownIt.render(article);

		return { article, headings, html, frontmatter };
	}

	/** Extracts headings from markdown content, skipping code blocks. */
	getHeadings(md: string) {
		const lines = md.split("\n");
		const headingRegex = /^(#{1,6})\s*(.+)/;
		const codeFenceRegex = /^```/;

		let inCodeFence = false;
		const headings: MdHeading[] = [];
		for (let line of lines) {
			line = line.trim();

			// Check for code fence
			if (codeFenceRegex.test(line)) {
				inCodeFence = !inCodeFence;
				continue;
			}

			// Skip headings within code fences
			if (inCodeFence) continue;

			const match = headingRegex.exec(line);
			if (match) {
				const level = match.at(1)?.length;
				const name = match.at(2);

				if (level && name) {
					const id = name
						.trim()
						.toLowerCase()
						.replace(/\s+/g, "-")
						.replace(/[^\w-]+/g, "");

					headings.push({ id, level, name });
				}
			}
		}

		return headings;
	}

	/**
	 * Extracts and validates frontmatter using the provided Zod schema.
	 * If frontmatter is invalid, throws an error.
	 */
	getFrontmatter(yaml: string, frontmatterSchema: z.ZodSchema) {
		const parsed = frontmatterSchema.safeParse(load(yaml));

		if (!parsed.success) {
			throw new Error(
				`Invalid frontmatter, please correct or update schema:\n\n${JSON.stringify(
					parsed.error.issues[0],
					null,
					4,
				)}`,
			);
		}

		return parsed.data;
	}
}
