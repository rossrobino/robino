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
	children?: TagInput;
};

/** Tags can be a `string`, a `TagDescriptor`, or an array of `TagDescriptors`. */
export type TagInput = string | TagDescriptor | TagDescriptor[];

/** How to inject tags into the HTML string. */
export type InjectMethod = "append" | "prepend" | "replace";
