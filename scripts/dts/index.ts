import pkg from "../../package.json";
import { unlink, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { format } from "prettier";

interface Export {
	[key: string]: {
		types: string;
		default: string;
	};
}

interface PackageJson {
	name: string;
	types: string;
	exports: Export;
}

const combine = async (pkg: PackageJson) => {
	const exports: Export = pkg.exports;
	const { name, types } = pkg;

	let combined = "";

	for (const key in exports) {
		if (exports[key]?.default) {
			const filePath = exports[key]?.default;
			if (filePath) {
				const path = filePath.replace("js", "d.ts");
				const dts = (await Bun.file(path).text()).replaceAll("declare", "");
				await unlink(path);
				const mod = name + key.slice(1); // remove "."
				combined += `declare module "${mod}" {${dts}}`;
			}
		}
	}
	combined = await format(combined, { parser: "babel-ts" });
	await mkdir(dirname(types));
	await Bun.write(types, combined);
};

combine(pkg);
