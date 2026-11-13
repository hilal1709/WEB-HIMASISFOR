/**
 * Pemeriksa redundansi: cari kalimat yang sama atau nyaris sama di seluruh teks sambutan.
 * Dipakai Meja Sambutan agar admin tidak mengulang kalimat di sampul, surat, dan profil.
 */

const FIELDS = [
  ["hero.subtitle", "Subjudul sampul"],
  ["hero.mascot.say", "Ucapan maskot"],
  ["letter.banner.title", "Judul banner"],
  ["letter.banner.body", "Isi banner"],
  ["letter.greeting", "Salam pembuka"],
  ["letter.quote", "Kutipan"],
  ["letter.closing", "Salam penutup"],
  ["profile.intro", "Pengantar profil"],
  ["seo.description", "Deskripsi meta"],
];

const get = (obj, p) => p.split(".").reduce((o, k) => o?.[k], obj);
const norm = (t) =>
  t
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);

function sentences(text) {
  return String(text ?? "")
    .split(/(?<=[.!?…])\s+|\n+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function jaccard(a, b) {
  const A = new Set(a);
  const B = new Set(b);
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  const jac = inter / (A.size + B.size - inter || 1);
  // kalimat pendek yang hampir seluruhnya tercakup kalimat lain juga dianggap mengulang
  const small = Math.min(A.size, B.size);
  const contain = small >= 4 ? inter / small : 0;
  return Math.max(jac, contain >= 0.9 ? contain : 0);
}

/** → [{ text, a: {path,label}, b: {path,label}, score }] */
export function findRedundancy(value, threshold = 0.75) {
  const items = [];
  for (const [path, label] of FIELDS) for (const t of sentences(get(value, path))) items.push({ path, label, t, w: norm(t) });
  (get(value, "letter.paragraphs") ?? []).forEach((p, i) => {
    for (const t of sentences(p)) items.push({ path: `letter.paragraphs.${i}`, label: `Paragraf ${i + 1}`, t, w: norm(t) });
  });
  const out = [];
  const seen = new Set();
  for (let i = 0; i < items.length; i++) {
    if (items[i].w.length < 4) continue;
    for (let j = i + 1; j < items.length; j++) {
      if (items[j].w.length < 4) continue;
      const score = jaccard(items[i].w, items[j].w);
      if (score < threshold) continue;
      const key = `${items[i].path}|${items[j].path}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ text: items[i].t, a: { path: items[i].path, label: items[i].label }, b: { path: items[j].path, label: items[j].label }, score });
    }
  }
  return out;
}
