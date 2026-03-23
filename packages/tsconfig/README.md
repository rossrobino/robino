# @robino/tsconfig

```bash
npm i -D @robino/tsconfig
```

## check

```json
{ "extends": "@robino/tsconfig/check.json" }
```

Use this as the standard `tsconfig.json`.

Type-checks `src`, including `*.test.*`, without emitting files.

Also includes all top-level `*.js` and `*.ts` files in the package root.

## tsc

```json
{ "extends": "@robino/tsconfig/tsc.json" }
```

Use this in `tsconfig.build.json` when building library output with `tsc`.

Builds `src`, emits files, and excludes `*.test.*`.

Also excludes top-level `*.js` and `*.ts` files from build output.

## bundler

```json
{ "extends": "@robino/tsconfig/bundler.json" }
```

Use this in `tsconfig.build.json` when you want bundler module resolution.

Uses bundler module resolution and does not emit files.
