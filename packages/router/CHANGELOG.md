# @robino/router

## 0.11.1

### Patch Changes

- 77a11c2: export `Context`

## 0.11.0

### Minor Changes

- 2254eeb: Removes `config.notFound`, `config.error`, and `config.base`. Merges `config.state` with `config.start`.

  All of these can now be set within `config.start` or within middleware, and `c.state` will be set to the return value of `config.start`.

## 0.10.0

### Minor Changes

- 8d163c3: add `start`

## 0.9.1

### Patch Changes

- a04e1d4: add status to c.page

## 0.9.0

### Minor Changes

- f3f6b7c: Remove enhanced headers dependency
- f3f6b7c: feat: update router to rely on `@robino/jsx` instead of `@robino/html`
- f3f6b7c: move `c.res` methods to `c`

  ```diff
  app.get("/", (c) => {
  -	c.res.text("hello");
  +	c.text("hello");
  });
  ```

### Patch Changes

- f3f6b7c: change `config.trailingSlash` from `null` to `"ignore"` for removal of the redirect
- Updated dependencies [f3f6b7c]
- Updated dependencies [f3f6b7c]
  - @robino/jsx@0.3.0

## 0.8.0

### Minor Changes

- a0cfd3f: etags strings

## 0.7.0

### Minor Changes

- d08c9c3: feat: add `c.res.etag`

## 0.6.1

### Patch Changes

- 685d095: fix: set c.res.html status correctly

## 0.6.0

### Minor Changes

- 2058d22: feat: change context to use `ResponseBuilder` and `SuperRequest`
- c3af911: feat: add inject method to `c.res.html`

### Patch Changes

- Updated dependencies [c3af911]
  - @robino/html@0.9.0

## 0.5.2

### Patch Changes

- d07e18b: fix: trailing slash mount issue

## 0.5.1

### Patch Changes

- 0fbe3be: fix: `mount` router state type conflict

## 0.5.0

### Minor Changes

- 37af66a: feat: add `mount` method to mount sub-routers
- 2137139: remove `create` helper, just use the `Middleware` type

## 0.4.0

### Minor Changes

- 0405af9: update to use middleware and a `next` function to be more composable

## 0.3.0

### Minor Changes

- 2bf5ce9: fix: stop processing handlers when a `Response` is returned

## 0.2.1

### Patch Changes

- df2d554: allow access to `state` in not found handler

## 0.2.0

### Minor Changes

- bc8055b: feat: add `Router.create` - create typed handler helper function
- 2b7296b: feat: apply handlers to multiple patterns at once with type safe parameters.

  ```ts
  router.get(["/multi/:param", "/pattern/:another"], ({ param }) => {
  	param; // { param: string } | { another: string }
  });
  ```

- 5eb28ce: breaking: rename config.state to config.start

## 0.1.2

### Patch Changes

- 66dd9b6: add git links to package.json

## 0.1.1

### Patch Changes

- d35a856: clean up/performance improvements
- 3473566: better notFound and error context types

## 0.1.0

### Minor Changes

- 062846d: trie router

## 0.0.5

### Patch Changes

- f1feeb6: trailing slash only redirect on not found

## 0.0.4

### Patch Changes

- aacbce1: export types

## 0.0.3

### Patch Changes

- 4fbe14c: fix ci

## 0.0.2

### Patch Changes

- 0116860: update notFound and error types

## 0.0.1

### Patch Changes

- 466903e: create `@robino/router` package with Fetch API based HTTP router
