---
"@robino/md": major
"@robino/prettier": patch
---

Update dependencies to their latest stable releases, including Shiki 4.5, Markdown-it 15, JS-YAML 5, and the Prettier plugins.

`@robino/md` now uses the TypeScript declarations bundled with Markdown-it and JS-YAML. Custom Markdown-it plugins must use the public exports (`MarkdownIt`, `MarkdownItOptions`, and `RendererRule`) instead of the old DefinitelyTyped declarations or internal subpath imports.

Frontmatter uses the YAML 1.2 core schema: dates remain strings, merge keys (`<<`) are not expanded, empty or comment-only input throws, and complex mapping keys are rejected. Update frontmatter and validation schemas accordingly.

Automatic links require a URL scheme by default. Call `processor.linkify.set({ fuzzyLink: true })` to restore bare-domain detection.
