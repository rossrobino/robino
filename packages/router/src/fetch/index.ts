import { Node, Route } from "../trie/index.js";

type MaybePromise<T> = T | Promise<T>;

type Params = Record<string, string>;

type ExtractParams<Pattern extends string = string> =
	Pattern extends `${infer _Start}:${infer Param}/${infer Rest}`
		? { [k in Param | keyof ExtractParams<Rest>]: string }
		: Pattern extends `${infer _Start}:${infer Param}`
			? { [k in Param]: string }
			: Pattern extends `${infer _Rest}*`
				? { "*": string }
				: {};

type ExtractMultiParams<Patterns extends string[]> = Patterns extends [
	infer First extends string,
	...infer Rest extends string[],
]
	? Rest["length"] extends 0
		? ExtractParams<First>
		: ExtractParams<First> | ExtractMultiParams<Rest>
	: never;

export type Handler<P extends Params = Params, S = null> = (
	context: Context<P, S>,
) => MaybePromise<Response | void>;

type NotFoundContext<S> = Pick<
	Context<Params, S>,
	"req" | "res" | "url" | "state"
>;

export type NotFoundHandler<S> = (
	context: NotFoundContext<S>,
) => MaybePromise<Response>;

export type ErrorHandler = (
	context: Pick<Context, "req"> & {
		error: Error;
	},
) => MaybePromise<Response>;

type Start<S> = (context: Pick<Context, "req" | "url">) => S;

type Context<P extends Params = Params, S = null> = {
	/** [Request reference](https://developer.mozilla.org/en-US/docs/Web/API/Request) */
	req: Request;

	/**
	 * Defined if returned from a previous handler, otherwise `null`
	 *
	 * [Response reference](https://developer.mozilla.org/en-US/docs/Web/API/Response)
	 */
	res: Response | null;

	/**
	 * URL created from `req.url`
	 *
	 * [URL reference](https://developer.mozilla.org/en-US/docs/Web/API/URL)
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

	/** matched route instance */
	route: Route<Handler<Params, S>[]>;

	/**
	 * `state` returned from `config.start` during each request
	 *
	 * @default null
	 */
	state: S;
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

export class Router<S = null> {
	#trieMap = new Map<Method, Node<Handler<Params, S>[]>>();

	#start?: Start<S>;

	#trailingSlash: TrailingSlash;

	/** Handler to run when route is not found. */
	notFound: NotFoundHandler<S> = () =>
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
			notFound?: NotFoundHandler<S>;

			/**
			 * Assign a handler to run when an Error is thrown.
			 *
			 * If not set, Error will be thrown. This might be desired
			 * if your server already includes error handling.
			 *
			 * @default null
			 */
			error?: ErrorHandler;

			/**
			 * Runs at the start of each request.
			 *
			 * @param context request context
			 * @returns any state to access in handlers
			 */
			start?: Start<S>;
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
			start,
		} = config;

		this.#trailingSlash = trailingSlash;
		this.error = error;
		this.notFound = notFound;
		this.#start = start;

		this.fetch = this.fetch.bind(this);
	}

	/**
	 * Create handler helper function.
	 *
	 * @param handler
	 * @returns typed handler based on the created router
	 */
	create(handler: Handler<Params, S>) {
		return handler;
	}

	/**
	 * @param method HTTP method
	 * @param pattern route pattern
	 * @param handlers request handlers
	 * @returns the router instance
	 */
	on<Pattern extends string>(
		method: Method,
		pattern: Pattern,
		...handlers: Handler<ExtractParams<Pattern>, S>[]
	): this;
	/**
	 * @param method HTTP method
	 * @param patterns array of route patterns
	 * @param handlers request handlers
	 * @returns the router instance
	 */
	on<Patterns extends string[]>(
		method: Method,
		patterns: [...Patterns],
		...handlers: Handler<ExtractMultiParams<Patterns>, S>[]
	): this;
	on<PatternOrPatterns extends string | string[]>(
		method: Method,
		pattern: PatternOrPatterns,
		...handlers: Handler<Params, S>[]
	) {
		let patterns: string[];
		if (!Array.isArray(pattern)) patterns = [pattern];
		else patterns = pattern;

		for (const p of patterns) {
			const route = new Route(p, handlers);
			const existing = this.#trieMap.get(method);

			if (existing) {
				existing.add(route);
			} else {
				const trie = new Node<Handler<Params, S>[]>();
				this.#trieMap.set(method, trie);
				trie.add(route);
			}
		}

		return this;
	}

	/**
	 * @param pattern route pattern
	 * @param handlers request handlers
	 * @returns the router instance
	 */
	get<Pattern extends string>(
		pattern: Pattern,
		...handlers: Handler<ExtractParams<Pattern>, S>[]
	): this;
	/**
	 * @param patterns array of route patterns
	 * @param handlers request handlers
	 * @returns the router instance
	 */
	get<Patterns extends string[]>(
		patterns: [...Patterns],
		...handlers: Handler<ExtractMultiParams<Patterns>, S>[]
	): this;
	get<PatternOrPatterns extends string | string[]>(
		patternOrPatterns: PatternOrPatterns,
		...handlers: Handler<Params, S>[]
	) {
		return this.on("GET", patternOrPatterns as string, ...handlers);
	}

	/**
	 * @param pattern route pattern
	 * @param handlers request handlers
	 * @returns the router instance
	 */
	post<Pattern extends string>(
		pattern: Pattern,
		...handlers: Handler<ExtractParams<Pattern>, S>[]
	): this;
	/**
	 * @param patterns array of route patterns
	 * @param handlers request handlers
	 * @returns the router instance
	 */
	post<Patterns extends string[]>(
		patterns: [...Patterns],
		...handlers: Handler<ExtractMultiParams<Patterns>, S>[]
	): this;
	post<PatternOrPatterns extends string | string[]>(
		patternOrPatterns: PatternOrPatterns,
		...handlers: Handler<Params, S>[]
	) {
		return this.on("POST", patternOrPatterns as string, ...handlers);
	}

	/**
	 * @param req [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request)
	 * @returns [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)
	 */
	async fetch(req: Request): Promise<Response> {
		try {
			const url = new URL(req.url);
			const trie = this.#trieMap.get(req.method);

			const context: NotFoundContext<S> & Partial<Context<Params, S>> = {
				req,
				res: null,
				url,
				state: this.#start ? this.#start({ req, url }) : (null as S),
			};

			if (trie) {
				const match = trie.find(url.pathname);

				if (match) {
					context.params = match.params;
					context.route = match.route;

					for (const handler of match.route.store) {
						const result = await handler(context as Context<Params, S>);

						if (result instanceof Response) context.res = result;
					}

					if (context.res) return context.res;
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
			}

			return this.notFound(context);
		} catch (error) {
			if (this.error && error instanceof Error) {
				return this.error({ req, error });
			}

			throw error;
		}
	}
}
