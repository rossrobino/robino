# @robino/router

```bash
npm i @robino/router
```

A [lightweight](https://bundlephobia.com/package/@robino/router) trie data structure and HTTP router built on the Fetch API.

This project is forked and adapted from [memoirist](https://github.com/SaltyAom/memoirist) and [@medley/router](https://github.com/medleyjs/router).

## Trie

The HTTP router is built using the trie `Node` and `Route` classes. You can build your own trie based router by importing them.

```ts
import { Node, Route } from "@robino/router";

// specify the type of the store in the generic
const trie = new Node<string>();
const route = new Route("/hello/:name", "store");

trie.add(route);

const match = trie.find("/hello/world"); // { route, params: { name: "world" } }
```

## Router

```ts
import { Router } from "@robino/router";

const router = new Router();

router.get("/", (c) => new Response("Hello world"));
```

### Configuration

```ts
const router = new Router({
	// optional configuration

	// redirect trailing slash preference
	trailingSlash: "always",

	// customize the not found response
	notFound: ({ req, url }) => new Response("custom", { status: 404 }),

	// add an error handler
	error: ({ error }) => new Response(error.message, { status: 500 }),

	// state created during each request
	state: (c) => "foo",
});
```

### Add routes

- `Context` contains context for the current route
- Supports type safe `/:params` within the route pattern
- Methods return an instance of the router so they can be chained if you like
- If a `Response` is returned from a handler, `Context.res` is set to the response - the final `Context.res` is returned

```ts
router
	.get("/", () => new Response("Hello world"))
	.post("/api/:slug", (c) => {
		// context
		c.req; // Request
		c.res; // Response returned from or set in previous handler | null
		c.url; // new URL(req.url)
		c.params; // type safe params: "/api/123" => { slug: "123" }
		c.route; // the matched Route
		c.state; // whatever is returned from `config.state` ex: "foo"
	})
	// other http methods
	.on("METHOD", "/pattern", () => new Response("handler"))
	// multiple handlers/middleware
	.get(
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
// next, sveltekit...
export const GET = router.fetch;
```

```ts
// bun, cloudflare...
export default router;
```
