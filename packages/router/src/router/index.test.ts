import { Router } from "./index.js";
import { expect, test } from "vitest";

const router = new Router<string>()
	.add("/", "/")
	.add("/hello/world", "/hello/world")
	.add("/hello/:slug", "/hello/:slug")
	.add("/hello/:slug/:another", "/hello/:slug/:another")
	.add("/api/posts/:slug/test", "/api/posts/:slug/test")
	.add("/api/movies/:slug/test", "/api/movies/:slug/test")
	.add("/api/*", "/api/*")
	.add("/*", "/*");

test("/", () => {
	const result = router.find("/");
	expect(result?.store).toBe("/");
	expect(result?.params).toStrictEqual({});
});

test("/hello/world", () => {
	const result = router.find("/hello/world");
	expect(result?.store).toBe("/hello/world");
	expect(result?.params).toStrictEqual({});
});

test("/hello/:slug", () => {
	const result = router.find("/hello/slug");
	expect(result?.store).toBe("/hello/:slug");
	expect(result?.params).toStrictEqual({ slug: "slug" });
});

test("/hello/:slug/:another", () => {
	const result = router.find("/hello/slug/another");
	expect(result?.store).toBe("/hello/:slug/:another");
	expect(result?.params).toStrictEqual({ slug: "slug", another: "another" });
});

test("/api/posts/:slug/test", () => {
	const result = router.find("/api/posts/my-post/test");
	expect(result?.store).toBe("/api/posts/:slug/test");
	expect(result?.params).toStrictEqual({ slug: "my-post" });
});

test("/api/movies/:slug/test", () => {
	const result = router.find("/api/movies/batman/test");
	expect(result?.store).toBe("/api/movies/:slug/test");
	expect(result?.params).toStrictEqual({ slug: "batman" });
});

test("/api/*", () => {
	const result = router.find("/api/wild/card");
	expect(result?.store).toBe("/api/*");
	expect(result?.params).toStrictEqual({ "*": "wild/card" });
});

test("/*", () => {
	const result = router.find("/whatever");
	expect(result?.store).toBe("/*");
	expect(result?.params).toStrictEqual({ "*": "whatever" });
});
