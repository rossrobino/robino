---
"@robino/md": major
---

feat: update to use [Standard Schema](https://github.com/standard-schema/standard-schema) instead of Zod

This enables a variety of validation libraries to be used in addition to Zod.

BREAKING - this also requires the `process` method to now be async.
