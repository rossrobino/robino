import { run, bench, boxplot } from "mitata";
import { readdirSync } from "node:fs";
import { readdir } from "node:fs/promises";

const filePath = ".";

const syncRead = () => readdirSync(filePath, { withFileTypes: true });
const asyncRead = async () => readdir(filePath, { withFileTypes: true });

boxplot(() => {
	bench("sync", syncRead).gc("inner");
	bench("async", asyncRead).gc("inner");
});

await run();
