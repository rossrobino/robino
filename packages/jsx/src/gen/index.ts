import fs from "node:fs/promises";

const main = async () => {
	const res = await fetch(
		"https://raw.githubusercontent.com/microsoft/vscode-custom-data/refs/heads/main/web-data/html/mdnTagDescriptions.json",
	);

	const data = (await res.json()) as Array<{
		name: string;
		description: string;
		attributes: Array<{ name: string; description: string }>;
	}>;

	let types = "";

	for (const el of data) {
		if (el.attributes.length) {
			const attrSet = new Set();

			types += `export type ${el.name.at(0)?.toUpperCase()}${el.name.slice(1)}HTMLAttributes = HTMLAttributesWithChildren<{\n\t${el.attributes
				.map((attr) => {
					if (attrSet.has(attr.name)) {
						return "";
					}

					attrSet.add(attr.name);

					return `/** ${replaceAsteriskBullets(attr.description)} */\n\t${addQuotesToName(attr.name)}: ${setType(el.name, attr)};\n\t`;
				})
				.join("")}\n}>;\n\n`;
		}
	}

	const imp = `// cspell: disable\nimport type { HTMLAttributesWithChildren } from "../types/index.js";\n\n`;

	await fs.writeFile("./src/gen/elements.ts", imp + types, "utf-8");
};

const replaceAsteriskBullets = (desc: string) =>
	desc.replaceAll("\n* ", "\n- ");

const addQuotesToName = (name: string) =>
	name.includes("-") ? `"${name}"` : name;

const getDef = (values?: string[]) => values?.map((v) => `"${v}"`).join(" | ");

const setType = (name: string, attr: { name: string; description: string }) => {
	if (attr.description.includes("oolean")) {
		return "string | boolean";
	}

	const globalDef = new Map<string, string[]>();
	const metaDef = new Map<string, string[]>();
	const olDef = new Map<string, string[]>();
	const scriptDef = new Map<string, string[]>();

	globalDef.set("referrerpolicy", [
		"no-referrer",
		"no-referrer-when-downgrade",
		"origin",
		"origin-when-cross-origin",
		"same-origin",
		"strict-origin",
		"strict-origin-when-cross-origin",
		"unsafe-url",
	]);
	globalDef.set("rel", [
		"alternate",
		"author",
		"bookmark",
		"external",
		"help",
		"license",
		"next",
		"nofollow",
		"noreferrer",
		"noopener",
		"prev",
		"search",
		"tag",
	]);
	globalDef.set("target", ["_self", "_blank", "_parent", "_top"]);
	globalDef.set("shape", ["rect", "circle", "poly", "default"]);
	globalDef.set("crossorigin", ["anonymous", "use-credentials"]);
	globalDef.set("decoding", ["sync", "async", "auto"]);
	globalDef.set("fetchpriority", ["high", "low", "auto"]);
	globalDef.set("loading", ["eager", "lazy"]);
	globalDef.set("popovertargetaction", ["hide", "show", "toggle"]);
	globalDef.set("as", [
		"audio",
		"document",
		"embed",
		"fetch",
		"font",
		"image",
		"object",
		"script",
		"style",
		"track",
		"video",
		"worker",
	]);
	globalDef.set("blocking", ["render"]);
	globalDef.set("http-equiv", [
		"content-security-policy",
		"content-type",
		"default-style",
		"x-ua-compatible",
		"refresh",
	]);
	globalDef.set("shadowrootmode", ["open", "closed"]);
	globalDef.set("autocapitalize", [
		"on",
		"off",
		"characters",
		"words",
		"sentences",
	]);
	globalDef.set("autocomplete", ["on", "off"]);
	globalDef.set("autocorrect", ["on", "off"]);
	globalDef.set("spellcheck", ["true", "false", "default"]);
	globalDef.set("wrap", ["hard", "soft", "off"]);
	globalDef.set("scope", ["row", "col", "rowgroup", "colgroup"]);
	globalDef.set("kind", ["subtitles", "captions", "chapters", "metadata"]);
	globalDef.set("controlslist", [
		"nodownload",
		"nofullscreen",
		"noremoteplayback",
	]);
	globalDef.set("preload", ["none", "metadata", "auto"]);

	metaDef.set("name", [
		"application-name",
		"author",
		"description",
		"generator",
		"keywords",
		"theme-color",
		"viewport",
	]);

	olDef.set("type", ["a", "A", "i", "I", "1"]);

	scriptDef.set("type", ["module", "importmap", "speculationrules"]);

	if (name === "meta") {
		if (metaDef.has(attr.name)) return getDef(metaDef.get(attr.name));
	}
	if (name === "ol") {
		if (olDef.has(attr.name)) return getDef(olDef.get(attr.name));
	}
	if (name === "script") {
		if (scriptDef.has(attr.name)) return getDef(scriptDef.get(attr.name));
	}
	if (globalDef.has(attr.name)) return getDef(globalDef.get(attr.name));

	return "string";
};

await main();
