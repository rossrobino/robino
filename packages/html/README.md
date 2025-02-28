# @robino/html

```bash
npm i @robino/html
```

## HTML Helpers

- `Page` - stream the creation of an HTML page

## Page

Inject tags into an HTML string.

`Page` creates a `Response` stream based on the order of injections within the initial HTML provided.

Each injection will be appended to the target element.

In this example, the `<head>` is sent first containing the script tag. This allows the browser to start fetching the assets for the page before the body is streamed in after the async function promise is resolved.

```ts
import { Page } from "@robino/html";

const page = new Page();

page
	// text
	.head("<title>Title</title>")
	// async function
	.body(async () => {
		// await...
		// this is streamed in after the head is sent
		// return Tags
	})
	// Tag or array of Tags
	.head({ name: "script", attrs: { type: "module", src: "./script.js" } })
	// other tags (need to be present in the initial HTML)
	.inject("some-other-tag", "tags")
	// generators
	.body(async function* () {
		yield "<p>first</p>";
		// await...
		yield "<p>next</p>";
	})
	// streams
	.body(new ReadableStream<string>());
```

The Injections will be sorted and resolved concurrently upon calling one of the following methods.

```ts
const res = page.toResponse(); // creates an in order stream response
const stream = page.toStream(); // just the stream
const text = await page.toString(); // res.text() (only use if you have to)
```
