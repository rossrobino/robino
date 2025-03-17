import type { Props, ElementProps, FC, JSX } from "../types/index.js";

/**
 * @param attrs attributes
 * @returns string of attributes
 */
const serializeAttrs = (attrs?: Record<string, unknown>) => {
	let str = "";

	for (let key in attrs) {
		const value = attrs[key];

		if (key === "className") key = "class";
		else if (key === "htmlFor") key = "for";

		if (value === true) {
			// if true don't put the value
			str += ` ${key}`;
		} else if (typeof value === "string") {
			str += ` ${key}=${JSON.stringify(value)}`;
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
	// Fragment
	if (typeof tag === "function") {
		yield* Fragment({ children: tag(props) });
		return;
	}

	// element
	const { children, ...attrs } = props as ElementProps;

	yield `<${tag}${serializeAttrs(attrs)}>`;

	if (voidElements.has(tag)) return;

	if (children) yield* Fragment({ children });

	yield `</${tag}>`;
};

/**
 * Resolves then streams children as an async generator.
 *
 * jsx requires a `Fragment` export to resolve <></>
 *
 * @param props containing children to render
 * @returns async generator that yields concatenated children
 */
export async function* Fragment(
	props: {
		children?: JSX.Element;
	} = {},
): AsyncIterable<string> {
	if (props.children instanceof Promise) props.children = await props.children;

	if (props.children == null || props.children === false) return;

	if (typeof props.children === "object") {
		if (Symbol.asyncIterator in props.children) {
			for await (const children of props.children)
				yield* Fragment({ children });
		} else if (Symbol.iterator in props.children) {
			const generators: AsyncIterable<string>[] = [];

			for (const children of props.children)
				generators.push(Fragment({ children }));

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
			yield JSON.stringify(props.children);
		}
	} else {
		// undefined, null, or false should render ""
		yield String(props.children); // primitive
	}
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
