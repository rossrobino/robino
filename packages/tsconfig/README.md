# @robino/tsconfig

```bash
npm i -D @robino/tsconfig
```

[Total TS Reference](https://www.totaltypescript.com/tsconfig-cheat-sheet)

- Sets source dir to `src` and out dir to `dist`
- Assumes you know your runtime, includes `@types/node` as a dependency, and sets `lib` to include DOM types.

## default

```json
{
	"extends": "@robino/tsconfig/tsconfig.json"
}
```

## bundler

```json
{
	"extends": "@robino/tsconfig/tsconfig.json",
	"compilerOptions": {
		"moduleResolution": "Bundler",
		"module": "Preserve",
		"noEmit": true
	}
}
```
