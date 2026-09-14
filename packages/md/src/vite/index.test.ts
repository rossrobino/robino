import { md } from "./index.js";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { type PluginOption, build } from "vite";
import { afterEach, expect, test } from "vitest";
import { z } from "zod";

let root = "";

afterEach(async () => {
	if (root) await rm(root, { force: true, recursive: true });
	root = "";
});

const bundle = async (plugin: PluginOption) => {
	root = await mkdtemp(join(tmpdir(), "robino-md-"));

	await Promise.all([
		writeFile(
			join(root, "entry.ts"),
			`import { frontmatter } from "./post.md?frontmatter";

globalThis.frontmatter = frontmatter;
globalThis.loadPost = () => import("./post.md");
`,
		),
		writeFile(
			join(root, "post.md"),
			`---
title: Lazy post
---

# Heading

Only in full content.
`,
		),
	]);

	return build({
		build: { rollupOptions: { input: join(root, "entry.ts") }, write: false },
		configFile: false,
		logLevel: "silent",
		plugins: [plugin],
		root,
	});
};

test("frontmatter query keeps full Markdown in a lazy chunk", async () => {
	const result = await bundle(
		md({ FrontmatterSchema: z.object({ title: z.string() }).strict() }),
	);

	if (!Array.isArray(result) && "close" in result) {
		await result.close();
		throw new Error("Expected a completed Vite build.");
	}

	const output = Array.isArray(result)
		? result.flatMap((build) => build.output)
		: result.output;
	const chunks = output.filter((item) => item.type === "chunk");
	const entry = chunks.find((chunk) => chunk.isEntry);
	const post = chunks.find((chunk) => !chunk.isEntry);

	expect(chunks).toHaveLength(2);
	expect(entry?.code).toContain("Lazy post");
	expect(entry?.code).not.toContain("Only in full content");
	expect(post?.code).toContain("Only in full content");
});

test("frontmatter query requires a schema", async () => {
	await expect(bundle(md())).rejects.toThrow(
		"The `?frontmatter` query requires a `FrontmatterSchema` option.",
	);
});
