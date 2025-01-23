import * as comp from "./index.tsx";
import { expect, test } from "vitest";

test("jsx", async () => {
	expect(comp.H1()).toBeTypeOf("string");
	expect(comp.P()).toBeTypeOf("string");
	expect(comp.Comp()).toBeTypeOf("string");
});
