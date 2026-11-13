/**
 * Markdown subset → blok terstruktur (bukan HTML string), dirender React sehingga aman dari XSS.
 * Didukung: ## / ### judul, paragraf, - / 1. daftar, > kutipan, ![alt](src "keterangan"), ---,
 * inline **tebal**, *miring*, `kode`, [teks](url).
 */
import { slugify } from "./berita-content";

const IMG = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/;

export function parseMarkdown(src = "") {
  const lines = String(src).replace(/\r\n?/g, "\n").split("\n");
  const blocks = [];
  const used = new Map();
  let para = [];
  let list = null;
  let quote = [];

  const flushPara = () => {
    if (para.length) blocks.push({ type: "p", text: para.join(" ") });
    para = [];
  };
  const flushList = () => {
    if (list) blocks.push(list);
    list = null;
  };
  const flushQuote = () => {
    if (quote.length) blocks.push({ type: "quote", text: quote.join(" ") });
    quote = [];
  };
  const flush = () => {
    flushPara();
    flushList();
    flushQuote();
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    let m;
    if ((m = line.match(/^(#{2,3})\s+(.+)$/))) {
      flush();
      const text = m[2].trim();
      let id = slugify(text) || "bagian";
      const n = used.get(id) ?? 0;
      used.set(id, n + 1);
      if (n) id = `${id}-${n + 1}`;
      blocks.push({ type: m[1].length === 2 ? "h2" : "h3", text, id });
    } else if ((m = line.match(IMG))) {
      flush();
      blocks.push({ type: "img", alt: m[1], src: m[2], caption: m[3] || m[1] });
    } else if (/^(-{3,}|\*{3,})$/.test(line)) {
      flush();
      blocks.push({ type: "hr" });
    } else if ((m = line.match(/^>\s?(.*)$/))) {
      flushPara();
      flushList();
      quote.push(m[1]);
    } else if ((m = line.match(/^([-*]|\d+[.)])\s+(.+)$/))) {
      flushPara();
      flushQuote();
      const ordered = /\d/.test(m[1]);
      if (!list || list.ordered !== ordered) {
        flushList();
        list = { type: "list", ordered, items: [] };
      }
      list.items.push(m[2]);
    } else {
      flushList();
      flushQuote();
      para.push(line);
    }
  }
  flush();
  return blocks;
}

/** Daftar isi dari judul ## (dan ###). */
export const tocOf = (blocks) => blocks.filter((b) => b.type === "h2" || b.type === "h3").map((b) => ({ id: b.id, text: b.text, level: b.type === "h2" ? 2 : 3 }));

/** Token inline: [{t:"text"|"b"|"i"|"code"|"a", v, href}] */
export function inline(text = "") {
  const out = [];
  const re = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\))/g;
  let last = 0;
  let m;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ t: "text", v: text.slice(last, m.index) });
    if (m[2]) out.push({ t: "b", v: m[2] });
    else if (m[3]) out.push({ t: "i", v: m[3] });
    else if (m[4]) out.push({ t: "code", v: m[4] });
    else out.push({ t: "a", v: m[5], href: safeHref(m[6]) });
    last = re.lastIndex;
  }
  if (last < text.length) out.push({ t: "text", v: text.slice(last) });
  return out;
}

/** Hanya http(s), mailto, dan tautan internal. */
export function safeHref(h = "") {
  return /^(https?:\/\/|mailto:|\/|#)/i.test(h) ? h : "#";
}

/** Teks polos (RSS, meta). */
export const plain = (src = "") =>
  String(src)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
