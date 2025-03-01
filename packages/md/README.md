# @robino/md

```bash
npm i @robino/md
```

An extended [markdown-it](https://github.com/markdown-it/markdown-it) instance with the following features.

- `renderStream` function to render and highlight a stream of markdown
- `process` markdown with frontmatter using a [Standard Schema](https://standardschema.dev/#what-schema-libraries-implement-the-spec) validator
- Syntax highlighting with [shiki](https://shiki.style/) using the [CSS variables](https://shiki.style/guide/theme-colors#css-variables-theme) theme to style
- Adds `<div style="overflow-x: auto;">...</div>` around each table element to prevent overflow

## Processor

```ts
import { Processor } from "@robino/md";
import langJs from "@shikijs/langs/js";

const processor = new Processor({
	// markdown-it options
	markdownIt: {
		// ...
	},
	highlighter: {
		// shiki langs
		langs: [langJs],
	},
});
```

## render

Use the `render` method to render highlighted HTML.

```ts
const html = processor.render(md);
```

## renderStream

`renderStream` streams the result of a markdown stream through the renderer/highlighter. You can easily render/highlight and stream the output from an LLM on the server.

The result will come in chunks of elements instead of by word since the entire element needs to be present to render and highlight correctly. Use with [@robino/html](https://github.com/rossrobino/robino/tree/main/packages/html) to easily send the result as an HTML response.

### ai-sdk

```ts
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

const { textStream } = streamText({
	model: openai("gpt-4o-mini"),
	prompt: "write some js code",
});

const htmlStream = processor.renderStream(textStream);
```

### openai

```ts
import { OpenAI } from "openai";

const openai = new OpenAI({
	apiKey: OPENAI_API_KEY,
});

const stream = await openai.chat.completions.create({
	messages: [
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
		for await (const chunk of stream) {
			const content = chunk.choices[0]?.delta.content;
			if (content) c.enqueue(content);
		}
		c.close();
	},
});

const htmlStream = processor.renderStream(mdStream);
```

## process

The `process` method provides extra meta data in addition to the HTML result.

```ts
// example using zod, any Standard Schema validator is supported
import { z } from "zod";

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

const result = await processor.process(md, frontmatterSchema);

result.html; // processed HTML article
result.headings; // { id: string, name: string, level: number }[]
result.frontmatter; // type-safe/validated frontmatter based on the schema
```
