import type { JSX } from "@robino/jsx";

export type Injection = {
	/**
	 * The tag name to target the injection to.
	 *
	 * @example "custom-element"
	 */
	target: string;

	/** element to inject. */
	element: JSX.Element;

	/** Index of the matched tag.  */
	index?: number;

	/** Result of the match. */
	match?: string;
};

export type MatchedInjection = Required<Injection>;
