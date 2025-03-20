import { Node, Route } from "../trie/index.js";
import type {
	ErrorMiddleware,
	ExtractMultiParams,
	ExtractParams,
	Method,
	Middleware,
	NotFoundMiddleware,
	Page,
	Params,
	StateFunction,
	TrailingSlash,
} from "../types.js";
import { Context } from "./context.js";

export class Router<State = null> {
	/** Built tries per HTTP method */
	#trieMap = new Map<Method, Node<Middleware<State, Params>[]>>();

	/** Added routes per HTTP method */
	#routesMap = new Map<Method, Route<Middleware<State, Params>[]>[]>();

	#state?: StateFunction<State>;
	#trailingSlash: TrailingSlash;
	#page?: Page<State>;
	notFound?: NotFoundMiddleware<State>;
	error: ErrorMiddleware<State> | null;

	constructor(
		config: {
			/**
			 * - `"never"` - Not found requests with a trailing slash will be redirected to the same path without a trailing slash
			 * - `"always"` - Not found requests without a trailing slash will be redirected to the same path with a trailing slash
			 * - `"ignore"` - no redirects (not recommended, bad for SEO)
			 *
			 * [Trailing Slash for Frameworks by Bjorn Lu](https://bjornlu.com/blog/trailing-slash-for-frameworks)
			 *
			 * @default "never"
			 */
			trailingSlash?: TrailingSlash;

			/**
			 * Base `HTML` string to inject into with `c.page`.
			 *
			 * @default
			 *
			 * ```html
			 * <!doctype html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body></body></html>
			 * ```
			 */
			page?: Page<State>;

			/**
			 * Assign a custom not found handler to run when
			 * a matching route is not found.
			 *
			 * @default
			 *
			 * ```ts
			 * (c) => c.res.set("Not found", {
			 * 	status: 404,
			 * 	headers: { contentType: "text/html" },
			 * })
			 * ```
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
			 * Sets the initial state before middleware runs.
			 *
			 * @param context request context
			 * @returns any state to access in middleware
			 * @default null
			 */
			state?: StateFunction<State>;
		} = {},
	) {
		this.#trailingSlash = config.trailingSlash ?? "never";
		this.#page = config.page;
		this.notFound = config.notFound;
		this.error = config.error ?? null;
		this.#state = config.state;

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
		...middleware: Middleware<State, ExtractParams<Pattern>>[]
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
		...middleware: Middleware<State, ExtractMultiParams<Patterns>>[]
	): this;
	on<PatternOrPatterns extends string | string[]>(
		method: Method,
		pattern: PatternOrPatterns,
		...middleware: Middleware<State, Params>[]
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
		...middleware: Middleware<State, ExtractParams<Pattern>>[]
	): this;
	/**
	 * @param patterns array of route patterns
	 * @param middleware
	 * @returns the router instance
	 */
	get<Patterns extends string[]>(
		patterns: [...Patterns],
		...middleware: Middleware<State, ExtractMultiParams<Patterns>>[]
	): this;
	get<PatternOrPatterns extends string | string[]>(
		patternOrPatterns: PatternOrPatterns,
		...middleware: Middleware<State, Params>[]
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
		...middleware: Middleware<State, ExtractParams<Pattern>>[]
	): this;
	/**
	 * @param patterns array of route patterns
	 * @param middleware
	 * @returns the router instance
	 */
	post<Patterns extends string[]>(
		patterns: [...Patterns],
		...middleware: Middleware<State, ExtractMultiParams<Patterns>>[]
	): this;
	post<PatternOrPatterns extends string | string[]>(
		patternOrPatterns: PatternOrPatterns,
		...middleware: Middleware<State, Params>[]
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
	 * @param req [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/Request)
	 * @returns [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/Response)
	 */
	async fetch(req: Request): Promise<Response> {
		const c = new Context<State, Params>({
			req,
			url: new URL(req.url),
			notFound: this.notFound,
			trailingSlash: this.#trailingSlash,
		});

		try {
			let trie = this.#trieMap.get(req.method);

			if (!trie) {
				const routes = this.#routesMap.get(req.method);

				if (routes) {
					// build trie
					trie = new Node<Middleware<State, Params>[]>();
					for (const route of routes) trie.add(route);
					this.#trieMap.set(req.method, trie);
				}
			}

			if (trie) {
				const match = trie.find(c.url.pathname);

				if (match) {
					c.route = match.route;
					c.params = match.params;

					if (this.#state) c.state = this.#state(c);

					c.basePage =
						typeof this.#page === "function" ? this.#page(c) : this.#page;

					await this.#compose(match.route.store)(c, () => Promise.resolve());
				}
			}

			return c.build();
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

				this.error(c, error);

				return c.build();
			}

			throw e;
		}
	}

	/**
	 * Combines all middleware into a single function.
	 * Adapted from [koa-compose](https://github.com/koajs/compose/blob/master/index.js)
	 *
	 * @param middleware
	 * @returns single function middleware function
	 */
	#compose(middleware: Middleware<State, Params>[]): Middleware<State, Params> {
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
