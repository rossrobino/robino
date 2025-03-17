# @robino/jsx

```bash
npm i @robino/jsx
```

A [tiny](https://bundlephobia.com/package/@robino/jsx) jsx to HTML import source. Write async jsx components and output a stream of HTML.

This library was written to be used for server-side templating if you don't want to add a larger UI framework. There are no JS runtime specific APIs used, so this package can be used anywhere.

> [!WARNING]
>
> `@robino/jsx` does not escape HTML.

## Configuration

Add the following values to your `tsconfig`:

```json
// tsconfig.json
{
	"jsx": "react-jsx",
	"jsxImportSource": "@robino/jsx"
}
```

## HTML Attributes

HTML attributes are of type `boolean` or `string` and are based on the [MDN HTML reference](https://developer.mozilla.org/en-US/docs/Web/HTML).

## Usage

Add props to a component.

```tsx
const Component = (props: { foo: string }) => {
	return <div>{props.foo}</div>;
};
```

Components can be asynchronous, for example you can fetch directly in a component.

```tsx
const Data = async () => {
	const res = await fetch("...");
	const data = await res.json();

	return <>{JSON.stringify(data)}</>;
};
```

jsx evaluates to an `AsyncIterable`, creating an in-order stream of components.

These two `Data` components `fetch` in parallel when this component is called, then they will stream in-order as soon as they are ready.

```tsx
const All = () => {
	return (
		<>
			<Component foo="bar" />
			<Data />
			<Data />
		</>
	);
};
```

Components can also be generators, `yield` values instead of `return`.

```tsx
async function* Gen() {
	yield "start";

	await something;

	yield <p>after</p>;
}
```

You can `return` or `yield` most data types from a component, they will be rendered

```tsx
function* DataTypes() {
	yield "string"; // "string"
	yield 1; // "1";
	yield null; // ""
	yield undefined; // ""
	yield false; // ""
	yield true; // "true"
	yield { foo: "bar" }; // '{ "foo": "bar" }'
	yield <p>jsx</p>; // "<p>jsx</p>"
	yield ["any-", "iterable", 1, null]; // "any-iterable1"
}
```
