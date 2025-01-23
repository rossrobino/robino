// https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes
type GlobalHTMLAttributes = Partial<
	Record<
		| "accesskey"
		| "anchor"
		| "autocapitalize"
		| "autocorrect"
		| "autofocus"
		| "class"
		| "contenteditable"
		| `data-${string}`
		| "dir"
		| "draggable"
		| "enterkeyhint"
		| "exportparts"
		| "hidden"
		| "id"
		| "inert"
		| "inputmode"
		| "is"
		| "itemid"
		| "itemprop"
		| "itemref"
		| "itemscope"
		| "itemtype"
		| "lang"
		| "nonce"
		| "part"
		| "popover"
		| "role"
		| "slot"
		| "spellcheck"
		| "style"
		| "tabindex"
		| "title"
		| "translate"
		| "virtualkeyboardpolicy"
		| "writingsuggestions",
		string
	>
>;

type ExtendedHTMLAttributes<T extends string> = GlobalHTMLAttributes &
	Partial<Record<T, string>>;

type AnchorHTMLAttributes = ExtendedHTMLAttributes<
	| "download"
	| "href"
	| "hreflang"
	| "ping"
	| "referrerpolicy"
	| "rel"
	| "target"
	| "type"
>;

// TODO

export type Elements = Record<
	string,
	Record<string, string> & GlobalHTMLAttributes
> & { a: AnchorHTMLAttributes };
