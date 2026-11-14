/** Pemeriksa redundansi Papan Jadwal: kalimat yang sama/nyaris sama di seluruh halaman Program Kelas. */
import { findRedundancy as core } from "@/lib/cms/redundancy";

const FIELDS = [
  ["hero.body", "Intro pembuka"],
  ["hero.mascot.say", "Ucapan Elvo (pembuka)"],
  ["banner.body", "Isi pengumuman"],
  ["classes.body", "Pengantar kelas"],
  ["schedule.body", "Pengantar jadwal"],
  ["compare.body", "Pengantar banding"],
  ["faq.body", "Pengantar tanya"],
  ["closing.note", "Catatan tombol penutup"],
  ["closing.stubBody", "Ajakan kontak"],
  ["closing.mascot.say", "Ucapan Elvo (penutup)"],
];

const get = (obj, p) => p.split(".").reduce((o, k) => o?.[k], obj);

/** → [{ text, a: {path,label}, b: {path,label}, score }]. */
export function findRedundancy(value, threshold = 0.75) {
  const items = FIELDS.map(([path, label]) => ({ path, label, text: get(value, path) }));
  (value?.classes?.items ?? []).forEach((c, i) => {
    const who = c.short || c.name || `Kelas ${i + 1}`;
    items.push({ path: `classes.items.${i}.tagline`, label: `Tagline ${who}`, text: c.tagline });
    items.push({ path: `classes.items.${i}.reason`, label: `Alasan kuis ${who}`, text: c.reason });
    (c.highlights ?? []).forEach((t, j) => items.push({ path: `classes.items.${i}.highlights.${j}`, label: `Keunggulan ${who} #${j + 1}`, text: t }));
  });
  (value?.faq?.items ?? []).forEach((f, i) => items.push({ path: `faq.items.${i}.a`, label: `Jawaban tanya #${i + 1}`, text: f.a }));
  (value?.closing?.links ?? []).forEach((l, i) => items.push({ path: `closing.links.${i}.body`, label: `Tautan ${l.title || i + 1}`, text: l.body }));
  return core(items, threshold);
}
