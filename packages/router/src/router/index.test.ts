import { Router } from "./index.js";
import { expect, test } from "vitest";

const router = new Router<string>()
	.add("/", "/")
	.add("/static/static", "/static/static")
	.add("/static/:param", "/static/:param")
	.add("/static/:param/:another", "/static/:param/:another")
	.add("/static/:param/:another/static", "/static/:param/:another/static")
	.add("/static/fork", "/static/fork")
	.add("/static/fork/:param", "/static/fork/:param")
	.add("/wild/*", "/wild/*")
	.add("/*", "/*");

test("/", () => {
	const result = router.find("/");
	expect(result?.store).toBe("/");
	expect(result?.params).toStrictEqual({});
});

test("/static/static", () => {
	const result = router.find("/static/static");
	expect(result?.store).toBe("/static/static");
	expect(result?.params).toStrictEqual({});
});

test("/static/:param", () => {
	const result = router.find("/static/param");
	expect(result?.store).toBe("/static/:param");
	expect(result?.params).toStrictEqual({ param: "param" });
});

test("/static/:param/:another", () => {
	const result = router.find("/static/param/another");
	expect(result?.store).toBe("/static/:param/:another");
	expect(result?.params).toStrictEqual({ param: "param", another: "another" });
});

test("/static/:param/:another/static", () => {
	const result = router.find("/static/param/another/static");
	expect(result?.store).toBe("/static/:param/:another/static");
	expect(result?.params).toStrictEqual({ param: "param", another: "another" });
});

test("/static/fork", () => {
	const result = router.find("/static/fork");
	expect(result?.store).toBe("/static/fork");
	expect(result?.params).toStrictEqual({});
});

test("/static/fork/:param", () => {
	const result = router.find("/static/fork/param");
	expect(result?.store).toBe("/static/fork/:param");
	expect(result?.params).toStrictEqual({ param: "param" });
});

test("/wild/*", () => {
	const result = router.find("/wild/whatever");
	expect(result?.store).toBe("/wild/*");
	expect(result?.params).toStrictEqual({ "*": "whatever" });
});

test("/*", () => {
	const result = router.find("/whatever");
	expect(result?.store).toBe("/*");
	expect(result?.params).toStrictEqual({ "*": "whatever" });
});
