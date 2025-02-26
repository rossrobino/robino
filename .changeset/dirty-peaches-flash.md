---
"@robino/router": minor
---

feat: apply handlers to multiple patterns at once with type safe parameters.

```ts
router.get(["/multi/:param", "/pattern/:another"], ({ param }) => {
	param; // { param: string } | { another: string }
});
```
