import { serializeTags, Injector } from "./index.js";
import { describe, expect, test } from "vitest";

test("serializeTags", () => {
	const tags = serializeTags({
		name: "p",
		attrs: { class: "text-black", open: true, nope: false },
		children: "Paragraph",
	});

	expect(tags).toBe(`<p class="text-black" open>Paragraph</p>`);
});

test("toResponse should create a response", () => {
	const injector = new Injector();
	expect(injector.toResponse()).toBeInstanceOf(Response);
});

test("head", async () => {
	const injector = new Injector().head({ name: "append-head" });

	expect(await injector.toString()).toBe(
		`<!doctype html><html><head><append-head></append-head></head><body></body></html>`,
	);
});

test("body", async () => {
	const injector = new Injector().body([{ name: "append-body" }]);

	expect(await injector.toString()).toBe(
		`<!doctype html><html><head></head><body><append-body></append-body></body></html>`,
	);
});

test("title", async () => {
	const injector = new Injector(
		"<!doctype html><html><head><title></title></head><body></body></html>",
	).title("title");

	expect(await injector.toString()).toBe(
		`<!doctype html><html><head><title>title</title></head><body></body></html>`,
	);
});

test("multiple", async () => {
	const injector = new Injector();

	const html = await injector
		.body(async () => {
			await new Promise((res) => setTimeout(res, 50));
			return "delay body";
		})
		.body("1")
		.body("2")
		.head("head")
		.toString();

	expect(html).toBe(
		"<!doctype html><html><head>head</head><body>delay body12</body></html>",
	);
});

describe("streaming", async () => {
	const start = performance.now();

	const injector = new Injector(
		"<!doctype html><html><head><title></title></head><body><main><custom-element></custom-element></main></body></html>",
	);

	const res = injector
		.inject("custom-element", "custom content")
		.main("1. main")
		.main("2. main")
		.body(async () => {
			await new Promise((res) => setTimeout(res, 200));
			return "delay body 2";
		})
		.body(async () => {
			await new Promise((res) => setTimeout(res, 100));
			return "delay body 1";
		})
		.body("body")
		.body(async () => {
			await new Promise((res) => setTimeout(res, 300));
			return "delay body 3";
		})
		.title("title")
		.head("head")
		.toResponse();

	const reader = res.body!.getReader();

	let html = "";
	let done = false;

	while (!done) {
		const chunk = await reader.read();
		const str = new TextDecoder().decode(chunk.value);
		html += str;
		done = chunk.done;
	}

	const total = performance.now() - start;

	test("should evaluate promises in parallel", async () => {
		expect(total).toBeLessThan(400);
	});

	test("result", () => {
		expect(html).toBe(
			"<!doctype html><html><head><title>title</title>head</head><body><main><custom-element>custom content</custom-element>1. main2. main</main>delay body 2delay body 1bodydelay body 3</body></html>",
		);
	});
});
