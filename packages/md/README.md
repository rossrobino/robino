# @robino/md

```bash
npm i @robino/md
```

- [`Processor`](#processor) - markdown processor
- [`md`](#plugin) - Vite plugin

## Overview

An extended [markdown-it](https://github.com/markdown-it/markdown-it) instance with the following features.

- [`process`](#process) markdown with `headings` and `frontmatter` using a [Standard Schema](https://standardschema.dev/#what-schema-libraries-implement-the-spec) validator
- Syntax highlighting with [shiki](https://shiki.style/) using the [CSS variables](https://shiki.style/guide/theme-colors#css-variables-theme) theme to style
- Adds `<div style="overflow-x: auto;">...</div>` around each table element to prevent overflow
- [Vite plugin](#plugin) to process markdown at build time
- [`renderStream`](#renderstream) function to render and highlight a stream of markdown

## Processor

```ts
import { Processor } from "@robino/md";
import langJs from "@shikijs/langs/js";

const processor = new Processor({
	markdownIt: {
		// markdown-it options
	},
	highlighter: {
		// shiki langs
		langs: [langJs],
	},
});

processor.use(SomeOtherPlugin); // use other plugins
```

### process

The `process` method provides extra meta data in addition to the HTML result.

```ts
// example using zod, any Standard Schema validator is supported
import { z } from "zod";

const FrontmatterSchema = z
	.object({
		title: z.string(),
		description: z.string(),
		keywords: z
			.string()
			.transform((val) => val.split(",").map((s) => s.trim().toLowerCase())),
		date: z.string(),
	})
	.strict();

const result = await processor.process(md, FrontmatterSchema);

result.html; // processed HTML article
result.headings; // { id: string, name: string, level: number }[]
result.frontmatter; // type-safe/validated frontmatter based on the schema
```

### render

Use the `render` method to render highlighted HTML.

```ts
const html = processor.render(md);
```

### renderStream

`renderStream` streams the result of a markdown stream through the renderer/highlighter. You can easily render/highlight and stream the output from an LLM on the server.

The result will come in chunks of elements instead of by word since the entire element needs to be present to render and highlight correctly.

#### ai-sdk

```ts
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

const { textStream } = streamText({
	model: openai("gpt-4o-mini"),
	prompt: "write some js code",
});

const htmlStream = processor.renderStream(textStream);
```

#### openai

```ts
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const response = await openai.responses.create({
	input: [
		{
			role: "user",
			content: "write some sample prose, a list, js code, table, etc.",
		},
	],
	model: "gpt-4o-mini",
	stream: true,
});

const mdStream = new ReadableStream<string>({
	async start(c) {
		for await (const event of response) {
			if (event.type === "response.output_text.delta") {
				if (event.delta) c.enqueue(event.delta);
			}
		}
		c.close();
	},
});

const htmlStream = processor.renderStream(mdStream);
```

## Plugin

### Configuration

Add the plugin to your `vite.config` to render markdown at build time.

```ts
// vite.config.ts
import { FrontmatterSchema } from "./src/lib/schema";
import { md } from "@robino/md";
import langJs from "@shikijs/langs/js";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		md({
			markdownIt: {
				// markdown-it options
			},
			highlighter: {
				// shiki langs
				langs: [langJs],
			},
			FrontmatterSchema,
		}),
	],
});
```

### Usage

Import a directory of processed markdown using a [glob](https://vite.dev/guide/features.html#glob-import) import.

```ts
import { FrontmatterSchema } from "./schema";
import type { Result } from "@robino/md";

const content = import.meta.glob<Result<typeof FrontmatterSchema>>(
	"./content/*.md",
	{ eager: true },
);
```

You can also import normally, add a `d.ts` file for type safety.

```ts
// d.ts
declare module "*.md" {
	import type { Heading } from "@robino/md";

	export const html: string;
	export const article: string;
	export const headings: Heading[];
	export const frontmatter: Frontmatter; // inferred output type from your schema
}
```

```ts
import { html, article, headings, frontmatter } from "./post.md";
```
