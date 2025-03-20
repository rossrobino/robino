import type { JSX } from "@robino/jsx";
import { Router } from "@robino/router";
import { html } from "client:page";

const app = new Router({ page: html });

app.get("/", (c) =>
	c.page(
		<>
			<h2>Stream</h2>
			<p>
				<Delay ms={100} />
				<Delay ms={300} />
				<Delay ms={500} />
				<Delay ms={400} />
				<Delay ms={700} />
				<Delay ms={100} />
				<Delay ms={800} />
			</p>
		</>,
	),
);

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const Delay = async function* (props: { ms: number }) {
	await delay(props.ms);

	yield <p>{new Set([props.ms])}</p>;

	yield (
		<ul>
			<li>1</li>
			<li>2</li>
			<li>3</li>
		</ul>
	);
};

export const handler = app.fetch;
