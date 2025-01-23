import { Injector } from "../injector/index.js";
import type {
	TagDescriptor,
	JSXProps,
	FC,
	JSXChildren,
} from "../types/index.js";

export const createElement = (
	name: string,
	attrs: TagDescriptor["attrs"],
	children: string,
) => Injector.serializeTags({ name, attrs, children });

const serializeChildren = (children: JSXChildren) =>
	Array.isArray(children) ? children.join("") : String(children);

export const Fragment = (props: JSXProps) =>
	serializeChildren(props.children ?? "");

export const jsx = (
	/** string or function that refers to the component or element type */
	tag: string | FC,

	/** object containing all the properties and attributes passed to the element or component */
	props: JSXProps,
) => {
	// it's another component...
	if (typeof tag === "function") return tag(props);

	// it's an element...
	const { children = "", ...rest } = props;

	return createElement(
		tag,
		// @ts-expect-error - serializeTags will ignore attrs that don't work,
		// but the type will be correct for Injector users
		rest,
		serializeChildren(children),
	);
};

export { jsx as jsxs, jsx as jsxDEV };
