import { run, bench, boxplot } from "mitata";
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";

const filePath = "package.json";

const syncRead = () => readFileSync(filePath, "utf-8");
const asyncRead = async () => readFile(filePath, "utf-8");

boxplot(() => {
	bench("sync", syncRead).gc("inner");
	bench("async", asyncRead).gc("inner");
});

await run();
