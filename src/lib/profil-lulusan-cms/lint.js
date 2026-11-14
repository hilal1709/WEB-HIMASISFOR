/** Pemeriksa redundansi Galeri Wisuda: kalimat yang sama/nyaris sama di seluruh halaman Profil Lulusan. */
import { findRedundancy as core } from "@/lib/cms/redundancy";

const FIELDS = [
  ["hero.body", "Intro panggung"],
  ["hero.mascot.say", "Ucapan Elvo (panggung)"],
  ["profiles.body", "Pengantar profil"],
  ["cpl.body", "Pengantar capaian"],
  ["alumni.body", "Pengantar alumni"],
  ["alumni.fallbackQuote", "Kutipan cadangan alumni"],
  ["alumni.mascot.say", "Ucapan Elvo (alumni)"],
  ["closing.body", "Kalimat penutup"],
  ["closing.note", "Catatan tombol penutup"],
  ["closing.mascot.say", "Ucapan Elvo (penutup)"],
];

const get = (obj, p) => p.split(".").reduce((o, k) => o?.[k], obj);

/** → [{ text, a: {path,label}, b: {path,label}, score }]. */
export function findRedundancy(value, threshold = 0.75) {
  const items = FIELDS.map(([path, label]) => ({ path, label, text: get(value, path) }));
  (value?.profiles?.items ?? []).forEach((p, i) => items.push({ path: `profiles.items.${i}.summary`, label: `Ringkasan ${p.short || p.title || i + 1}`, text: p.summary }));
  (value?.cpl?.items ?? []).forEach((c, i) =>
    (c.items ?? []).forEach((t, j) => items.push({ path: `cpl.items.${i}.items.${j}`, label: `${c.title || "CPL"} #${j + 1}`, text: t }))
  );
  (value?.alumni?.items ?? []).forEach((a, i) => items.push({ path: `alumni.items.${i}.quote`, label: `Kutipan ${a.name || i + 1}`, text: a.quote }));
  (value?.closing?.links ?? []).forEach((l, i) => items.push({ path: `closing.links.${i}.body`, label: `Tautan ${l.title || i + 1}`, text: l.body }));
  // deskripsi meta memang merangkum halaman → tidak ikut diperiksa
  return core(items, threshold);
}
