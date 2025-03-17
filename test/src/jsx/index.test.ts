import * as comp from "./index.tsx";
import { toString } from "@robino/jsx";
import { expect, test } from "vitest";

test("components should return AsyncGenerator", async () => {
	expect(await comp.H1({ children: "Heading1" })).toBeTypeOf("object");
	expect(await comp.P()).toBeTypeOf("object");
});

test("async components should not waterfall", async () => {
	expect(await comp.App()).toBeTypeOf("object");
});

test("fragment should unwrap all promises (not toString them)", async () => {
	const html = await toString(comp.App());
	expect(html.includes("Promise")).toBe(false);
});

test("undefined and null children should render the empty string", async () => {
	expect(await toString(comp.UndefinedComp())).toBe("");
	expect(await toString(comp.NullComp())).toBe("");
	expect(await toString(comp.UndefinedNullComp())).toBe("");
});
