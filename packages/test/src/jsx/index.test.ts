import * as comp from "./index.tsx";
import { expect, test } from "vitest";

test("basic", async () => {
	expect(await comp.H1({ children: "Heading1" })).toBeTypeOf("string");
	expect(await comp.P()).toBeTypeOf("string");
});

test("async components with delay - should not waterfall", async () => {
	expect(await comp.App()).toBeTypeOf("string");
});

test("should unwrap all promises (not stringify them)", async () => {
	const html = await comp.App();
	expect(html.includes("Promise")).toBe(false);
	console.log(html);
});
