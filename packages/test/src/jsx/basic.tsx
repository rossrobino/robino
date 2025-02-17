import type { Children } from "@robino/jsx";

export const App = () => {
	return (
		<div
			className="container"
			data-test="main-container"
			role="main"
			aria-labelledby="main-title"
		>
			<Div text="hello" />
			<h1 id="main-title">Main Title</h1>
			<section className="content" data-test="content-section">
				<article className="post" data-post-id="1">
					<h2>Post Title 1</h2>
					<p data-test="post-content">
						This is the content of the first post. It has several interesting
						points.
					</p>
					<footer className="post-footer">
						<a href="/post/1" rel="noopener noreferrer" target="_blank">
							Read more
						</a>
					</footer>
				</article>
				<article className="post" data-post-id="2">
					<h2>Post Title 2</h2>
					<p>
						This post contains even more exciting information than the first
						one.
					</p>
					<footer className="post-footer">
						<a href="/post/2" rel="noopener noreferrer" target="_blank">
							Continue reading
						</a>
					</footer>
					<Div text="hello" />
				</article>
			</section>
			<footer className="footer" data-test="footer" role="contentinfo">
				<p>
					Contact us: <a href="mailto:info@example.com">info@example.com</a>
				</p>
				<nav>
					<ul role="list">
						<li>
							<a href="/about">About Us</a>
						</li>
						<li>
							<a href="/terms">Terms of Service</a>
						</li>
						<li>
							<a href="/privacy">Privacy Policy</a>
						</li>
					</ul>
				</nav>
			</footer>
		</div>
	);
};

const Div = async (props: { text: string }) => {
	return (
		<div>
			{props.text}
			{false}
			{true}
			{"hi"}
		</div>
	);
};

// const Delay = async (props: { delay: number; children: Children }) => {
// 	await new Promise((res) => setTimeout(res, props.delay));

// 	return (
// 		<p>
// 			delay: {String(props.delay)}
// 			{props.children}
// 		</p>
// 	);
// };
