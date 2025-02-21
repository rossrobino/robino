# @robino/html

```bash
npm i @robino/html
```

## HTML Helpers

- `escape` - escape strings of HTML.
- `Injector` - inject strings into HTML.

## Injector

Inject tags into an HTML string.

Injector creates a `Response` stream based on the order of injections within the initial HTML provided.

### Basic

In this example, the `<head>` is sent first containing the script tag. This allows the browser to start fetching the assets for the page before the body is streamed in after the async function promise is resolved.

```ts
import { Injector } from "@robino/html";

const page = new Injector();

const res = page
	// async function
	.body(async () => {
		// await...
		// return Tags
	})
	// Tags
	.head({ name: "script", attrs: { type: "module", src: "./script.js" } })
	// creates an in order stream response
	.toResponse();
```
