import * as comp from "./index.tsx";
import { stringify } from "@robino/jsx";
import { expect, test } from "vitest";

test("components should return AsyncGenerator", async () => {
	expect(await comp.H1({ children: "Heading1" })).toBeTypeOf("object");
	expect(await comp.P()).toBeTypeOf("object");
});

test("async components should not waterfall", async () => {
	expect(await comp.App()).toBeTypeOf("object");
});

test("fragment should unwrap all promises (not stringify them)", async () => {
	const html = await stringify(comp.App());
	expect(html.includes("Promise")).toBe(false);
});

test("undefined and null children should render the empty string", async () => {
	expect(await stringify(comp.UndefinedComp())).toBe("");
	expect(await stringify(comp.NullComp())).toBe("");
	expect(await stringify(comp.UndefinedNullComp())).toBe("");
});
