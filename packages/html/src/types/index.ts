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

	/** The matched content, starts as `""`. */
	content: string;

	/** Index of the matched tag.  */
	index?: number;

	/** Result of the match. */
	match?: string;

	/** Content is built and ready to enqueue. */
	waiting?: boolean;
};

export type MatchedInjection = Required<Injection>;
