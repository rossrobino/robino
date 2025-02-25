---
"@robino/md": major
---

Breaking changes

- Renamed
  - `MarkdownProcessor` => `Processor`
  - type `MdHeading` => `Heading`
  - type `MdData` => `Result`
  - type `MarkdownProcessorOptions` => `Options`
- Adds `<div style="overflow-x: auto;">` around each table element to prevent overflow
- Skips highlighting if there are no `highlighter.langs` provided

Patch changes

- improve `getHeadings` performance
