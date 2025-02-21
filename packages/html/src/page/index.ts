import { serialize } from "../serialize/index.js";
import type { Injection, MatchedInjection, TagInput } from "../types/index.js";

export class Page {
	/** The initial HTML string to inject content into. */
	#html: string;

	/** An array of injections to process when a response is generated. */
	#injections: Injection[] = [];

	/** A set of tag names that have been used -- to avoid sending the same match multiple times. */
	#targets: Set<string> = new Set();

	/**
	 * @param html The HTML string.
	 *
	 * @default
	 *
	 * ```html
	 * <!doctype html>
	 * <html>
	 * 	<head></head>
	 * 	<body></body>
	 * </html>
	 * ```
	 */
	constructor(
		html: string = "<!doctype html><html><head></head><body></body></html>",
	) {
		this.#html = html;
	}

	/**
	 * @param injection to resolve
	 * @returns the content with the match
	 */
	async #resolveTagInput(injection: MatchedInjection) {
		let tagInput = injection.tagInput;

		if (typeof tagInput === "function") {
			tagInput = tagInput();
		}

		if (tagInput instanceof Promise) {
			tagInput = await tagInput;
		}

		return serialize(tagInput) + injection.match;
	}

	/**
	 * @returns `true` if there are no injections, `false` otherwise
	 */
	get empty() {
		return this.#injections.length === 0;
	}

	/**
	 * @param target tag to inject into, for example `"main"`
	 * @param tagInput tags to inject
	 */
	inject(target: string, tagInput: TagInput) {
		this.#injections.push({ target, tagInput });
		return this;
	}

	/**
	 * @param tagInput tags to inject into the `<head>` element
	 */
	head(tagInput: TagInput) {
		this.#injections.push({ target: "head", tagInput });
		return this;
	}

	/**
	 * @param tagInput tags to inject into the `<body>` element
	 */
	body(tagInput: TagInput) {
		this.#injections.push({ target: "body", tagInput });
		return this;
	}

	/**
	 * @returns a `ReadableStream` that streams the HTML in order as each `TagInput` resolves
	 */
	toStream() {
		const matched: MatchedInjection[] = this.#injections
			// create a regular expression and run it over the html to determine the order
			.map((injection) => {
				const result = this.#html.match(
					new RegExp(`<\/${injection.target}>`, "i"),
				);

				if (!result?.index)
					throw new Error(
						`Tag not found: </${injection.target}> did not match in initial HTML, ensure ${injection.target} element exists.\n\n${this.#html}\n`,
					);

				injection.index = result.index;
				injection.match = result.at(0);

				// `as` because index and result are now set
				return injection as MatchedInjection;
			})
			// sort by location of the match -- for example, head might come before body
			.sort((a, b) => a.index - b.index);

		// If two matches have the same target, the match string does not need to be sent twice.
		// For example, </body>...</body> if two injections are targeted to body
		for (let i = matched.length - 1; i >= 0; i--) {
			const injection = matched.at(i)!;

			if (this.#targets.has(injection.target)) {
				injection.match = "";
			} else {
				this.#targets.add(injection.target);
			}
		}

		return new ReadableStream<string>({
			start: async (c) => {
				const first = this.#html.slice(0, matched.at(0)?.index);

				c.enqueue(first);

				// tracks the number of characters of the initial html that have been sent
				let charsSent = first.length;
				let queueIndex = 0;

				// resolved injections waiting to be sent in the correct order
				const queue: MatchedInjection[] = [];
				const tasks = [];

				for (let i = 0; i < matched.length; i++) {
					const queuedInjection: MatchedInjection = matched.at(i)!;

					queue.push(queuedInjection);

					const task = (async () => {
						queuedInjection.content =
							await this.#resolveTagInput(queuedInjection);

						if (i === queueIndex) {
							let current: MatchedInjection | undefined = queuedInjection;

							while (current?.content) {
								// send the content
								c.enqueue(current.content);
								charsSent += current.match.length;

								// set to next injection in the queue
								current = queue.at(++queueIndex);

								if (current) {
									// send chunk immediately, even if current hasn't resolved yet
									const chunk = this.#html.slice(charsSent, current.index);
									if (chunk) c.enqueue(chunk);
									charsSent = current.index;
								}
							}
						}
					})();

					tasks.push(task);
				}

				await Promise.all(tasks);

				// last
				c.enqueue(this.#html.slice(charsSent));

				c.close();
			},
		});
	}

	/**
	 * @returns a `Response` that streams the HTML in order as each `TagInput`  resolves
	 */
	toResponse() {
		return new Response(this.toStream().pipeThrough(new TextEncoderStream()), {
			headers: { "content-type": "text/html; charset=utf-8" },
		});
	}

	/**
	 * WARNING - This method will negate the streaming benefits of the Page.
	 * All promises will be resolved to generate the result. It's better to use
	 * `toResponse` or `toStream` when possible.
	 *
	 * @returns a string of HTML from the readable stream.
	 */
	async toString() {
		const reader = this.toStream().getReader();
		let html = "";

		while (true) {
			const { done, value } = await reader.read();
			if (done) return html;
			html += value;
		}
	}
}
