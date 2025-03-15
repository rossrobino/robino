import { Node, Route } from "../trie/index.js";
import { ResponseBuilder } from "./response-builder.js";
import { SuperRequest } from "./super-request.js";

export type Params = Record<string, string>;

export type StartContext = Pick<Context, "req">;
export type Start<State> = (context: StartContext) => State;

export type NotFoundContext<State> = Pick<
	Context<Params, State>,
	"req" | "res" | "state"
>;
export type NotFoundMiddleware<State> = (
	context: NotFoundContext<State>,
) => any;

export type ErrorContext<State> = Pick<Context<{}, State>, "req" | "res"> & {
	error: Error;
};
export type ErrorMiddleware<State> = (context: ErrorContext<State>) => any;

export type Context<P extends Params = Params, State = null> = {
	/** Request context with enhanced `Headers` and URL. */
	req: SuperRequest;

	/** Builds the final `Response` after middleware has processed. */
	res: ResponseBuilder<State>;

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

export type Middleware<P extends Params = Params, State = null> = (
	context: Context<P, State>,
	next: () => Promise<void>,
) => any;

export type Method =
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

export class Router<State = null> {
	/** Built tries per HTTP method */
	#trieMap = new Map<Method, Node<Middleware<Params, State>[]>>();
	/** Added routes per HTTP method */
	#routesMap = new Map<Method, Route<Middleware<Params, State>[]>[]>();
	#start?: Start<State>;
	#trailingSlash: TrailingSlash;
	#html?: string;
	notFound?: NotFoundMiddleware<State>;
	error: ErrorMiddleware<State> | null;

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

			/** Default `HTML` string to respond with or inject into with `c.res.html()`. */
			html?: string;

			/**
			 * Assign a custom not found handler to run when
			 * a matching route is not found.
			 *
			 * @default
			 *
			 * (c) => c.res.set("Not found", {
			 * 	status: 404,
			 * 	headers: { contentType: "text/html" },
			 * })
			 */
			notFound?: NotFoundMiddleware<State>;

			/**
			 * Assign a handler to run when an Error is thrown.
			 *
			 * If not set, Error will be thrown. This might be desired
			 * if your server already includes error handling.
			 *
			 * @default null
			 */
			error?: ErrorMiddleware<State>;

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
			html,
			notFound,
			error = null,
			start,
		} = config;

		this.#trailingSlash = trailingSlash;
		this.#html = html;
		this.notFound = notFound;
		this.error = error;
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
			const existing = this.#routesMap.get(method);

			if (existing) {
				existing.push(route);
			} else {
				this.#routesMap.set(method, [route]);
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
	 * @param basePattern pattern to mount the router to, each route will begin with this base
	 * @param router sub-router to mount
	 * @returns the base router instance
	 */
	mount(basePattern: string, router: Router<State>) {
		if (basePattern.at(-1) === "/") basePattern = basePattern.slice(0, -1);

		router.#routesMap.forEach((routes, method) => {
			for (const route of routes) {
				if (
					this.#trailingSlash !== "always" &&
					route.pattern === "/" &&
					basePattern !== ""
				) {
					route.pattern = "";
				}

				this.on(method, basePattern + route.pattern, ...route.store);
			}
		});

		return this;
	}

	/**
	 * @param request [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request)
	 * @returns [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)
	 */
	async fetch(request: Request): Promise<Response> {
		const req = new SuperRequest(request);
		const state = this.#start ? this.#start({ req }) : (null as State);
		const res = new ResponseBuilder({
			req,
			state,
			html: this.#html,
			notFound: this.notFound,
		});

		try {
			let trie = this.#trieMap.get(req.method);

			if (!trie) {
				const routes = this.#routesMap.get(req.method);

				if (routes) {
					// build trie
					trie = new Node<Middleware<Params, State>[]>();
					for (const route of routes) trie.add(route);
					this.#trieMap.set(req.method, trie);
				}
			}

			const context: NotFoundContext<State> & Partial<Context<Params, State>> =
				{
					req,
					res,
					state,
				};

			if (trie) {
				const match = trie.find(req.url.pathname);

				if (match) {
					context.params = match.params;
					context.route = match.route;

					const composed = this.#compose(match.route.store);

					await composed(context as Context<Params, State>, () =>
						Promise.resolve(),
					);
				}

				if (
					(!context.res.status || context.res.status === 404) &&
					this.#trailingSlash
				) {
					const last = req.url.pathname.at(-1);

					if (this.#trailingSlash === "always" && last !== "/") {
						req.url.pathname += "/";
						context.res.redirect(req.url, 308);
					} else if (
						this.#trailingSlash === "never" &&
						req.url.pathname !== "/" &&
						last === "/"
					) {
						req.url.pathname = req.url.pathname.slice(0, -1);
						context.res.redirect(req.url, 308);
					}
				}
			}

			return context.res.build();
		} catch (e) {
			if (this.error) {
				let error: Error;
				if (e instanceof Error) {
					error = e;
				} else {
					error = new Error(
						`Something other than an \`Error\` was thrown:\n\n${e}`,
					);
				}

				this.error({ req, error, res });

				return res.build();
			}

			throw e;
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
