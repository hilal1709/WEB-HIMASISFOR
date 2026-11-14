/**
 * Pemeriksa redundansi bersama: cari kalimat yang sama atau nyaris sama di antara field CMS.
 * `items` = [{ path, label, text }]; tiap teks dipecah per kalimat lalu dibandingkan (Jaccard + cakupan).
 */

const norm = (t) =>
  t
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);

export function sentences(text) {
  return String(text ?? "")
    .split(/(?<=[.!?…])\s+|\n+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function similarity(a, b) {
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
export function findRedundancy(items, threshold = 0.75) {
  const parts = [];
  for (const it of items) for (const t of sentences(it.text)) parts.push({ path: it.path, label: it.label, t, w: norm(t) });
  const out = [];
  const seen = new Set();
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].w.length < 4) continue;
    for (let j = i + 1; j < parts.length; j++) {
      if (parts[j].w.length < 4) continue;
      const score = similarity(parts[i].w, parts[j].w);
      if (score < threshold) continue;
      const key = `${parts[i].path}|${parts[j].path}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ text: parts[i].t, a: { path: parts[i].path, label: parts[i].label }, b: { path: parts[j].path, label: parts[j].label }, score });
    }
  }
  return out;
}
