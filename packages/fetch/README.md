# @robino/fetch

```bash
npm i @robino/fetch
```

Fetch API utilities

- [Router](#router)

## Router

A lightweight HTTP router built on the Fetch API.

### Routing

1. The router will first check to see if there is an exact match for route/HTTP method
   - Time complexity: `O(1)`
   - This makes the router very fast for exact matches, regardless of the number of segments in the route
2. Then the router iterates through routes with parameters (`/:param`) in the order they are added until a match is found.
   - Time complexity: `O(m * n)`, where `m` is the number of parameterized routes with the same method, and `n` is the number of segments

### Basic

```ts
import { Router } from "@robino/fetch";

const router = new Router();

router.get("/", (c) => new Response("Hello world"));
```

### Configuration

```ts
const router = new Router({
	// optional configuration

	// redirect trailing slash
	trailingSlash: "always",

	// custom not found response
	notFound: ({ req, url }) => new Response("custom", { status: 404 }),

	// error handler
	error: ({ error }) => new Response(error.message, { status: 500 }),
});
```

### Add routes

- `Context` contains helpers for the current route
- Supports type safe `/:params` within the route id
- Methods return an instance of the router so they can be chained

```ts
router
	.get("/", () => new Response("Hello world"))
	// context
	.post("/api/:slug", (c) => {
		c.req; // the web Request
		c.url; // new URL(req.url)
		c.params; // type safe params: "/api/123" => { slug: "123" }
		c.route; // route info
		// ...
	})
	// other http methods
	.on("METHOD", "/id", () => new Response("handler"));
```

### fetch

Use the `fetch` method to create a response,

```ts
const res = await router.fetch(new Request("https://example.com/"));
```

or use in an existing framework.

```ts
export const GET = router.fetch;
```
