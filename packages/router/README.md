# @robino/router

```bash
npm i @robino/router
```

A lightweight HTTP router built on the Fetch API.

## Routing

- A regular expression is created for each route based on the pattern provided.
- Upon request, the router iterates through routes within the method in the order they were added until a match is found.
- Performance
  - Aims to strike a balance between startup and run time.
  - `Router.fetch` time complexity: `O(n)`, where `n` is the number of routes with the same method.
- Parameters
  - Supports type safe parameters starting with `:`.

## Basic

```ts
import { Router } from "@robino/router";

const router = new Router();

router.get("/", (c) => new Response("Hello world"));
```

## Configuration

```ts
const router = new Router({
	// optional configuration

	// redirect trailing slash preference
	trailingSlash: "always",

	// customize the not found response
	notFound: ({ req, url }) => new Response("custom", { status: 404 }),

	// add an error handler
	error: ({ error }) => new Response(error.message, { status: 500 }),
});
```

## Add routes

- `Context` contains helpers for the current route
- Supports type safe `/:params` within the route pattern
- Methods return an instance of the router so they can be chained

```ts
router
	.get("/", () => new Response("Hello world"))
	.post("/api/:slug", (c) => {
		// context
		c.req; // the web Request
		c.url; // new URL(req.url)
		c.params; // type safe params: "/api/123" => { slug: "123" }
		c.route; // the matched Route
	})
	// other http methods
	.on("METHOD", "/pattern", () => new Response("handler"));
```

## fetch

Use the `fetch` method to create a response,

```ts
const res = await router.fetch(new Request("https://example.com/"));
```

or use in an existing framework.

```ts
export const GET = router.fetch;
```
