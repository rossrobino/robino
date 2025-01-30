import type { Children, JSX } from "@robino/jsx";

export const H1 = (props: JSX.IntrinsicElements["h1"]) => {
	return <h1 class="bg-blue">{props.children}</h1>;
};

export const P = () => {
	return (
		<p>
			<a referrerpolicy="origin" href="/link">
				Anchor
			</a>
			<q>tests</q>
			<ul>
				<li>
					tests<H1>asdf</H1>
				</li>
				<li>hello</li>
			</ul>
		</p>
	);
};

export const Delay = async (props: { delay: number }) => {
	await new Promise((res) => setTimeout(res, props.delay));
	return <p>delay: {String(props.delay)}</p>;
};

export const App = () => {
	return (
		<p>
			<Delay delay={100} />
			<Delay delay={200} />
			<H1 children="hello"></H1>
			<p>
				<Delay delay={200} />
				<>
					fragment
					<Delay delay={100} />
					<a href="mailto:ross">text</a>
				</>
				<P text={() => "paragraph"} />
				text
			</p>
		</p>
	);
};

export const UndefinedComp = () => <>{undefined}</>;
export const NullComp = () => <>{null}</>;
export const UndefinedNullComp = () => (
	<>
		{}
		{null}
	</>
);
