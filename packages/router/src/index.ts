type Params = Record<string, string | null>;

type ExtractParams<Pattern extends string> =
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

type Context<P extends Params = any> = {
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
	route: Route;
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
	| "PATCH";

type TrailingSlash = "always" | "never" | null;

export class Route {
	/** constructed regular expression to execute */
	pattern: RegExp;

	/** request handler */
	handler: Handler;

	#keys: string[] = [];

	/**
	 * @param pattern route pattern to match
	 * @param handler request handler
	 */
	constructor(pattern: string, handler: Handler) {
		this.handler = handler;

		const segments = pattern.split("/");
		if (!segments[0]) segments.shift(); // if ""

		let regex = "^";

		for (const segment of segments) {
			if (segment[0] === ":") {
				this.#keys.push(segment.slice(1));
				regex += "/([^/]+?)";
			} else {
				regex += "/" + segment;
			}
		}

		this.pattern = new RegExp(regex + "$");
	}

	/**
	 * @param pathname pathname to execute the route pattern with
	 * @returns if matches, returns the params, otherwise `null`
	 */
	exec(pathname: string): Params | null {
		const matches = this.pattern.exec(pathname);

		if (!matches) return null;

		const params: Record<string, string | null> = {};

		let i = 0;
		for (const key of this.#keys) {
			params[key] = matches[++i] || null;
		}

		return params;
	}
}

export class Router {
	#routes: Record<string, Array<Route>> = {};

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
		method: Method | (string & {}),
		pattern: Pattern,
		handler: Handler<ExtractParams<Pattern>>,
	) {
		this.#routes[method] ??= [];
		this.#routes[method].push(new Route(pattern, handler));

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

			for (const route of this.#routes[req.method] ?? []) {
				const params = route.exec(url.pathname);
				if (params) return route.handler({ req, url, params, route });
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
