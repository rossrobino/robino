---
"@robino/router": minor
---

move `c.res` methods to `c`

```diff
app.get("/", (c) => {
-	c.res.text("hello");
+	c.text("hello");
});
```
