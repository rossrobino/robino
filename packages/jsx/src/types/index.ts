import type { Elements } from "./elements.js";

type MaybePromise<T> = T | Promise<T>;

export namespace JSX {
	export type IntrinsicElements = Elements;
	export type Element = MaybePromise<
		| string
		| number
		| bigint
		| boolean
		| object
		| null
		| undefined
		| Symbol
		| Iterable<Element>
		| AsyncIterable<Element>
	>;
}

export type ElementProps = Record<string, JSX.Element>;

export type Props = Record<string, unknown>;

export type FC<P = Props> = (props: P) => JSX.Element;
