import { Node, Route } from "../trie/index.js";

type Params = Record<string, string>;

type ExtractParams<Pattern extends string = string> =
	Pattern extends `${infer _Start}:${infer Param}/${infer Rest}`
		? { [k in Param | keyof ExtractParams<Rest>]: string }
		: Pattern extends `${infer _Start}:${infer Param}`
			? { [k in Param]: string }
			: {};

export type Handler<P extends Params = any> = (
	context: Context<P>,
) => Response | Promise<Response>;

export type NotFoundHandler = (
	context?: Partial<Pick<Context, "req" | "url">>,
) => Response | Promise<Response>;

export type ErrorHandler = (
	context: Partial<Pick<Context, "req">> & {
		error: Error;
	},
) => Response | Promise<Response>;

type Context<P extends Params = ExtractParams<string>> = {
	/** [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/Request) */
	req: Request;

	/**
	 * URL created from `req.url`
	 *
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/URL)
	 */
	url: URL;

	/**
	 * Route pattern parameters
	 *
	 * Given the route pattern `/posts/:slug` is added, a request made to
	 * `/posts/my-post` would create a `params` object `{ slug: "my-post" }`.
	 *
	 * @example { slug: "my-post" }
	 */
	params: P;

	/** The matched route instance */
	// route: Route;
};

type Method =
	| "GET"
	| "HEAD"
	| "POST"
	| "PUT"
	| "DELETE"
	| "CONNECT"
	| "OPTIONS"
	| "TRACE"
	| "PATCH"
	| (string & {});

type TrailingSlash = "always" | "never" | null;

export class FetchRouter {
	#trieMap = new Map<Method, Node<Handler>>();

	#trailingSlash: TrailingSlash;

	/** Handler to run when route is not found. */
	notFound: NotFoundHandler = () =>
		new Response("Not found", {
			status: 404,
			headers: { "content-type": "text/html" },
		});

	/** Handler to run when an Error is thrown.  */
	error: ErrorHandler | null;

	constructor(
		config: {
			/**
			 * - `"never"` - Not found requests with a trailing slash will be redirected to the same path without a trailing slash
			 * - `"always"` - Not found requests without a trailing slash will be redirected to the same path with a trailing slash
			 * - `null` - no redirects (not recommended, bad for SEO)
			 *
			 * [Trailing Slash for Frameworks by Bjorn Lu](https://bjornlu.com/blog/trailing-slash-for-frameworks)
			 *
			 * @default "never"
			 */
			trailingSlash?: TrailingSlash;

			/**
			 * Assign a custom not found handler to run when
			 * a matching route is not found.
			 *
			 * @default
			 *
			 * () => new Response("Not found", {
			 * 	status: 404,
			 * 	headers: { "content-type": "text/html" },
			 * })
			 */
			notFound?: NotFoundHandler;

			/**
			 * Assign a handler to run when an Error is thrown.
			 *
			 * If not set, Error will be thrown. This might be desired
			 * if your server already includes error handling.
			 *
			 * @default null
			 */
			error?: ErrorHandler;
		} = {},
	) {
		const {
			trailingSlash = "never",
			error = null,
			notFound = () =>
				new Response("Not found", {
					status: 404,
					headers: { "content-type": "text/html" },
				}),
		} = config;

		this.#trailingSlash = trailingSlash;
		this.error = error;
		this.notFound = notFound;

		this.fetch = this.fetch.bind(this);
	}

	/**
	 * @param method [HTTP method](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)
	 * @param pattern route pattern to match
	 * @param handler request handler
	 * @returns the router instance
	 */
	on<Pattern extends string>(
		method: Method,
		pattern: Pattern,
		handler: Handler<ExtractParams<Pattern>>,
	) {
		const route = new Route(pattern, handler);
		const existing = this.#trieMap.get(method);

		if (existing) {
			existing.add(route);
		} else {
			const trie = new Node<Handler>();
			this.#trieMap.set(method, trie);
			trie.add(route);
		}

		return this;
	}

	/**
	 * @param pattern route pattern to match
	 * @param handler request handler
	 * @returns the router instance
	 */
	get<Pattern extends string>(
		pattern: Pattern,
		handler: Handler<ExtractParams<Pattern>>,
	) {
		return this.on("GET", pattern, handler);
	}

	/**
	 * @param pattern route pattern to match
	 * @param handler request handler
	 * @returns the router instance
	 */
	post<Pattern extends string>(
		pattern: Pattern,
		handler: Handler<ExtractParams<Pattern>>,
	) {
		return this.on("POST", pattern, handler);
	}

	/**
	 * @param req [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request)
	 * @returns [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)
	 */
	async fetch(req: Request): Promise<Response> {
		try {
			const url = new URL(req.url);

			const result = this.#trieMap.get(req.method)?.find(url.pathname);

			if (result) {
				return result.route.store({ req, url, params: result.params });
			}

			if (this.#trailingSlash) {
				const last = url.pathname.at(-1);

				if (this.#trailingSlash === "always" && last !== "/") {
					url.pathname += "/";
					return Response.redirect(url, 308);
				}

				if (
					this.#trailingSlash === "never" &&
					url.pathname !== "/" &&
					last === "/"
				) {
					url.pathname = url.pathname.slice(0, -1);
					return Response.redirect(url, 308);
				}
			}

			return this.notFound({ req, url });
		} catch (error) {
			if (this.error && error instanceof Error) {
				return this.error({ req, error });
			}

			throw error;
		}
	}
}
