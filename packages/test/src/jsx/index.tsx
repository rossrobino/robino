import type { FC } from "@robino/jsx";

export const H1: FC = ({ children }) => {
	return <h1 class="bg-blue">{children}</h1>;
};

export const P: FC<{ text: () => string }> = async ({ text }) => {
	return (
		<p>
			{text()} <a href="/link">Anchor</a>
		</p>
	);
};

export const Delay = async (props: { delay: number }) => {
	await new Promise((res) => setTimeout(res, props.delay));
	return <p>delay: {props.delay}</p>;
};

export const App = () => {
	return (
		<p>
			<Delay delay={100} />
			<Delay delay={150} />
			<Delay delay={200} />
			<H1>Heading 1</H1>
			<p>
				<Delay delay={200} />
				<>
					my name is ross
					<Delay delay={100} />
					<a href="mailto:ross">hello</a>
				</>
				<P text={() => "paragraph"} />
				hello
			</p>
		</p>
	);
};
