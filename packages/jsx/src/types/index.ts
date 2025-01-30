import type { Elements } from "./elements.js";

export namespace JSX {
	export type IntrinsicElements = Elements;
	export type Element = Promise<string>;
}

type MaybePromise<T> = T | Promise<T>;

export type Children = MaybePromise<
	string | number | bigint | boolean | Array<Children> | null | undefined
>;

export type ElementProps = Record<string, Children>;

export type Props = Record<string, unknown>;

export type FC<P = Props> = (props: P) => JSX.Element;
