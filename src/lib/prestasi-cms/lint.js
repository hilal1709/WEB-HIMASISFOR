/**
 * Pemeriksa redundansi Ruang Kurator: kalimat yang sama atau nyaris sama di seluruh halaman Prestasi.
 * Inti algoritma ada di `@/lib/cms/redundancy`.
 */
import { findRedundancy as core } from "@/lib/cms/redundancy";

const FIELDS = [
  ["hero.body", "Pengantar sampul"],
  ["hero.mascot.say", "Ucapan maskot sampul"],
  ["archive.body", "Kepala arsip"],
  ["archive.empty.body", "Pesan hasil kosong"],
  ["story.quote", "Kutipan kisah"],
  ["story.mascot.say", "Ucapan maskot kisah"],
  ["closing.body", "Ajakan penutup"],
  ["modal.description", "Keterangan modal"],
  ["seo.description", "Deskripsi meta"],
];

const get = (obj, p) => p.split(".").reduce((o, k) => o?.[k], obj);

/** → [{ text, a, b, score }] */
export function findRedundancy(value, threshold = 0.75) {
  const items = FIELDS.map(([path, label]) => ({ path, label, text: get(value, path) }));
  (value?.closing?.next ?? []).forEach((x, i) => items.push({ path: `closing.next.${i}.body`, label: `Jalan lanjut ${x.title || i + 1}`, text: x.body }));
  (value?.story?.people ?? []).forEach((p, i) => items.push({ path: `story.people.${i}.role`, label: `Peran ${p.name || i + 1}`, text: p.role }));
  return core(items, threshold);
}

/** Peta path → jumlah temuan (untuk tanda peringatan di field). */
export function redundancyByPath(list) {
  const out = {};
  for (const r of list) for (const p of [r.a.path, r.b.path]) out[p] = [...(out[p] ?? []), r];
  return out;
}
