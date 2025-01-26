import type { Elements } from "./elements.js";

export namespace JSX {
	export type IntrinsicElements = Elements;
	export type Element = Promise<string>;
}

export type Children =
	| string
	| boolean
	| JSX.Element
	| Array<Children>
	| undefined;

export type ElementProps = Record<string, Children>;

export type Props = Record<string, unknown>;

export type FC<P = Props> = (props: P) => JSX.Element;
