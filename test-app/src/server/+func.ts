import { Page } from "@robino/html";
import { Router } from "@robino/router";
import { html } from "client:page";
import { OpenAI } from "openai";

const app = new Router({
	start() {
		return { page: new Page(html) };
	},
});

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

app.get("/", (c) => {
	return c.state.page
		.body(
			new Page("<readable-stream></readable-stream>")
				.inject("readable-stream", async () => {
					await delay(1000);
					return "<p>ReadableStream</p>";
				})
				.toStream(),
			"<p>Loading ReadableStream...</p>",
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
		.body("<p>not streamed</p>")
		.toResponse();
});

const openai = new OpenAI({
	apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});

app.get("/chat", async (c) => {
	const stream = await openai.chat.completions.create({
		messages: [{ role: "user", content: "hello write a few sentences" }],
		model: "gpt-4o-mini",
		stream: true,
	});

	const textStream = new ReadableStream<string>({
		async start(c) {
			for await (const chunk of stream)
				c.enqueue(chunk.choices[0]?.delta.content ?? "");
			c.close();
		},
	});

	return c.state.page.body(textStream).toResponse();
});

export const handler = app.fetch;
