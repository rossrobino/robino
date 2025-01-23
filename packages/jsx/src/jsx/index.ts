import type { Props, FC, Children } from "../types/index.js";
import { Injector, type TagDescriptor } from "@robino/html";

/**
 * The main function of the jsx transform cycle, each time jsx is encountered
 * it is passed into this function to be resolved.
 *
 * @param tag string or function that refers to the component or element type
 * @param props object containing all the properties and attributes passed to the element or component
 * @returns the result of the jsx transform
 */
export const jsx = async (tag: string | FC, props: Props) => {
	// it's another component or a Fragment...
	if (typeof tag === "function") {
		return await tag(props);
	}

	// it's an element...
	const { children = "", ...rest } = props;

	return createElement(
		tag,
		// @ts-expect-error - serializeTags will ignore attrs that don't work,
		// but the type will be correct for Injector users
		rest,
		await serializeChildren(children),
	);
};

/**
 * called when a base HTML element is reached within some jsx
 *
 * @param name name of the html element
 * @param attrs attributes on the element
 * @param children the innerHTML of the element
 * @returns an html string of the outer html
 */
export const createElement = (
	name: string,
	attrs: TagDescriptor["attrs"],
	children: string,
) => Injector.serializeTags({ name, attrs, children });

/**
 * serializes an array of children into a string
 *
 * @param children
 * @returns string of concatenated children
 */
const serializeChildren = async (children: Children) => {
	if (Array.isArray(children)) {
		const resolvedChildren = await Promise.all(children);
		return resolvedChildren.join("");
	}

	return String(await children);
};

/**
 * jsx requires a `Fragment` export to resolve <></>.
 *
 * @param props
 * @returns string of concatenated children
 */
export const Fragment = async (props: Props) =>
	serializeChildren(props.children ?? "");

export { jsx as jsxs, jsx as jsxDEV };
