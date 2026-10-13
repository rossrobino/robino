import {
	type GrammarState,
	type HighlighterCore,
	hastToHtml,
} from "@shikijs/core";
import { transformerMetaHighlight } from "@shikijs/transformers";
import MarkdownIt, {
	type Env,
	type MarkdownIt as Markdown,
	type Token,
} from "markdown-it";

/** Captures the built-in pipeline so later plugin changes use a full render. */
export function snapshot(md: Markdown) {
	const pipeline = () => [
		md.render,
		md.parse,
		md.parseInline,
		md.renderer.render,
		md.renderer.renderInline,
		md.renderer.renderToken,
		md.core.process,
		md.block.parse,
		md.inline.parse,
		md.options.highlight,
		...Object.entries(md.renderer.rules).flat(),
		...md.core.ruler.getRules(""),
		...md.block.ruler.getRules(""),
		...md.inline.ruler.getRules(""),
		...md.inline.ruler2.getRules(""),
	];
	const original = pipeline();

	return () => {
		const current = pipeline();
		return (
			md.render === MarkdownIt.prototype.render &&
			md.parse === MarkdownIt.prototype.parse &&
			original.length === current.length &&
			original.every((value, i) => value === current[i])
		);
	};
}

/** Per-response state shared by the iterable and Web Stream APIs. */
export class Stream {
	#md: Markdown;
	#highlighter: HighlighterCore | undefined;
	#compatible: boolean;
	#partial: string[] = [];
	#lines: string[] = [];
	#output: string[] = [];
	#cr = false;
	#hold = false;
	#skip = 0;
	#size = 0;
	#retry = 0;
	#kind = "";
	#fence:
		| {
				token: Token;
				indent: number;
				count: number;
				state?: GrammarState | undefined;
		  }
		| undefined;
	#table:
		| {
				header: string;
				count: number;
				columns: number;
				body: boolean;
				close: Token[];
		  }
		| undefined;

	/** Creates an isolated renderer for one response. */
	constructor(
		md: Markdown,
		compatible: boolean,
		highlighter?: HighlighterCore,
	) {
		this.#md = md;
		this.#compatible = compatible;
		this.#highlighter = highlighter;
	}

	/** Consumes only new input; unfinished lines stay in pieces until complete. */
	push(chunk: string) {
		if (!this.#compatible) {
			this.#lines.push(chunk);
			return "";
		}

		let start = 0;
		for (let i = 0; i < chunk.length; i++) {
			const char = chunk[i];
			if (this.#cr) {
				this.#cr = false;
				if (char === "\n") {
					start = i + 1;
					continue;
				}
			}
			if (char !== "\r" && char !== "\n") continue;
			this.#partial.push(chunk.slice(start, i), "\n");
			this.#line(this.#partial.join("").replace(/\0/g, "\uFFFD"));
			this.#partial = [];
			this.#cr = char === "\r";
			start = i + 1;
		}
		if (start < chunk.length) this.#partial.push(chunk.slice(start));
		return this.#take();
	}

	/** Completes open containers and resolves any deferred Markdown at EOF. */
	flush() {
		if (this.#partial.length) {
			this.#line(this.#partial.join("").replace(/\0/g, "\uFFFD"));
			this.#partial = [];
		}
		this.#close();
		if (this.#lines.length) {
			const source = this.#lines.join("");
			this.#output.push(
				this.#skip
					? this.#render(this.#md.parse(source, {}).slice(this.#skip))
					: this.#md.render(source),
			);
			this.#lines = [];
		}
		return this.#take();
	}

	#take() {
		const html = this.#output.join("");
		this.#output = [];
		return html;
	}

	#render(tokens: Token[]) {
		return this.#md.renderer.render(tokens, this.#md.options, {});
	}

	#line(line: string) {
		if (this.#fence) {
			const close = line.match(/^ {0,3}(`{3,}|~{3,})[\t ]*\n?$/)?.[1];
			if (
				close &&
				close[0] === this.#fence.token.markup[0] &&
				close.length >= this.#fence.token.markup.length
			)
				this.#close();
			else this.#code(line);
			return;
		}
		if (this.#table && this.#row(line)) return;

		const blank = /^[\t ]*\n?$/.test(line);
		if (!this.#lines.length && blank) return;
		const previous = this.#lines.at(-1);
		this.#lines.push(line);
		this.#size += line.length;
		if (this.#hold) return;

		const candidate =
			/^ {0,3}(?:#{1,6}(?:[\t ]|\n|$)|`{3,}|~{3,}|>|[-*+]([\t ]|\n|$)|1[.)][\t ]|[-=][-=\t ]*\n?$|[_*][_*\t ]*\n?$|[|:-][|:\-\t ]*\n?$|<)/.test(
				line,
			);
		// Ordinary first lines cannot finish a block. Avoid parsing the same
		// paragraph once here and again at its terminating blank line.
		if (
			!previous &&
			!candidate &&
			!/^[\t ]|^\d{1,9}[.)](?:[\t ]|\n|$)/.test(line)
		) {
			this.#kind = "paragraph_open";
			return;
		}
		if (
			!previous ||
			// After a blank line, an unindented non-container line ends these
			// blocks. Probe immediately so a long list cannot delay subsequent code.
			(/^(?:bullet_list_open|ordered_list_open|blockquote_open|code_block)$/.test(
				this.#kind,
			) &&
				/^[\t ]*\n$/.test(previous) &&
				!/^\s|^>|^(?:[-+*]|\d{1,9}[.)])(?:[\t ]|\n|$)/.test(line)) ||
			((blank || candidate || /^[\t ]*\n$/.test(previous)) &&
				((blank &&
					(this.#kind === "paragraph_open" || this.#kind === "table_open")) ||
					this.#size >= this.#retry))
		)
			this.#parse(blank);
	}

	#parse(blank: boolean) {
		const env: Env = {};
		const tokens = this.#md.parse(this.#lines.join(""), env);
		// Definitions have document scope. Keep them with the remainder so both
		// forward and backward references resolve exactly as in a full render.
		if (env.references) {
			this.#hold = true;
			return;
		}
		let last = 0;
		for (let i = 0; i < tokens.length; i++) {
			if (tokens[i]?.level === 0 && tokens[i]?.map) last = i;
		}
		const token = tokens[last];
		if (!token?.map) return;
		if (last) {
			if (this.#defer(tokens.slice(0, last))) return;
			this.#output.push(this.#render(tokens.slice(0, last)));
			this.#lines = this.#lines.slice(token.map[0]);
			this.#size = this.#lines.reduce((size, line) => size + line.length, 0);
		}
		this.#kind = token.type;

		if (
			token.type === "heading_open" ||
			token.type === "hr" ||
			(blank && token.type === "paragraph_open")
		) {
			if (this.#defer(tokens.slice(last))) return;
			this.#output.push(this.#render(tokens.slice(last)));
			this.#reset();
		} else if (token.type === "fence") {
			const [opener = "", ...lines] = this.#lines;
			token.content = "";
			this.#fence = {
				token,
				indent: opener.length - opener.trimStart().length,
				count: 0,
			};
			this.#reset();
			for (const line of lines) this.#line(line);
		} else if (token.type === "table_open") {
			const header =
				tokens.findIndex(
					(token, i) => i >= last && token.type === "thead_close",
				) + 1;
			if (this.#defer(tokens.slice(last, header))) return;
			this.#output.push(this.#render(tokens.slice(last, header)));
			const lines = this.#lines;
			this.#table = {
				header: lines.slice(0, 2).join(""),
				count: header - last,
				columns: tokens
					.slice(last, header)
					.filter((token) => token.type === "th_open").length,
				body: false,
				close: tokens
					.slice(last)
					.filter((token) => token.type === "table_close"),
			};
			this.#reset();
			for (const line of lines.slice(2)) this.#line(line);
		} else {
			// Bound reparsing of long lists, quotes, raw HTML, and indented code.
			// A failed boundary probe must accumulate more input before retrying.
			this.#retry = this.#size * 2;
		}
	}

	#reset() {
		this.#lines = [];
		this.#size = 0;
		this.#retry = 0;
		this.#kind = "";
	}

	#defer(tokens: Token[]): boolean {
		// An unresolved bracket in inline text can become a reference link later.
		// Parsed links, code spans, and raw HTML can already be emitted unchanged.
		this.#hold = tokens.some(
			(token) =>
				(token.type === "text" && token.content.includes("[")) ||
				(token.children && this.#defer(token.children)),
		);
		return this.#hold;
	}

	#code(line: string) {
		const fence = this.#fence;
		if (!fence) return;
		let indent = 0;
		let i = 0;
		while (indent < fence.indent && (line[i] === " " || line[i] === "\t")) {
			indent += line[i++] === "\t" ? 4 - (indent % 4) : 1;
		}
		line = " ".repeat(Math.max(0, indent - fence.indent)) + line.slice(i);
		if (!fence.count) {
			const html = this.#render([fence.token]);
			this.#output.push(
				html.slice(0, html.indexOf(">", html.indexOf("<code")) + 1),
			);
		}
		fence.count++;
		if (!this.#highlighter) {
			this.#output.push(this.#md.utils.escapeHtml(line));
			return;
		}

		const info = this.#md.utils
			.unescapeAll(fence.token.info)
			.trim()
			.split(/(\s+)/g);
		const lang = this.#highlighter
			.getLoadedLanguages()
			.includes(info[0] || "md")
			? info[0] || "md"
			: "md";
		const highlight = transformerMetaHighlight();
		const hast = this.#highlighter.codeToHast(
			line.endsWith("\n") ? line.slice(0, -1) : line,
			{
				lang,
				theme: "css-variables",
				...(fence.state ? { grammarState: fence.state } : {}),
				meta: { __raw: info.slice(2).join("") },
				transformers: [
					{
						line(node) {
							return highlight.line?.call(this, node, fence.count);
						},
					},
				],
			},
		);
		fence.state = this.#highlighter.getLastGrammarState(hast);
		const pre = hast.children[0];
		if (pre?.type !== "element")
			throw new Error("Expected a Shiki pre element");
		const code = pre.children[0];
		if (code?.type !== "element")
			throw new Error("Expected a Shiki code element");
		this.#output.push(
			(fence.count > 1 ? "\n" : "") + hastToHtml(code.children),
		);
	}

	#row(line: string) {
		const table = this.#table;
		if (!table) return false;
		const tokens = this.#md.parse(table.header + line, {});
		if (tokens[table.count]?.type !== "tbody_open") {
			this.#close();
			return false;
		}
		const columns = line.trim().split(/(?<!\\)\|/);
		if (columns[0] === "") columns.shift();
		if (columns.at(-1) === "") columns.pop();
		// Ragged rows share markdown-it's document-wide cell completion limit.
		// Defer them together so row-by-row parsing cannot reset that limit.
		if (this.#defer(tokens) || columns.length !== table.columns) {
			this.#hold = true;
			this.#skip = table.count + (table.body ? 1 : 0);
			this.#lines = [table.header, line];
			this.#table = undefined;
			return true;
		}
		this.#output.push(
			this.#render(tokens.slice(table.count + (table.body ? 1 : 0), -2)),
		);
		table.body = true;
		table.close = tokens.slice(-2);
		return true;
	}

	#close() {
		if (this.#fence) {
			this.#output.push(
				this.#fence.count
					? "</code></pre>\n"
					: this.#render([this.#fence.token]),
			);
			this.#fence = undefined;
		}
		if (this.#table) {
			this.#output.push(this.#render(this.#table.close));
			this.#table = undefined;
		}
	}
}
