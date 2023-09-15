import { expect, test } from "bun:test";
import { process } from "./mod.js";
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
console.log("hello");
\`\`\`

`;

test("process", async () => {
	const data = process(md);
	expect(data.article).toBeString();
	expect(data.article).toStartWith("---");
	expect(data.headings).toBeArrayOfSize(2);
	expect(data.headings.at(0)?.id).toBeString();
	expect(data.headings.at(0)?.level).toBeNumber();
	expect(data.headings.at(0)?.name).toBeString();
	expect(data.html).toBeString();
	expect(data.frontmatter).toEqual({});
});

test("with frontmatter", async () => {
	const data = process(md, frontmatterSchema);
	expect(data.frontmatter?.title).toBeString();
	expect(data.frontmatter?.description).toBeString();
	expect(data.frontmatter?.keywords).toBeArrayOfSize(3);
});
