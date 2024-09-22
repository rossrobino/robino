import { fromHighlighter } from "@shikijs/markdown-it/core";
import { transformerMetaHighlight } from "@shikijs/transformers";
import { load } from "js-yaml";
import MarkdownIt from "markdown-it";
import Anchor from "markdown-it-anchor";
import {
	createCssVariablesTheme,
	createHighlighterCoreSync,
	type HighlighterGeneric,
	createJavaScriptRegexEngine,
	type MaybeArray,
	type LanguageRegistration,
} from "shiki/core";
import langBash from "shiki/langs/bash.mjs";
import langCss from "shiki/langs/css.mjs";
import langHtml from "shiki/langs/html.mjs";
import langJson from "shiki/langs/json.mjs";
import langMd from "shiki/langs/md.mjs";
import langTsx from "shiki/langs/tsx.mjs";
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

export interface LangConfig {
	/** Custom shiki grammars to load */
	langs: MaybeArray<LanguageRegistration>[],

	/** Define custom aliases used */
	aliases?: Record<string, string>
}

export interface Options<T extends z.ZodTypeAny> {
		md: string;
		frontmatterSchema?: T;
		processFrontmatter?: boolean; // New option: Whether to process frontmatter (default: true)
		langConfig?: LangConfig
}

const mdIt = MarkdownIt({ typographer: true, linkify: true, html: true });

const variableTheme = createCssVariablesTheme();

mdIt.use(Anchor, { permalink: Anchor.permalink.headerLink() });

const defaultOptions = {
	md: "",
	lint: false,
	processFrontmatter: true,	
	langConfig: {
		langs: [langHtml, langCss, langTsx, langMd, langBash, langJson],
		aliases: {
			svelte: "html",
			js: "tsx",
			jsx: "tsx",
			ts: "tsx",
		}
	}
}

/**
 * - Processes markdown strings with optional frontmatter and syntax highlighting.
 * - Users can optionally pass custom language options for syntax highlighting.
 * - The function merges user-defined languages with default ones.
 *
 * ```ts
 * import { processMarkdown } from "robino/util/md";
 *
 * const frontmatterSchema = z.object({
 *   title: z.string(),
 *   description: z.string(),
 *   keywords: z.string().transform((val) => val.split(",").map((s) => s.trim().toLowerCase())),
 *   date: z.string(),
 * }).strict();
 *
 * const data = processMarkdown({
 *   md,
 *   frontmatterSchema,
 *   processFrontmatter: true,
 *   langConfig: {
 *     langs: [customLang],
 *     aliases: { customAlias: "customLang" }
 *   }
 * });
 * ```
 *
 * @param options - An object containing markdown and optional configurations
 * @returns headings, article, frontmatter, html
 */
export const processMarkdown = <T extends z.ZodTypeAny>(options: Options<T>) => {
	// Define default options

	// Merge passed options with default options
	const mergedOptions = {
		...defaultOptions,
		...options, // This overrides default options with user-defined options
		langConfig: {
			...defaultOptions.langConfig,
			...options.langConfig,
			langs: [
				...(defaultOptions.langConfig.langs || []), // Default languages
				...(options.langConfig?.langs || []) // User-defined languages (if provided)
			]
		}
	};
	const { md, frontmatterSchema, processFrontmatter, langConfig } = mergedOptions;


	// Create the highlighter core with provided or default languages
	const highlighter = createHighlighterCoreSync({
		themes: [variableTheme],
		langs: langConfig.langs, // Use merged languages
		engine: createJavaScriptRegexEngine(),
		langAlias: langConfig.aliases,
	}) as HighlighterGeneric<any, any>;

	// Configure MarkdownIt with syntax highlighting
	mdIt.use(
		fromHighlighter(highlighter, {
			theme: "css-variables",
			transformers: [transformerMetaHighlight()],
		}),
	);

	const split = md.split("---");
	const yaml = split.at(1);
	const shouldProcessFrontmatter =
		processFrontmatter && yaml && frontmatterSchema;

	// Process frontmatter based on option
	const article = shouldProcessFrontmatter ? split.slice(2).join("---") : md;
	const frontmatter = shouldProcessFrontmatter
		? getFrontmatter(yaml, frontmatterSchema)
		: {};

	const headings = getHeadings(article);

	// Render markdown to HTML
	let html = mdIt.render(article);

	return { article, headings, html, frontmatter };
};


/**
 * Extracts headings from markdown content, skipping code blocks.
 */
const getHeadings = (md: string) => {
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
};

/**
 * Extracts and validates frontmatter using the provided Zod schema.
 * If frontmatter is invalid, returns an empty object.
 */
const getFrontmatter = (yaml: string, frontmatterSchema: z.ZodSchema) => {
	const loaded = load(yaml);

	const parsed = frontmatterSchema.safeParse(loaded);

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
};
