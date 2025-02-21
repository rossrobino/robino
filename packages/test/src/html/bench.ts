// WIP
import { Page, serialize } from "@robino/html";
import { run, bench } from "mitata";

const main = async () => {
	const page = new Page(
		"<!doctype html><html><head><title></title></head><body><main><custom-element></custom-element></main></body></html>",
	);

	const res = page
		.inject("custom-element", "custom content")
		.body("body")
		.head("head")
		.toResponse();

	await res.text();
};

const serializeTags = () => {
	serialize([
		{
			name: "div",
			attrs: {
				class: "bg-black text-white",
				"data-attr": "foo",
			},
			children: {
				name: "custom-element",
				attrs: {
					foo: "bar",
					food: "bard",
				},
				children: "hello",
			},
		},
	]);
};

bench("Page", async () => await main()).gc("inner");
bench("serialize", serializeTags).gc("inner");

await run();
