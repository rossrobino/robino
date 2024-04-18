import { load } from "js-yaml";
import { z } from "zod";
import { marked } from "marked";
import { gfmHeadingId } from "marked-gfm-heading-id";
import { markedHighlight } from "marked-highlight";
import { markedSmartypants } from "marked-smartypants";
import hljs from "highlight.js/lib/common";

marked.use(gfmHeadingId());
marked.use(markedSmartypants());
marked.use(
	markedHighlight({
		langPrefix: "hljs language-",
		highlight: (code, lang) => {
			let language = "plaintext";
			if (hljs.getLanguage(lang)) {
				language = lang;
			} else if (lang === "svelte" || lang === "vue") {
				language = "html";
			}
			return hljs.highlight(code, { language }).value;
		},
	}),
);

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

/**
 * - processes markdown strings, pass in a zod schema for frontmatter parsing
 * - uses `highlight.js` to syntax highlight
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
 * const data = processMarkdown(md, frontmatterSchema);
 * ```
 * @param md string
 * @param frontmatterSchema an optional zod schema
 * @returns headings, article, frontmatter, html
 */
export const processMarkdown = async <T extends z.ZodTypeAny>(
	md: string,
	frontmatterSchema?: T,
) => {
	const split = md.split("---");

	const yaml = split.at(1);

	const shouldProcessFrontmatter = yaml && frontmatterSchema;

	const article = shouldProcessFrontmatter ? split.slice(2).join("---") : md;

	const frontmatter = shouldProcessFrontmatter
		? getFrontmatter(yaml, frontmatterSchema)
		: {};

	const headings = getHeadings(article);

	const html = await marked.parse(article);

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
			`Invalid frontmatter, please correct or update schema in src/schemas:\n\n${JSON.stringify(
				parsed.error.issues[0],
				null,
				4,
			)}`,
		);
	}

	return parsed.data;
};
