import type { Route } from "../trie/index.js";
import type {
	Middleware,
	NotFoundMiddleware,
	Params,
	TrailingSlash,
} from "./index.js";
import { page, type JSX } from "@robino/jsx";

type Layout = (props: { children: JSX.Element }) => JSX.Element;

export class Context<State, P extends Params> {
	/** [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/Request) */
	req: Request;

	/**
	 * `new URL(req.url)`
	 *
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/URL)
	 */
	url: URL;

	/**
	 * `state` returned from `config.state` and possibly modified by middleware.
	 *
	 * @default null
	 */
	state: State = null as State;

	/**
	 * Route pattern parameters
	 *
	 * Given the route pattern `/posts/:slug` is added, a request made to
	 * `/posts/my-post` would create a `params` object `{ slug: "my-post" }`.
	 *
	 * @example { slug: "my-post" }
	 */
	params: P = {} as P; // set after match

	/** The matched `Route` instance. */
	route: Route<Middleware<State, P>[]> = undefined as any; // set after match

	/** [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/Response/Response#body) */
	body: BodyInit | null = null;

	/** [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) */
	status?: number;

	/** [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/Headers) */
	headers = new Headers();

	/** Base page to inject the `head` and `body` into, set initially in `config.page`. */
	basePage?: string;

	#notFound: NotFoundMiddleware<State>;
	#layouts: Layout[] = [];
	#headElements: JSX.Element[] = [];
	#trailingSlash: TrailingSlash;

	constructor(options: {
		req: Request;
		url: URL;
		notFound?: NotFoundMiddleware<State>;
		trailingSlash: TrailingSlash;
	}) {
		this.req = options.req;
		this.url = options.url;
		this.#notFound = options.notFound ?? (() => this.html("Not found", 404));
		this.#trailingSlash = options.trailingSlash;
	}

	/** Runs the `notFound` middleware. */
	notFound() {
		this.#notFound(this);
	}

	/**
	 * Mirrors `new Response()` constructor, set values with one function.
	 *
	 * @param body Response BodyInit
	 * @param init Enhanced ResponseInit
	 */
	res(
		body: BodyInit | null,
		init?: {
			/**
			 * [HTTP response status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
			 *
			 * @default 200
			 */
			status?: number;

			/** [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/Headers) */
			headers?: HeadersInit;
		},
	) {
		this.body = body;
		this.status = init?.status ?? 200;

		if (init?.headers) {
			for (const [name, value] of new Headers(init.headers)) {
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
	html(body: BodyInit | null, status?: number) {
		this.res(body, {
			status,
			headers: { "content-type": "text/html; charset=utf-8" },
		});
	}

	/**
	 * Creates a JSON response.
	 *
	 * @param data passed into JSON.stringify to create the body
	 * @param status [HTTP response status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
	 */
	json(data: any, status?: number) {
		this.res(JSON.stringify(data), {
			status,
			headers: { "content-type": "application/json" },
		});
	}

	/**
	 * Creates a plain text response.
	 *
	 * @param body response body
	 * @param status [HTTP response status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
	 */
	text(body: BodyInit, status?: number) {
		this.res(body, { status, headers: { "content-type": "text/html" } });
	}

	/**
	 * Creates a redirect response.
	 *
	 * @param location redirect `Location` header
	 * @param status defaults to [`302`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/302)
	 */
	redirect(location: string | URL, status: 301 | 302 | 303 | 307 | 308 = 302) {
		this.headers.set("location", location.toString());
		this.status = status;
	}

	/**
	 * @param Element `JSX.Element` to add to the head
	 */
	head(Element: JSX.Element) {
		this.#headElements.push(Element);
	}

	/**
	 * @param Layout `Layout`(s) for the `Page` to be passed into before being injected into the `<body>`
	 */
	layout(...Layout: Layout[]) {
		this.#layouts.push(...Layout);
	}

	/**
	 * Creates an HTML response based on the `head` elements, `Layout`(s), and `Page` provided.
	 *
	 * @param Page `JSX.Element` to inject into the `<body>`
	 */
	page(Page: JSX.Element) {
		for (let i = this.#layouts.length - 1; i >= 0; i--)
			Page = this.#layouts[i]!({ children: Page });

		this.html(
			page(this.basePage, {
				head: this.#headElements.length ? this.#headElements : undefined,
				body: Page,
			}),
		);
	}

	/**
	 * Generates an etag from a hash of the string provided.
	 * If the etag matches, sets the response to not modified.
	 *
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag)
	 *
	 * @param s string to hash
	 * @returns `true` if the etag matches, `false` otherwise
	 */
	etag(s: string) {
		// Fast hashing algorithm http://www.cse.yorku.ca/~oz/hash.html
		// Adapted from SvelteKit https://github.com/sveltejs/kit/blob/25d459104814b0c2dc6b4cf73b680378a29d8200/packages/kit/src/runtime/hash.js
		let hash = 5381;

		let i = s.length;
		while (i) hash = (hash * 33) ^ s.charCodeAt(--i);

		const etag = `"${(hash >>> 0).toString(36)}"`;

		this.headers.set("etag", etag);

		if (this.req.headers.get("if-none-match") === etag) {
			this.body = null;
			this.status = 304;

			return true;
		}

		return false;
	}

	/**
	 * @returns the constructed Response
	 */
	build() {
		if ((!this.status || this.status === 404) && this.#trailingSlash) {
			const last = this.url.pathname.at(-1);

			if (this.#trailingSlash === "always" && last !== "/") {
				this.url.pathname += "/";
				this.redirect(this.url, 308);
			} else if (
				this.#trailingSlash === "never" &&
				this.url.pathname !== "/" &&
				last === "/"
			) {
				this.url.pathname = this.url.pathname.slice(0, -1);
				this.redirect(this.url, 308);
			}
		}

		if (!this.body && !this.status) this.notFound();

		return new Response(this.body, {
			status: this.status,
			headers: this.headers,
		});
	}
}
