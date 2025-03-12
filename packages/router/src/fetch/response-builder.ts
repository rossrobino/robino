import type { NotFoundContext, NotFoundMiddleware } from "./index.js";
import type { SuperRequest } from "./super-request.js";
import { SuperHeaders, type SuperHeadersInit } from "@mjackson/headers";

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

	#notFound: NotFoundMiddleware<State>;
	#notFoundContext: NotFoundContext<State>;

	constructor(options: {
		req: SuperRequest;
		state: State;
		notFound?: NotFoundMiddleware<State>;
	}) {
		this.#notFoundContext = {
			req: options.req,
			state: options.state,
			res: this,
		};

		this.#notFound =
			options.notFound ??
			((c) =>
				c.res.set("Not found", {
					status: 404,
					headers: { contentType: "text/html" },
				}));
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
	 * @param status HTTP status code
	 */
	html(body: BodyInit, status?: number) {
		this.set(body, {
			status,
			headers: { contentType: "text/html; charset=utf-8" },
		});
	}

	/**
	 * Creates a JSON response.
	 *
	 * @param value passed into JSON.stringify to create the body
	 * @param status HTTP status code
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
	 * @param status HTTP status code
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
		this.status = status;
		this.headers.location = location.toString();
	}

	/** Runs the `notFound` middleware.  */
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
