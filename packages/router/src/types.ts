import type { Context } from "./fetch/context.js";

export type MaybePromise<T> = T | Promise<T>;

export type Params = Record<string, string>;

export type UnmatchedContext<State, P extends Params> = Omit<
	Context<State, P>,
	"route"
> &
	Partial<Pick<Context<State, P>, "route">>;

export type Start<State> = (
	context: Omit<UnmatchedContext<any, Params>, "state" | "route" | "params">,
) => State;

export type ErrorMiddleware<State> = (
	context: UnmatchedContext<State, Params>,
	error: unknown,
) => MaybePromise<void>;

export type Middleware<State = null, P extends Params = Params> = (
	context: Context<State, P>,
	next: () => Promise<void>,
) => MaybePromise<void>;

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

export type TrailingSlash = "always" | "never" | "ignore";

export type ExtractParams<Pattern extends string = string> =
	Pattern extends `${infer _Start}:${infer Param}/${infer Rest}`
		? { [k in Param | keyof ExtractParams<Rest>]: string }
		: Pattern extends `${infer _Start}:${infer Param}`
			? { [k in Param]: string }
			: Pattern extends `${infer _Rest}*`
				? { "*": string }
				: {};

export type ExtractMultiParams<Patterns extends string[]> = Patterns extends [
	infer First extends string,
	...infer Rest extends string[],
]
	? Rest["length"] extends 0
		? ExtractParams<First>
		: ExtractParams<First> | ExtractMultiParams<Rest>
	: never;
