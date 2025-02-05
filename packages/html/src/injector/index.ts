import type {
	Injection,
	MatchedInjection,
	TagDescriptor,
	TagInput,
} from "../types/index.js";

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

/**
 * @param tag `TagDescriptor`
 * @returns an HTML string of the tag
 */
const serializeTag = (tag: TagDescriptor) => {
	if (["link", "meta", "base"].includes(tag.name)) {
		return `<${tag.name}${serializeAttrs(tag.attrs)}>`;
	}

	return `<${tag.name}${serializeAttrs(tag.attrs)}>${serializeTags(
		tag.children,
	)}</${tag.name}>`;
};

/** Serializes an array of TagDescriptors into a string. */
export const serializeTags = (tags: TagDescriptor["children"]): string => {
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

/**
 * Inject tags into an HTML string.
 *
 * Injector creates a stream of responses based on the order of injections.
 *
 * @example
 *
 * In this example, the head is sent first containing the script tag.
 * This allows the browser to start fetching the assets for the page
 * before the body is streamed in after the async function promise is resolved.
 *
 * ```ts
 * import { Injector } from "@robino/html";
 *
 * const page = new Injector();
 *
 * page.
 * 	// async function
 * 	body(async () => {
 * 		// await...
 * 		// return Tags
 * 	})
 * 	// Tags
 * 	.head({ name: "script", attrs: { type: "module", src: "./script.js" } })
 * 	// string
 * 	.body("text")
 * 	// creates an in order stream response
 * 	.toResponse();
 * ```
 */
export class Injector {
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
		let tagInput: TagInput;

		if (typeof injection.tagInput === "function") {
			tagInput = await injection.tagInput();
		} else {
			tagInput = injection.tagInput;
		}

		return serializeTags(tagInput) + injection.match;
	}

	/**
	 * @param target tag to inject into, for example `"custom-element"`
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
	 * @param tagInput tags to inject into the `<title>` element
	 */
	title(tagInput: TagInput) {
		this.#injections.push({ target: "title", tagInput });
		return this;
	}

	/**
	 * @param tagInput tags to inject into the `<main>` element
	 */
	main(tagInput: TagInput) {
		this.#injections.push({ target: "main", tagInput });
		return this;
	}

	/**
	 * @returns A web `Response` that streams the HTML in order as each `TagInput` resolves
	 */
	toResponse() {
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

		return new Response(
			new ReadableStream<string>({
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
			}).pipeThrough(new TextEncoderStream()),
			{ headers: { "content-type": "text/html; charset=utf-8" } },
		);
	}

	/**
	 * WARNING - This method will negate the streaming benefits of the Injector.
	 * All promises will be resolved to generate the result. It's better to use
	 * `toResponse` when possible.
	 *
	 * @returns a string of HTML from the response stream.
	 */
	async toString() {
		return this.toResponse().text();
	}
}
