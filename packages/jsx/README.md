# @robino/jsx

```bash
npm i @robino/jsx
```

A [tiny](https://bundlephobia.com/package/@robino/jsx) jsx to HTML import source. Write async jsx components and output HTML strings.

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

Components are asynchronous, for example you can fetch directly in a component.

```tsx
const Data = async () => {
	const res = await fetch("...");
	const data = await res.json();

	return <>{JSON.stringify(data)}</>;
};
```

All components used are evaluated using `Promise.all`.

```tsx
const All = () => {
	return (
		<>
			<Component foo="bar" />
			{/* These two Data components `fetch` in parallel when this component is called */}
			<Data />
			<Data />
		</>
	);
};
```

Call a component directly to get a string of HTML.

```tsx
const html = await All(); // string of HTML
```
