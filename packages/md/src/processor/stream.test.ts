import { Processor } from "./index.js";
import langHtml from "@shikijs/langs/html";
import langLua from "@shikijs/langs/lua";
import langTsx from "@shikijs/langs/tsx";
import { expect, test } from "vitest";

const plain = new Processor();
const highlighted = new Processor({
	highlighter: {
		langs: [langTsx, langHtml, langLua],
		langAlias: { ts: "tsx" },
	},
});

function split(source: string, size: number) {
	return Array.from({ length: Math.ceil(source.length / size) }, (_, i) =>
		source.slice(i * size, (i + 1) * size),
	);
}

function output(
	processor: Processor,
	method: string,
	source: AsyncIterable<string>,
) {
	if (method === "generate") return processor.generate(source);
	const iterator = source[Symbol.asyncIterator]();
	return processor
		.stream(
			new ReadableStream<string>({
				async pull(controller) {
					const result = await iterator.next();
					if (result.done) controller.close();
					else controller.enqueue(result.value);
				},
				async cancel() {
					await iterator.return?.();
				},
			}),
		)
		.values();
}

async function render(processor: Processor, method: string, chunks: string[]) {
	return (
		await Array.fromAsync(
			output(
				processor,
				method,
				(async function* () {
					yield* chunks;
				})(),
			),
		)
	).join("");
}

function gate() {
	let open = () => {};
	return {
		promise: new Promise<void>((resolve) => {
			open = resolve;
		}),
		open: () => open(),
	};
}

async function next(iterator: AsyncIterator<string>) {
	let timer: ReturnType<typeof setTimeout> | undefined;
	try {
		return await Promise.race([
			iterator.next(),
			new Promise<never>((_, reject) => {
				timer = setTimeout(
					() => reject(new Error("HTML was buffered past a stable boundary")),
					250,
				);
			}),
		]);
	} finally {
		clearTimeout(timer);
	}
}

test.each([
	["loose lists", "- one\n\n- two\n\nAfter.\n"],
	["nested lists", "- one\n\n  continuation\n\n- two\n\n# Next\n"],
	["indented code", "    one\n\n    two\n\nAfter.\n"],
	["lazy quotes", "> one\ncontinuation\n>\n> two\n\nAfter.\n"],
	[
		"raw scripts",
		"<script>\nlet one = 1;\n\n# not a heading\n</script>\n\nAfter.\n",
	],
	["multiline comments", "<!--\none\n\ntwo\n-->\n\n# After\n"],
	["raw HTML blocks", "<div>\n\n# Heading\n\n</div>\n"],
	[
		"forward references",
		"Intro.\n\n[site][ref]\n\n[ref]: https://example.com\n",
	],
	[
		"backward references",
		"[ref]: https://example.com\n\n# Title\n\n[site][ref]\n",
	],
	["multiline references", '[site]: /url\n  "Title"\n\n[site]\n'],
	["zero-output definitions", "[ref]: /url\n\n```ts\nconst a = 1;\n```\n"],
	["reference headings", "# [site]\n\n[site]: /url\n"],
	["reference images", "![image][ref]\n\n[ref]: /image.png\n"],
	["inline links", "[site](https://example.com) and `a[b]`.\n\n# Next\n"],
	["multiline inline links", "[site\nname](https://example.com)\n\n# Next\n"],
	[
		"table references",
		"| A | B |\n|---|---|\n| 1 | 2 |\n| [site] | 3 |\n\n[site]: /url\n",
	],
	[
		"reference table headers",
		"| [site] | B |\n|---|---|\n| 1 | 2 |\n\n[site]: /url\n",
	],
	[
		"ragged tables",
		"| A | B |\n|---|---|\n| 1 | 2 |\n| 3 |\n| 4 | 5 | 6 |\n\n# Next\n",
	],
	["empty tables", "| A | B |\n|---|---|\n\nAfter.\n"],
	["tables after nested tables", "> | A |\n> |---|\n\n| B |\n|---|\n"],
	[
		"escaped table pipes",
		"| A | B |\n|:---|---:|\n| a\\|b | `c` |\n| [link](/url) | **d** |\n",
	],
	[
		"table terminators",
		"| A | B |\n|---|---|\n| 1 | 2 |\n```ts\nlet a = 1;\n```\n",
	],
	["setext headings", "Heading\n=======\n\nText.\n"],
	[
		"NUL and split surrogate pairs",
		"# Hello 😀\n\nText \0 and 🐈.\n\n```ts\nconst face = '😀';\n```\n",
	],
])("streaming preserves %s", async (_, source) => {
	for (const processor of [plain, highlighted]) {
		const expected = processor.render(source);
		for (const method of ["generate", "stream"]) {
			for (const size of [1, 2, 7, source.length + 1]) {
				expect(await render(processor, method, split(source, size))).toBe(
					expected,
				);
			}
		}
	}
});

test.each([
	[
		"multiline JavaScript and metadata",
		"```ts {2,4-5}\n/* comment\n * continued\n */\nconst text = `hello\nworld`;\n```\n",
	],
	[
		"embedded JSX",
		'~~~tsx\nconst node = <div>\n  <span title="hello">world</span>\n</div>;\n~~~\n',
	],
	[
		"embedded HTML scripts",
		"```html\n<script>\nconst text = `hello\nworld`;\n</script>\n<style>\np { color: red; }\n</style>\n```\n",
	],
	[
		"Lua multiline strings",
		"~~~lua\nlocal value = [=[hello\nworld]=]\n--[[ a comment\ncontinued ]]\n~~~\n",
	],
	[
		"Markdown fallback",
		"```unloaded\n# Heading\n\n**bold** and `code`\n\n- item\n```\n",
	],
	["empty fences", "```ts\n```\n\n~~~\n~~~\n"],
	["blank code lines", "```ts {2}\n\n\nconst a = 1;\n\n```\n"],
	["indentation and tabs", "  ~~~ts\n\tconst a = 1;\n x\n    y\n  ~~~\n"],
	["longer fence markers", "````ts\n```\n~~~\n`````\n"],
	["unclosed fences", "```ts\n/* open\n * continued"],
	["closing fence without newline", "~~~ts\nconst a = 1;\n~~~"],
	["invalid backtick metadata", "```ts `invalid`\n\nAfter.\n"],
	[
		"escaped language info",
		"```t&#115; {2}\nconst a = 1;\nconst b = 2;\n```\n",
	],
])("code lines preserve %s", async (_, source) => {
	for (const processor of [plain, highlighted]) {
		for (const method of ["generate", "stream"]) {
			for (const ending of ["\n", "\r\n", "\r"]) {
				const input = source.replace(/\n/g, ending);
				expect(await render(processor, method, split(input, 1))).toBe(
					processor.render(input),
				);
			}
		}
	}
});

for (const method of ["generate", "stream"]) {
	test(`${method} starts code immediately after a completed long list`, async () => {
		const wait = gate();
		const prefix = "- item\n".repeat(100) + "\n```ts\nconst a = 1;\n";
		const iterator = output(
			highlighted,
			method,
			(async function* () {
				yield prefix;
				await wait.promise;
				yield "```\n";
			})(),
		);
		try {
			const first = await next(iterator);
			expect(first.value).toBe(
				highlighted.render(prefix).replace(/<\/code><\/pre>\n$/, ""),
			);
			wait.open();
			expect(first.value + (await Array.fromAsync(iterator)).join("")).toBe(
				highlighted.render(prefix + "```\n"),
			);
		} finally {
			wait.open();
		}
	});

	test(`${method} emits highlighted code lines before the fence closes`, async () => {
		const wait = gate();
		const prefix = "```ts {2}\n/* comment\n";
		const suffix = " * continued\n */\n```\n";
		const iterator = output(
			highlighted,
			method,
			(async function* () {
				yield prefix;
				await wait.promise;
				yield suffix;
			})(),
		);
		try {
			const first = await next(iterator);
			expect(first.done).toBe(false);
			expect(first.value).toBe(
				highlighted.render(prefix).replace(/<\/code><\/pre>\n$/, ""),
			);
			wait.open();
			expect(first.value + (await Array.fromAsync(iterator)).join("")).toBe(
				highlighted.render(prefix + suffix),
			);
		} finally {
			wait.open();
		}
	});

	test(`${method} emits table headers and rows before the table ends`, async () => {
		const row = gate();
		const end = gate();
		const header = "| A | B |\n|:---|---:|\n";
		const content = "| **one** | [two](/url) |\n";
		const iterator = output(
			highlighted,
			method,
			(async function* () {
				yield header;
				await row.promise;
				yield content;
				await end.promise;
				yield "\nAfter.\n";
			})(),
		);
		try {
			const first = await next(iterator);
			expect(first.value).toBe(
				highlighted.render(header).replace(/<\/table>\n<\/div>$/, ""),
			);
			row.open();
			const second = await next(iterator);
			expect(second.value).toContain(
				'<td style="text-align:left"><strong>one</strong></td>',
			);
			expect(second.value).not.toContain("</table>");
			end.open();
			expect(
				(first.value ?? "") +
					second.value +
					(await Array.fromAsync(iterator)).join(""),
			).toBe(highlighted.render(header + content + "\nAfter.\n"));
		} finally {
			row.open();
			end.open();
		}
	});

	test.each([
		"***\n",
		"Heading\n=======\n",
		"[link](/url) and `a[b]`.\n\n",
		"~~~ts\r\nconst a = 1;\r\n~~~\r\n",
	])(
		`${method} emits a stable block without waiting for EOF: %j`,
		async (source) => {
			const wait = gate();
			const iterator = output(
				highlighted,
				method,
				(async function* () {
					yield source;
					await wait.promise;
				})(),
			);
			try {
				expect((await next(iterator)).value).toBe(highlighted.render(source));
			} finally {
				wait.open();
				await iterator.next();
			}
		},
	);
}

test("custom plugins render the whole document with their original context", async () => {
	const processor = new Processor({
		plugins: [
			(md) => {
				md.core.ruler.push("count", (state) => {
					for (const token of state.tokens) {
						if (token.type === "heading_open")
							token.attrSet("data-length", String(state.src.length));
					}
				});
			},
		],
	});
	const source = "# Title\n\nParagraph.\n\n```ts\ncode\n```\n";
	for (const method of ["generate", "stream"]) {
		expect(await render(processor, method, split(source, 1))).toBe(
			processor.render(source),
		);
	}
});

test("later renderer, parser, and highlighter customizations use a full render", async () => {
	for (const customize of [
		(processor: Processor) =>
			processor.use((md) => {
				md.renderer.rules.fence = (tokens) =>
					`<custom>${tokens[0]?.content}</custom>`;
			}),
		(processor: Processor) => processor.disable("fence"),
		(processor: Processor) =>
			processor.set({ highlight: (source) => `<pre>${source.length}</pre>` }),
	]) {
		const processor = new Processor();
		customize(processor);
		const source = "# Title\n\n```ts\none\ntwo\n```\n";
		for (const method of ["generate", "stream"]) {
			expect(await render(processor, method, split(source, 1))).toBe(
				processor.render(source),
			);
		}
	}
});

test("concurrent responses do not share highlighting or table state", async () => {
	const sources = [
		"```ts\n/* open\ncontinued */\n```\n",
		"| A | B |\n|---|---|\n| one | two |\n",
		"```ts\nconst a = 1;\n```\n",
	];
	expect(
		await Promise.all(
			sources.map((source) =>
				render(highlighted, "generate", split(source, 1)),
			),
		),
	).toEqual(sources.map((source) => highlighted.render(source)));
});

test("default streaming emits code and table containers across chunks", async () => {
	const source =
		"Intro.\n\n```ts\n/* comment\ncontinued */\n```\n\n| A | B |\n|---|---|\n| one | two |\n\nAfter.\n";
	const chunks = split(source, 1);
	for (const result of [
		highlighted.generate(chunks),
		highlighted
			.stream(
				new ReadableStream<string>({
					start(controller) {
						for (const chunk of chunks) controller.enqueue(chunk);
						controller.close();
					},
				}),
			)
			.values(),
	]) {
		const html = await Array.fromAsync(result);
		expect(html.join("")).toBe(highlighted.render(source));
		expect(
			html.some((chunk) => chunk.includes("<pre") && !chunk.includes("</pre>")),
		).toBe(true);
		expect(
			html.some(
				(chunk) => chunk.includes("<table>") && !chunk.includes("</table>"),
			),
		).toBe(true);
	}
});

test("incremental streams preserve source errors and cancellation", async () => {
	const error = new Error("source failed");
	const failed = highlighted.stream(
		new ReadableStream<string>({
			start(controller) {
				controller.error(error);
			},
		}),
	);
	await expect(failed.getReader().read()).rejects.toBe(error);

	const stopped = Promise.withResolvers<unknown>();
	const cancelled = highlighted.stream(
		new ReadableStream<string>({
			cancel(value) {
				stopped.resolve(value);
			},
		}),
	);
	await cancelled.cancel("disconnected");
	expect(await stopped.promise).toBe("disconnected");

	let closed = false;
	const iterator = highlighted.generate(
		(async function* () {
			try {
				yield "```ts\nconst a = 1;\n";
				yield "```\n";
			} finally {
				closed = true;
			}
		})(),
	);
	await iterator.next();
	await iterator.return();
	expect(closed).toBe(true);
});
