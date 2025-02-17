import { serialize } from "./index.js";
import { describe, expect, test } from "vitest";

test("serializeTags", () => {
	const tags = serialize({
		name: "p",
		attrs: { class: "text-black", open: true, nope: false },
		children: "Paragraph",
	});

	expect(tags).toBe(`<p class="text-black" open>Paragraph</p>`);
});
