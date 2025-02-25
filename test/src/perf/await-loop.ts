import { run, bench, boxplot } from "mitata";
import { readFileSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const files = await readdir(".", { withFileTypes: true, recursive: true });

console.log(`${files.length} files found`);

const sequential = async () => {
	const content: Map<string, string> = new Map();

	for (const file of files) {
		if (file.isFile()) {
			const filePath = join(file.parentPath, file.name);
			const text = await readFile(filePath, "utf-8");
			content.set(filePath, text);
		}
	}
};

const concurrent = async () => {
	const content: Map<string, string> = new Map();

	const tasks: Promise<void>[] = [];

	for (const file of files) {
		if (file.isFile()) {
			const filePath = join(file.parentPath, file.name);

			const task = async () => {
				const text = await readFile(filePath, "utf-8");
				content.set(filePath, text);
			};

			tasks.push(task());
		}
	}

	await Promise.all(tasks);
};

const map = async () => {
	const content: Map<string, string> = new Map();

	await Promise.all(
		files.map(async (file) => {
			if (file.isFile()) {
				const filePath = join(file.parentPath, file.name);
				const text = await readFile(filePath, "utf-8");
				content.set(filePath, text);
			}
		}),
	);
};

const sync = async () => {
	const content: Map<string, string> = new Map();

	for (const file of files) {
		if (file.isFile()) {
			const filePath = join(file.parentPath, file.name);
			const text = readFileSync(filePath, "utf-8");
			content.set(filePath, text);
		}
	}
};

boxplot(() => {
	bench("sequential", sequential).gc("inner");
	bench("concurrent", concurrent).gc("inner");
	bench("map", map).gc("inner");
	bench("sync sequential", sync).gc("inner");
});

await run();
