---
"@robino/router": minor
---

Removes `config.notFound`, `config.error`, and `config.base`. Merges `config.state` with `config.start`.

All of these can now be set within `config.start` or within middleware, and `c.state` will be set to the return value of `config.start`.
