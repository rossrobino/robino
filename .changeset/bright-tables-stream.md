---
"@robino/md": major
---

Improve server-side Markdown streaming in `stream` and `generate`.

- Emit top-level fenced code lines and table rows as they arrive in `stream` and `generate`. Syntax highlighting preserves multiline grammar state, language aliases, and highlighted line metadata. Chunks can contain open containers and must be written in order to one continuous HTML response; no client-side JavaScript is required.
- Buffer unfinished input in pieces to avoid repeatedly copying and scanning growing paragraphs and code blocks. Emit headings, setext headings, and horizontal rules when their complete lines are available.
- Fix premature boundaries in loose/nested lists, indented code, raw HTML, and comments. Handle tilde fences, split CRLF sequences, and lone carriage returns.
- Preserve reference definitions and unresolved links by buffering the remaining input when later definitions can affect rendering. Custom plugins and parser/renderer modifications use a full render at the end to preserve document context. Irregular table rows also remain buffered to respect markdown-it's cell completion limit.

### Migration

The method signatures remain `processor.stream(source)` and `processor.generate(source)`. Individual chunks can now contain open `<pre>`, `<code>`, and table containers. Write chunks in order to one continuous HTML response, or concatenate them before parsing the result. Consumers that parse each chunk as a standalone HTML fragment must update their handling. Concatenated HTML matches a full render of the same Markdown.
