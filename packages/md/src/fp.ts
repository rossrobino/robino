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
	langConfig?: LangConfig;
	mdItInstance?: MarkdownIt; // Optional custom MarkdownIt instance
}

// Default language configuration
const defaultLangs = [langHtml, langCss, langTsx, langMd, langBash, langJson];
const defaultAliases = { svelte: "html", js: "tsx", jsx: "tsx", ts: "tsx" };

// Default highlighter setup using Shiki
const variableTheme = createCssVariablesTheme();
const defaultHighlighter = createHighlighterCoreSync({
	themes: [variableTheme],
	langs: defaultLangs,
	engine: createJavaScriptRegexEngine(),
	langAlias: defaultAliases,
}) as HighlighterGeneric<any, any>;

// Default MarkdownIt setup with highlighter and anchor plugin
const defaultMdIt = MarkdownIt({ typographer: true, linkify: true, html: true })
	.use(
		fromHighlighter(defaultHighlighter, {
			theme: "css-variables",
			transformers: [transformerMetaHighlight()],
		}),
	)
	.use(Anchor, { permalink: Anchor.permalink.headerLink() });

/**
 * Processes a markdown string with optional frontmatter parsing and a custom MarkdownIt instance.
 * 
 * If a custom `mdItInstance` is provided, it will be used for rendering. Otherwise, a default MarkdownIt instance
 * (created outside of the function scope) will be used.
 * 
 * This function retains its simplicity by accepting only the markdown content (`md`), 
 * the optional frontmatter schema (`frontmatterSchema`), and a custom MarkdownIt instance (`mdItInstance`) if needed.
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
 *   md, // markdown string
 *   frontmatterSchema, // optional frontmatter schema
 *   mdItInstance: customMdItInstance // optional custom MarkdownIt instance
 * });
 * ```
 *
 * @param options - An object containing markdown and optional configurations.
 * @param options.md - The markdown string to process.
 * @param options.frontmatterSchema - (Optional) Zod schema to validate and extract frontmatter.
 * @param options.mdItInstance - (Optional) A custom MarkdownIt instance to use for rendering.
 * @returns An object containing the processed `article`, `headings`, `html`, and `frontmatter`.
 */

export const processMarkdown = <T extends z.ZodTypeAny>(options: Options<T>) => {
  const { md, frontmatterSchema, mdItInstance } = options;

  // Use the provided MarkdownIt instance or default one
  const mdIt = mdItInstance ?? defaultMdIt;
  const split = md.split("---");
  const yaml = split.at(1);
  // Split and process frontmatter if applicable
  const shouldProcessFrontmatter = yaml && frontmatterSchema;

  const article = shouldProcessFrontmatter ? split.slice(2).join("---") : md;
  const frontmatter = shouldProcessFrontmatter
    ? getFrontmatter(yaml, frontmatterSchema)
    : {};

  const headings = getHeadings(article);

  // Render markdown to HTML using the mdIt instance
  const html = mdIt.render(article);

  return { article, headings, html, frontmatter };
};

/**
 * A higher-order function that creates a `processMarkdown` function with a pre-configured MarkdownIt instance.
 *
 * It merges the default language configurations (langs and aliases) with any custom language configurations provided
 * through the `langConfig`. Once created, the resulting `processMarkdown` function will utilize the generated `mdItInstance` 
 * for markdown processing.
 *
 * This approach retains flexibility while optimizing repeated usage by avoiding re-creating the MarkdownIt instance 
 * for each markdown string processed.
 * 
 * Example:
 * 
 * ```ts
 * import { createProcessMarkdown } from "robino/util/md";
 *
 * const frontmatterSchema = z.object({
 *   title: z.string(),
 *   description: z.string(),
 *   keywords: z.string().transform((val) => val.split(",").map((s) => s.trim().toLowerCase())),
 *   date: z.string(),
 * }).strict();
 *
 * const customProcessor = createProcessMarkdown({
 *   frontmatterSchema,
 *   langConfig: { 
 *     langs: [customLang], 
 *     aliases: { customAlias: "customLang" } 
 *   }
 * });
 *
 * const data = customProcessor({
 *   md: "# Your markdown string here", 
 *   frontmatterSchema 
 * });
 * ```
 * 
 * @param options - An object containing the configuration for the MarkdownIt instance.
 * @param options.frontmatterSchema - (Optional) Zod schema for frontmatter validation.
 * @param options.langConfig - (Optional) Custom language configurations for syntax highlighting.
 * @returns A `processMarkdown` function pre-configured with the merged MarkdownIt instance.
 */

export const createProcessMarkdown = <T extends z.ZodTypeAny>(
  options: Omit<Options<T>, 'md'>
) => {
  // Merge default language configurations with user-defined ones
  const mergedLangConfig = {
    langs: [
      ...(defaultLangs || []), // Default languages
      ...(options.langConfig?.langs || []), // User-defined languages
    ],
    aliases: {
      ...defaultAliases, // Default aliases
      ...options.langConfig?.aliases, // User-defined aliases
    },
  };

  // Create a MarkdownIt instance with the merged language configurations
  const mdItInstance = MarkdownIt({ typographer: true, linkify: true, html: true })
    .use(
      fromHighlighter(
        createHighlighterCoreSync({
          themes: [variableTheme],
          langs: mergedLangConfig.langs,
          engine: createJavaScriptRegexEngine(),
          langAlias: mergedLangConfig.aliases,
        }) as HighlighterGeneric<any, any>,
        {
          theme: "css-variables",
          transformers: [transformerMetaHighlight()],
        }
      )
    )
    .use(Anchor, { permalink: Anchor.permalink.headerLink() });

  // Return a pre-configured `processMarkdown` function
  return (processOptions: { md: string; frontmatterSchema?: T }) => {
    // Forward the `mdItInstance` to `processMarkdown`
    return processMarkdown({ ...processOptions, mdItInstance });
  };
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