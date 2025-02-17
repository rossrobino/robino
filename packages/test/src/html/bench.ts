// WIP
import { Injector, serialize } from "@robino/html";
import { run, bench } from "mitata";

const main = async () => {
	const injector = new Injector(
		"<!doctype html><html><head><title></title></head><body><main><custom-element></custom-element></main></body></html>",
	);

	const res = injector
		.inject("custom-element", "custom content")
		.main("1. main")
		.main("2. main")
		.body("body")
		.title("title")
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

bench("Injector", async () => await main()).gc("inner");
bench("serialize", serializeTags).gc("inner");

await run();
