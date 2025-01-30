import type { Props, ElementProps, FC, Children, JSX } from "../types/index.js";
import { serializeTags } from "@robino/html";

/**
 * The main function of the jsx transform cycle, each time jsx is encountered
 * it is passed into this function to be resolved.
 *
 * @param tag string or function that refers to the component or element type
 * @param props object containing all the properties and attributes passed to the element or component
 * @returns a string of HTML
 */
export const jsx: {
	(tag: FC, props: Props): JSX.Element;
	(tag: string, props: ElementProps): JSX.Element;
} = async (tag, props) => {
	if (typeof tag === "function") {
		// Fragment
		return tag(props);
	}

	// element
	const { children, ...attrs } = props as ElementProps;

	// @ts-expect-error - `serializeTags` will ignore attrs that don't work,
	// but the type will be correct for `serializeTags` users
	return serializeTags({
		name: tag,
		attrs,
		children: await Fragment({ children }),
	});
};

/**
 * Resolves then concatenates children into a string.
 *
 * jsx requires a `Fragment` export to resolve <></>
 *
 * @param props containing children to render
 * @returns string of concatenated children
 */
export const Fragment = async (props?: { children?: Children }) => {
	if (Array.isArray(props?.children)) {
		const resolvedChildren = await Promise.all(props.children);
		// join takes care of null or undefined here, returns ""
		return resolvedChildren.join("");
	}

	const resolvedChild = await props?.children;
	if (resolvedChild == null) return "";
	return String(resolvedChild);
};

export { jsx as jsxs, jsx as jsxDEV };
