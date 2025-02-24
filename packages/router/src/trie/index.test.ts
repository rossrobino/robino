import { Node } from "./index.js";
import { expect, test } from "vitest";

const trie = new Node<string>()
	.add("/", "/")
	.add("/static/static", "/static/static")
	.add("/static/:param", "/static/:param")
	.add("/static/:param/:another", "/static/:param/:another")
	.add("/static/:param/:another/static", "/static/:param/:another/static")
	.add(
		"/static/:param/:another/static/static",
		"/static/:param/:another/static/static",
	)
	.add("/static/fork", "/static/fork")
	.add("/static/fork/:param", "/static/fork/:param")
	.add("/wild/*", "/wild/*");

test("/", () => {
	const result = trie.find("/");
	expect(result?.store).toBe("/");
	expect(result?.params).toStrictEqual({});
});

test("/static/static", () => {
	const result = trie.find("/static/static");
	expect(result?.store).toBe("/static/static");
	expect(result?.params).toStrictEqual({});
});

test("/static/:param", () => {
	const result = trie.find("/static/param");
	expect(result?.store).toBe("/static/:param");
	expect(result?.params).toStrictEqual({ param: "param" });
});

test("/static/:param/:another", () => {
	const result = trie.find("/static/param/another");
	expect(result?.store).toBe("/static/:param/:another");
	expect(result?.params).toStrictEqual({ param: "param", another: "another" });
});

test("/static/:param/:another/static", () => {
	const result = trie.find("/static/param/another/static");
	expect(result?.store).toBe("/static/:param/:another/static");
	expect(result?.params).toStrictEqual({ param: "param", another: "another" });
});

test("/static/:param/:another/static/static", () => {
	const result = trie.find("/static/param/another/static/static");
	expect(result?.store).toBe("/static/:param/:another/static/static");
	expect(result?.params).toStrictEqual({ param: "param", another: "another" });
});

test("/static/fork", () => {
	const result = trie.find("/static/fork");
	expect(result?.store).toBe("/static/fork");
	expect(result?.params).toStrictEqual({});
});

test("/static/fork/:param", () => {
	const result = trie.find("/static/fork/param");
	expect(result?.store).toBe("/static/fork/:param");
	expect(result?.params).toStrictEqual({ param: "param" });
});

test("/wild/*", () => {
	const result = trie.find("/wild/whatever");
	expect(result?.store).toBe("/wild/*");
	expect(result?.params).toStrictEqual({ "*": "whatever" });
});

test("/nope", () => {
	const result = trie.find("/nope");
	expect(result).toBe(null);
});

test("/static//static", () => {
	const result = trie.find("/static//static");
	expect(result).toBe(null); // Depending on desired behavior
});

test("Empty path", () => {
	const result = trie.find("");
	expect(result).toBe(null);
});

test("/ with trailing slash", () => {
	const result = trie.find("/static/fork/");
	expect(result).toBe(null);
});

test("/*", () => {
	trie.add("/*", "/*");
	const result = trie.find("/whatever");
	expect(result?.store).toBe("/*");
	expect(result?.params).toStrictEqual({ "*": "whatever" });
});
