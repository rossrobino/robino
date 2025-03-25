import type { JSX } from "@robino/jsx";

export const H1 = (props: JSX.IntrinsicElements["h1"]) => {
	return <h1 class="bg-blue">{props.children}</h1>;
};

export const P = () => {
	return (
		<p>
			<a referrerpolicy="origin" href="/link">
				Anchor
			</a>
			<drab-prefetch prerender trigger="a[href^='/']">
				custom element
			</drab-prefetch>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="currentColor"
				class="size-5"
			>
				<path
					fill-rule="evenodd"
					d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
					clip-rule="evenodd"
				/>
			</svg>
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
