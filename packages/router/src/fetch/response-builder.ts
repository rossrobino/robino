import { hash } from "./hash.js";
import type { NotFoundContext, NotFoundMiddleware } from "./index.js";
import type { SuperRequest } from "./super-request.js";
import { SuperHeaders, type SuperHeadersInit } from "@mjackson/headers";
import { Page } from "@robino/html";

type Inject = (page: Page) => void;

export class ResponseBuilder<State> {
	/** [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/Response/Response#body) */
	body: BodyInit | null = null;

	/** [HTTP response status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) */
	status?: number;

	/**
	 * An enhanced `Headers` interface with type-safe access.
	 *
	 * [API Reference](https://github.com/mjackson/remix-the-web/tree/main/packages/headers)
	 *
	 * [MDN `Headers` Reference](https://developer.mozilla.org/en-US/docs/Web/API/Headers)
	 */
	headers = new SuperHeaders();

	/** created with `config` and `this` */
	#notFoundContext: NotFoundContext<State>;

	#notFound: NotFoundMiddleware<State>;
	#html?: string;
	#req: SuperRequest;

	constructor(config: {
		req: SuperRequest;
		state: State;
		html?: string;
		notFound?: NotFoundMiddleware<State>;
	}) {
		const {
			req,
			state,
			html,
			notFound = (c) =>
				c.res.set("Not found", {
					status: 404,
					headers: { contentType: "text/html" },
				}),
		} = config;

		this.#notFoundContext = {
			req,
			state,
			res: this,
		};
		this.#html = html;
		this.#notFound = notFound;
		this.#req = req;
	}

	/**
	 * Enhanced `new Response()` constructor, set values with one function.
	 *
	 * @param body Response BodyInit
	 * @param init Enhanced ResponseInit
	 */
	set(
		body: BodyInit | null,
		init?: {
			/**
			 * [HTTP response status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
			 *
			 * @default 200
			 */
			status?: number;

			/**
			 * An enhanced `HeadersInit`, headers will be appended to the ResponseBuilder.
			 *
			 * [API Reference](https://github.com/mjackson/remix-the-web/tree/main/packages/headers)
			 *
			 * [MDN `Headers` Reference](https://developer.mozilla.org/en-US/docs/Web/API/Headers)
			 */
			headers?: SuperHeadersInit;
		},
	) {
		this.body = body;
		this.status = init?.status ?? 200;

		if (init?.headers) {
			for (const [name, value] of new SuperHeaders(init.headers)) {
				this.headers.append(name, value);
			}
		}
	}

	/**
	 * Creates an HTML response.
	 *
	 * @param body HTML body
	 * @param status [HTTP response status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
	 */
	html(body?: BodyInit | null, status?: number): void;
	/**
	 * @param html HTML to inject into
	 * @param inject callback to inject tags into HTML
	 * @param status [HTTP response status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
	 */
	html(html: string, inject: Inject, status?: number): void;
	/**
	 * @param inject callback to inject tags into default HTML
	 * @param status [HTTP response status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
	 */
	html(inject: Inject, status?: number): void;
	html(
		bodyOrInject?: (BodyInit | null) | Inject,
		statusOrInject?: number | Inject,
		status?: number,
	) {
		let body: BodyInit | null;

		if (typeof bodyOrInject === "function") {
			const page = new Page(this.#html);
			bodyOrInject(page);
			body = page.toByteStream();
		} else if (
			typeof bodyOrInject === "string" &&
			typeof statusOrInject === "function"
		) {
			const page = new Page(bodyOrInject);
			statusOrInject(page);
			body = page.toByteStream();
		} else if (bodyOrInject !== undefined) {
			body = bodyOrInject;
		} else if (this.#html) {
			body = this.#html;
		} else {
			body = null;
		}

		this.set(body, {
			status: typeof statusOrInject === "number" ? statusOrInject : status,
			headers: { contentType: "text/html; charset=utf-8" },
		});
	}

	/**
	 * Creates a JSON response.
	 *
	 * @param value passed into JSON.stringify to create the body
	 * @param status [HTTP response status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
	 */
	json(value: any, status?: number) {
		this.set(JSON.stringify(value), {
			status,
			headers: { contentType: "application/json" },
		});
	}

	/**
	 * Creates a plain text response.
	 *
	 * @param body response body
	 * @param status [HTTP response status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
	 */
	text(body: BodyInit, status?: number) {
		this.set(body, { status, headers: { contentType: "text/html" } });
	}

	/**
	 * Creates a redirect response.
	 *
	 * @param location redirect `Location` header
	 * @param status defaults to [`302`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/302)
	 */
	redirect(location: string | URL, status: 301 | 302 | 303 | 307 | 308 = 302) {
		this.headers.location = location.toString();
		this.status = status;
	}

	/**
	 * Generates an etag from the values.
	 * If the etag matches, sets the response to not modified.
	 *
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag)
	 *
	 * @param values values to hash
	 * @returns `true` if the etag matches, `false` otherwise
	 */
	etag(...values: (string | ArrayBufferView)[]) {
		const etag = `"${hash(...values)}"`;
		this.headers.etag = etag;

		if (this.#req.headers.ifNoneMatch.matches(etag)) {
			this.body = null;
			this.status = 304;

			return true;
		}

		return false;
	}

	/** Runs the `notFound` middleware. */
	notFound() {
		this.#notFound(this.#notFoundContext);
	}

	/**
	 * @returns the constructed Response
	 */
	build() {
		if (!this.body && !this.status) this.notFound();

		return new Response(this.body, {
			status: this.status,
			headers: this.headers as unknown as Headers,
		});
	}
}
