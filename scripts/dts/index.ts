import { unlink, mkdir, readFile, writeFile, exists } from "node:fs/promises";
import { dirname } from "node:path";
import { format } from "prettier";
import { z } from "zod";

const ModuleTypes = z.object({
	types: z.string(),
	default: z.string(),
});

const PackageJsonSchema = z.object({
	name: z.string(),
	types: z.string(),
	exports: z.record(ModuleTypes),
});

export const main = async (pkg: z.infer<typeof PackageJsonSchema>) => {
	const data = PackageJsonSchema.parse(pkg);
	const { name, types, exports } = data;

	let combined = "";

	for (const key in exports) {
		if (!key.startsWith(".")) {
			throw new Error(`sub path ${key} does not start with "."`);
		}

		const mod = name + key.slice(1); // remove "."...

		const entryPoint = exports[key];

		if (entryPoint) {
			const tsPath = entryPoint.default;

			// replace the last "js"
			const path = tsPath.replace(/js$/, "d.ts");

			const dts = await readFileAndDelete(path);

			combined += `declare module "${mod}" {${dts}}`;
		}
	}
	combined = await format(combined, { parser: "babel-ts" });
	await mkdir(dirname(types), { recursive: true });
	await writeFile(types, combined);
};

const readFileAndDelete = async (path: string) => {
	const fileExists = await exists(path);
	if (!fileExists) {
		throw new Error(`${path} not found.`);
	}
	const text = await readFile(path, "utf-8");
	await unlink(path);
	return text;
};

import pkg from "../../package.json";

main(pkg);
