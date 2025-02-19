import { Router } from "@robino/fetch";
import { Hono } from "hono";
import { run, bench, boxplot } from "mitata";

let router = new Router();
let hono = new Hono();

boxplot(() => {
	bench("init", () => {
		router = new Router({ trailingSlash: null });
	}).gc("inner");
	bench("hono - init", () => {
		hono = new Hono();
	}).gc("inner");
});

boxplot(() => {
	bench("set routes", () => {
		router.get("/", () => new Response("hello world"));
		router.get("/foo/bar/baz", (c) => new Response(c.url.pathname));
		router.get("/food/bard/bad", (c) => Response.json(c.req.url));
		router.post("/api/data", async (c) => {
			const body = await c.req.json();
			return Response.json(body);
		});
		router.get("/api/:id", (c) => Response.json(c.params));
		router.get("/api/:id/route", (c) => Response.json(c.route.id));
		router.on("PUT", "/api/update/:id", (c) => {
			return new Response(`Updated ${c.params.id}`);
		});
		router.on("DELETE", "/api/remove/:id", (c) => {
			return new Response(`Deleted ${c.params.id}`);
		});
		router.get("/users/:userId/books/:bookId", (c) => {
			return Response.json({ user: c.params.userId, book: c.params.bookId });
		});
		router.get("/search", (c) => {
			const query = c.url.searchParams.get("query") || "none";
			return new Response(`Query: ${query}`);
		});
	}).gc("inner");

	bench("hono - set routes", () => {
		hono.get("/", () => new Response("hello world"));
		hono.get("/foo/bar/baz", (c) => new Response(c.req.path));
		hono.get("/food/bard/bad", (c) => Response.json(c.req.url));
		hono.post("/api/data", async (c) => {
			const body = await c.req.json();
			return Response.json(body);
		});
		hono.get("/api/:id", (c) => Response.json(c.req.param()));
		hono.get("/api/:id/route", (c) => Response.json(c.req.routePath));
		hono.put("/api/update/:id", (c) => {
			return new Response(`Updated ${c.req.param("id")}`);
		});
		hono.delete("/api/remove/:id", (c) => {
			return new Response(`Deleted ${c.req.param("id")}`);
		});
		hono.get("/users/:userId/books/:bookId", (c) => {
			return Response.json({
				user: c.req.param("userId"),
				book: c.req.param("bookId"),
			});
		});
		hono.get("/search", (c) => {
			const query = c.req.query("query") || "none";
			return new Response(`Query: ${query}`);
		});
	}).gc("inner");
});

boxplot(() => {
	bench("GET /", () => router.fetch(new Request("http://localhost:5173/"))).gc(
		"inner",
	);
	bench("hono - GET /", () =>
		hono.fetch(new Request("http://localhost:5173/")),
	).gc("inner");
});

boxplot(() => {
	bench("GET /api/123", () =>
		router.fetch(new Request("http://localhost:5173/api/123")),
	).gc("inner");
	bench("hono - GET /api/123", () =>
		hono.fetch(new Request("http://localhost:5173/api/123")),
	).gc("inner");
});

boxplot(() => {
	bench("GET /foo/bar/baz", () =>
		router.fetch(new Request("http://localhost:5173/foo/bar/baz")),
	).gc("inner");
	bench("hono - GET /foo/bar/baz", () =>
		hono.fetch(new Request("http://localhost:5173/foo/bar/baz")),
	).gc("inner");
});

boxplot(() => {
	bench("GET api/123/route", () =>
		router.fetch(new Request("http://localhost:5173/api/123/route")),
	).gc("inner");
	bench("hono - GET api/123/route", () =>
		hono.fetch(new Request("http://localhost:5173/api/123/route")),
	).gc("inner");
});

boxplot(() => {
	bench("GET /food/bard/bad", () =>
		router.fetch(new Request("http://localhost:5173/food/bard/bad")),
	).gc("inner");
	bench("hono - GET /food/bard/bad", () =>
		hono.fetch(new Request("http://localhost:5173/food/bard/bad")),
	).gc("inner");
});

boxplot(() => {
	bench("POST /api/data", async () =>
		router.fetch(
			new Request("http://localhost:5173/api/data", {
				method: "POST",
				body: JSON.stringify({ key: "value" }),
			}),
		),
	).gc("inner");
	bench("hono - POST /api/data", async () =>
		hono.fetch(
			new Request("http://localhost:5173/api/data", {
				method: "POST",
				body: JSON.stringify({ key: "value" }),
			}),
		),
	).gc("inner");
});

boxplot(() => {
	bench("PUT /api/update/123", () =>
		router.fetch(
			new Request("http://localhost:5173/api/update/123", { method: "PUT" }),
		),
	).gc("inner");
	bench("hono - PUT /api/update/123", () =>
		hono.fetch(
			new Request("http://localhost:5173/api/update/123", { method: "PUT" }),
		),
	).gc("inner");
});

boxplot(() => {
	bench("DELETE /api/remove/123", () =>
		router.fetch(
			new Request("http://localhost:5173/api/remove/123", { method: "DELETE" }),
		),
	).gc("inner");
	bench("hono - DELETE /api/remove/123", () =>
		hono.fetch(
			new Request("http://localhost:5173/api/remove/123", { method: "DELETE" }),
		),
	).gc("inner");
});

boxplot(() => {
	bench("GET /users/1/books/101", () =>
		router.fetch(new Request("http://localhost:5173/users/1/books/101")),
	).gc("inner");
	bench("hono - GET /users/1/books/101", () =>
		hono.fetch(new Request("http://localhost:5173/users/1/books/101")),
	).gc("inner");
});

boxplot(() => {
	bench("GET /search", () =>
		router.fetch(new Request("http://localhost:5173/search?query=test")),
	).gc("inner");
	bench("hono - GET /search", () =>
		hono.fetch(new Request("http://localhost:5173/search?query=test")),
	).gc("inner");
});

await run();
