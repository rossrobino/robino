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

type MaybeOmitGlobalHTMLAttribute<
	U extends keyof GlobalHTMLAttributes | null = null,
> = U extends keyof GlobalHTMLAttributes
	? Omit<GlobalHTMLAttributes, U>
	: GlobalHTMLAttributes;

type ExtendedHTMLAttributes<
	T extends Record<string, string | boolean>,
	U extends keyof GlobalHTMLAttributes | null = null,
> = MaybeOmitGlobalHTMLAttribute<U> & Partial<T>;

type AnchorHTMLAttributes = ExtendedHTMLAttributes<{
	/** Link to downloadable file */
	download: string | boolean;
	/** URL of hyperlink */
	href: string;
	/** Language of linked document */
	hreflang: string;
	/** List of URLs to ping */
	ping: string;
	/** Controls referrer information */
	referrerpolicy:
		| "no-referrer"
		| "no-referrer-when-downgrade"
		| "origin"
		| "origin-when-cross-origin"
		| "same-origin"
		| "strict-origin"
		| "strict-origin-when-cross-origin"
		| "unsafe-url"
		| (string & {});
	/** Specifies relationship to target */
	rel:
		| "alternate"
		| "author"
		| "bookmark"
		| "external"
		| "help"
		| "license"
		| "next"
		| "nofollow"
		| "noreferrer"
		| "noopener"
		| "prev"
		| "search"
		| "tag"
		| (string & {});
	/** Specifies context for navigation */
	target: "_self" | "_blank" | "_parent" | "_top" | (string & {});
	/** Hints at the MIME type */
	type: string;
}>;

type AreaHTMLAttributes = ExtendedHTMLAttributes<{
	/** Alternative text for the area */
	alt: string;
	/** Coords of the area */
	coords: string;
	/** Download link or Boolean indicating download */
	download: string | boolean;
	/** URL if area defines hyperlink */
	href: string;
	/** Pings specified URLs when area is clicked */
	ping: string;
	/** Controls referrer info */
	referrerpolicy: string;
	/** Relationship between area and target */
	rel: string;
	/** Defines the shape of the area */
	shape: "rect" | "circle" | "poly" | "default" | (string & {});
	/** Context for navigation */
	target: "_self" | "_blank" | "_parent" | "_top" | (string & {});
}>;

type AudioHTMLAttributes = ExtendedHTMLAttributes<{
	/** Boolean if audio should autoplay */
	autoplay: boolean;
	/** Boolean if controls are shown for audio playback */
	controls: boolean;
	/** Customize the native audio controls  */
	controlslist: string;
	/** CORS requests crossorigin when audio used on canvas */
	crossorigin: "anonymous" | "use-credentials" | "" | (string & {});
	/** Boolean indicating disable of remote playback */
	disableremoteplayback: boolean;
	/** Boolean if audio should loop */
	loop: boolean;
	/** Boolean if muted by default */
	muted: boolean;
	/** Preload hint: none, metadata, auto */
	preload: "none" | "metadata" | "auto" | "" | (string & {});
	/** URL of audio source */
	src: string;
}>;

type BaseHTMLAttributes = ExtendedHTMLAttributes<{
	/** Base URL */
	href: string;
	/** Target navigation context in base */
	target: "_self" | "_blank" | "_parent" | "_top" | (string & {});
}>;

type BlockquoteHTMLAttributes = ExtendedHTMLAttributes<{
	/** Attribution URL for the content */
	cite: string;
}>;

type BodyHTMLAttributes = ExtendedHTMLAttributes<{
	/** After print event handler */
	onafterprint: string;
	/** Before print event handler */
	onbeforeprint: string;
	/** When about to unload */
	onbeforeunload: string;
	/** Blur event handler */
	onblur: string;
	/** Error event handler */
	onerror: string;
	/** Focus event handler */
	onfocus: string;
	/** Change in URL fragment */
	onhashchange: string;
	/** Change in preferred language */
	onlanguagechange: string;
	/** Load event handler */
	onload: string;
	/** Message from web worker or other document */
	onmessage: string;
	/** Error in receiving postMessage */
	onmessageerror: string;
	/** Transition to offline availability */
	onoffline: string;
	/** Transition to online availability */
	ononline: string;
	/** Change in session history */
	onpageswap: string;
	/** When page is hidden */
	onpagehide: string;
	/** Revealed content */
	onpagereveal: string;
	/** Page shows content */
	onpageshow: string;
	/** Popstate event handler */
	onpopstate: string;
	/** Resize event handler */
	onresize: string;
	/** Promise rejection handled */
	onrejectionhandled: string;
	/** Change in web storage */
	onstorage: string;
	/** Unhandled promise rejection */
	onunhandledrejection: string;
	/** Unload event handler */
	onunload: string;
}>;

type ButtonHTMLAttributes = ExtendedHTMLAttributes<{
	/** Boolean autofocus on button */
	autofocus: boolean;
	/** Command to execute */
	command: string;
	/** Specifies a command relationship */
	commandfor: string;
	/** Boolean to disable button */
	disabled: boolean;
	/** Form ID to associate button */
	form: string;
	/** URL action for form button */
	formaction: string;
	/** Encoding of form when submitting */
	formenctype:
		| "application/x-www-form-urlencoded"
		| "multipart/form-data"
		| "text/plain"
		| (string & {});
	/** HTTP method for form submission */
	formmethod: "get" | "post" | "dialog" | (string & {});
	/** Boolean to ignore form validation  */
	formnovalidate: boolean;
	/** Target for form submission */
	formtarget: "_self" | "_blank" | "_parent" | "_top" | (string & {});
	/** Name of the button */
	name: string;
	/** Element to popover target */
	popovertarget: string;
	/** Action to take with popover target */
	popovertargetaction: string;
	/** Button type: button, submit, or reset */
	type: "button" | "submit" | "reset" | (string & {});
	/** Defines the button's initial value */
	value: string;
}>;

type CanvasHTMLAttributes = ExtendedHTMLAttributes<{
	/** Height of the canvas */
	height: string;
	/** Boolean for Mozilla-specific opaque setting */
	["moz-opaque"]: boolean;
	/** Width of the canvas */
	width: string;
}>;

type ColHTMLAttributes = ExtendedHTMLAttributes<{
	/** Number of columns the element should span */
	span: string;
}>;

type ColgroupHTMLAttributes = ExtendedHTMLAttributes<{
	/** Defines the span of the column group */
	span: string;
}>;

type DataHTMLAttributes = ExtendedHTMLAttributes<{
	/** Machine-readable value */
	value: string;
}>;

type DelHTMLAttributes = ExtendedHTMLAttributes<{
	/** Source URL of the quoted change */
	cite: string;
	/** Date and time of the change */
	datetime: string;
}>;

type DetailsHTMLAttributes = ExtendedHTMLAttributes<{
	/** If the details are open */
	open: boolean;
	/** HTML5 global attribute allowing user agents to define meaning/scoped functionality */
	name: string;
}>;

type DialogHTMLAttributes = ExtendedHTMLAttributes<
	{
		/** Boolean to open state of the dialog */
		open: boolean;
	},
	"tabindex"
>;

type EmbedHTMLAttributes = ExtendedHTMLAttributes<{
	/** Height of the embedded content */
	height: string;
	/** URL of the resource to embed */
	src: string;
	/** MIME type of the embedded content */
	type: string;
	/** Width of the embedded content */
	width: string;
}>;

type FieldsetHTMLAttributes = ExtendedHTMLAttributes<{
	/** Boolean to disable the fieldset */
	disabled: boolean;
	/** Form ID that fieldset belongs to */
	form: string;
	/** Name of the fieldset */
	name: string;
}>;

type FormHTMLAttributes = ExtendedHTMLAttributes<{
	/** Character encoding to use */
	["accept-charset"]: string;
	/** How text is capitalized in forms */
	autocapitalize:
		| "off"
		| "none"
		| "on"
		| "sentences"
		| "words"
		| "characters"
		| (string & {});
	/** Hint for browser to activate autocomplete */
	autocomplete: "on" | "off" | (string & {});
	/** Name of the form */
	name: string;
	/** Relationship between documents */
	rel: string;
	/** Destination URL for data when submitting form */
	action: string;
	/** Encoding type for form submissions */
	enctype:
		| "application/x-www-form-urlencoded"
		| "multipart/form-data"
		| "text/plain"
		| (string & {});
	/** HTTP method to submit the form */
	method: "get" | "post" | "dialog" | (string & {});
	/** Boolean to submit without validation check */
	novalidate: boolean;
	/** Navigation target for form submission */
	target: "_self" | "_blank" | "_parent" | "_top" | (string & {});
}>;

type HtmlHTMLAttributes = ExtendedHTMLAttributes<{
	/** XML namespace of HTML document */
	xmlns: string;
}>;

type IframeHTMLAttributes = ExtendedHTMLAttributes<{
	/** Specifies a Permissions Policy for the iframe */
	allow: string;
	/** Set to true if the iframe can activate fullscreen mode */
	allowfullscreen: boolean;
	/** The height of the frame in CSS pixels */
	height: string;
	/** Indicates when the browser should load the iframe */
	loading: "eager" | "lazy" | (string & {});
	/** A targetable name for the embedded browsing context */
	name: string;
	/** Indicates which referrer to send when fetching the frame's resource */
	referrerpolicy:
		| "no-referrer"
		| "no-referrer-when-downgrade"
		| "origin"
		| "origin-when-cross-origin"
		| "same-origin"
		| "strict-origin"
		| "strict-origin-when-cross-origin"
		| "unsafe-url"
		| (string & {});
	/** Controls the restrictions applied to the content embedded in the iframe */
	sandbox: string;
	/** The URL of the page to embed */
	src: string;
	/** Inline HTML to embed, overriding the src attribute */
	srcdoc: string;
	/** The width of the frame in CSS pixels */
	width: string;
}>;

type ImgHTMLAttributes = ExtendedHTMLAttributes<{
	/** Defines text that can replace the image in the page */
	alt: string;
	/** Indicates if the fetching of the image must be done using a CORS request */
	crossorigin: "anonymous" | "use-credentials" | (string & {});
	/** Provides a hint to the browser regarding decoding */
	decoding: "sync" | "async" | "auto" | (string & {});
	/** Marks the image for observation by the PerformanceElementTiming API */
	elementtiming: string;
	/** Provides a hint of the relative priority to use when fetching the image */
	fetchpriority: "high" | "low" | "auto" | (string & {});
	/** The intrinsic height of the image, in pixels */
	height: string;
	/** Indicates that the image is part of a server-side map */
	ismap: boolean;
	/** Indicates how the browser should load the image */
	loading: "eager" | "lazy";
	/** Referrer policy for fetching the image */
	referrerpolicy:
		| "no-referrer"
		| "no-referrer-when-downgrade"
		| "origin"
		| "origin-when-cross-origin"
		| "same-origin"
		| "strict-origin"
		| "strict-origin-when-cross-origin"
		| "unsafe-url"
		| (string & {});
	/** Sizes attribute */
	sizes: string;
	/** The image URL */
	src: string;
	/** One or more strings indicating possible image sources */
	srcset: string;
	/** The intrinsic width of the image in pixels */
	width: string;
	/** The partial URL of an image map */
	usemap: string;
}>;

type InputHTMLAttributes = ExtendedHTMLAttributes<{
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

type InsHTMLAttributes = ExtendedHTMLAttributes<{
	/** This attribute defines the URI of a resource that explains the change, such as a link to meeting minutes or a ticket in a troubleshooting system. */
	cite: string;
	/** This attribute indicates the time and date of the change and must be a valid date with an optional time string. */
	datetime: string;
}>;

type LabelHTMLAttributes = ExtendedHTMLAttributes<{
	/** The id of a labelable form-related element in the same document */
	for: string;
}>;

type LiHTMLAttributes = ExtendedHTMLAttributes<{
	/** The current ordinal value of the list item, only numerical values are allowed */
	value: string;
}>;

type LinkHTMLAttributes = ExtendedHTMLAttributes<{
	/** Specifies the type of content being loaded */
	as:
		| "audio"
		| "document"
		| "embed"
		| "fetch"
		| "font"
		| "image"
		| "object"
		| "script"
		| "style"
		| "track"
		| "video"
		| "worker"
		| (string & {});
	/** Indicates whether certain operations should be blocked */
	blocking: "render" | (string & {});
	/** Indicates whether CORS must be used when fetching the resource */
	crossorigin: "anonymous" | "use-credentials" | (string & {});
	/** Indicates whether the stylesheet is to be loaded or not */
	disabled: boolean;
	/** Provides a hint for the fetch priority */
	fetchpriority: "high" | "low" | "auto" | (string & {});
	/** Specifies the URL of the linked resource */
	href: string;
	/** Indicates the language of the linked resource */
	hreflang: string;
	/** Similar syntax and semantics to sizes for preload */
	imagesizes: string;
	/** Similar syntax and semantics to srcset for preload */
	imagesrcset: string;
	/** Contains inline metadata such as a cryptographic hash of the resource */
	integrity: string;
	/** Specifies the media that the linked resource applies to */
	media: string;
	/** Specifies the referrer policy for the link */
	referrerpolicy:
		| "no-referrer"
		| "no-referrer-when-downgrade"
		| "origin"
		| "origin-when-cross-origin"
		| "unsafe-url"
		| (string & {});
	/** Defines the relationship between the current document and the linked document */
	rel: string;
	/** Defines the sizes of icons for visual media */
	sizes: string;
	/** Specifies a title for the <link> element */
	title: string;
	/** Defines the MIME type of the content linked to */
	type: string;
}>;

type MapHTMLAttributes = ExtendedHTMLAttributes<{
	/** The name attribute gives the map a name so that it can be referenced; it must have a non-empty value with no space characters. */
	name: string;
}>;

type MetaHTMLAttributes = ExtendedHTMLAttributes<{
	/** This attribute declares the document's character encoding. */
	charset: "utf-8";
	/** This attribute contains the value for the http-equiv or name attribute, depending on which is used. */
	content: string;
	/** Defines a pragma directive. */
	"http-equiv":
		| "content-security-policy"
		| "content-type"
		| "default-style"
		| "x-ua-compatible"
		| "refresh"
		| (string & {});
	/** The media attribute defines which media the theme color defined in the content attribute should be applied to. */
	media: string;
	/** The name and content attributes can be used together to provide document metadata. */
	name:
		| "application-name"
		| "author"
		| "description"
		| "generator"
		| "keywords"
		| "theme-color"
		| "viewport"
		| (string & {});
}>;

type MeterHTMLAttributes = ExtendedHTMLAttributes<{
	/** The current numeric value, between min and max. Defaults to 0 if unspecified. */
	value: string;
	/** The lower numeric bound of the range. Defaults to 0 if unspecified. */
	min: string;
	/** The upper numeric bound of the range. Defaults to 1 if unspecified. */
	max: string;
	/** The upper bound of the low end of the range. Defaults to min if unspecified. */
	low: string;
	/** The lower bound of the high end of the range. Defaults to max if unspecified. */
	high: string;
	/** Indicates the optimal numeric value within the range. */
	optimum: string;
	/** Sets a form owner for the element. Refers to the id of a form in the same tree. */
	form: string;
}>;

type ObjectHTMLAttributes = ExtendedHTMLAttributes<{
	/** The address of the resource as a valid URL. At least one of data and type must be defined. */
	data: string;
	/** The form element, if any, that the object element is associated with (its form owner). The value of the attribute must be an ID of a <form> element in the same document. */
	form: string;
	/** The height of the displayed resource, in CSS pixels. (Absolute values only. NO percentages) */
	height: string;
	/** The name of valid browsing context (HTML5), or the name of the control (HTML 4). */
	name: string;
	/** The content type of the resource specified by data. At least one of data and type must be defined. */
	type: string;
	/** The width of the display resource, in CSS pixels. (Absolute values only. NO percentages) */
	width: string;
}>;

type OlHTMLAttributes = ExtendedHTMLAttributes<{
	/** Specifies that the list's items are in reverse order. */
	reversed: boolean;
	/** An integer to start counting from for the list items. */
	start: string;
	/** Sets the numbering type for the list items. */
	type: "a" | "A" | "i" | "I" | "1" | (string & {});
}>;

type OptgroupHTMLAttributes = ExtendedHTMLAttributes<{
	/** If this Boolean attribute is set, none of the items in this option group is selectable. */
	disabled: boolean;
	/** The name of the group of options, which the browser can use when labeling the options in the user interface. */
	label: string;
}>;

type OptionHTMLAttributes = ExtendedHTMLAttributes<{
	/** If this Boolean attribute is set, this option is not checkable. */
	disabled: boolean;
	/** This attribute is text for the label indicating the meaning of the option. */
	label: string;
	/** If present, this Boolean attribute indicates that the option is initially selected. */
	selected: boolean;
	/** The content of this attribute represents the value to be submitted with the form. */
	value: string;
}>;

type OutputHTMLAttributes = ExtendedHTMLAttributes<{
	/** A space-separated list of other elements' ids that contributed input values to the calculation. */
	for: string;
	/** The form element to associate the output with, must be an id of a form in the same document. */
	form: string;
	/** The element's name, used in the form.elements API. */
	name: string;
}>;
type ProgressHTMLAttributes = ExtendedHTMLAttributes<{
	/** Max value for progress, must be > 0 */
	max: string;
	/** Current progress value, between 0 and max */
	value: string;
}>;

type QuoteHTMLAttributes = ExtendedHTMLAttributes<{
	/** URL designating a source for the quoted information */
	cite: string;
}>;

type ScriptHTMLAttributes = ExtendedHTMLAttributes<{
	/**
	 * Indicates if a script should be fetched in parallel and executed as soon as it's available.
	 * Boolean attribute; presence means true, absence means false.
	 */
	async: boolean;
	/** Blocks certain operations based on fetching of the script, like rendering.  */
	blocking: string;
	/** Indicates if error logging is enabled for non-standard CORS checks. */
	crossorigin: "anonymous" | "use-credentials" | (string & {});
	/**
	 * Executes the script after the document has been parsed, deferring DOMContentLoaded.
	 * Boolean attribute; presence means true, absence means false.
	 */
	defer: boolean;
	/** Hint of the relative priority for fetching the script. */
	fetchpriority: "high" | "low" | "auto";
	/** Inline metadata for verifying fetched resources. Must not be specified without a src value. */
	integrity: string;
	/**
	 * Prevents script execution in browsers that support ES modules.
	 * Boolean attribute; presence means true, absence means false.
	 */
	nomodule: boolean;
	/** Cryptographic nonce for allowing scripts within a Content-Security-Policy. */
	nonce: string;
	/** Indicates which referrer to send when fetching the script. */
	referrerpolicy:
		| "no-referrer"
		| "no-referrer-when-downgrade"
		| "origin"
		| "origin-when-cross-origin"
		| "same-origin"
		| "strict-origin"
		| "strict-origin-when-cross-origin"
		| "unsafe-url"
		| (string & {});
	/** URI of an external script to be fetched. */
	src: string;
	/** Indicates the type of script represented. */
	type: "module" | "importmap" | "speculationrules" | (string & {});
}>;

type SelectHTMLAttributes = ExtendedHTMLAttributes<{
	/** A string providing a hint for the user agent's autocomplete feature. */
	autocomplete: string;
	/** Boolean attribute specifying that the form control should have input focus when the page loads. */
	autofocus: boolean;
	/** Boolean attribute indicating that the user cannot interact with the control. */
	disabled: boolean;
	/** The form element to associate the <select> with. */
	form: string;
	/** Boolean attribute indicating that multiple options can be selected in the list. */
	multiple: boolean;
	/** Attribute used to specify the name of the control. */
	name: string;
	/** Boolean attribute indicating that an option with a non-empty string value must be selected. */
	required: boolean;
	/** Defines the number of rows in the list that should be visible at one time. */
	size: string;
}>;

type SlotHTMLAttributes = ExtendedHTMLAttributes<{
	/** The slot's name. */
	name: string;
}>;

type SourceHTMLAttributes = ExtendedHTMLAttributes<{
	/** Specifies the MIME media type of the image or media type */
	type: string;
	/** Specifies the URL of the media resource */
	src: string;
	/** Specifies a comma-separated list of image URLs and their descriptors */
	srcset: string;
	/** Specifies a list of source sizes for the rendered width of the image */
	sizes: string;
	/** Specifies the media query for the resource's intended media */
	media: string;
	/** Specifies the intrinsic height of the image in pixels */
	height: string;
	/** Specifies the intrinsic width of the image in pixels */
	width: string;
}>;

type StyleHTMLAttributes = ExtendedHTMLAttributes<{
	/** Defines operations to be blocked on critical subresources */
	blocking: "render" | (string & {});
	/** Defines which media the style should be applied to */
	media: string;
	/** A cryptographic nonce for Content-Security-Policy */
	nonce: string;
	/** Specifies alternative style sheet sets */
	title: string;
}>;

type TdHTMLAttributes = ExtendedHTMLAttributes<{
	/** Indicates how many columns the data cell spans. */
	colspan: string;
	/** A list of space-separated strings corresponding to the id of the <th> elements providing headings. */
	headers: string;
	/** Indicates how many rows the data cell spans. */
	rowspan: string;
}>;

type TemplateHTMLAttributes = ExtendedHTMLAttributes<{
	/** Creates a shadow root for the parent element. */
	shadowrootmode: "open" | "closed" | (string & {});
	/** Sets the clonable property of a ShadowRoot to true. */
	shadowrootclonable: boolean;
	/** Sets the delegatesFocus property of a ShadowRoot to true. */
	shadowrootdelegatesfocus: boolean;
	/** Sets the serializable property of a ShadowRoot to true. */
	shadowrootserializable: boolean;
}>;

type TextareaHTMLAttributes = ExtendedHTMLAttributes<{
	/** Controls whether inputted text is automatically capitalized and, if so, in what manner. */
	autocapitalize:
		| "off"
		| "characters"
		| "words"
		| "sentences"
		| "on"
		| (string & {});
	/** Controls whether entered text can be automatically completed by the browser. */
	autocomplete: "off" | "on" | (string & {});
	/** Controls whether automatic spelling correction and processing are enabled while editing. */
	autocorrect: "on" | "off" | (string & {});
	/** The form control should have input focus when the page loads. */
	autofocus: boolean;
	/** The visible width of the text control, in average character widths. */
	cols: string;
	/** Indicates the text directionality of the element contents. */
	dirname: string;
	/** Boolean attribute indicates that the user cannot interact with the control. */
	disabled: boolean;
	/** The form element the textarea element is associated with. */
	form: string;
	/** The maximum string length that the user can enter. */
	maxlength: string;
	/** The minimum string length required that the user should enter. */
	minlength: string;
	/** The name of the control. */
	name: string;
	/** A hint to the user of what can be entered in the control. */
	placeholder: string;
	/** Boolean attribute indicates that the user cannot modify the value of the control. */
	readonly: boolean;
	/** Specifies that the user must fill in a value before submitting the form. */
	required: boolean;
	/** The number of visible text lines for the control. */
	rows: string;
	/** Specifies whether the textarea is subject to spell-checking. */
	spellcheck: "true" | "false" | "default";
	/** Indicates how the control should wrap the value for form submission. */
	wrap: "hard" | "soft" | "off";
}>;

type ThHTMLAttributes = ExtendedHTMLAttributes<{
	/** A short, abbreviated description of the header cell's content. */
	abbr: string;
	/** A non-negative integer value indicating how many columns the header cell spans or extends. */
	colspan: string;
	/** A list of space-separated strings corresponding to the id attributes of the <th> elements that provide the headers for this header cell. */
	headers: string;
	/** A non-negative integer value indicating how many rows the header cell spans or extends. */
	rowspan: string;
	/** Defines the cells that the header (defined in the <th>) element relates to. */
	scope: "row" | "col" | "rowgroup" | "colgroup" | (string & {});
}>;

type TimeHTMLAttributes = ExtendedHTMLAttributes<{
	/** Indicates the time and/or date of the element */
	datetime: string;
}>;

type TrackHTMLAttributes = ExtendedHTMLAttributes<{
	/** Indicates that the track should be enabled by default */
	default: boolean;
	/** How the text track is meant to be used */
	kind: "subtitles" | "captions" | "chapters" | "metadata" | (string & {});
	/** A user-readable title of the text track */
	label: string;
	/** Address of the track (.vtt file) */
	src: string;
	/** Language of the track text data */
	srclang: string;
}>;

type VideoHTMLAttributes = ExtendedHTMLAttributes<{
	/** Boolean attribute for autoplay functionality */
	autoplay: boolean;
	/** Boolean attribute to offer video controls */
	controls: boolean;
	/** Specifies controls to be displayed: nodownload, nofullscreen, noremoteplayback */
	controlslist:
		| "nodownload"
		| "nofullscreen"
		| "noremoteplayback"
		| (string & {});
	/** CORS settings: anonymous, use-credentials */
	crossorigin: "anonymous" | "use-credentials" | "" | (string & {});
	/** Boolean to prevent Picture-in-Picture mode */
	disablepictureinpicture: boolean;
	/** Boolean to disable remote playback */
	disableremoteplayback: boolean;
	/** Height of display area in CSS pixels */
	height: string;
	/** Boolean to loop playback of video */
	loop: boolean;
	/** Boolean attribute to mute audio by default */
	muted: boolean;
	/** Boolean attribute for inline playback */
	playsinline: boolean;
	/** URL for an image shown while downloading */
	poster: string;
	/** Preload behavior: none, metadata, auto */
	preload: "none" | "metadata" | "auto" | "" | (string & {});
	/** URL of the video source */
	src: string;
	/** Width of display area in CSS pixels */
	width: string;
}>;

export type Elements = Record<
	string,
	Record<string, string> & GlobalHTMLAttributes
> & {
	a: AnchorHTMLAttributes;
	area: AreaHTMLAttributes;
	audio: AudioHTMLAttributes;
	base: BaseHTMLAttributes;
	blockquote: BlockquoteHTMLAttributes;
	body: BodyHTMLAttributes;
	button: ButtonHTMLAttributes;
	canvas: CanvasHTMLAttributes;
	col: ColHTMLAttributes;
	colgroup: ColgroupHTMLAttributes;
	data: DataHTMLAttributes;
	del: DelHTMLAttributes;
	details: DetailsHTMLAttributes;
	dialog: DialogHTMLAttributes;
	embed: EmbedHTMLAttributes;
	fieldset: FieldsetHTMLAttributes;
	form: FormHTMLAttributes;
	html: HtmlHTMLAttributes;
	iframe: IframeHTMLAttributes;
	img: ImgHTMLAttributes;
	input: InputHTMLAttributes;
	ins: InsHTMLAttributes;
	label: LabelHTMLAttributes;
	li: LiHTMLAttributes;
	link: LinkHTMLAttributes;
	map: MapHTMLAttributes;
	meta: MetaHTMLAttributes;
	meter: MeterHTMLAttributes;
	object: ObjectHTMLAttributes;
	ol: OlHTMLAttributes;
	optgroup: OptgroupHTMLAttributes;
	option: OptionHTMLAttributes;
	output: OutputHTMLAttributes;
	progress: ProgressHTMLAttributes;
	q: QuoteHTMLAttributes;
	script: ScriptHTMLAttributes;
	select: SelectHTMLAttributes;
	slot: SlotHTMLAttributes;
	source: SourceHTMLAttributes;
	style: StyleHTMLAttributes;
	td: TdHTMLAttributes;
	template: TemplateHTMLAttributes;
	textarea: TextareaHTMLAttributes;
	th: ThHTMLAttributes;
	time: TimeHTMLAttributes;
	track: TrackHTMLAttributes;
	video: VideoHTMLAttributes;
};
