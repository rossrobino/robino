export type Params = Record<string, string>;

export type ExtractParams<RouteID extends string> =
	RouteID extends `${infer _Start}:${infer Param}/${infer Rest}`
		? { [k in Param | keyof ExtractParams<Rest>]: string }
		: RouteID extends `${infer _Start}:${infer Param}`
			? { [k in Param]: string }
			: {};

export type RouteHandler<P extends Params = any> = (
	context: Context<P>,
) => Response | Promise<Response>;

export type NotFoundHandler = (
	context: Omit<Context, "params" | "route">,
) => Response | Promise<Response>;

export type ErrorHandler = (
	context: Omit<Context, "params" | "route"> & { error: Error },
) => Response | Promise<Response>;

export type Context<P extends Params = any> = {
	req: Request;
	params: P;
	url: URL;
	route: { id: string; handler: RouteHandler };
};

export type Method =
	| "GET"
	| "HEAD"
	| "POST"
	| "PUT"
	| "DELETE"
	| "CONNECT"
	| "OPTIONS"
	| "TRACE"
	| "PATCH";

export type TrailingSlash = "always" | "never" | null;
