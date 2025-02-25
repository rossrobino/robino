# @robino/md

```bash
npm i @robino/md
```

Markdown processing toolkit.

- Processes markdown with [markdown-it](https://github.com/markdown-it/markdown-it)
- Optionally parse frontmatter using a [Standard Schema](https://standardschema.dev/#what-schema-libraries-implement-the-spec) validator
- Syntax highlighting with [shiki](https://shiki.style/) using the [CSS variables](https://shiki.style/guide/theme-colors#css-variables-theme) theme to style
- Creates an array of headings with `id`, `level` and `name` to make a table of contents, etc.
- Adds `<div style="overflow-x: auto;">...</div>` around each table element to prevent overflow

## Example

```ts
import { Processor } from "@robino/md";
import langHtml from "shiki/langs/html.mjs";
import { z } from "zod";

const processor = new Processor({
	// markdown-it options
	markdownIt: {
		// ...
	},
	highlighter: {
		// shiki langs
		langs: [langHtml],
		// lang aliases
		langAlias: {
			svelte: "html",
		},
	},
});

// example using zod
const frontmatterSchema = z
	.object({
		title: z.string(),
		description: z.string(),
		keywords: z
			.string()
			.transform((val) => val.split(",").map((s) => s.trim().toLowerCase())),
		date: z.string(),
	})
	.strict();

const {
	// original markdown document
	article,
	// { id: string, name: string, level: number }[]
	headings,
	// processed HTML article
	html,
	// type-safe/validated frontmatter based on the schema
	frontmatter,
} = await processor.process(md, frontmatterSchema);
```
