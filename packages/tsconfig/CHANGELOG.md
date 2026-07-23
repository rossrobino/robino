# @robino/tsconfig

## 3.0.0

### Major Changes

- 4854cf2: Require TypeScript 7 and enable additional strict compiler checks.

## 2.0.0

### Major Changes

- 295b7b1: Upgrade to TypeScript 6
  - Upgrades to ts6
  - Erasable syntax only set to true
  - Removed `@types/node` dependency, users must add themselves now, and also in to their `types: ["node"]` array

### Minor Changes

- 400de59: Use `check.json` as your standard `tsconfig.json`.

  For builds, add a `tsconfig.build.json` that extends either `@robino/tsconfig/tsc.json` or `@robino/tsconfig/bundler.json`.

## 1.0.4

### Patch Changes

- 9b7887a: update dependencies

## 1.0.2

### Patch Changes

- 15b90e8: update dependencies

## 1.0.1

### Patch Changes

- 66dd9b6: add git links to package.json
- 0613189: update dependencies

## 1.0.0

### Major Changes

- c547a20: add ts peer dep

## 0.2.3

### Patch Changes

- ff1d57c: update dependencies

## 0.2.2

### Patch Changes

- 17d1a1e: update dependencies

## 0.2.1

### Patch Changes

- 1febc22: fix: update files in package.json

## 0.2.0

### Minor Changes

- 19027fb: Adds `bundler.json` and renames `tsconfig.json` to `tsc.json`

## 0.1.1

### Patch Changes

- 7aabe69: Add `files` to package.json

## 0.1.0

### Minor Changes

- 5cd9507: Splits `robino` into a monorepo with separate packages.
