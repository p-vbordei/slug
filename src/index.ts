const TRANSLITERATION: Record<string, string> = {
  // Romanian
  "ă": "a", "â": "a", "î": "i", "ș": "s", "ț": "t", "ş": "s", "ţ": "t",
  "Ă": "A", "Â": "A", "Î": "I", "Ș": "S", "Ț": "T", "Ş": "S", "Ţ": "T",

  // German
  "ä": "ae", "ö": "oe", "ü": "ue", "ß": "ss",
  "Ä": "Ae", "Ö": "Oe", "Ü": "Ue",

  // French / Spanish / Portuguese / Italian (those not covered by NFD strip)
  "ñ": "n", "Ñ": "N",
  "ç": "c", "Ç": "C",
  "œ": "oe", "Œ": "Oe",
  "æ": "ae", "Æ": "Ae",

  // Polish
  "ą": "a", "Ą": "A", "ć": "c", "Ć": "C", "ę": "e", "Ę": "E",
  "ł": "l", "Ł": "L", "ń": "n", "Ń": "N", "ś": "s", "Ś": "S",
  "ź": "z", "Ź": "Z", "ż": "z", "Ż": "Z",

  // Czech / Slovak
  "č": "c", "Č": "C", "ď": "d", "Ď": "D", "ě": "e", "Ě": "E",
  "ň": "n", "Ň": "N", "ř": "r", "Ř": "R", "š": "s", "Š": "S",
  "ť": "t", "Ť": "T", "ů": "u", "Ů": "U", "ý": "y", "Ý": "Y",
  "ž": "z", "Ž": "Z",

  // Turkish
  "ı": "i", "İ": "I", "ğ": "g", "Ğ": "G",

  // Nordic
  "å": "a", "Å": "A", "ø": "o", "Ø": "O",

  // Cyrillic (Russian / Ukrainian / Bulgarian)
  "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "yo",
  "ж": "zh", "з": "z", "и": "i", "й": "y", "к": "k", "л": "l", "м": "m",
  "н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t", "у": "u",
  "ф": "f", "х": "kh", "ц": "ts", "ч": "ch", "ш": "sh", "щ": "shch",
  "ъ": "", "ы": "y", "ь": "", "э": "e", "ю": "yu", "я": "ya",
  "А": "A", "Б": "B", "В": "V", "Г": "G", "Д": "D", "Е": "E", "Ё": "Yo",
  "Ж": "Zh", "З": "Z", "И": "I", "Й": "Y", "К": "K", "Л": "L", "М": "M",
  "Н": "N", "О": "O", "П": "P", "Р": "R", "С": "S", "Т": "T", "У": "U",
  "Ф": "F", "Х": "Kh", "Ц": "Ts", "Ч": "Ch", "Ш": "Sh", "Щ": "Shch",
  "Ъ": "", "Ы": "Y", "Ь": "", "Э": "E", "Ю": "Yu", "Я": "Ya",
  "і": "i", "ї": "yi", "є": "ye", "ґ": "g",
  "І": "I", "Ї": "Yi", "Є": "Ye", "Ґ": "G",

  // Greek
  "α": "a", "β": "v", "γ": "g", "δ": "d", "ε": "e", "ζ": "z", "η": "i",
  "θ": "th", "ι": "i", "κ": "k", "λ": "l", "μ": "m", "ν": "n", "ξ": "x",
  "ο": "o", "π": "p", "ρ": "r", "σ": "s", "ς": "s", "τ": "t", "υ": "y",
  "φ": "f", "χ": "ch", "ψ": "ps", "ω": "o",

  // Common symbols — padded with spaces so they break adjacent words
  "&": " and ", "%": " percent ", "+": " plus ", "@": " at ",
};

export interface SlugOptions {
  /** Word separator. Default `"-"`. */
  separator?: string;
  /** Lowercase the result. Default true. */
  lower?: boolean;
  /** Keep only `[a-zA-Z0-9]` plus separator (drops anything not ASCII). Default false. */
  strict?: boolean;
  /** Trim separators from the ends. Default true. */
  trim?: boolean;
  /** Maximum length of the result (after trimming). 0 = no limit. */
  maxLength?: number;
  /** Additional transliteration overrides, applied before built-ins. */
  replacements?: Record<string, string>;
}

/**
 * Convert a string into a URL-friendly slug.
 *
 * Pipeline:
 *  1. Apply user `replacements`, then built-in transliterations (RO, DE, FR,
 *     PL, CZ, TR, RU/UA, GR, common symbols).
 *  2. NFD decompose + strip combining diacritics (catches any remaining accents).
 *  3. Lowercase (unless `lower: false`).
 *  4. Replace non-alphanumeric runs with the separator.
 *  5. Trim separators from the ends (unless `trim: false`).
 *  6. Clip to `maxLength` if set.
 */
export function slugify(input: string, opts: SlugOptions = {}): string {
  if (typeof input !== "string") return "";

  let s = input;
  if (opts.replacements) {
    for (const [k, v] of Object.entries(opts.replacements)) {
      s = s.split(k).join(v);
    }
  }
  // Lowercase first so uppercase Greek/Cyrillic letters match the lowercase
  // transliteration map.
  if (opts.lower !== false) s = s.toLowerCase();

  // Built-in character-by-character transliteration.
  let translit = "";
  for (const ch of s) {
    translit += TRANSLITERATION[ch] ?? ch;
  }
  s = translit;
  // NFD normalize and drop combining diacritics for anything we didn't map explicitly.
  s = s.normalize("NFD").replace(/[̀-ͯ]/g, "");

  // Second pass: catches characters whose base form is in the map but whose
  // precomposed form wasn't (e.g. Greek έ → strip acute → ε → "e").
  let translit2 = "";
  for (const ch of s) {
    translit2 += TRANSLITERATION[ch] ?? ch;
  }
  s = translit2;

  const sepRaw = opts.separator ?? "-";
  const sep = sepRaw;
  const escapedSep = sep.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Keep alphanumerics; in strict mode keep only ASCII alphanumerics.
  const allowedClass = opts.strict ? "[^a-zA-Z0-9]+" : "[^\\p{L}\\p{N}]+";
  s = s.replace(new RegExp(allowedClass, "gu"), sep);

  if (opts.trim !== false) {
    s = s.replace(new RegExp(`^(?:${escapedSep})+|(?:${escapedSep})+$`, "g"), "");
  }

  if (opts.maxLength && s.length > opts.maxLength) {
    s = s.slice(0, opts.maxLength);
    // Don't cut mid-word: drop the trailing partial word if there's a separator
    // earlier in the string. Falls back to plain slice if no separator exists.
    const lastSep = s.lastIndexOf(sep);
    if (lastSep > 0) s = s.slice(0, lastSep);
    if (opts.trim !== false) {
      s = s.replace(new RegExp(`(?:${escapedSep})+$`, "g"), "");
    }
  }
  return s;
}
