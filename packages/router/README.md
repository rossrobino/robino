# @robino/router

```bash
npm i @robino/router
```

A [lightweight](https://bundlephobia.com/package/@robino/router) radix trie [data structure](https://en.wikipedia.org/wiki/Radix_tree) and HTTP router built on the Fetch API.

This project is forked and adapted from [memoirist](https://github.com/SaltyAom/memoirist) and [@medley/router](https://github.com/medleyjs/router).

## Trie

The HTTP [`Router`](#router) is built using the trie `Node` and `Route` classes. You can build your own trie based router by importing them.

```ts
import { Node, Route } from "@robino/router";

// specify the type of the store in the generic
const trie = new Node<string>();
const route = new Route("/hello/:name", "store");

trie.add(route);

const match = trie.find("/hello/world"); // { route, params: { name: "world" } }
```

## Router

Straightforward HTTP routing.

```ts
import { Router } from "@robino/router";

const router = new Router();

router.get("/", (c) => new Response("Hello world"));
```

### Configuration

Optional configuration when creating the router.

```ts
const router = new Router({
	// redirect trailing slash preference
	trailingSlash: "always",

	// customize the not found response
	notFound: ({ req, url }) => new Response("custom", { status: 404 }),

	// add an error handler
	error: ({ error }) => new Response(error.message, { status: 500 }),

	// state created during each request
	state: (c) => ({ foo: "bar" }),
});
```

### Context

`Context` contains context for the current route. `Router` doesn't provide many helpers in favor of using standard APIs or creating your own `state`. For example, there is no `c.redirect` you can just use [`Response.redirect`](https://developer.mozilla.org/en-US/docs/Web/API/Response/redirect_static).

```ts
router.get("/api/:id", (c) => {
	c.req; // Request
	c.res; // Response returned from or set in previous handler | null
	c.url; // new URL(req.url)
	c.params; // type safe params: "/api/123" => { id: "123" }
	c.route; // Matched Route
	c.state; // whatever is returned from `config.state`, for example use for an auth helper or a key/value store
});
```

### Routing

#### Prioritization

Given three routes are added in any order,

```ts
router.get("/hello/world", ...);
router.get("/hello/:name", ...);
router.get("/hello/*", ...);
```

The following pathnames would match the corresponding patterns.

| pathname              | Route.pattern    |
| --------------------- | ---------------- |
| `"/hello/world"`      | `"/hello/world"` |
| `"/hello/john"`       | `"/hello/:name"` |
| `"/hello/john/smith"` | `"/hello/*"`     |

First, the static match is found, then the parametric, and finally the wildcard.

#### Examples

##### Basic

```ts
router.get("/", () => new Response("Hello world"));
```

##### Param

```ts
router.post("/api/:id", (c) => {
	// matches "/api/123"
	c.param; // { id: "123" }
});
```

##### Wildcard

Add an asterisk `*` to match all remaining segments in the route.

```ts
router.get("/wild/*", () => {
	// matches "/wild/anything/..."
});
```

##### Other or custom methods

```ts
router.on("METHOD", "/pattern", () => new Response("handler"));
```

##### Multiple handlers or middleware

While not as composable as router that use a `next` hook, the processing of the handlers for each route is very straightforward.

Add multiple handlers or middleware to a route, they will be processed in order. When a `Response` is returned from a handler, it will be assigned to `Context.res`. The final `Context.res` will be returned as the response for the route.

```ts
router.get(
	"/multi",
	() => {
		console.log("pre middleware");
	},
	() => new Response("handler"),
	({ res }) => {
		res.headers.set("post", "middleware");
	},
);
```

### fetch

Use the `fetch` method to create a response,

```ts
const res = await router.fetch(new Request("https://example.com/"));
```

or use in an existing framework.

```ts
// next, sveltekit, astro...
export const GET = router.fetch;
```

```ts
// bun, deno, cloudflare...
export default router;
```
