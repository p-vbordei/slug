# slug

[![ci](https://github.com/p-vbordei/slug/actions/workflows/ci.yml/badge.svg)](https://github.com/p-vbordei/slug/actions/workflows/ci.yml)

[![npm](https://img.shields.io/npm/v/%40p-vbordei%2Fslug.svg)](https://www.npmjs.com/package/@p-vbordei/slug)
[![downloads](https://img.shields.io/npm/dm/%40p-vbordei%2Fslug.svg)](https://www.npmjs.com/package/@p-vbordei/slug)
[![bundle](https://img.shields.io/bundlejs/size/%40p-vbordei%2Fslug)](https://bundlejs.com/?q=%40p-vbordei%2Fslug)

> URL-safe slugifier with explicit transliteration for the languages most likely to mangle naive normalization — Romanian, German, French, Polish, Czech, Turkish, Russian/Ukrainian, Greek, plus common symbols. Zero dependencies.

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

Works with Node 20+, browsers, Bun, Deno. ESM + CJS.

## Why

Naive `text.normalize("NFD").replace(/diacritics/, "")` does the wrong thing for several common languages:

- German `ß` → just disappears (should be `ss`)
- German `ä` → `a` (should be `ae` in well-formed slugs)
- Polish `ł` → unchanged (NFD doesn't decompose it)
- Cyrillic alphabet → unchanged

`slug` ships an explicit transliteration table for 200+ characters across 9 language groups, then falls back to NFD-strip for everything else. The result: human-readable slugs even for non-ASCII input.

## Recipes

### Database-unique slug

```ts
import { slugify } from "@p-vbordei/slug";

async function uniqueSlug(title: string): Promise<string> {
  const base = slugify(title, { maxLength: 80 });
  let candidate = base;
  let n = 1;
  while (await db.exists("posts", { slug: candidate })) {
    candidate = `${base}-${++n}`;
  }
  return candidate;
}
```

### Filename-safe slug

```ts
import { slugify } from "@p-vbordei/slug";

const filename = slugify(userTitle, {
  strict: true,         // ASCII-only
  maxLength: 100,
});
fs.writeFileSync(`./uploads/${filename}.txt`, content);
```

### Preserve case for branding

```ts
import { slugify } from "@p-vbordei/slug";

slugify("Project Sandcastle", { lower: false });  // "Project-Sandcastle"
```

### Add custom replacements

```ts
import { slugify } from "@p-vbordei/slug";

slugify("C# is awesome", {
  replacements: { "#": "sharp" },
});  // "c-sharp-is-awesome"
```

### URL path component

```ts
import { slugify } from "@p-vbordei/slug";

const url = `/blog/${slugify(post.title)}-${post.id}`;
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

## Languages with explicit transliteration

| Language | Examples |
|---|---|
| Romanian | ă→a, â→a, î→i, ș→s, ț→t |
| German | ä→ae, ö→oe, ü→ue, ß→ss |
| French / Spanish / Portuguese | ç→c, ñ→n, œ→oe, æ→ae |
| Polish | ą→a, ć→c, ę→e, ł→l, ń→n, ś→s, ź→z, ż→z |
| Czech / Slovak | č→c, ď→d, ě→e, ň→n, ř→r, š→s, ť→t, ů→u, ý→y, ž→z |
| Turkish | ı→i, İ→I, ğ→g |
| Nordic | å→a, ø→o |
| Cyrillic (Russian / Ukrainian) | а→a, ж→zh, ц→ts, ш→sh, щ→shch, ю→yu, я→ya |
| Greek | α→a, β→v, γ→g, δ→d, ε→e, θ→th, χ→ch, ψ→ps |

Symbols: `&`→`and`, `%`→`percent`, `+`→`plus`, `@`→`at`.

Everything else gets NFD-decomposed and stripped of combining marks (catches accents not in the explicit table).

## Caveats

- **English-locale word substitutions** for symbols. Override via `replacements` for other languages.
- **No `ñ` → `ny`** (Spanish) — uses `ñ` → `n` to match prevailing convention; override if you need it.
- **No Chinese/Japanese/Korean transliteration** — too ambiguous to ship a default. Use a CJK-romanization library and pass results through `slugify`.

## License

Apache-2.0 © Vlad Bordei
