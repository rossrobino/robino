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

/** The expected input into the Injector methods. */
export type TagInput = Tags | (() => Tags) | (() => Promise<Tags>);

export type Injection = {
	/**
	 * The tag name to target the injection to.
	 *
	 * @example "custom-element"
	 */
	target: string;

	/** The tags to inject. */
	tagInput: TagInput;

	/** Index of the matched tag.  */
	index?: number;

	/** Result of the match. */
	match?: string;
};

export type MatchedInjection = Required<Injection> & {
	/** The matched and encoded content. */
	content?: string;
};
