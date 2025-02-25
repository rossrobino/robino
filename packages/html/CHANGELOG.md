# @robino/html

## 0.6.0

### Minor Changes

- 3c8d8cb: feat: pass an optional custom `ResponseInit` into `Page.toResponse` to override the default status or headers.

  ```ts
  const page = new Page();

  // ...

  const res = page.toResponse({ status: 404 });
  ```

## 0.5.0

### Minor Changes

- ee5828c: Clean up

  - Renames `Injector` to `Page`
  - Removes `title` and `main` methods - just use `inject`, `head`, or `body`

## 0.4.2

### Patch Changes

- 4351deb: perf: use a set for void elements

## 0.4.1

### Patch Changes

- abc8cba: fix: adds all void elements to avoid closing tags that should not be closed

## 0.4.0

### Minor Changes

- 9e4c725: rename `serializeTags` to `serialize`

## 0.3.0

### Minor Changes

- f53e473: feat: adds two new methods to `Injector`

  - `toStream()` - returns a ReadableStream of strings for the page.
  - `empty` - returns `true` if there are no injections, `false` otherwise.

## 0.2.2

### Patch Changes

- df6d737: fix: TagInput should also accept Promise<Tags>

## 0.2.1

### Patch Changes

- c31ce2e: better error messaging

## 0.2.0

### Minor Changes

- 68d42e2: feat: Injector now streams in order based on resolved injections. For example, you can now send the `<head>` element of the document with all of the links for assets, and then stream in the `<body>` as it renders.

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

## 0.1.0

### Minor Changes

- ef71fa4: add `escape` function

## 0.0.5

### Patch Changes

- 4039766: serializeTags - better tree shaking

## 0.0.4

### Patch Changes

- 168ba26: fix types

## 0.0.3

### Patch Changes

- c6eb4e8: use unknown for attr types

## 0.0.2

### Patch Changes

- b9085e7: fix: exclude attributes with a value of `false`

## 0.0.1

### Patch Changes

- f245d42: init
