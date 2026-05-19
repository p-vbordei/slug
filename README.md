# slug

URL-safe slugifier with explicit transliteration for the languages most likely to mangle naive normalization — Romanian, German, French, Polish, Czech, Turkish, Russian/Ukrainian, Greek, plus common symbols. Zero dependencies.

```ts
import { slugify } from "@p-vbordei/slug";

slugify("Mălai cu brânză și țuică");         // "malai-cu-branza-si-tuica"
slugify("Schöne Grüße aus München");         // "schoene-gruesse-aus-muenchen"
slugify("Привет мир");                       // "privet-mir"
slugify("crème brûlée");                     // "creme-brulee"
slugify("100% pure");                        // "100-percent-pure"

slugify("Hello World", { separator: "_" });          // "hello_world"
slugify("very long title", { maxLength: 10 });       // "very-long"
```

## Install

```sh
npm install @p-vbordei/slug
```

## API

### `slugify(input, opts?): string`

| Option | Type | Default | Meaning |
|---|---|---|---|
| `separator` | `string` | `"-"` | Joiner between words |
| `lower` | `boolean` | `true` | Lowercase the result |
| `strict` | `boolean` | `false` | Drop anything not ASCII alphanumeric (after transliteration) |
| `trim` | `boolean` | `true` | Strip leading/trailing separators |
| `maxLength` | `number` | — | Clip to length; doesn't leave trailing separator |
| `replacements` | `Record<string, string>` | — | Custom maps, applied before built-ins |

## Why not `slugify` on npm?

`slugify` is fine but CJS-only, untyped via default export, and its symbol substitutions are English-locked. This one is ESM, typed, has German `ß → ss` and Turkish `İ → I` done right, and is much smaller.

## License

Apache-2.0 © Vlad Bordei
