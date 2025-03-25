import type { Props, ElementProps, FC, JSX } from "../types/index.js";
import { mergeAsyncIterables } from "./merge-async-iterables.js";
import { serializeAttr } from "./serialize-attr.js";

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
 * The main function of the jsx transform cycle, each time jsx is encountered
 * it is passed into this function to be resolved.
 *
 * @param tag string or function that refers to the component or element type
 * @param props object containing all the properties and attributes passed to the element or component
 * @returns an async generator that yields parts of HTML
 */
export const jsx: {
	(tag: FC, props: Props): Awaited<JSX.Element>;
	(tag: string, props: ElementProps): Awaited<JSX.Element>;
} = async function* (tag, props) {
	if (typeof tag === "function") {
		yield* toGenerator(tag(props));
	} else {
		// element
		const { children, ...attrs } = props as ElementProps;

		yield `<${tag}${serializeAttr(attrs)}>`;

		if (voidElements.has(tag)) return;

		if (children) yield* toGenerator(children);

		yield `</${tag}>`;
	}
};

export { jsx as jsxs, jsx as jsxDEV };

/**
 * jsx requires a `Fragment` export to resolve <></>
 *
 * @param props containing `children` to render
 * @returns async generator that yields concatenated children
 */
export async function* Fragment(
	props: {
		children?: JSX.Element;
	} = {},
) {
	yield* toGenerator(props.children);
}

/**
 * @param element
 * @returns async generator that yields concatenated children
 */
export async function* toGenerator(
	element: JSX.Element,
): AsyncGenerator<string, void, unknown> {
	if (typeof element === "function") element = element();
	if (element instanceof Promise) element = await element;

	// undefined, null, or false should render ""
	if (element == null || element === false) return;

	if (typeof element === "object") {
		if (Symbol.asyncIterator in element) {
			for await (const children of element) yield* toGenerator(children);
		} else if (Symbol.iterator in element) {
			const generators: AsyncIterable<string>[] = [];

			for (const children of element) generators.push(toGenerator(children));

			const queue: string[] = new Array(generators.length).fill("");
			const completed = new Set<number>();

			let current = 0;
			for await (const { index, value, done } of mergeAsyncIterables(
				generators,
			)) {
				if (done) {
					completed.add(index);

					if (index === current) {
						while (++current < generators.length) {
							if (queue[current]) {
								// yield whatever is in the next queue even if it hasn't completed yet
								yield queue[current]!;
								queue[current] = "";
							}

							// if it hasn't completed, stop iterating to the next
							if (!completed.has(current)) break;
						}
					}
				} else if (index === current) {
					yield value; // stream the current value directly
				} else {
					queue[index] += value; // queue the value for later
				}
			}

			yield queue.join(""); // clear the queue
		} else {
			yield JSON.stringify(element); // avoids things like [object Object]
		}
	} else {
		yield String(element); // primitive
	}
}

/**
 * Converts a `JSX.Element` into its fully concatenated string representation.
 *
 * WARNING - this negates streaming benefits and buffers the result into a string.
 *
 * @param element
 * @returns A promise that resolves to the concatenated string.
 */
export const toString = async (element: JSX.Element) => {
	let buffer = "";
	for await (const value of toGenerator(element)) buffer += value;
	return buffer;
};
