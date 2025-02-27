---
"@robino/html": minor
---

feat: stream with generator functions

```ts
import { Page } from "@robino/html";

const page = new Page();

page.body(async function* () {
	yield "<p>first</p>";
	// await...
	yield "<p>next</p>";
});

const res = page.toResponse();
```
