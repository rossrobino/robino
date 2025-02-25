---
"@robino/html": minor
---

feat: pass an optional custom `ResponseInit` into `Page.toResponse` to override the default status or headers.

```ts
const page = new Page();

// ...

const res = page.toResponse({ status: 404 });
```
