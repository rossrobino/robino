// cspell: disable
import type { Children, ElementProps } from "./index.js";

// cspell: disable
// https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes
type GlobalHTMLAttributes = Partial<{
	accesskey: string;
	anchor: string;
	autocapitalize:
		| "off"
		| "characters"
		| "words"
		| "sentences"
		| "on"
		| (string & {});
	autocorrect: string;
	autofocus: boolean;
	class: string;
	contenteditable: string;
	dir: string;
	draggable: boolean;
	enterkeyhint: string;
	exportparts: string;
	hidden: boolean;
	id: string;
	inert: boolean;
	inputmode: string;
	is: string;
	itemid: string;
	itemprop: string;
	itemref: string;
	itemscope: boolean;
	itemtype: string;
	lang: string;
	nonce: string;
	part: string;
	popover: string;
	role: string;
	slot: string;
	spellcheck: "true" | "false";
	style: string;
	tabindex: number;
	title: string;
	translate: string;
	virtualkeyboardpolicy: string;
	writingsuggestions: boolean;
}> &
	ARIAHTMLAttributes;

type ARIAHTMLAttributes = Partial<{
	"aria-atomic": "true" | "false";
	"aria-busy": "true" | "false";
	"aria-controls": string;
	"aria-current":
		| "page"
		| "step"
		| "location"
		| "date"
		| "time"
		| "true"
		| "false"
		| "false";
	"aria-describedby": string;
	"aria-description": string;
	"aria-details": string;
	"aria-disabled": "true" | "false";
	"aria-dropeffect": "none" | "copy" | "execute" | "link" | "move" | "popup";
	"aria-errormessage": string;
	"aria-flowto": string;
	"aria-grabbed": "true" | "false";
	"aria-haspopup":
		| "menu"
		| "listbox"
		| "tree"
		| "grid"
		| "dialog"
		| "true"
		| "false";
	"aria-hidden": "true" | "false";
	"aria-invalid": "grammar" | "false" | "spelling" | "true";
	"aria-keyshortcuts": string;
	"aria-label": string;
	"aria-labelledby": string;
	"aria-live": "assertive" | "off" | "polite";
	"aria-owns": string;
	"aria-relevant": "additions" | "all" | "removals" | "text" | "additions text";
	"aria-roledescription": string;
}>;

type ExtendedHTMLAttributes<T extends ElementProps> = GlobalHTMLAttributes &
	Partial<T>;

type HTMLAttributesWithChildren<T extends ElementProps> =
	ExtendedHTMLAttributes<T> & ElementProps;

type AHTMLAttributes = HTMLAttributesWithChildren<{
	download: string | boolean;
	href: string;
	hreflang: string;
	ping: string;
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
	target: "_self" | "_blank" | "_parent" | "_top" | (string & {});
	type: string;
}>;

type AreaHTMLAttributes = HTMLAttributesWithChildren<{
	alt: string;
	coords: "rect" | "circle" | "poly" | (string & {});
	download: string | boolean;
	href: string;
	ping: string;
	referrerpolicy: string;
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
	shape: "rect" | "circle" | "poly" | "default" | (string & {});
	target: "_self" | "_blank" | "_parent" | "_top" | (string & {});
}>;

type AudioHTMLAttributes = HTMLAttributesWithChildren<{
	autoplay: boolean;
	controls: boolean;
	controlslist: string;
	crossorigin: "anonymous" | "use-credentials" | (string & {});
	disableremoteplayback: boolean;
	loop: boolean;
	muted: boolean;
	preload: "none" | "metadata" | "auto" | (string & {});
	src: string;
}>;

type BaseHTMLAttributes = HTMLAttributesWithChildren<{
	href: string;
	target: "_self" | "_blank" | "_parent" | "_top" | (string & {});
}>;

type BdoHTMLAttributes = HTMLAttributesWithChildren<{
	dir: string;
}>;

type BlockquoteHTMLAttributes = HTMLAttributesWithChildren<{
	cite: string;
}>;

type BodyHTMLAttributes = HTMLAttributesWithChildren<{
	onafterprint: string;
	onbeforeprint: string;
	onbeforeunload: string;
	onblur: string;
	onerror: string;
	onfocus: string;
	onhashchange: string;
	onlanguagechange: string;
	onload: string;
	onmessage: string;
	onmessageerror: string;
	onoffline: string;
	ononline: string;
	onpageswap: string;
	onpagehide: string;
	onpagereveal: string;
	onpageshow: string;
	onpopstate: string;
	onresize: string;
	onrejectionhandled: string;
	onstorage: string;
	onunhandledrejection: string;
	onunload: string;
}>;

type ButtonHTMLAttributes = ExtendedHTMLAttributes<{
	autofocus: boolean;
	command: string;
	commandfor: string;
	disabled: boolean;
	form: string;
	formaction: string;
	formenctype:
		| "application/x-www-form-urlencoded"
		| "multipart/form-data"
		| "text/plain"
		| (string & {});
	formmethod: "get" | "post" | "dialog" | (string & {});
	formnovalidate: boolean;
	formtarget: "_self" | "_blank" | "_parent" | "_top" | (string & {});
	name: string;
	popovertarget: string;
	popovertargetaction: string;
	type: "button" | "submit" | "reset" | (string & {});
	value: string;
}>;

type CanvasHTMLAttributes = ExtendedHTMLAttributes<{
	height: string;
	["moz-opaque"]: boolean;
	width: string;
}>;
type ColHTMLAttributes = ExtendedHTMLAttributes<{
	span: string;
}>;

type ColgroupHTMLAttributes = ExtendedHTMLAttributes<{
	span: string;
}>;

type DataHTMLAttributes = ExtendedHTMLAttributes<{
	value: string;
}>;

type DelHTMLAttributes = ExtendedHTMLAttributes<{
	cite: string;
	datetime: string;
}>;

type DetailsHTMLAttributes = ExtendedHTMLAttributes<{
	open: boolean;
	name: string;
}>;

type DialogHTMLAttributes = ExtendedHTMLAttributes<{
	/** Boolean to open state of the dialog */
	open: boolean;
}>;

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
	["accept-charset"]: string;
	autocapitalize:
		| "off"
		| "none"
		| "on"
		| "sentences"
		| "words"
		| "characters"
		| (string & {});
	autocomplete: "on" | "off" | (string & {});
	name: string;
	rel: string;
	action: string;
	enctype:
		| "application/x-www-form-urlencoded"
		| "multipart/form-data"
		| "text/plain"
		| (string & {});
	method: "get" | "post" | "dialog" | (string & {});
	novalidate: boolean;
	target: "_self" | "_blank" | "_parent" | "_top" | (string & {});
}>;

type HtmlHTMLAttributes = ExtendedHTMLAttributes<{
	xmlns: string;
}>;

type IframeHTMLAttributes = ExtendedHTMLAttributes<{
	allow: string;
	allowfullscreen: boolean;
	height: string;
	loading: "eager" | "lazy" | (string & {});
	name: string;
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
	sandbox: string;
	src: string;
	srcdoc: string;
	width: string;
}>;

type ImgHTMLAttributes = ExtendedHTMLAttributes<{
	alt: string;
	crossorigin: "anonymous" | "use-credentials" | (string & {});
	decoding: "sync" | "async" | "auto" | (string & {});
	elementtiming: string;
	fetchpriority: "high" | "low" | "auto" | (string & {});
	height: string;
	ismap: boolean;
	loading: "eager" | "lazy";
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
	sizes: string;
	src: string;
	srcset: string;
	width: string;
	usemap: string;
}>;

type InputHTMLAttributes = ExtendedHTMLAttributes<{
	accept: string;
	alt: string;
	autocapitalize: string;
	autocomplete: string;
	capture: string;
	checked: boolean;
	dirname: string;
	disabled: boolean;
	form: string;
	formaction: string;
	formenctype: string;
	formmethod: string;
	formnovalidate: boolean;
	formtarget: string;
	height: string;
	list: string;
	max: string;
	maxlength: string;
	min: string;
	minlength: string;
	multiple: boolean;
	name: string;
	pattern: string;
	placeholder: string;
	popovertarget: string;
	popovertargetaction: "hide" | "show" | "toggle";
	readonly: boolean;
	required: boolean;
	size: string;
	src: string;
	step: string;
	type:
		| "button"
		| "checkbox"
		| "color"
		| "date"
		| "datetime-local"
		| "email"
		| "file"
		| "hidden"
		| "image"
		| "month"
		| "number"
		| "password"
		| "radio"
		| "range"
		| "reset"
		| "search"
		| "submit"
		| "tel"
		| "text"
		| "time"
		| "url"
		| "week";
	value: string;
	width: string;
}>;

type InsHTMLAttributes = ExtendedHTMLAttributes<{
	cite: string;
	datetime: string;
}>;

type LabelHTMLAttributes = ExtendedHTMLAttributes<{
	for: string;
}>;

type LiHTMLAttributes = ExtendedHTMLAttributes<{
	value: string;
}>;

type LinkHTMLAttributes = ExtendedHTMLAttributes<{
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
	blocking: "render" | (string & {});
	crossorigin: "anonymous" | "use-credentials" | (string & {});
	disabled: boolean;
	fetchpriority: "high" | "low" | "auto" | (string & {});
	href: string;
	hreflang: string;
	imagesizes: string;
	imagesrcset: string;
	integrity: string;
	media: string;
	referrerpolicy:
		| "no-referrer"
		| "no-referrer-when-downgrade"
		| "origin"
		| "origin-when-cross-origin"
		| "unsafe-url"
		| (string & {});
	rel: string;
	sizes: string;
	title: string;
	type: string;
}>;

type MapHTMLAttributes = ExtendedHTMLAttributes<{
	name: string;
}>;

type MetaHTMLAttributes = ExtendedHTMLAttributes<{
	charset: "utf-8";
	content: string;
	"http-equiv":
		| "content-security-policy"
		| "content-type"
		| "default-style"
		| "x-ua-compatible"
		| "refresh"
		| (string & {});
	media: string;
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
	value: string;
	min: string;
	max: string;
	low: string;
	high: string;
	optimum: string;
	form: string;
}>;

type ObjectHTMLAttributes = ExtendedHTMLAttributes<{
	data: string;
	form: string;
	height: string;
	name: string;
	type: string;
	width: string;
}>;

type OlHTMLAttributes = ExtendedHTMLAttributes<{
	reversed: boolean;
	start: string;
	type: "a" | "A" | "i" | "I" | "1" | (string & {});
}>;

type OptgroupHTMLAttributes = ExtendedHTMLAttributes<{
	disabled: boolean;
	label: string;
}>;

type OptionHTMLAttributes = ExtendedHTMLAttributes<{
	disabled: boolean;
	label: string;
	selected: boolean;
	value: string;
}>;

type OutputHTMLAttributes = ExtendedHTMLAttributes<{
	for: string;
	form: string;
	name: string;
}>;
type ProgressHTMLAttributes = ExtendedHTMLAttributes<{
	max: string;
	value: string;
}>;

type QHTMLAttributes = ExtendedHTMLAttributes<{
	cite: string;
}>;

type ScriptHTMLAttributes = ExtendedHTMLAttributes<{
	async: boolean;
	blocking: string;
	crossorigin: "anonymous" | "use-credentials" | (string & {});
	defer: boolean;
	fetchpriority: "high" | "low" | "auto";
	integrity: string;
	nomodule: boolean;
	nonce: string;
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
	src: string;
	type: "module" | "importmap" | "speculationrules" | (string & {});
}>;

type SelectHTMLAttributes = ExtendedHTMLAttributes<{
	autocomplete: string;
	autofocus: boolean;
	disabled: boolean;
	form: string;
	multiple: boolean;
	name: string;
	required: boolean;
	size: string;
}>;

type SlotHTMLAttributes = ExtendedHTMLAttributes<{
	name: string;
}>;

type SourceHTMLAttributes = ExtendedHTMLAttributes<{
	type: string;
	src: string;
	srcset: string;
	sizes: string;
	media: string;
	height: string;
	width: string;
}>;

type StyleHTMLAttributes = ExtendedHTMLAttributes<{
	blocking: "render" | (string & {});
	media: string;
	nonce: string;
	title: string;
}>;

type TdHTMLAttributes = ExtendedHTMLAttributes<{
	colspan: string;
	headers: string;
	rowspan: string;
}>;

type TemplateHTMLAttributes = ExtendedHTMLAttributes<{
	shadowrootmode: "open" | "closed" | (string & {});
	shadowrootclonable: boolean;
	shadowrootdelegatesfocus: boolean;
	shadowrootserializable: boolean;
}>;

type TextareaHTMLAttributes = ExtendedHTMLAttributes<{
	autocomplete: "off" | "on" | (string & {});
	autocorrect: "on" | "off" | (string & {});
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
	/** Indicates how the control should wrap the value for form submission. */
	wrap: "hard" | "soft" | "off";
}>;

type ThHTMLAttributes = ExtendedHTMLAttributes<{
	abbr: string;
	colspan: string;
	headers: string;
	rowspan: string;
	scope: "row" | "col" | "rowgroup" | "colgroup" | (string & {});
}>;

type TimeHTMLAttributes = ExtendedHTMLAttributes<{
	datetime: string;
}>;

type TrackHTMLAttributes = ExtendedHTMLAttributes<{
	default: boolean;
	kind: "subtitles" | "captions" | "chapters" | "metadata" | (string & {});
	label: string;
	src: string;
	srclang: string;
}>;

type VideoHTMLAttributes = ExtendedHTMLAttributes<{
	autoplay: boolean;
	controls: boolean;
	controlslist:
		| "nodownload"
		| "nofullscreen"
		| "noremoteplayback"
		| (string & {});
	crossorigin: "anonymous" | "use-credentials" | (string & {});
	disablepictureinpicture: boolean;
	disableremoteplayback: boolean;
	height: string;
	loop: boolean;
	muted: boolean;
	playsinline: boolean;
	poster: string;
	preload: "none" | "metadata" | "auto" | (string & {});
	src: string;
	width: string;
}>;

type GlobalAttributesWithChildren = GlobalHTMLAttributes &
	Record<string, Children>;

export type Elements = Record<string, GlobalAttributesWithChildren> & {
	a: AHTMLAttributes;
	abbr: GlobalAttributesWithChildren;
	address: GlobalAttributesWithChildren;
	area: AreaHTMLAttributes;
	article: GlobalAttributesWithChildren;
	aside: GlobalAttributesWithChildren;
	audio: AudioHTMLAttributes;
	base: BaseHTMLAttributes;
	bdi: GlobalAttributesWithChildren;
	bdo: BdoHTMLAttributes;
	blockquote: BlockquoteHTMLAttributes;
	body: BodyHTMLAttributes;
	br: GlobalAttributesWithChildren;
	button: ButtonHTMLAttributes;
	canvas: CanvasHTMLAttributes;
	caption: GlobalAttributesWithChildren;
	cite: GlobalAttributesWithChildren;
	code: GlobalAttributesWithChildren;
	col: ColHTMLAttributes;
	colgroup: ColgroupHTMLAttributes;
	data: DataHTMLAttributes;
	datalist: GlobalAttributesWithChildren;
	dd: GlobalAttributesWithChildren;
	del: DelHTMLAttributes;
	details: DetailsHTMLAttributes;
	dfn: GlobalAttributesWithChildren;
	dialog: DialogHTMLAttributes;
	div: GlobalAttributesWithChildren;
	dl: GlobalAttributesWithChildren;
	dt: GlobalAttributesWithChildren;
	em: GlobalAttributesWithChildren;
	embed: EmbedHTMLAttributes;
	fieldset: FieldsetHTMLAttributes;
	figcaption: GlobalAttributesWithChildren;
	figure: GlobalAttributesWithChildren;
	footer: GlobalAttributesWithChildren;
	form: FormHTMLAttributes;
	h1: GlobalAttributesWithChildren;
	h2: GlobalAttributesWithChildren;
	h3: GlobalAttributesWithChildren;
	h4: GlobalAttributesWithChildren;
	h5: GlobalAttributesWithChildren;
	h6: GlobalAttributesWithChildren;
	head: GlobalAttributesWithChildren;
	header: GlobalAttributesWithChildren;
	hgroup: GlobalAttributesWithChildren;
	hr: GlobalAttributesWithChildren;
	html: HtmlHTMLAttributes;
	iframe: IframeHTMLAttributes;
	i: GlobalAttributesWithChildren;
	img: ImgHTMLAttributes;
	input: InputHTMLAttributes;
	ins: InsHTMLAttributes;
	kbd: GlobalAttributesWithChildren;
	label: LabelHTMLAttributes;
	legend: GlobalAttributesWithChildren;
	li: LiHTMLAttributes;
	link: LinkHTMLAttributes;
	main: GlobalAttributesWithChildren;
	map: MapHTMLAttributes;
	mark: GlobalAttributesWithChildren;
	menu: GlobalAttributesWithChildren;
	meta: MetaHTMLAttributes;
	meter: MeterHTMLAttributes;
	nav: GlobalAttributesWithChildren;
	noscript: GlobalAttributesWithChildren;
	object: ObjectHTMLAttributes;
	ol: OlHTMLAttributes;
	optgroup: OptgroupHTMLAttributes;
	option: OptionHTMLAttributes;
	output: OutputHTMLAttributes;
	p: GlobalAttributesWithChildren;
	picture: GlobalAttributesWithChildren;
	pre: GlobalAttributesWithChildren;
	progress: ProgressHTMLAttributes;
	q: QHTMLAttributes;
	rp: GlobalAttributesWithChildren;
	rt: GlobalAttributesWithChildren;
	ruby: GlobalAttributesWithChildren;
	s: GlobalAttributesWithChildren;
	samp: GlobalAttributesWithChildren;
	script: ScriptHTMLAttributes;
	search: GlobalAttributesWithChildren;
	section: GlobalAttributesWithChildren;
	select: SelectHTMLAttributes;
	slot: SlotHTMLAttributes;
	small: GlobalAttributesWithChildren;
	source: SourceHTMLAttributes;
	span: GlobalAttributesWithChildren;
	strong: GlobalAttributesWithChildren;
	style: StyleHTMLAttributes;
	sub: GlobalAttributesWithChildren;
	summary: GlobalAttributesWithChildren;
	sup: GlobalAttributesWithChildren;
	table: GlobalAttributesWithChildren;
	tbody: GlobalAttributesWithChildren;
	td: TdHTMLAttributes;
	template: TemplateHTMLAttributes;
	textarea: TextareaHTMLAttributes;
	tfoot: GlobalAttributesWithChildren;
	th: ThHTMLAttributes;
	thead: GlobalAttributesWithChildren;
	time: TimeHTMLAttributes;
	title: GlobalAttributesWithChildren;
	tr: GlobalAttributesWithChildren;
	track: TrackHTMLAttributes;
	u: GlobalAttributesWithChildren;
	ul: GlobalAttributesWithChildren;
	var: GlobalAttributesWithChildren;
	video: VideoHTMLAttributes;
	wbr: GlobalAttributesWithChildren;
};
