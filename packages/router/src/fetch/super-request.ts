import type { Method } from "./index.js";
import { SuperHeaders } from "@mjackson/headers";

export class SuperRequest {
	/**
	 * The original Request.
	 *
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/Request)
	 */
	req: Request;

	/**
	 * URL created from `req.url`.
	 *
	 * [URL reference](https://developer.mozilla.org/en-US/docs/Web/API/URL)
	 */
	url: URL;

	/**
	 * An enhanced `Headers` interface with type-safe access.
	 *
	 * [API Reference](https://github.com/mjackson/remix-the-web/tree/main/packages/headers)
	 *
	 * [MDN `Headers` Reference](https://developer.mozilla.org/en-US/docs/Web/API/Headers)
	 */
	headers: SuperHeaders;

	constructor(req: Request) {
		this.req = req;
		this.url = new URL(req.url);
		this.headers = new SuperHeaders(req.headers);
	}

	// these are exposed because they are accessed often enough it would
	// be inconvenient to access via `req` every time

	/** [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/Request/method) */
	get method(): Method {
		return this.req.method;
	}

	/** [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/Request/formData) */
	formData() {
		return this.req.formData();
	}
}
