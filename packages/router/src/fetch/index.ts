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

export type Middleware<P extends Params = Params, State = null> = (
	context: Context<P, State>,
	next: () => Promise<void>,
) => MaybePromise<void>;

type NotFoundContext<State> = Pick<
	Context<Params, State>,
	"req" | "res" | "url" | "state"
>;

export type NotFoundHandler<State> = (
	context: NotFoundContext<State>,
) => MaybePromise<Response>;

export type ErrorHandler = (
	context: Pick<Context, "req"> & {
		error: Error;
	},
) => MaybePromise<Response>;

type Start<State> = (context: Pick<Context, "req" | "url">) => State;

type Context<P extends Params = Params, State = null> = {
	/** [Request reference](https://developer.mozilla.org/en-US/docs/Web/API/Request) */
	req: Request;

	/**
	 * The final response to return.
	 *
	 * [Response reference](https://developer.mozilla.org/en-US/docs/Web/API/Response)
	 */
	res?: Response;

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

	/** The matched `Route` instance. */
	route: Route<Middleware<Params, State>[]>;

	/**
	 * `state` returned from `config.start` during each request
	 *
	 * @default null
	 */
	state: State;
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

export class Router<State = null> {
	#trieMap = new Map<Method, Node<Middleware<Params, State>[]>>();

	#start?: Start<State>;

	#trailingSlash: TrailingSlash;

	/** Handler to run when route is not found. */
	notFound: NotFoundHandler<State> = () =>
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
			notFound?: NotFoundHandler<State>;

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
			 * @returns any state to access in middleware
			 */
			start?: Start<State>;
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
	 * @param method HTTP method
	 * @param pattern route pattern
	 * @param middleware
	 * @returns the router instance
	 */
	on<Pattern extends string>(
		method: Method,
		pattern: Pattern,
		...middleware: Middleware<ExtractParams<Pattern>, State>[]
	): this;
	/**
	 * @param method HTTP method
	 * @param patterns array of route patterns
	 * @param middleware
	 * @returns the router instance
	 */
	on<Patterns extends string[]>(
		method: Method,
		patterns: [...Patterns],
		...middleware: Middleware<ExtractMultiParams<Patterns>, State>[]
	): this;
	on<PatternOrPatterns extends string | string[]>(
		method: Method,
		pattern: PatternOrPatterns,
		...middleware: Middleware<Params, State>[]
	) {
		let patterns: string[];
		if (!Array.isArray(pattern)) patterns = [pattern];
		else patterns = pattern;

		for (const p of patterns) {
			const route = new Route(p, middleware);
			const existing = this.#trieMap.get(method);

			if (existing) {
				existing.add(route);
			} else {
				const trie = new Node<Middleware<Params, State>[]>();
				this.#trieMap.set(method, trie);
				trie.add(route);
			}
		}

		return this;
	}

	/**
	 * @param pattern route pattern
	 * @param middleware
	 * @returns the router instance
	 */
	get<Pattern extends string>(
		pattern: Pattern,
		...middleware: Middleware<ExtractParams<Pattern>, State>[]
	): this;
	/**
	 * @param patterns array of route patterns
	 * @param middleware
	 * @returns the router instance
	 */
	get<Patterns extends string[]>(
		patterns: [...Patterns],
		...middleware: Middleware<ExtractMultiParams<Patterns>, State>[]
	): this;
	get<PatternOrPatterns extends string | string[]>(
		patternOrPatterns: PatternOrPatterns,
		...middleware: Middleware<Params, State>[]
	) {
		return this.on("GET", patternOrPatterns as string, ...middleware);
	}

	/**
	 * @param pattern route pattern
	 * @param middleware
	 * @returns the router instance
	 */
	post<Pattern extends string>(
		pattern: Pattern,
		...middleware: Middleware<ExtractParams<Pattern>, State>[]
	): this;
	/**
	 * @param patterns array of route patterns
	 * @param middleware
	 * @returns the router instance
	 */
	post<Patterns extends string[]>(
		patterns: [...Patterns],
		...middleware: Middleware<ExtractMultiParams<Patterns>, State>[]
	): this;
	post<PatternOrPatterns extends string | string[]>(
		patternOrPatterns: PatternOrPatterns,
		...middleware: Middleware<Params, State>[]
	) {
		return this.on("POST", patternOrPatterns as string, ...middleware);
	}

	/**
	 * @param req [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request)
	 * @returns [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)
	 */
	async fetch(req: Request): Promise<Response> {
		try {
			const url = new URL(req.url);
			const trie = this.#trieMap.get(req.method);

			const context: NotFoundContext<State> & Partial<Context<Params, State>> =
				{
					req,
					res: undefined,
					url,
					state: this.#start ? this.#start({ req, url }) : (null as State),
				};

			if (trie) {
				const match = trie.find(url.pathname);

				if (match) {
					context.params = match.params;
					context.route = match.route;

					const composed = this.#compose(match.route.store);

					await composed(context as Context<Params, State>, () =>
						Promise.resolve(),
					);

					if (context.res instanceof Response) return context.res;
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

	/**
	 * adapted from [koa-compose](https://github.com/koajs/compose/blob/master/index.js)
	 *
	 * @param middleware
	 * @returns single function comprised of all middleware
	 */
	#compose(middleware: Middleware<Params, State>[]): Middleware<Params, State> {
		return (c, next) => {
			let index = -1;

			const dispatch = async (i: number): Promise<void> => {
				if (i <= index) throw new Error("next() called multiple times");

				index = i;

				const mw = i === middleware.length ? next : middleware[i];

				if (!mw) return;

				return mw(c, dispatch.bind(null, i + 1));
			};

			return dispatch(0);
		};
	}
}
