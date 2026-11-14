/**
 * Pemeriksa redundansi Meja Sambutan: kalimat yang sama atau nyaris sama di sampul, surat, dan profil.
 * Inti algoritma ada di `@/lib/cms/redundancy`.
 */
import { findRedundancy as core } from "@/lib/cms/redundancy";

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

/** → [{ text, a: {path,label}, b: {path,label}, score }] */
export function findRedundancy(value, threshold = 0.75) {
  const items = FIELDS.map(([path, label]) => ({ path, label, text: get(value, path) }));
  (get(value, "letter.paragraphs") ?? []).forEach((p, i) => items.push({ path: `letter.paragraphs.${i}`, label: `Paragraf ${i + 1}`, text: p }));
  return core(items, threshold);
}
