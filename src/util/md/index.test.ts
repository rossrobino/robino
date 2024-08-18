import { expect, test } from "bun:test";
import { processMarkdown } from "./index.js";
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

# Heading 1

## Heading 2

Paragraph

\`\`\`ts
console.log("hello"); // [!code ++]
console.log("hello"); // [!code --]
\`\`\`

\`\`\`html
<hello>test</hello>
\`\`\`
`;

test("processMarkdown", async () => {
	const { article, headings, html, frontmatter } = await processMarkdown({
		md,
	});
	expect(article).toBeString();
	expect(article).toStartWith("---");
	expect(headings).toBeArrayOfSize(2);
	expect(headings.at(0)?.id).toBeString();
	expect(headings.at(0)?.level).toBeNumber();
	expect(headings.at(0)?.name).toBeString();
	expect(html).toBeString();
	expect(frontmatter).toEqual({});
});

test("with frontmatter", async () => {
	const { frontmatter, html } = await processMarkdown({
		md,
		frontmatterSchema,
	});
	Bun.write("./src/util/md/test.html", html);
	expect(frontmatter.title).toBeString();
	expect(frontmatter.description).toBeString();
	expect(frontmatter.keywords).toBeArrayOfSize(3);
});
