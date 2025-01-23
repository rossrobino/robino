export const H1 = () => {
	return <h1 class="bg-blue">Heading 1</h1>;
};

export const P = () => {
	return (
		<p>
			paragraph <a href="/link">Anchor</a>
		</p>
	);
};

export const AsyncComp = async () => {
	await new Promise((res) => setTimeout(res, 1000));

	return <>ASYNC</>;
};

export const Comp = () => {
	return (
		<>
			<H1 />
			<P />
			<>
				hello my name is ross
				<H1 />
				<P />
			</>
		</>
	);
};
