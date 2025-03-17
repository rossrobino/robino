import type { FC, JSX } from "@robino/jsx";

/** An object that describes a tag and its children. */
export type TagDescriptor = {
	/**
	 * The tagName of the element.
	 *
	 * @example "h1"
	 */
	name: string;

	/**
	 * The attributes on the tag.
	 *
	 * @example
	 *
	 * These attributes,
	 *
	 * ```js
	 * {
	 * 	class: "text-black",
	 * 	open: true,
	 * }
	 * ```
	 *
	 * would produce the following HTML.
	 *
	 * ```html
	 * <dialog class="text-black" open>...</dialog>
	 * ```
	 */
	attrs?: Record<string, string | boolean | undefined>;

	/** Children of the tag. Tags or a string of HTML. */
	children?: Tags;
};

/** Tags can be a `string`, a `TagDescriptor`, or an array of `TagDescriptors`. */
export type Tags = string | TagDescriptor | TagDescriptor[];

/** The expected input into the Page methods. */
export type TagInput = FC | JSX.Element;

export type Injection = {
	/**
	 * The tag name to target the injection to.
	 *
	 * @example "custom-element"
	 */
	target: string;

	/** Tags to inject. */
	tagInput: TagInput;

	/** If the injection should be streamed out of order. */
	defer: boolean;

	/** ID for out of order streaming, default to `""` if not streaming. */
	id: string;

	/** If the injection holds the loading state for out of order streaming. */
	loading: boolean;

	/** The matched content, starts as `""`. */
	content: string;

	/** If the injection is targeted to the <head> element. */
	head?: boolean;

	/** Index of the matched tag.  */
	index?: number;

	/** Result of the match. */
	match?: string;

	/** Content is built and ready to enqueue. */
	waiting?: boolean;
};

export type MatchedInjection = Required<Injection>;
