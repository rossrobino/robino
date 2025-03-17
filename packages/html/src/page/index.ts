import type { Injection, MatchedInjection } from "../types/index.js";
import { generator, stringify, type JSX } from "@robino/jsx";

export class Page {
	/** Initial HTML string to inject content into. */
	#html: string;

	/** Injections to process when a response is generated. */
	#injections: Injection[] = [];

	/** Tag names that have been used - to avoid sending the same match multiple times. */
	#targets = new Set<string>();

	/**
	 * @param html The HTML string.
	 *
	 * @default
	 *
	 * ```html
	 * <!doctype html><html><head></head><body></body></html>
	 * ```
	 */
	constructor(html?: string | null) {
		this.#html =
			html ?? "<!doctype html><html><head></head><body></body></html>";
	}

	/**
	 * @param target tag to inject into, for example `"main"`
	 * @param element element to inject
	 * @param loading provide loading tags to stream the result out of order
	 */
	inject(target: string, element: Injection["element"]) {
		this.#injections.push({
			target,
			element,
		});

		return this;
	}

	/**
	 * @param element element to inject into the `<head>` element
	 */
	head(element: Injection["element"]) {
		return this.inject("head", element);
	}

	/**
	 * @param element element to inject into the `<body>` element
	 */
	body(element: Injection["element"]) {
		return this.inject("body", element);
	}

	#createElements() {
		const matched: MatchedInjection[] = this.#injections
			// create a regular expression and run it over the html to determine the order
			.map((inj) => {
				const result = this.#html.match(new RegExp(`<\/${inj.target}>`, "i"));

				if (!result?.index)
					throw new Error(
						`Tag not found: </${inj.target}> did not match in initial` +
							` HTML, ensure ${inj.target} element exists.\n\n${this.#html}\n`,
					);

				inj.index = result.index;
				inj.match = result[0];

				return inj as MatchedInjection; // `as` because index and result are now set
			})
			// sort by location of the match -- for example, head might come before body
			.sort((a, b) => a.index - b.index);

		// If two matches have the same target, the match string does not need to be sent twice.
		// For example, </body>...</body> if two injections are targeted to body
		for (let i = matched.length - 1; i >= 0; i--) {
			const inj = matched[i]!;

			if (this.#targets.has(inj.target)) {
				inj.match = "";
			} else {
				this.#targets.add(inj.target);
			}
		}

		const elements: JSX.Element[] = [this.#html.slice(0, matched[0]?.index)];

		for (let i = 0; i < matched.length; i++) {
			const inj = matched[i]!;
			elements.push(inj.element);
			elements.push(this.#html.slice(inj.index, matched[i + 1]?.index));
		}

		return elements;
	}

	/**
	 * @returns a `AsyncGenerator` that yields the HTML in order as each `Element` resolves
	 */
	toGenerator() {
		return generator(this.#createElements());
	}

	/**
	 * @returns a `ReadableStream<string>` that streams the HTML in order as
	 * each `Element` resolves
	 */
	toStream() {
		return new ReadableStream<string>({
			start: async (c) => {
				for await (const value of this.toGenerator()) c.enqueue(value);
				c.close();
			},
		});
	}

	/**
	 * @returns `toStream` piped through a `TextEncoderStream`
	 */
	toByteStream() {
		return this.toStream().pipeThrough(new TextEncoderStream());
	}

	/**
	 * @param init [ResponseInit](https://developer.mozilla.org/en-US/docs/Web/API/Response/Response#options),
	 * defaults to have content-type HTML header
	 * @returns a `Response` that streams the HTML in order as each `Element` resolves
	 */
	toResponse(init: ResponseInit = {}) {
		init.headers ??= { "content-type": "text/html; charset=utf-8" };
		return new Response(this.toByteStream(), init);
	}

	/**
	 * WARNING - This method will negate the streaming benefits of the Page.
	 * All promises will be resolved to generate the result. It's better to use
	 * `toResponse` or `toStream` when possible.
	 *
	 * @returns a string of HTML from the readable stream.
	 */
	toString() {
		return stringify(this.#createElements());
	}
}
