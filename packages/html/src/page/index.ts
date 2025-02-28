import { escape } from "../escape/index.js";
import { serialize } from "../serialize/index.js";
import type {
	Injection,
	MatchedInjection,
	TagInput,
	Tags,
} from "../types/index.js";

export class Page {
	/** Initial HTML string to inject content into. */
	#html: string;

	/** Injections to process when a response is generated. */
	#injections: Injection[] = [];

	/** Completed injection ids used to check if deferred can be sent. */
	#completed = new Set<string>();

	/** Deferred injections to stream out of order. */
	#deferred: Injection[] = [];

	/** If the out of order client side stream script has been added. */
	#scriptAdded = false;

	/** Tag names that have been used -- to avoid sending the same match multiple times. */
	#targets: Set<string> = new Set();

	/**
	 * @param html The HTML string.
	 *
	 * @default
	 *
	 * ```html
	 * <!doctype html><html><head></head><body></body></html>
	 * ```
	 */
	constructor(html = "<!doctype html><html><head></head><body></body></html>") {
		this.#html = html;
	}

	/** @returns client side script for out of order streaming */
	#outOfOrderScript() {
		return serialize({
			name: "script",
			children:
				"(" +
				(() => {
					if (!customElements.get("page-defer"))
						customElements.define(
							"page-defer",
							class extends HTMLElement {
								connectedCallback() {
									const h = this.dataset.html ?? "";
									if (this.hasAttribute("data-head")) {
										document.head.innerHTML += h;
									} else {
										const t = document.querySelector<HTMLElement>(
											"[data-id='" + this.dataset.id + "']",
										);
										if (t) {
											if (t.hasAttribute("data-clear")) {
												t.removeAttribute("data-clear");
												t.innerHTML = "";
											}
											t.innerHTML += h;
										}
									}
								}
							},
						);
				}).toString() +
				")()",
		});
	}

	/**
	 * @param inj injection
	 * @param tags html tags
	 * @returns `<page-defer>` custom element
	 */
	#pageDefer(inj: Injection, tags: Tags) {
		return serialize({
			name: "page-defer",
			attrs: {
				style: "display: none;",
				"data-id": inj.id,
				"data-html": escape(serialize(tags), true),
				"data-head": inj.head,
			},
		});
	}

	/**
	 * @param inj injection to resolve
	 * @returns the content with the match
	 */
	async *#resolveInjection(inj: Injection) {
		if (inj.loading) {
			if (!this.#scriptAdded) {
				this.#scriptAdded = true;
				yield this.#outOfOrderScript();
			}
			yield `<page-stream style="display: contents;" data-id="${inj.id}" data-clear>`;
		}

		if (typeof inj.tagInput === "function") inj.tagInput = inj.tagInput();

		if (typeof inj.tagInput === "object" && "next" in inj.tagInput) {
			if (Symbol.asyncIterator in inj.tagInput) {
				while (true) {
					const { value, done } = await inj.tagInput.next();
					if (value) {
						if (inj.defer) yield this.#pageDefer(inj, value);
						else yield serialize(value);
					}
					if (done) break;
				}
			} else {
				while (true) {
					const { value, done } = inj.tagInput.next();
					if (value) {
						if (inj.defer) yield this.#pageDefer(inj, value);
						else yield serialize(value);
					}
					if (done) break;
				}
			}
		} else if (inj.tagInput instanceof ReadableStream) {
			const reader = inj.tagInput.getReader();
			while (true) {
				const { value, done } = await reader.read();
				if (value) {
					if (inj.defer) yield this.#pageDefer(inj, value);
					else yield serialize(value);
				}
				if (done) break;
			}
		} else if (inj.tagInput instanceof Promise) {
			inj.tagInput = await inj.tagInput;
			if (inj.defer) yield this.#pageDefer(inj, inj.tagInput);
			else yield serialize(inj.tagInput);
		} else {
			if (inj.defer) yield this.#pageDefer(inj, inj.tagInput);
			else yield serialize(inj.tagInput);
		}

		if (inj.loading) yield "</page-stream>";

		if (inj.match) yield inj.match;
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
	 * @param loading provide loading tags to stream the result out of order
	 */
	inject(target: string, tagInput: TagInput, loading?: TagInput) {
		if (loading !== undefined) {
			const id = crypto.randomUUID().split("-").at(0)!;
			const head = target === "head";

			if (!head) {
				this.#injections.push({
					target,
					tagInput: loading,
					content: "",
					defer: false,
					loading: true,
					id,
				});
			}
			this.#deferred.push({
				target,
				tagInput,
				content: "",
				defer: true,
				loading: false,
				id,
				head,
			});
		} else {
			this.#injections.push({
				target,
				tagInput,
				content: "",
				defer: false,
				loading: false,
				id: "",
			});
		}

		return this;
	}

	/**
	 * @param tagInput tags to inject into the `<head>` element
	 * @param stream whether or not the tags should be streamed into the `<head>`
	 */
	head(tagInput: TagInput, stream?: boolean) {
		return this.inject("head", tagInput, stream ? "stream" : undefined);
	}

	/**
	 * @param tagInput tags to inject into the `<body>` element
	 * @param loading provide loading tags to stream the result out of order
	 */
	body(tagInput: TagInput, loading?: TagInput) {
		return this.inject("body", tagInput, loading);
	}

	/**
	 * @returns a `ReadableStream` that streams the HTML in order as
	 * each `TagInput` resolves
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
						`Tag not found: </${injection.target}> did not match in initial` +
							` HTML, ensure ${injection.target} element exists.\n\n${this.#html}\n`,
					);

				injection.index = result.index;
				injection.match = result.at(0);
				injection.waiting = false;

				return injection as MatchedInjection; // `as` because index and result are now set
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

				/** Number of characters of the initial html that have been sent */
				let charsSent = first.length;
				let queueIndex = 0;

				/** Resolved injections waiting to be sent in the correct order */
				const queue: MatchedInjection[] = [];
				const tasks: Promise<void>[] = [];

				for (let i = 0; i < matched.length; i++) {
					const inj: MatchedInjection = matched.at(i)!;
					queue.push(inj);

					const promise = (async () => {
						let streamed = false;
						for await (const str of this.#resolveInjection(inj)) {
							if (i !== queueIndex) {
								inj.content += str;
							} else {
								if (!streamed) {
									streamed = true;
									if (inj.content) {
										c.enqueue(inj.content); // send what's done
									}
								}
								c.enqueue(str); // stream the rest
							}
						}

						if (streamed) this.#completed.add(inj.id);
						inj.waiting = true;

						if (i === queueIndex) {
							let current: MatchedInjection | undefined = inj;

							while (current?.waiting) {
								if (!streamed || current !== inj) {
									// send the first if not already streamed
									// always send the others
									c.enqueue(current.content);
									this.#completed.add(current.id);
								}

								// sent the match with the content/stream, increment
								charsSent += current.match.length;
								// set to next injection in the queue
								current = queue.at(++queueIndex);

								if (current) {
									// send between chunk immediately, even if current hasn't resolved yet
									const chunk = this.#html.slice(charsSent, current.index);
									if (chunk) c.enqueue(chunk);
									charsSent = current.index;
								}
							}
						}

						// clear the waiting deferred injections
						for (const def of this.#deferred) {
							if (def.waiting) {
								c.enqueue(def.content);
								def.waiting = false;
							}
						}
					})();

					tasks.push(promise);
				}

				for (const inj of this.#deferred) {
					const promise = (async () => {
						let streamed = false;
						for await (const str of this.#resolveInjection(inj)) {
							if (this.#completed.has(inj.id) || inj.head) {
								if (!streamed) {
									streamed = true;
									if (inj.content) {
										c.enqueue(inj.content);
									}
								}
								c.enqueue(str);
							} else {
								inj.content += str;
							}
						}
						if (!streamed) inj.waiting = true;
					})();

					tasks.push(promise);
				}

				await Promise.all(tasks);

				c.enqueue(this.#html.slice(charsSent)); // last
				c.close();
			},
		});
	}

	/**
	 * @param init [ResponseInit](https://developer.mozilla.org/en-US/docs/Web/API/Response/Response#options),
	 * defaults to have content-type HTML header
	 * @returns a `Response` that streams the HTML in order as each `TagInput`  resolves
	 */
	toResponse(init: ResponseInit = {}) {
		init.headers ??= { "content-type": "text/html; charset=utf-8" };

		return new Response(
			this.toStream().pipeThrough(new TextEncoderStream()),
			init,
		);
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
			const { value, done } = await reader.read();
			if (done) return html;
			html += value;
		}
	}
}
