# @robino/router

```bash
npm i @robino/router
```

A [lightweight](https://bundlephobia.com/package/@robino/router) HTTP router built on the Fetch API.

This project is forked and adapted from [memoirist](https://github.com/SaltyAom/memoirist) and [@medley/router](https://github.com/medleyjs/router).

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
		c.req; // Request
		c.res; // Response returned from or set in previous handler | null
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
