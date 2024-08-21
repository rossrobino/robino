import { processMarkdown } from "./index.js";
import fs from "node:fs/promises";
import path from "node:path";
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

test("processMarkdown", async () => {
	const { article, headings, html, frontmatter } = await processMarkdown({
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
	const { frontmatter, html } = await processMarkdown({
		md,
		frontmatterSchema,
	});
	await fs.writeFile(path.join(import.meta.dirname, "test.html"), html);
	expect(frontmatter.title).toBeTypeOf("string");
	expect(frontmatter.description).toBeTypeOf("string");
	expect(frontmatter.keywords).toBeInstanceOf(Array);
});
