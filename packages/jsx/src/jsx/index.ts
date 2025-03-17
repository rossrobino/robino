import type { Props, ElementProps, FC, JSX } from "../types/index.js";

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
		yield* generator(tag(props));
		return;
	}

	// element
	const { children, ...attrs } = props as ElementProps;

	yield `<${tag}${serializeAttrs(attrs)}>`;

	if (voidElements.has(tag)) return;

	if (children) yield* generator(children);

	yield `</${tag}>`;
};

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
	yield* generator(props.children);
}

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
 * @param attrs attributes
 * @returns string of attributes
 */
function serializeAttrs(attrs?: Props) {
	let str = "";

	for (let key in attrs) {
		const value = attrs[key];

		if (key === "className") key = "class";
		else if (key === "htmlFor") key = "for";

		if (value === true) {
			// just put the key without the value
			str += ` ${key}`;
		} else if (
			typeof value === "string" ||
			typeof value === "number" ||
			typeof value === "bigint"
		) {
			str += ` ${key}=${JSON.stringify(value)}`;
		}
		// otherwise, don't include the attribute
	}

	return str;
}

/**
 * @param element any `JSX.Element`
 * @returns async generator that yields concatenated children
 */
export async function* generator(
	element: JSX.Element,
): AsyncGenerator<string, void, unknown> {
	if (typeof element === "function") element = element();
	if (element instanceof Promise) element = await element;

	// undefined, null, or false should render ""
	if (element == null || element === false) return;

	if (typeof element === "object") {
		if (Symbol.asyncIterator in element) {
			for await (const children of element) yield* generator(children);
		} else if (Symbol.iterator in element) {
			const generators: AsyncIterable<string>[] = [];

			for (const children of element) generators.push(generator(children));

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
								yield queue[current]!;
								queue[current] = "";
							}

							if (!completed.has(current)) break;
						}
					}
				} else if (index === current) {
					yield value;
				} else {
					queue[index] += value;
				}
			}

			yield queue.join("");
		} else {
			yield JSON.stringify(element);
		}
	} else {
		yield String(element); // primitive
	}
}

/**
 * Asynchronously converts a `JSX.Element` into its fully concatenated string representation.
 *
 * @param element - `JSX.Element` to stringify.
 * @returns A promise that resolves to the concatenated string.
 */
export async function stringify(element: JSX.Element) {
	let buffer = "";
	for await (const value of generator(element)) buffer += value;
	return buffer;
}

async function* mergeAsyncIterables<T>(iterables: AsyncIterable<T>[]) {
	const entries = iterables.map((iterable, index) => {
		const iterator = iterable[Symbol.asyncIterator]();
		return {
			index,
			iterator,
			promise: iterator.next().then((result) => ({ result, index })),
		};
	});

	while (entries.length) {
		// wait for the next resolved promise from any iterator
		const { result, index } = await Promise.race(
			entries.map((entry) => entry.promise),
		);

		if (result.done) {
			// iterator is finished, remove entry
			const entryIndex = entries.findIndex((entry) => entry.index === index);

			if (entryIndex !== -1) entries.splice(entryIndex, 1);

			yield { index, done: true as const };
		} else {
			yield { index, value: result.value, done: false as const };

			// ask this iterator for its next chunk
			const entry = entries.find((entry) => entry.index === index);
			if (entry) {
				entry.promise = entry.iterator
					.next()
					.then((result) => ({ result, index }));
			}
		}
	}
}

export { jsx as jsxs, jsx as jsxDEV };
