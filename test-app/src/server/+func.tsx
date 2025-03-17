import { Router } from "@robino/router";
import { html } from "client:page";

const app = new Router({ html });

app.get("/", (c) => {
	c.res.html((p) =>
		p.body(
			<p>
				<Delay ms={100} />
				<Delay ms={600} />
				<Delay ms={500} />
				<Delay ms={600} />
				<Delay ms={700} />
				<Delay ms={100} />
			</p>,
		),
	);
});

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const Delay = async function* (props: { ms: number }) {
	await delay(props.ms);

	yield new Set([props.ms]);

	yield async () => {
		return "hello";
	};

	yield (
		<ul>
			<li className="hello">1</li>
			<li>2</li>
			<li>3</li>
		</ul>
	);
};

export const handler = app.fetch;
