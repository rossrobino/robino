import type { TagDescriptor } from "../types/index.js";

/**
 * @param attrs attributes - type is `unknown` because at runtime (jsx package) these could be something else.
 * @returns string of attributes
 */
const serializeAttrs = (attrs?: Record<string, unknown>) => {
	let str = "";

	for (const key in attrs) {
		if (attrs[key] === true) {
			// if true don't put the value
			str += ` ${key}`;
		} else if (typeof attrs[key] === "string") {
			str += ` ${key}=${JSON.stringify(attrs[key])}`;
		}
		// otherwise, don't include the attribute
	}

	return str;
};

// https://developer.mozilla.org/en-US/docs/Glossary/Void_element#self-closing_tags
const voidElements = new Set([
	"area",
	"base",
	"br",
	"col",
	"embed",
	"hr",
	"img",
	"input",
	"link",
	"meta",
	"source",
	"track",
	"wbr",
]);

/**
 * @param tag `TagDescriptor`
 * @returns an HTML string of the tag
 */
const serializeTag = (tag: TagDescriptor) => {
	if (voidElements.has(tag.name)) {
		return `<${tag.name}${serializeAttrs(tag.attrs)}>`;
	}

	return `<${tag.name}${serializeAttrs(tag.attrs)}>${serialize(
		tag.children,
	)}</${tag.name}>`;
};

/** Serializes an array of TagDescriptors into a string. */
export const serialize = (tags: TagDescriptor["children"]): string => {
	if (tags instanceof Array) {
		return tags.map(serializeTag).join("");
	}

	if (typeof tags === "string") {
		return tags;
	}

	if (tags) {
		return serializeTag(tags);
	}

	return "";
};
