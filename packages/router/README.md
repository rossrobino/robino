# @robino/router

```bash
npm i @robino/router
```

A [lightweight](https://bundlephobia.com/package/@robino/router) radix [trie](https://en.wikipedia.org/wiki/Radix_tree) routing library.

- [Trie](#trie) data structure
- HTTP [router](#router) built on the Fetch API.

The `Trie` is forked and adapted from [memoirist](https://github.com/SaltyAom/memoirist) and [@medley/router](https://github.com/medleyjs/router). `Router` middleware is based on [koa-compose](https://github.com/koajs/compose).

## Trie

The HTTP [router](#router) is built using these trie `Node` and `Route` classes. You can build your own trie based router by importing them.

```ts
import { Node, Route } from "@robino/router";

// specify the type of the store in the generic
const trie = new Node<string>();
const route = new Route("/hello/:name", "store");

trie.add(route);

const match = trie.find("/hello/world"); // { route, params: { name: "world" } }
```

### Prioritization

Given three routes are added in any order,

```ts
trie.add(new Route("/hello/world", "store"));
trie.add(new Route("/hello/:name", "store"));
trie.add(new Route("/hello/*", "store"));
```

The following pathnames would match the corresponding patterns.

| pathname              | Route.pattern    |
| --------------------- | ---------------- |
| `"/hello/world"`      | `"/hello/world"` |
| `"/hello/john"`       | `"/hello/:name"` |
| `"/hello/john/smith"` | `"/hello/*"`     |

More specific matches are prioritized. First, the static match is found, then the parametric, and finally the wildcard.

## Router

```ts
import { Router } from "@robino/router";

const router = new Router();

router.get("/", (c) => c.res("Hello world"));
```

### Configuration

Optional configuration when creating the router.

```ts
const router = new Router({
	// redirect trailing slash preference
	trailingSlash: "always",

	// customize the not found response
	notFound: (c) => c.res("custom", { status: 404 }),

	// add an error handler
	error: (c) => c.res(c.error.message, { status: 500 }),

	// run at the start of each request, return state to use in middleware
	start: (c) => ({ foo: "bar" }),
});
```

### Context

`Context` contains context for the current request.

```ts
router.get("/api/:id", (c) => {
	c.req; // Request
	c.url; // URL
	c.params; // type safe params: "/api/123" => { id: "123" }
	c.route; // Matched Route
	c.state; // whatever is returned from `config.start`, for example an auth helper or a key/value store
	c.res; // create a response
	c.html; // html helper
	c.json; // json helper
	c.text; // text helper
	c.page; // create a page response with elements
	c.head; // elements to inject into head
	c.layout; // add layout around the page
});
```

### Examples

#### Basic

```ts
router.get("/", (c) => c.res("Hello world"));
```

#### Param

```ts
router.post("/api/:id", (c) => {
	// matches "/api/123"
	c.param; // { id: "123" }
});
```

#### Wildcard

Add an asterisk `*` to match all remaining segments in the route.

```ts
router.get("/wild/*", () => {
	// matches "/wild/anything/..."
});
```

#### Other or custom methods

```ts
router.on("METHOD", "/pattern", () => {
	// ...
});
```

#### Middleware

Add middleware to a route, the first middleware added to the route will be called, and the `next` middleware can be called within the first by using `await next()`.

```ts
router.get(
	"/multi",
	async (c, next) => {
		// middleware
		console.log("pre"); // 1
		await next(); // calls the next middleware below
		console.log("post"); // 3
	},
	(c) => {
		console.log("final"); // 2
		c.text("hello world");
	},
);
```

`Context` is passed between between each middleware that is stored in the matched `Route`. After all the handlers have been run, the `Context` will `build` and return the final response.

#### Multiple patterns

Apply handlers to multiple patterns at once with type safe parameters.

```ts
router.get(["/multi/:param", "/pattern/:another"], (c) => {
	c.param; // { param: string } | { another: string }
});
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

### mount

Mount routers onto another with a base pattern.

```ts
const app = new Router();

const hello = new Router();

hello.get("/world", (c) => c.text("hello world"));

app.mount("/hello", hello); // "/hello/world"
```
