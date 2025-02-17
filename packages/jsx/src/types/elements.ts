// cspell: disable
import type { Children, ElementProps } from "./index.js";

// https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes
type HTMLAttributes<T extends ElementProps = ElementProps> = Partial<{
	children: Children;
	accesskey: string;
	anchor: string;
	autocapitalize:
		| "on"
		| "off"
		| "characters"
		| "words"
		| "sentences"
		| (string & {});
	autocorrect: "on" | "off" | (string & {});
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
	// https://www.w3.org/TR/wai-aria-1.1/#role_definitions
	role:
		| "alert"
		| "alertdialog"
		| "application"
		| "article"
		| "banner"
		| "button"
		| "cell"
		| "checkbox"
		| "columnheader"
		| "combobox"
		| "complementary"
		| "contentinfo"
		| "definition"
		| "dialog"
		| "directory"
		| "document"
		| "feed"
		| "figure"
		| "form"
		| "grid"
		| "gridcell"
		| "group"
		| "heading"
		| "img"
		| "link"
		| "list"
		| "listbox"
		| "listitem"
		| "log"
		| "main"
		| "marquee"
		| "math"
		| "menu"
		| "menubar"
		| "menuitem"
		| "menuitemcheckbox"
		| "menuitemradio"
		| "navigation"
		| "none"
		| "note"
		| "option"
		| "presentation"
		| "progressbar"
		| "radio"
		| "radiogroup"
		| "region"
		| "row"
		| "rowgroup"
		| "rowheader"
		| "scrollbar"
		| "search"
		| "searchbox"
		| "separator"
		| "slider"
		| "spinbutton"
		| "status"
		| "switch"
		| "tab"
		| "table"
		| "tablist"
		| "tabpanel"
		| "term"
		| "textbox"
		| "timer"
		| "toolbar"
		| "tooltip"
		| "tree"
		| "treegrid"
		| "treeitem"
		| (string & {});
	slot: string;
	spellcheck: "true" | "false";
	style: string;
	tabindex: number;
	title: string;
	translate: string;
	virtualkeyboardpolicy: string;
	writingsuggestions: boolean;
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
}> &
	ElementProps &
	Partial<T>;

// have lots of values and shared by some elements but not global
type SharedHTMLAttributes = {
	crossorigin: "anonymous" | "use-credentials" | (string & {});
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
	target: "_self" | "_blank" | "_parent" | "_top" | (string & {});
	preload: "none" | "metadata" | "auto" | (string & {});
	controlslist:
		| "nodownload"
		| "nofullscreen"
		| "noremoteplayback"
		| (string & {});
	enctype:
		| "application/x-www-form-urlencoded"
		| "multipart/form-data"
		| "text/plain"
		| (string & {});
	method: "get" | "post" | "dialog" | (string & {});
	loading: "eager" | "lazy" | (string & {});
	fetchpriority: "high" | "low" | "auto" | (string & {});
	popovertargetaction: "hide" | "show" | "toggle";
};

type AHTMLAttributes = HTMLAttributes<{
	download: string | boolean;
	href: string;
	hreflang: string;
	ping: string;
	referrerpolicy: SharedHTMLAttributes["referrerpolicy"];
	rel:
		| "alternate"
		| "author"
		| "bookmark"
		| "external"
		| "help"
		| "license"
		| "me"
		| "next"
		| "nofollow"
		| "noopener"
		| "noreferrer"
		| "opener"
		| "prev"
		| "privacy-policy"
		| "search"
		| "tag"
		| "terms-of-service"
		| (string & {});
	target: SharedHTMLAttributes["target"];
	type: string;
}>;

type AreaHTMLAttributes = HTMLAttributes<{
	alt: string;
	coords: "rect" | "circle" | "poly" | (string & {});
	download: string | boolean;
	href: string;
	ping: string;
	referrerpolicy: SharedHTMLAttributes["referrerpolicy"];
	rel: AHTMLAttributes["rel"];
	shape: "rect" | "circle" | "poly" | "default" | (string & {});
	target: SharedHTMLAttributes["target"];
}>;

type AudioHTMLAttributes = HTMLAttributes<{
	autoplay: boolean;
	controls: boolean;
	controlslist: SharedHTMLAttributes["controlslist"];
	crossorigin: SharedHTMLAttributes["crossorigin"];
	disableremoteplayback: boolean;
	loop: boolean;
	muted: boolean;
	preload: SharedHTMLAttributes["preload"];
	src: string;
}>;

type BaseHTMLAttributes = HTMLAttributes<{
	href: string;
	target: SharedHTMLAttributes["target"];
}>;

type BlockquoteHTMLAttributes = HTMLAttributes<{
	cite: string;
}>;

type BodyHTMLAttributes = HTMLAttributes<{
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

type ButtonHTMLAttributes = HTMLAttributes<{
	command: string;
	commandfor: string;
	disabled: boolean;
	form: string;
	formaction: string;
	formenctype: SharedHTMLAttributes["enctype"];
	formmethod: SharedHTMLAttributes["method"];
	formnovalidate: boolean;
	formtarget: SharedHTMLAttributes["target"];
	name: string;
	popovertarget: string;
	popovertargetaction: SharedHTMLAttributes["popovertargetaction"];
	type: "button" | "submit" | "reset" | (string & {});
	value: string;
}>;

type CanvasHTMLAttributes = HTMLAttributes<{
	height: string;
	["moz-opaque"]: boolean;
	width: string;
}>;

type ColHTMLAttributes = HTMLAttributes<{
	span: string;
}>;

type ColgroupHTMLAttributes = HTMLAttributes<{
	span: string;
}>;

type DataHTMLAttributes = HTMLAttributes<{
	value: string;
}>;

type DelHTMLAttributes = HTMLAttributes<{
	cite: string;
	datetime: string;
}>;

type DetailsHTMLAttributes = HTMLAttributes<{
	open: boolean;
	name: string;
}>;

type DialogHTMLAttributes = HTMLAttributes<{
	open: boolean;
}>;

type EmbedHTMLAttributes = HTMLAttributes<{
	height: string;
	src: string;
	type: string;
	width: string;
}>;

type FieldsetHTMLAttributes = HTMLAttributes<{
	disabled: boolean;
	form: string;
	name: string;
}>;

type FormHTMLAttributes = HTMLAttributes<{
	["accept-charset"]: string;
	autocomplete: "on" | "off" | (string & {});
	name: string;
	rel:
		| "external"
		| "help"
		| "license"
		| "next"
		| "nofollow"
		| "noopener"
		| "noreferrer"
		| "opener"
		| "prev"
		| "search";
	action: string;
	enctype: SharedHTMLAttributes["enctype"];
	method: SharedHTMLAttributes["method"];
	novalidate: boolean;
	target: SharedHTMLAttributes["target"];
}>;

type HtmlHTMLAttributes = HTMLAttributes<{
	xmlns: string;
}>;

type IframeHTMLAttributes = HTMLAttributes<{
	allow: string;
	allowfullscreen: boolean;
	height: string;
	loading: SharedHTMLAttributes["loading"];
	name: string;
	referrerpolicy: SharedHTMLAttributes["referrerpolicy"];
	sandbox: string;
	src: string;
	srcdoc: string;
	width: string;
}>;

type ImgHTMLAttributes = HTMLAttributes<{
	alt: string;
	crossorigin: SharedHTMLAttributes["crossorigin"];
	decoding: "sync" | "async" | "auto" | (string & {});
	elementtiming: string;
	fetchpriority: SharedHTMLAttributes["fetchpriority"];
	height: string;
	ismap: boolean;
	loading: SharedHTMLAttributes["loading"];
	referrerpolicy: SharedHTMLAttributes["referrerpolicy"];
	sizes: string;
	src: string;
	srcset: string;
	width: string;
	usemap: string;
}>;

type InputHTMLAttributes = HTMLAttributes<{
	accept: string;
	alt: string;
	autocomplete: string;
	capture: string;
	checked: boolean;
	dirname: string;
	disabled: boolean;
	form: string;
	formaction: string;
	formenctype: SharedHTMLAttributes["enctype"];
	formmethod: SharedHTMLAttributes["method"];
	formnovalidate: boolean;
	formtarget: SharedHTMLAttributes["target"];
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
	popovertargetaction: SharedHTMLAttributes["popovertargetaction"];
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

type InsHTMLAttributes = HTMLAttributes<{
	cite: string;
	datetime: string;
}>;

type LabelHTMLAttributes = HTMLAttributes<{
	for: string;
}>;

type LiHTMLAttributes = HTMLAttributes<{
	value: string;
}>;

type LinkHTMLAttributes = HTMLAttributes<{
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
	crossorigin: SharedHTMLAttributes["crossorigin"];
	disabled: boolean;
	fetchpriority: SharedHTMLAttributes["fetchpriority"];
	href: string;
	hreflang: string;
	imagesizes: string;
	imagesrcset: string;
	integrity: string;
	media: string;
	// not all the same options as others
	referrerpolicy:
		| "no-referrer"
		| "no-referrer-when-downgrade"
		| "origin"
		| "origin-when-cross-origin"
		| "unsafe-url"
		| (string & {});
	// not all the same options as others
	rel:
		| "alternate"
		| "author"
		| "canonical"
		| "dns-prefetch"
		| "expect"
		| "help"
		| "icon"
		| "license"
		| "manifest"
		| "me"
		| "modulepreload"
		| "next"
		| "pingback"
		| "preconnect"
		| "prefetch"
		| "preload"
		| "prerender"
		| "prev"
		| "privacy-policy"
		| "search"
		| "stylesheet"
		| "terms-of-service"
		| (string & {});
	sizes: string;
	type: string;
}>;

type MapHTMLAttributes = HTMLAttributes<{
	name: string;
}>;

type MetaHTMLAttributes = HTMLAttributes<{
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

type MeterHTMLAttributes = HTMLAttributes<{
	value: string;
	min: string;
	max: string;
	low: string;
	high: string;
	optimum: string;
	form: string;
}>;

type ObjectHTMLAttributes = HTMLAttributes<{
	data: string;
	form: string;
	height: string;
	name: string;
	type: string;
	width: string;
}>;

type OlHTMLAttributes = HTMLAttributes<{
	reversed: boolean;
	start: string;
	type: "a" | "A" | "i" | "I" | "1" | (string & {});
}>;

type OptgroupHTMLAttributes = HTMLAttributes<{
	disabled: boolean;
	label: string;
}>;

type OptionHTMLAttributes = HTMLAttributes<{
	disabled: boolean;
	label: string;
	selected: boolean;
	value: string;
}>;

type OutputHTMLAttributes = HTMLAttributes<{
	for: string;
	form: string;
	name: string;
}>;

type ProgressHTMLAttributes = HTMLAttributes<{
	max: string;
	value: string;
}>;

type QHTMLAttributes = HTMLAttributes<{
	cite: string;
}>;

type ScriptHTMLAttributes = HTMLAttributes<{
	async: boolean;
	blocking: string;
	crossorigin: SharedHTMLAttributes["crossorigin"];
	defer: boolean;
	fetchpriority: SharedHTMLAttributes["fetchpriority"];
	integrity: string;
	nomodule: boolean;
	referrerpolicy: SharedHTMLAttributes["referrerpolicy"];
	src: string;
	type: "module" | "importmap" | "speculationrules" | (string & {});
}>;

type SelectHTMLAttributes = HTMLAttributes<{
	autocomplete: string;
	disabled: boolean;
	form: string;
	multiple: boolean;
	name: string;
	required: boolean;
	size: string;
}>;

type SlotHTMLAttributes = HTMLAttributes<{
	name: string;
}>;

type SourceHTMLAttributes = HTMLAttributes<{
	type: string;
	src: string;
	srcset: string;
	sizes: string;
	media: string;
	height: string;
	width: string;
}>;

type StyleHTMLAttributes = HTMLAttributes<{
	blocking: "render" | (string & {});
	media: string;
}>;

type TdHTMLAttributes = HTMLAttributes<{
	colspan: string;
	headers: string;
	rowspan: string;
}>;

type TemplateHTMLAttributes = HTMLAttributes<{
	shadowrootmode: "open" | "closed" | (string & {});
	shadowrootclonable: boolean;
	shadowrootdelegatesfocus: boolean;
	shadowrootserializable: boolean;
}>;

type TextareaHTMLAttributes = HTMLAttributes<{
	autocomplete: "off" | "on" | (string & {});
	cols: string;
	dirname: string;
	disabled: boolean;
	form: string;
	maxlength: string;
	minlength: string;
	name: string;
	placeholder: string;
	readonly: boolean;
	required: boolean;
	rows: string;
	wrap: "hard" | "soft" | "off";
}>;

type ThHTMLAttributes = HTMLAttributes<{
	abbr: string;
	colspan: string;
	headers: string;
	rowspan: string;
	scope: "row" | "col" | "rowgroup" | "colgroup" | (string & {});
}>;

type TimeHTMLAttributes = HTMLAttributes<{
	datetime: string;
}>;

type TrackHTMLAttributes = HTMLAttributes<{
	default: boolean;
	kind: "subtitles" | "captions" | "chapters" | "metadata" | (string & {});
	label: string;
	src: string;
	srclang: string;
}>;

type VideoHTMLAttributes = HTMLAttributes<{
	autoplay: boolean;
	controls: boolean;
	controlslist: SharedHTMLAttributes["controlslist"];
	crossorigin: SharedHTMLAttributes["crossorigin"];
	disablepictureinpicture: boolean;
	disableremoteplayback: boolean;
	height: string;
	loop: boolean;
	muted: boolean;
	playsinline: boolean;
	poster: string;
	preload: SharedHTMLAttributes["preload"];
	src: string;
	width: string;
}>;

export type Elements = Record<string, HTMLAttributes> & {
	a: AHTMLAttributes;
	abbr: HTMLAttributes;
	address: HTMLAttributes;
	area: AreaHTMLAttributes;
	article: HTMLAttributes;
	aside: HTMLAttributes;
	audio: AudioHTMLAttributes;
	base: BaseHTMLAttributes;
	bdi: HTMLAttributes;
	bdo: HTMLAttributes;
	blockquote: BlockquoteHTMLAttributes;
	body: BodyHTMLAttributes;
	br: HTMLAttributes;
	button: ButtonHTMLAttributes;
	canvas: CanvasHTMLAttributes;
	caption: HTMLAttributes;
	cite: HTMLAttributes;
	code: HTMLAttributes;
	col: ColHTMLAttributes;
	colgroup: ColgroupHTMLAttributes;
	data: DataHTMLAttributes;
	datalist: HTMLAttributes;
	dd: HTMLAttributes;
	del: DelHTMLAttributes;
	details: DetailsHTMLAttributes;
	dfn: HTMLAttributes;
	dialog: DialogHTMLAttributes;
	div: HTMLAttributes;
	dl: HTMLAttributes;
	dt: HTMLAttributes;
	em: HTMLAttributes;
	embed: EmbedHTMLAttributes;
	fieldset: FieldsetHTMLAttributes;
	figcaption: HTMLAttributes;
	figure: HTMLAttributes;
	footer: HTMLAttributes;
	form: FormHTMLAttributes;
	h1: HTMLAttributes;
	h2: HTMLAttributes;
	h3: HTMLAttributes;
	h4: HTMLAttributes;
	h5: HTMLAttributes;
	h6: HTMLAttributes;
	head: HTMLAttributes;
	header: HTMLAttributes;
	hgroup: HTMLAttributes;
	hr: HTMLAttributes;
	html: HtmlHTMLAttributes;
	iframe: IframeHTMLAttributes;
	i: HTMLAttributes;
	img: ImgHTMLAttributes;
	input: InputHTMLAttributes;
	ins: InsHTMLAttributes;
	kbd: HTMLAttributes;
	label: LabelHTMLAttributes;
	legend: HTMLAttributes;
	li: LiHTMLAttributes;
	link: LinkHTMLAttributes;
	main: HTMLAttributes;
	map: MapHTMLAttributes;
	mark: HTMLAttributes;
	menu: HTMLAttributes;
	meta: MetaHTMLAttributes;
	meter: MeterHTMLAttributes;
	nav: HTMLAttributes;
	noscript: HTMLAttributes;
	object: ObjectHTMLAttributes;
	ol: OlHTMLAttributes;
	optgroup: OptgroupHTMLAttributes;
	option: OptionHTMLAttributes;
	output: OutputHTMLAttributes;
	p: HTMLAttributes;
	picture: HTMLAttributes;
	pre: HTMLAttributes;
	progress: ProgressHTMLAttributes;
	q: QHTMLAttributes;
	rp: HTMLAttributes;
	rt: HTMLAttributes;
	ruby: HTMLAttributes;
	s: HTMLAttributes;
	samp: HTMLAttributes;
	script: ScriptHTMLAttributes;
	search: HTMLAttributes;
	section: HTMLAttributes;
	select: SelectHTMLAttributes;
	slot: SlotHTMLAttributes;
	small: HTMLAttributes;
	source: SourceHTMLAttributes;
	span: HTMLAttributes;
	strong: HTMLAttributes;
	style: StyleHTMLAttributes;
	sub: HTMLAttributes;
	summary: HTMLAttributes;
	sup: HTMLAttributes;
	table: HTMLAttributes;
	tbody: HTMLAttributes;
	td: TdHTMLAttributes;
	template: TemplateHTMLAttributes;
	textarea: TextareaHTMLAttributes;
	tfoot: HTMLAttributes;
	th: ThHTMLAttributes;
	thead: HTMLAttributes;
	time: TimeHTMLAttributes;
	title: HTMLAttributes;
	tr: HTMLAttributes;
	track: TrackHTMLAttributes;
	u: HTMLAttributes;
	ul: HTMLAttributes;
	var: HTMLAttributes;
	video: VideoHTMLAttributes;
	wbr: HTMLAttributes;
};
