import { Page } from "./index.js";
import { describe, expect, test } from "vitest";

describe("toResponse", () => {
	const page = new Page()
		.body(async () => {
			await new Promise((res) => setTimeout(res, 50));
			return "delay body";
		})
		.head("head");

	const res = page.toResponse();
	test("should create Response", () => {
		expect(res).toBeInstanceOf(Response);
	});

	test("should have default content-type header", () => {
		expect(res.headers.get("content-type")).toBe("text/html; charset=utf-8");
	});

	test("verify result", async () => {
		const html = await res.text();
		expect(html).toBe(
			"<!doctype html><html><head>head</head><body>delay body</body></html>",
		);
	});
	test("custom headers", () => {
		const custom = new Page().toResponse({
			headers: { "content-type": "application/js" },
		});

		expect(custom.headers.get("content-type")).toBe("application/js");
	});

	test("custom status", () => {
		const custom = new Page().toResponse({ status: 404 });

		expect(custom.headers.get("content-type")).toBe("text/html; charset=utf-8");
		expect(custom.status).toBe(404);
	});
});

describe("toStream", () => {
	const page = new Page();
	test("should create ReadableStream", () => {
		expect(page.toStream()).toBeInstanceOf(ReadableStream);
	});
});

test("head", async () => {
	const page = new Page().head({ name: "append-head" });

	expect(await page.toString()).toBe(
		`<!doctype html><html><head><append-head></append-head></head><body></body></html>`,
	);
});

test("body", async () => {
	const page = new Page().body([{ name: "append-body" }]);

	expect(await page.toString()).toBe(
		`<!doctype html><html><head></head><body><append-body></append-body></body></html>`,
	);
});

test("multiple", async () => {
	const page = new Page();

	const html = await page
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

	const page = new Page(
		"<!doctype html><html><head></head><body><main><custom-element></custom-element></main></body></html>",
	);

	const res = page
		.inject("custom-element", "custom content")
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

	test("verify result", () => {
		expect(html).toBe(
			"<!doctype html><html><head>head</head><body><main><custom-element>custom content</custom-element></main>delay body 2delay body 1bodydelay body 3</body></html>",
		);
	});
});

test("error", () => {
	const page = new Page();

	expect(() => page.inject("title", "title").toResponse()).toThrowError();
});

describe("empty", () => {
	const page = new Page();

	test("should be empty", () => {
		expect(page.empty).toBe(true);
	});

	test("should not be empty", () => {
		page.body("not empty");
		expect(page.empty).toBe(false);
	});
});
