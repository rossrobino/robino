# @robino/html

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
