---
"@robino/html": minor
---

feat: Injector now streams in order based on resolved injections. For example, you can now send the `<head>` element of the document with all of the links for assets, and then stream in the `<body>` as it renders.

```ts
import { Injector } from "@robino/html";

const page = new Injector();

page
	// async function
	.body(async () => {
		// await... ex: database request
		// return Tags
	})
	// Tags
	.head({ name: "script", attrs: { type: "module", src: "./script.js" } })
	// string
	.body("text")
	// creates an in order stream response
	.toResponse();
```

BREAKING

- `append` is now the only `method` to inject tags, significantly reducing complexity for streaming. Injection `method` no longer needs to be specified.
- `toString` is now async as it is now a wrapper around `Response.text()`.
- `comment` method has been removed.
- Fallbacks for methods like `body` and `title` are no longer present, `Injector` will throw an error if the tag is not found.
