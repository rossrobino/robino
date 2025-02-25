import * as comp from "./index.tsx";
import { expect, test } from "vitest";

test("components should return strings", async () => {
	expect(await comp.H1({ children: "Heading1" })).toBeTypeOf("string");
	expect(await comp.P()).toBeTypeOf("string");
});

test("async components should not waterfall", async () => {
	expect(await comp.App()).toBeTypeOf("string");
});

test("fragment should unwrap all promises (not stringify them)", async () => {
	const html = await comp.App();
	expect(html.includes("Promise")).toBe(false);
});

test("undefined and null children should render the empty string", async () => {
	expect(await comp.UndefinedComp()).toBe("");
	expect(await comp.NullComp()).toBe("");
	expect(await comp.UndefinedNullComp()).toBe("");
});
