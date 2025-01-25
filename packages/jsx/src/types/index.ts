import type * as Attr from "../gen/elements.js";

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

type ExtendedHTMLAttributes<T extends ElementProps> = GlobalHTMLAttributes &
	Partial<T>;

export type HTMLAttributesWithChildren<T extends ElementProps> =
	ExtendedHTMLAttributes<T> & ElementProps;

// cspell: disable
// https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes
type GlobalHTMLAttributes = Partial<{
	/** Shortcut key(s) for the element */
	accesskey: string;
	/** Specifies the anchor */
	anchor: string;
	/** Controls text capitalization */
	autocapitalize: string;
	/** Controls text correction */
	autocorrect: string;
	/** Automatically sets focus to the element */
	autofocus: boolean;
	/** Space-separated list of classes */
	class: string;
	/** Specifies if content is editable */
	contenteditable: string;
	/** Text directionality */
	dir: string;
	/** Whether the element is draggable */
	draggable: boolean;
	/** Hint for input methods */
	enterkeyhint: string;
	/** Names shadow DOM export parts */
	exportparts: string;
	/** Hides the element */
	hidden: boolean;
	/** Unique element identifier */
	id: string;
	/** Specifies element's inertness */
	inert: boolean;
	/** Provides a hint of what the input mode is */
	inputmode: string;
	/** Custom element name */
	is: string;
	/** Global identifier of the item */
	itemid: string;
	/** Property names of the item */
	itemprop: string;
	/** Defines related items */
	itemref: string;
	/** Defines the item as a data item */
	itemscope: boolean;
	/** Item type of the element */
	itemtype: string;
	/** Language of the element's content */
	lang: string;
	/** Cryptographic nonce */
	nonce: string;
	/** Assigns semantic meaning to element parts */
	part: string;
	/** Assigns a popover description */
	popover: string;
	/**
	 * Defines an element's role
	 *
	 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles)
	 */
	role: string;
	/** Assigns a slot in a shadow DOM */
	slot: string;
	/** Checks document text for errors */
	spellcheck: boolean;
	/** Inline CSS styling */
	style: string;
	/** Order of the element in tabbing */
	tabindex: number;
	/** Suggests title for element */
	title: string;
	/** Defines if to translate element */
	translate: string;
	/** Request virtual keyboard policy */
	virtualkeyboardpolicy: string;
	/** Suggest text writing improvements */
	writingsuggestions: boolean;
	/** Data attributes, globally available */
	[key: `data-${string}`]: string;
	/** Indicates whether assistive technologies will present all changes */
	"aria-atomic": "true" | "false";
	/** Indicates an element's "busyness" */
	"aria-busy": "true" | "false";
	/** Identifies an element (or elements) that is controlled by the current element */
	"aria-controls": string;
	/** Indicates the current state of an element */
	"aria-current":
		| "page"
		| "step"
		| "location"
		| "date"
		| "time"
		| "true"
		| "false"
		| "false";
	/** Identifies the element that describes the object */
	"aria-describedby": string;
	/** Defines a string value that describes the element */
	"aria-description": string;
	/** Identifies the element that provides a detailed description */
	"aria-details": string;
	/** Indicates that the element is perceivable but disabled */
	"aria-disabled": "true" | "false";
	/** Indicate what functions can be performed when dragged */
	"aria-dropeffect": "none" | "copy" | "execute" | "link" | "move" | "popup";
	/** Indicates the element where an error has occurred */
	"aria-errormessage": string;
	/** Identifies the next element (or elements) in the logical sequence */
	"aria-flowto": string;
	/** Indicates an element's "grabbed" state */
	"aria-grabbed": "true" | "false";
	/** Indicates the availability and type of interactive popup element */
	"aria-haspopup":
		| "menu"
		| "listbox"
		| "tree"
		| "grid"
		| "dialog"
		| "true"
		| "false";
	/** Indicates that the element is not visible */
	"aria-hidden": "true" | "false";
	/** Indicates the validity of user input */
	"aria-invalid": "grammar" | "false" | "spelling" | "true";
	/** Indicates keyboard shortcuts */
	"aria-keyshortcuts": string;
	/** Defines a string value that labels the current element */
	"aria-label": string;
	/** Identifies the element (or elements) that labels the current element */
	"aria-labelledby": string;
	/** Defines the "live" state for an element */
	"aria-live": "assertive" | "off" | "polite";
	/** Identifies an element (or elements) for which the current element is an owner or controller */
	"aria-owns": string;
	/** Indicates what user agent defines as the "relevant" changes */
	"aria-relevant": "additions" | "all" | "removals" | "text" | "additions text";
	/** Defines a human-readable, author-localized description for a role */
	"aria-roledescription": string;
}>;

type TemplateHTMLAttributes = HTMLAttributesWithChildren<{
	/** Creates a shadow root for the parent element. */
	shadowrootmode: "open" | "closed" | (string & {});
	/** Sets the clonable property of a ShadowRoot to true. */
	shadowrootclonable: boolean;
	/** Sets the delegatesFocus property of a ShadowRoot to true. */
	shadowrootdelegatesfocus: boolean;
	/** Sets the serializable property of a ShadowRoot to true. */
	shadowrootserializable: boolean;
}>;

type InputHTMLAttributes = HTMLAttributesWithChildren<{
	/** Valid for file input type only. Defines which file types are selectable. */
	accept: string;
	/** Provides alternative text for image input type. */
	alt: string;
	/** Controls automatic capitalization in inputted text. */
	autocapitalize: string;
	/** Hint for form autofill feature. */
	autocomplete: string;
	/** Media capture input method in file upload controls. */
	capture: string;
	/** Whether the command or control is checked. */
	checked: boolean;
	/** Name of form field for sending the element's directionality. */
	dirname: string;
	/** Whether the form control is disabled. */
	disabled: boolean;
	/** Associates the control with a form element. */
	form: string;
	/** URL to use for form submission. */
	formaction: string;
	/** Form encoding type for submission. */
	formenctype: string;
	/** HTTP method for form submission. */
	formmethod: string;
	/** Bypass form control validation. */
	formnovalidate: boolean;
	/** Browsing context for form submission. */
	formtarget: string;
	/** Vertical dimension for image input type. */
	height: string;
	/** ID of <datalist> for autocomplete options. */
	list: string;
	/** Maximum acceptable value. */
	max: string;
	/** Maximum length of value in UTF-16 code units. */
	maxlength: string;
	/** Minimum acceptable value. */
	min: string;
	/** Minimum length of value in UTF-16 code units. */
	minlength: string;
	/** Whether to allow multiple values. */
	multiple: boolean;
	/** Name for the form control. */
	name: string;
	/** Pattern value must match to be valid. */
	pattern: string;
	/** Placeholder text. */
	placeholder: string;
	/** Target ID for popover. */
	popovertarget: string;
	/** Action for popover control button. */
	popovertargetaction: "hide" | "show" | "toggle";
	/** The value is not editable. */
	readonly: boolean;
	/** A value is required for form submission. */
	required: boolean;
	/** Size of the control. */
	size: string;
	/** URL of image file for image input type. */
	src: string;
	/** Incremental steps that are valid. */
	step: string;
	/** Type of form control. */
	type: string;
	/** The value of the control. */
	value: string;
	/** Horizontal dimension for image input type. */
	width: string;
}>;

export type Elements = Record<string, Record<string, Children>> & {
	a: Attr.AHTMLAttributes;
	area: Attr.AreaHTMLAttributes;
	audio: Attr.AudioHTMLAttributes;
	base: Attr.BaseHTMLAttributes;
	blockquote: Attr.BlockquoteHTMLAttributes;
	body: Attr.BodyHTMLAttributes;
	button: Attr.ButtonHTMLAttributes;
	canvas: Attr.CanvasHTMLAttributes;
	col: Attr.ColHTMLAttributes;
	colgroup: Attr.ColgroupHTMLAttributes;
	data: Attr.DataHTMLAttributes;
	del: Attr.DelHTMLAttributes;
	details: Attr.DetailsHTMLAttributes;
	dialog: Attr.DialogHTMLAttributes;
	embed: Attr.EmbedHTMLAttributes;
	fieldset: Attr.FieldsetHTMLAttributes;
	form: Attr.FormHTMLAttributes;
	html: Attr.HtmlHTMLAttributes;
	iframe: Attr.IframeHTMLAttributes;
	img: Attr.ImgHTMLAttributes;
	input: InputHTMLAttributes;
	ins: Attr.InsHTMLAttributes;
	label: Attr.LabelHTMLAttributes;
	li: Attr.LiHTMLAttributes;
	link: Attr.LinkHTMLAttributes;
	map: Attr.MapHTMLAttributes;
	meta: Attr.MetaHTMLAttributes;
	meter: Attr.MeterHTMLAttributes;
	object: Attr.ObjectHTMLAttributes;
	ol: Attr.OlHTMLAttributes;
	optgroup: Attr.OptgroupHTMLAttributes;
	option: Attr.OptionHTMLAttributes;
	output: Attr.OutputHTMLAttributes;
	progress: Attr.ProgressHTMLAttributes;
	q: Attr.QHTMLAttributes;
	script: Attr.ScriptHTMLAttributes;
	select: Attr.SelectHTMLAttributes;
	slot: Attr.SlotHTMLAttributes;
	source: Attr.SourceHTMLAttributes;
	style: Attr.StyleHTMLAttributes;
	td: Attr.TdHTMLAttributes;
	template: TemplateHTMLAttributes;
	textarea: Attr.TextareaHTMLAttributes;
	th: Attr.ThHTMLAttributes;
	time: Attr.TimeHTMLAttributes;
	track: Attr.TrackHTMLAttributes;
	video: Attr.VideoHTMLAttributes;
};
