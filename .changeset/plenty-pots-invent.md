---
"@robino/md": minor
---

feat: add `renderStream` method to easily render/highlight and stream the output from an LLM on the server

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

The result will come in chunks of elements instead of by word since the entire element needs to be present to render and highlight correctly.
