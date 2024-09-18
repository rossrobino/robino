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
} from "shiki/core";
import langBash from "shiki/langs/bash.mjs";
import langCss from "shiki/langs/css.mjs";
import langHtml from "shiki/langs/html.mjs";
import langJson from "shiki/langs/json.mjs";
import langMd from "shiki/langs/md.mjs";
import langTsx from "shiki/langs/tsx.mjs";
import { z } from "zod";

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

const mdIt = MarkdownIt({ typographer: true, linkify: true, html: true });

const variableTheme = createCssVariablesTheme();

const highlighter = createHighlighterCoreSync({
	themes: [variableTheme],
	langs: [langHtml, langCss, langTsx, langMd, langBash, langJson],
	engine: createJavaScriptRegexEngine(),
	langAlias: {
		svelte: "html",
		js: "tsx",
		jsx: "tsx",
		ts: "tsx",
	},
}) as HighlighterGeneric<any, any>;

mdIt.use(
	fromHighlighter(highlighter, {
		theme: "css-variables",
		transformers: [transformerMetaHighlight()],
	}),
);

mdIt.use(Anchor, { permalink: Anchor.permalink.headerLink() });

/**
 * - processes markdown strings, pass in a zod schema for frontmatter parsing
 * - uses `shiki` to syntax highlight
 *
 * ```ts
 * import { processMarkdown } from "robino/util/md";
 *
 * const frontmatterSchema = z
 *		.object({
 *			title: z.string(),
 *			description: z.string(),
 *			keywords: z
 *				.string()
 *				.transform((val) => val.split(",").map((s) => s.trim().toLowerCase())),
 *			date: z.string(),
 *		})
 *		.strict();
 *
 * const data = processMarkdown({ md, frontmatterSchema });
 * ```
 * @param options
 * @returns headings, article, frontmatter, html
 */
export const processMarkdown = <T extends z.ZodTypeAny>(options: {
	/** String of markdown to process. */
	md: string;

	/** An optional zod schema */
	frontmatterSchema?: T;
}) => {
	const { md, frontmatterSchema } = options;

	const split = md.split("---");

	const yaml = split.at(1);

	const shouldProcessFrontmatter = yaml && frontmatterSchema;

	const article = shouldProcessFrontmatter ? split.slice(2).join("---") : md;

	const frontmatter = shouldProcessFrontmatter
		? getFrontmatter(yaml, frontmatterSchema)
		: {};

	const headings = getHeadings(article);

	const html = mdIt.render(article);

	const data: MdData<T> = { article, headings, html, frontmatter };

	return data;
};

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
