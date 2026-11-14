/**
 * Pemeriksa redundansi Katalog Dosen: kalimat yang sama atau nyaris sama di seluruh halaman.
 * Inti algoritma ada di `@/lib/cms/redundancy`.
 */
import { findRedundancy as core } from "@/lib/cms/redundancy";

const FIELDS = [
  ["hero.intro", "Pengantar sampul"],
  ["hero.mascot.say", "Ucapan maskot sampul"],
  ["directory.body", "Kepala direktori"],
  ["directory.empty.body", "Pesan hasil kosong"],
  ["map.body", "Kepala peta rumpun"],
  ["closing.body", "Ajakan penutup"],
  ["closing.mascot.say", "Ucapan maskot penutup"],
  ["seo.description", "Deskripsi meta"],
];

const get = (obj, p) => p.split(".").reduce((o, k) => o?.[k], obj);

/** `lecturers` = daftar hasil resolve (untuk kutipan). → [{ text, a, b, score }] */
export function findRedundancy(value, lecturers = [], threshold = 0.75) {
  const items = FIELDS.map(([path, label]) => ({ path, label, text: get(value, path) }));
  (value?.fields ?? []).forEach((f, i) => items.push({ path: `fields.${i}.body`, label: `Rumpun ${f.short || i + 1}`, text: f.body }));
  (value?.closing?.next ?? []).forEach((n, i) => items.push({ path: `closing.next.${i}.body`, label: `Tautan ${n.title || i + 1}`, text: n.body }));
  lecturers.forEach((l) => l.quote && items.push({ path: `lecturer:${l.key}.quote`, label: `Kutipan ${l.name.split(" ")[0]}`, text: l.quote }));
  return core(items, threshold);
}
