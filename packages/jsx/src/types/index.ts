import type { Elements } from "./elements.js";

export type Children =
	| string
	| Promise<string>
	| Array<string | Promise<string>>;

export type Props = Record<string, unknown> & {
	children?: Children;
};

export type FC<P = Props> = (props?: P) => Promise<string>;

export namespace JSX {
	export type IntrinsicElements = Elements;
	export type Element = ReturnType<FC>;
}
