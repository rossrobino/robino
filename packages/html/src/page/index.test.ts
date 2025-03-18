import { Page } from "./index.js";
import { toResponse, toStream, toString } from "@robino/jsx";
import { describe, expect, test } from "vitest";

const delay = (ms: number) => {
	return new Promise((res) => setTimeout(res, ms));
};

describe("toResponse", () => {
	const page = new Page()
		.body(async () => {
			await delay(50);
			return "delay body";
		})
		.head("head");

	const res = toResponse(page.create());
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
		const custom = toResponse(new Page().create(), {
			headers: { "content-type": "application/js" },
		});

		expect(custom.headers.get("content-type")).toBe("application/js");
	});

	test("custom status", () => {
		const custom = toResponse(new Page().create(), { status: 404 });

		expect(custom.headers.get("content-type")).toBe("text/html; charset=utf-8");
		expect(custom.status).toBe(404);
	});
});

describe("toStream", () => {
	const page = new Page();
	test("should create ReadableStream", () => {
		expect(toStream(page.create())).toBeInstanceOf(ReadableStream);
	});
});

test("head", async () => {
	const page = new Page().head("<append-head></append-head>");

	expect(await toString(page.create())).toBe(
		`<!doctype html><html><head><append-head></append-head></head><body></body></html>`,
	);
});

test("body", async () => {
	const page = new Page().body(["<append-body></append-body>"]);

	expect(await toString(page.create())).toBe(
		`<!doctype html><html><head></head><body><append-body></append-body></body></html>`,
	);
});

test("multiple", async () => {
	const page = new Page();

	const html = await toString(
		page
			.body(async () => {
				await delay(50);
				return "delay body";
			})
			.body("1")
			.body("2")
			.head("head")
			.create(),
	);

	expect(html).toBe(
		"<!doctype html><html><head>head</head><body>delay body12</body></html>",
	);
});

describe("streaming", async () => {
	const start = performance.now();

	const page = new Page(
		"<!doctype html><html><head></head><body><main><custom-element></custom-element></main></body></html>",
	)
		.inject("custom-element", "custom content")
		.body(async () => {
			await delay(200);
			return "delay body 2";
		})
		.body(async () => {
			await delay(100);
			return "delay body 1";
		})
		.body("body")
		.body(async () => {
			await delay(300);
			return "delay body 3";
		})
		.head("head");

	const res = toResponse(page.create());

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

test("error", async () => {
	await expect(async () =>
		new Page().inject("title", "title").create(),
	).rejects.toThrowError();
});

describe("generator", async () => {
	const page = new Page();

	let check = false;

	page
		.body(async function* () {
			yield "starting 1 ";
			await delay(100);
			check = true;
			yield "done 1 ";
		})
		.body(async function* () {
			yield "starting 2 ";
			await delay(50);
			expect(check).toBe(false); // occurs first
			yield ['<p class="bg-blue-500">done 2</p>'];
		})
		.head(function* () {
			yield "YIELD HEAD";
			yield " RETURN HEAD";
		});

	test("parallel", async () => {
		const text = await toString(page.create());
		expect(text).toBe(
			'<!doctype html><html><head>YIELD HEAD RETURN HEAD</head><body>starting 1 done 1 starting 2 <p class="bg-blue-500">done 2</p></body></html>',
		);
	});
});
