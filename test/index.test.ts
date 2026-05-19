import { describe, it, expect } from "vitest";
import { slugify } from "../src/index.js";

describe("basic", () => {
  it("lowercases and dashes spaces", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });
  it("collapses runs of non-alphanumerics", () => {
    expect(slugify("hello   world!!! foo")).toBe("hello-world-foo");
  });
  it("trims ends", () => {
    expect(slugify(" ---hello---world--- ")).toBe("hello-world");
  });
  it("custom separator", () => {
    expect(slugify("hello world", { separator: "_" })).toBe("hello_world");
  });
  it("lower: false preserves case", () => {
    expect(slugify("Hello World", { lower: false })).toBe("Hello-World");
  });
});

describe("transliteration", () => {
  it("Romanian", () => {
    expect(slugify("Mălai cu brânză și țuică")).toBe("malai-cu-branza-si-tuica");
  });
  it("German umlauts", () => {
    expect(slugify("Schöne Grüße aus München")).toBe("schoene-gruesse-aus-muenchen");
  });
  it("German ß", () => {
    expect(slugify("Straße")).toBe("strasse");
  });
  it("French", () => {
    expect(slugify("crème brûlée")).toBe("creme-brulee");
  });
  it("Polish", () => {
    expect(slugify("Zażółć gęślą jaźń")).toBe("zazolc-gesla-jazn");
  });
  it("Czech", () => {
    expect(slugify("příliš žluťoučký kůň")).toBe("prilis-zlutoucky-kun");
  });
  it("Turkish", () => {
    expect(slugify("İstanbul")).toBe("istanbul");
  });
  it("Russian", () => {
    expect(slugify("Привет мир")).toBe("privet-mir");
  });
  it("Greek", () => {
    expect(slugify("Καλημέρα κόσμε")).toBe("kalimera-kosme");
  });
});

describe("symbols", () => {
  it("substitutes &, %, +, @", () => {
    expect(slugify("A & B")).toBe("a-and-b");
    expect(slugify("100% pure")).toBe("100-percent-pure");
    expect(slugify("foo + bar")).toBe("foo-plus-bar");
    expect(slugify("ask @ help")).toBe("ask-at-help");
  });
});

describe("strict mode", () => {
  it("drops non-ASCII alphanumerics", () => {
    expect(slugify("Café São Paulo", { strict: true })).toBe("cafe-sao-paulo");
  });
  it("drops emoji", () => {
    expect(slugify("hello 🎉 world", { strict: true })).toBe("hello-world");
  });
  it("non-strict keeps emoji-free unicode letters", () => {
    expect(slugify("ñoño", { strict: false })).toBe("nono"); // ñ → n via translit
  });
});

describe("maxLength", () => {
  it("clips to maxLength", () => {
    expect(slugify("a very long title with many words", { maxLength: 15 })).toBe("a-very-long");
  });
  it("does not leave trailing separator after clip", () => {
    expect(slugify("hello world foo", { maxLength: 6 })).toBe("hello");
  });
});

describe("custom replacements", () => {
  it("applied before built-in translit", () => {
    expect(slugify("a@b", { replacements: { "@": " over " } })).toBe("a-over-b");
  });
});

describe("edge cases", () => {
  it("empty input → empty string", () => {
    expect(slugify("")).toBe("");
  });
  it("only symbols → empty string", () => {
    expect(slugify("!!!!---")).toBe("");
  });
  it("non-string input → empty string", () => {
    // @ts-expect-error testing runtime
    expect(slugify(null)).toBe("");
  });
});
