import type { Context } from "./fetch/context.js";

export type Params = Record<string, string>;

export type StateFunction<State> = (
	context: Omit<Context<State, Params>, "state">,
) => State;

type UnmatchedContext<State> = Omit<Context<State, Params>, "params" | "route">;

export type NotFoundMiddleware<State> = (
	context: UnmatchedContext<State>,
) => any;

export type ErrorMiddleware<State> = (
	context: UnmatchedContext<State>,
	error: Error,
) => any;

export type Page<State> =
	| string
	| ((context: Context<State, Params>) => string);

export type Middleware<State = null, P extends Params = Params> = (
	context: Context<State, P>,
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
