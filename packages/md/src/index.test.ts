import { processMarkdown } from "./index.js";
import fs from "node:fs/promises";
import path from "node:path";
import langLua from "shiki/langs/lua.mjs"
import { expect, test } from "vitest";
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
`;

test("processMarkdown", () => {
	const { article, headings, html, frontmatter } = processMarkdown({
		md,
	});
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
	const { frontmatter, html } = processMarkdown({
		md,
		frontmatterSchema,
	});
	await fs.writeFile(path.join(import.meta.dirname, "test.html"), html);
	expect(frontmatter.title).toBeTypeOf("string");
	expect(frontmatter.description).toBeTypeOf("string");
	expect(frontmatter.keywords).toBeInstanceOf(Array);
});

const mdWithLua = `
# Lua Code Example

\`\`\`lua
function hello_world()
  print("Hello, World!")
end
\`\`\`
`;

test("processMarkdown with custom Lua language support", async () => {
	const { html } = processMarkdown({
		md: mdWithLua,
		langConfig: {langs: [langLua]},  // Pass the custom Lua language grammar
	});

	// Verify that the Lua code block was properly highlighted in the output HTML
	expect(html).toContain('<pre class="shiki');
	expect(html).toContain('<code class="language-lua">');
});