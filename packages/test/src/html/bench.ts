// WIP
import { Injector } from "@robino/html";
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

bench("Injector", () => main()).gc("inner");

await run();
