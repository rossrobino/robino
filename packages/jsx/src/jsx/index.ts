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
		yield* toGenerator(tag(props));
		return;
	}

	// element
	const { children, ...attrs } = props as ElementProps;

	yield `<${tag}${serializeAttrs(attrs)}>`;

	if (voidElements.has(tag)) return;

	if (children) yield* toGenerator(children);

	yield `</${tag}>`;
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
const serializeAttrs = (attrs?: Props) => {
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
};

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

/**
 * @param element
 * @returns a `ReadableStream<string>` that streams the HTML in order
 */
export const toStream = (element: JSX.Element) =>
	new ReadableStream<string>({
		start: async (c) => {
			for await (const value of toGenerator(element)) c.enqueue(value);
			c.close();
		},
	});

/**
 * @param element
 * @returns `toStream` piped through a `TextEncoderStream`
 */
export const toByteStream = (element: JSX.Element) =>
	toStream(element).pipeThrough(new TextEncoderStream());

/**
 * @param element
 * @param init [ResponseInit](https://developer.mozilla.org/en-US/docs/Web/API/Response/Response#options),
 * defaults to have content-type HTML header
 * @returns a `Response` that streams the HTML in order as each `Element` resolves
 */
export const toResponse = (element: JSX.Element, init: ResponseInit = {}) => {
	init.headers ??= { "content-type": "text/html; charset=utf-8" };
	return new Response(toByteStream(element), init);
};

/**
 * @param html string of HTML to inject elements into
 * @param options page options
 * @returns HTML stream response
 */
export const page = (
	html = '<!doctype html><html><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head><body></body></html>',
	options: { head?: JSX.Element; body?: JSX.Element } = {},
) => {
	const elements: JSX.Element[] = [];

	if (options.head) {
		const tag = "</head>";
		const parts = html.split(tag);
		if (!parts[1]) tagNotFound(tag);
		elements.push(parts[0], options.head, parts[1]);
	}

	if (options.body) {
		const tag = "</body>";
		if (options.head) {
			const parts = (elements[2] as string).split(tag); // know it's a string since it's set above
			if (!parts[1]) tagNotFound(tag);
			elements[2] = parts[0];
			elements.push(options.body, parts[1]);
		} else {
			const parts = html.split(tag);
			if (!parts[1]) tagNotFound(tag);
			elements.push(parts[0], options.body, parts[1]);
		}
	}

	return toResponse(elements);
};

const tagNotFound = (tag: string) => {
	throw new Error(`No closing ${tag} tag found`);
};
