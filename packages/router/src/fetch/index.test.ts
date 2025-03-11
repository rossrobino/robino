import { Router } from "./index.js";
import { expect, test } from "vitest";

const router = new Router({
	trailingSlash: "always",
	start: (c) => {
		return { foo: "bar" };
	},
});

const get = (pathname: string) =>
	router.fetch(new Request("http://localhost:5173" + pathname));

test("context", () => {
	router
		.get(
			"/",
			async (c, next) => {
				expect(c.state.foo).toBe("bar");
				c.state.foo = "baz";
				c.req.headers.set("hello", "world");
				await next();
			},
			async (c) => {
				expect(c.state.foo).toBe("baz");
				expect(c.url).toBeInstanceOf(URL);
				expect(c.req).toBeInstanceOf(Request);
				expect(c.req.headers.get("hello")).toBe("world");

				c.res = new Response("hello world");
			},
		)
		.get("/api/:id/", (c) => {
			expect(c.params.id).toBeDefined();

			c.res = Response.json(c.params);
		})
		.get("/wild/*", (c) => {
			expect(c.params["*"]).toBeDefined();

			c.res = Response.json(c.params);
		});
	router.get(["/multi/:param", "/pattern/:another"], (c) => {
		if ("param" in c.params) {
			expect(c.params.param).toBeDefined();
			c.res = new Response("multi");
		} else {
			expect(c.params.another).toBeDefined();
			c.res = new Response("pattern");
		}
	});
	router.post("/post/", async (c) => {
		const formData = await c.req.formData();
		c.res = Response.json(formData.get("key"));
	});
	router.get("/error/", () => {
		throw new Error("An error occurred");
	});
});

test("GET /", async () => {
	const res = await get("/");
	const text = await res.text();

	expect(text).toBe("hello world"); // this is failing, not found
});

test("GET /api/:id/", async () => {
	const res = await get("/api/123/");
	const json = await res.json();

	expect(json.id).toBe("123");
});

test("GET /wild/*", async () => {
	const res = await get("/wild/hello");
	const json = await res.json();

	expect(json["*"]).toBe("hello");
});

test("POST /post/", async () => {
	const formData = new FormData();
	formData.append("key", "value");

	const res = await router.fetch(
		new Request("http://localhost:5173/post/", {
			method: "post",
			body: formData,
		}),
	);

	const json = await res.json();

	expect(json).toBe("value");
});

test("GET /multi/param & /pattern/another", async () => {
	const multi = await get("/multi/param");
	const mText = await multi.text();
	expect(mText).toBe("multi");

	const patt = await get("/pattern/another");
	const pText = await patt.text();
	expect(pText).toBe("pattern");
});

test("GET /not-found/", async () => {
	const res = await get("/not-found/");
	const text = await res.text();

	expect(text).toBe("Not found");
	expect(res.status).toBe(404);
});

test("GET /not-found/ (custom)", async () => {
	router.notFound = (c) => {
		return new Response(c?.url?.pathname, { status: 404 });
	};

	const res = await get("/not-found/");
	const text = await res.text();

	expect(text).toBe("/not-found/");
	expect(res.status).toBe(404);
});

test("GET /error/", async () => {
	await expect(() => get("/error/")).rejects.toThrowError();
});

test("GET /error/ (custom)", async () => {
	router.error = ({ error }) => {
		expect(error).toBeInstanceOf(Error);

		return new Response(error.message, { status: 500 });
	};

	const res = await get("/error/");
	expect(await res.text()).toBe("An error occurred");
});

test("trailing slash - always", async () => {
	const res = await get("/api/123");

	expect(res.status).toBe(308);
	expect(res.headers.get("location")).toBe("http://localhost:5173/api/123/");
});

test("trailing slash - never", async () => {
	const nev = new Router();
	nev.get("/test", (c) => {
		c.res = new Response("test");
	});

	const res = await nev.fetch(new Request("http://localhost:5173/test/"));

	expect(res.status).toBe(308);
	expect(res.headers.get("location")).toBe("http://localhost:5173/test");
});

test("trailing slash - null", async () => {
	const nul = new Router({ trailingSlash: null });
	nul.get("/nope", (c) => {
		c.res = new Response("nope");
	});
	nul.get("/yup/", (c) => {
		c.res = new Response("yup");
	});

	expect(
		(await nul.fetch(new Request("http://localhost:5173/nope"))).status,
	).toBe(200);
	expect(
		(await nul.fetch(new Request("http://localhost:5173/nope/"))).status,
	).toBe(404);

	expect(
		(await nul.fetch(new Request("http://localhost:5173/yup"))).status,
	).toBe(404);
	expect(
		(await nul.fetch(new Request("http://localhost:5173/yup/"))).status,
	).toBe(200);
});

test("mount", async () => {
	const base = new Router();
	const sub = new Router();

	sub.get("/world", (c) => {
		c.res = new Response("hello world");
	});

	base.mount("/hello", sub);

	const res = await base.fetch(
		new Request("http://localhost:5173/hello/world"),
	);

	expect(res.status).toBe(200);
	expect(await res.text()).toBe("hello world");
});
