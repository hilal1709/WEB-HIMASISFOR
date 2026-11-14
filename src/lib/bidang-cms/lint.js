/**
 * Pemeriksa redundansi Konsol Bidang: kalimat yang sama atau nyaris sama di bagian halaman
 * maupun antarbidang (mis. ringkasan dua bidang yang mengulang). Inti algoritma: `@/lib/cms/redundancy`.
 */
import { findRedundancy as core } from "@/lib/cms/redundancy";

const PAGE = [
  ["hero.intro", "Intro sampul"],
  ["hero.mascot.say", "Ucapan maskot"],
  ["mosaic.body", "Paragraf mosaik"],
  ["radar.body", "Paragraf penakar"],
  ["caseStudy.headline", "Judul studi kasus"],
  ["caseStudy.body", "Isi studi kasus"],
  ["shortlist.emptyText", "Rak kosong"],
  ["shortlist.oneText", "Rak satu bidang"],
  ["shortlist.manyText", "Rak banyak bidang"],
  ["shortlist.banner.title", "Judul banner"],
  ["shortlist.banner.body", "Isi banner"],
  ["toasts.addedDesc", "Deskripsi notifikasi"],
  ["seo.description", "Deskripsi meta"],
];

const FIELD = [
  ["teaser", "ringkasan beranda"],
  ["question", "pertanyaan"],
  ["summary", "ringkasan"],
  ["move.step", "langkah studi kasus"],
];

const get = (obj, p) => p.split(".").reduce((o, k) => o?.[k], obj);

/** → [{ text, a: {path,label}, b: {path,label}, score }] */
export function findRedundancy(value, threshold = 0.75) {
  const items = PAGE.map(([path, label]) => ({ path, label, text: get(value, path) }));
  (value?.fields ?? []).forEach((f, i) => {
    const name = f.short || f.title || `Bidang ${i + 1}`;
    for (const [p, label] of FIELD) items.push({ path: `fields.${i}.${p}`, label: `${name} · ${label}`, text: get(f, p) });
    (f.learn ?? []).forEach((t, j) => items.push({ path: `fields.${i}.learn.${j}`, label: `${name} · dipelajari ${j + 1}`, text: t }));
  });
  return core(items, threshold);
}

/** Indeks bidang yang punya redundansi (untuk LED merah di channel). */
export function redundantFields(hits) {
  const out = new Set();
  for (const h of hits) for (const p of [h.a.path, h.b.path]) {
    const m = /^fields\.(\d+)\./.exec(p);
    if (m) out.add(Number(m[1]));
  }
  return out;
}
