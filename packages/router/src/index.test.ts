import { Router } from "./index.js";
import { expect, test } from "vitest";

const router = new Router({ trailingSlash: "always" });

test("context", () => {
	router
		.get("/", (c) => {
			expect(c.url).toBeInstanceOf(URL);
			expect(c.req).toBeInstanceOf(Request);
			expect(c.route.handler).toBeTypeOf("function");
			expect(c.route.pattern).toBeInstanceOf(RegExp);

			return new Response("hello world");
		})
		.get("/api/:id/", ({ params }) => {
			expect(params.id).toBeDefined();

			return Response.json(params);
		});
});

test("GET /", async () => {
	const res = await router.fetch(new Request("http://localhost:5173/"));
	const text = await res.text();

	expect(text).toBe("hello world");
});

test("GET /api/:id/", async () => {
	const res = await router.fetch(new Request("http://localhost:5173/api/123/"));
	const json = await res.json();

	expect(json.id).toBe("123");
});

test("POST /post/", async () => {
	router.post("/post/", async ({ req }) => {
		const formData = await req.formData();
		return Response.json(formData.get("key"));
	});

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

test("GET /not-found/", async () => {
	const res = await router.fetch(
		new Request("http://localhost:5173/not-found/"),
	);
	const text = await res.text();

	expect(text).toBe("Not found");
	expect(res.status).toBe(404);
});

test("GET /not-found/ (custom)", async () => {
	router.notFound = (c) => {
		return new Response(c?.url?.pathname, { status: 404 });
	};

	const res = await router.fetch(
		new Request("http://localhost:5173/not-found/"),
	);
	const text = await res.text();

	expect(text).toBe("/not-found/");
	expect(res.status).toBe(404);
});

test("GET /error/", async () => {
	router.get("/error/", () => {
		throw new Error("An error occurred");
	});

	await expect(() =>
		router.fetch(new Request("http://localhost:5173/error/")),
	).rejects.toThrowError();
});

test("GET /error/ (custom)", async () => {
	router.error = ({ error }) => {
		expect(error).toBeInstanceOf(Error);

		return new Response(error.message, { status: 500 });
	};

	const res = await router.fetch(new Request("http://localhost:5173/error/"));

	expect(await res.text()).toBe("An error occurred");
});

test("trailing slash - always", async () => {
	const res = await router.fetch(new Request("http://localhost:5173/api/123"));

	expect(res.status).toBe(308);
	expect(res.headers.get("location")).toBe("http://localhost:5173/api/123/");
});

test("trailing slash - never", async () => {
	const nev = new Router();
	nev.get("/test", () => new Response("test"));

	const res = await nev.fetch(new Request("http://localhost:5173/test/"));

	expect(res.status).toBe(308);
	expect(res.headers.get("location")).toBe("http://localhost:5173/test");
});

test("trailing slash - null", async () => {
	const nul = new Router({ trailingSlash: null });
	nul.get("/nope", () => new Response("nope"));
	nul.get("/yup/", () => new Response("yup"));

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
