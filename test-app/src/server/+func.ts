import { Page } from "@robino/html";
import { html } from "client:page";
import type { Handler } from "domco";

const delay = (ms: number) => {
	return new Promise((res) => setTimeout(res, ms));
};

export const handler: Handler = async (req) => {
	const url = new URL(req.url);

	if (url.pathname === "/") {
		const page = new Page(html);

		page
			.body(
				new Page("<readable-stream></readable-stream>")
					.inject(
						"readable-stream",
						async () => {
							await delay(1000);
							return "<p>ReadableStream</p>";
						},
						"<p>Loading ReadableStream...</p>",
					)
					.toStream(),
			)
			.head(async () => {
				await delay(4000);
				return "<title>Delayed title</title>";
			}, true)
			.body(async function* () {
				await delay(1000);
				yield "<p>first</p>";

				await delay(2000);
				yield '<p>second</p><script>console.log("hello")</script>';
			}, "loading...")
			.body("<p>not streamed</p>");

		return page.toResponse();
	}

	return new Response("Not found", { status: 404 });
};
