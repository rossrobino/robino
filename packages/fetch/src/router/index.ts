import type {
	ErrorHandler,
	ExtractParams,
	Method,
	NotFoundHandler,
	Params,
	RouteHandler,
	TrailingSlash,
} from "../types/index.js";

export class Router {
	#routes: Record<
		Method,
		{ static: Map<string, RouteHandler>; params: Map<string, RouteHandler> }
	> = {
		GET: {
			static: new Map(),
			params: new Map(),
		},
		HEAD: {
			static: new Map(),
			params: new Map(),
		},
		POST: {
			static: new Map(),
			params: new Map(),
		},
		PUT: {
			static: new Map(),
			params: new Map(),
		},
		DELETE: {
			static: new Map(),
			params: new Map(),
		},
		CONNECT: {
			static: new Map(),
			params: new Map(),
		},
		OPTIONS: {
			static: new Map(),
			params: new Map(),
		},
		TRACE: {
			static: new Map(),
			params: new Map(),
		},
		PATCH: {
			static: new Map(),
			params: new Map(),
		},
	} as const;

	#trailingSlash: TrailingSlash;

	/** Handler to run when route is not found. */
	notFound: NotFoundHandler = () => new Response("Not found", { status: 404 });

	/** Handler to run when an error occurs.  */
	error: ErrorHandler | null;

	constructor(
		config: {
			/**
			 * - `"never"` - requests with a trailing slash will be redirected to the same path without a trailing slash
			 * - `"always"` - requests without a trailing slash will be redirected to the same path with a trailing slash
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
			 * @default () => new Response("Not found", { status: 404 })
			 */
			notFound?: NotFoundHandler;

			/**
			 * Assign a handler to run when an error occurs.
			 *
			 * If not set, error will be thrown. This might be desired
			 * if your server already includes error handling.
			 *
			 * @default null
			 */
			error?: ErrorHandler;
		} = {},
	) {
		const {
			trailingSlash = "never",
			notFound = () => new Response("Not found", { status: 404 }),
			error = null,
		} = config;

		this.#trailingSlash = trailingSlash;
		this.error = error;
		this.notFound = notFound;

		this.fetch = this.fetch.bind(this);
	}

	/**
	 * @param method [HTTP method](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)
	 * @param id route id to match
	 * @param handler request handler
	 * @returns the router instance
	 */
	on<RouteID extends string>(
		method: Method,
		id: RouteID,
		handler: RouteHandler<ExtractParams<RouteID>>,
	) {
		this.#routes[method][id.includes(":") ? "params" : "static"].set(
			id,
			handler,
		);

		return this;
	}

	/**
	 * @param id route id to match
	 * @param handler request handler
	 * @returns the router instance
	 */
	get<RouteID extends string>(
		id: RouteID,
		handler: RouteHandler<ExtractParams<RouteID>>,
	) {
		return this.on("GET", id, handler);
	}

	/**
	 * @param id route id to match
	 * @param handler request handler
	 * @returns the router instance
	 */
	post<RouteID extends string>(
		id: RouteID,
		handler: RouteHandler<ExtractParams<RouteID>>,
	) {
		return this.on("POST", id, handler);
	}

	/**
	 * @param req [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request)
	 * @returns [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)
	 */
	async fetch(req: Request): Promise<Response> {
		const url = new URL(req.url);

		try {
			if (this.#trailingSlash) {
				const last = url.pathname[url.pathname.length - 1];

				if (this.#trailingSlash === "always" && last !== "/") {
					url.pathname += "/";
					return Response.redirect(url, 308);
				} else if (
					this.#trailingSlash === "never" &&
					url.pathname !== "/" &&
					last === "/"
				) {
					url.pathname = url.pathname.slice(0, -1);
					return Response.redirect(url, 308);
				}
			}

			const route = this.#routes[req.method as Method];

			if (route) {
				const handler = route.static.get(url.pathname);

				if (handler) {
					// exact match
					return handler({
						req,
						params: {},
						url,
						route: { id: url.pathname, handler },
					});
				}

				const segments = url.pathname.split("/");

				for (const [id, handler] of route.params.entries()) {
					const idSegments = id.split("/");

					if (segments.length !== idSegments.length) continue;

					const params: Params = {};
					let i = 0;

					for (; i < segments.length; i++) {
						// same length, they will always be defined
						const seg = segments[i]!;
						const idSeg = idSegments[i]!;

						if (seg === idSeg) continue;

						if (idSeg[0] === ":") {
							params[idSeg.slice(1)] = seg;
							continue;
						}

						break;
					}

					if (i === segments.length) {
						// matched - completed loop
						return handler({ req, params, url, route: { id, handler } });
					}
				}
			}

			return this.notFound({ req, url });
		} catch (error) {
			if (this.error && error instanceof Error) {
				return this.error({ req, url, error });
			}

			throw error;
		}
	}
}
