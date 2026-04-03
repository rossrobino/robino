import { Processor } from "./index.js";
import fs from "node:fs/promises";
import path from "node:path";
import langHtml from "shiki/langs/html.mjs";
import langLua from "shiki/langs/lua.mjs";
import langMd from "shiki/langs/md.mjs";
import langTsx from "shiki/langs/tsx.mjs";
import { expect, test } from "vitest";
import { z } from "zod";

const processor = new Processor({
	highlighter: {
		langs: [langHtml, langMd, langTsx, langLua],
		langAlias: { ts: "tsx" },
	},
});

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

const md = `---
title: Title
description: desc
keywords: 1, 2, 3
date: 10, 23, 23
---

<style>
	pre {
		padding: 1rem;
	}
</style>

# Heading 1

## Heading 2

| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |

Paragraph

\`\`\`ts {1}
console.log("hello");
console.log("hello"); // comment

const add = (a: number, b: number): number => {
	return a + b;
}
\`\`\`

\`\`\`html
<hello attr="hi">test</hello>
\`\`\`

\`\`\`lua
function hello_world()
  print("Hello, World!")
end
\`\`\`

hello

paragraph

test
`;

function chunk(md: string) {
	return md.split(/(?<=\n)/);
}

function defer() {
	let done!: () => void;

	return {
		promise: new Promise<void>((resolve) => {
			done = resolve;
		}),
		done,
	};
}

async function collectStream(stream: ReadableStream<string>) {
	const chunks: string[] = [];
	const reader = stream.getReader();

	while (true) {
		const { value, done } = await reader.read();

		if (done) break;
		if (value != null) chunks.push(value);
	}

	return chunks;
}

async function collectGenerate(
	gen: Iterable<string> | AsyncIterable<string>,
) {
	const chunks: string[] = [];

	for await (const value of processor.generate(gen)) {
		chunks.push(value);
	}

	return chunks;
}

function nextWithin(
	gen: AsyncIterator<string>,
	ms = 100,
) {
	return new Promise<IteratorResult<string>>((resolve, reject) => {
		const timer = setTimeout(() => {
			reject(
				new Error(`Timed out waiting for streamed HTML within ${ms}ms`),
			);
		}, ms);

		gen.next().then(
			(value) => {
				clearTimeout(timer);
				resolve(value);
			},
			(error) => {
				clearTimeout(timer);
				reject(error);
			},
		);
	});
}

test("render and stream produce same output", async () => {
	const html = processor.render(md);

	const stream = processor.stream(
		new ReadableStream({
			start(controller) {
				controller.enqueue(md);
				controller.close();
			},
		}),
	);
	let streamed = "";
	const reader = stream.getReader();
	while (true) {
		const { value, done } = await reader.read();
		if (value) streamed += value;
		if (done) break;
	}

	expect(streamed).toEqual(html);
});

test("render and stream produce same output with line chunks", async () => {
	const html = processor.render(md);
	const stream = processor.stream(
		new ReadableStream({
			start(controller) {
				for (const value of chunk(md)) controller.enqueue(value);
				controller.close();
			},
		}),
	);

	const streamed = (await collectStream(stream)).join("");

	expect(streamed).toEqual(html);
});

test("render and generator produce same output", async () => {
	const html = processor.render(md);

	const gen = (async function* () {
		yield md;
	})();

	let streamed = "";

	for await (const chunk of processor.generate(gen)) {
		streamed += chunk;
	}

	expect(streamed).toEqual(html);
});

test("render and generator produce same output with line chunks", async () => {
	const html = processor.render(md);
	const streamed = (await collectGenerate(
		(async function* () {
			for (const value of chunk(md)) yield value;
		})(),
	)).join("");

	expect(streamed).toEqual(html);
});

test("generator flushes a completed paragraph before an unfinished fenced code block", async () => {
	const prefix = "# Title\n\nA full paragraph.\n\n";
	const start = "```js\nconsole.log(";
	const end = "1);\n```\n";
	const wait = defer();
	const gen = processor.generate(
		(async function* () {
			yield prefix + start;
			await wait.promise;
			yield end;
		})(),
	);
	const first = await nextWithin(gen);

	expect(first).toEqual({
		value: processor.render(prefix),
		done: false,
	});

	wait.done();

	let html = first.value ?? "";

	for await (const value of gen) {
		html += value;
	}

	expect(html).toEqual(processor.render(prefix + start + end));
});

test("generator flushes a completed paragraph before a later unfinished fenced code block", async () => {
	const intro = "# Title\n\n";
	const block = "```ts\nconst a = 1;\n```\n";
	const prefix = "\nA paragraph after code.\n\n";
	const start = "```js\nconsole.log(";
	const end = "1);\n```\n";
	const wait = defer();
	const gen = processor.generate(
		(async function* () {
			yield intro + block;
			yield prefix + start;
			await wait.promise;
			yield end;
		})(),
	);
	const first = await nextWithin(gen);

	expect(first).toEqual({
		value: processor.render(intro + block),
		done: false,
	});

	const second = await nextWithin(gen);

	expect(second).toEqual({
		value: processor.render(prefix),
		done: false,
	});

	wait.done();

	let html = (first.value ?? "") + (second.value ?? "");

	for await (const value of gen) {
		html += value;
	}

	expect(html).toEqual(processor.render(intro + block + prefix + start + end));
});

test("generator flushes an ATX heading when the line ends", async () => {
	const heading = "## Hello\n";
	const wait = defer();
	const gen = processor.generate(
		(async function* () {
			yield heading;
			await wait.promise;
			yield "\nParagraph\n";
		})(),
	);
	const first = await nextWithin(gen);

	expect(first).toEqual({
		value: processor.render(heading),
		done: false,
	});

	wait.done();
});

test("process", async () => {
	const { article, headings, html, frontmatter } = await processor.process(md);

	expect(article).toBeTypeOf("string");
	expect(article.at(0)).toBe("-");
	expect(headings).toBeInstanceOf(Array);
	expect(headings.at(0)?.id).toBeTypeOf("string");
	expect(headings.at(0)?.level).toBeTypeOf("number");
	expect(headings.at(0)?.name).toBeTypeOf("string");
	expect(html).toBeTypeOf("string");
	expect(frontmatter).toEqual({});
});

test("with frontmatter", async () => {
	const { frontmatter, html } = await processor.process(md, frontmatterSchema);

	await fs.writeFile(path.join(import.meta.dirname, "test.html"), html);

	expect(frontmatter.title).toBeTypeOf("string");
	expect(frontmatter.description).toBeTypeOf("string");
	expect(frontmatter.keywords).toBeInstanceOf(Array);
});

test("check Lua language support", async () => {
	const { html } = await processor.process(md);

	// Verify that the Lua code block was properly highlighted in the output HTML
	expect(html).toContain('<pre class="shiki');
	expect(html).toContain('<code class="language-lua">');
});
