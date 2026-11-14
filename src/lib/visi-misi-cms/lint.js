/** Pemeriksa redundansi Ruang Kompas: kalimat yang sama/nyaris sama di seluruh halaman Visi & Misi. */
import { findRedundancy as core } from "@/lib/cms/redundancy";

const FIELDS = [
  ["hero.subtitle", "Subjudul cakrawala"],
  ["hero.mascot.say", "Ucapan Elvo (cakrawala)"],
  ["visi.mascot.say", "Ucapan Elvo (visi)"],
  ["misi.intro", "Pengantar misi"],
  ["roadmap.body", "Pengantar perjalanan"],
  ["closing.mascot.say", "Ucapan Elvo (langkah)"],
  ["seo.description", "Deskripsi meta"],
];

const get = (obj, p) => p.split(".").reduce((o, k) => o?.[k], obj);

/** → [{ text, a: {path,label}, b: {path,label}, score }]. */
export function findRedundancy(value, threshold = 0.75) {
  const items = FIELDS.map(([path, label]) => ({ path, label, text: get(value, path) }));
  items.push({ path: "visi.text", label: "Teks visi", text: get(value, "visi.text") });
  (value?.misi?.items ?? []).forEach((m, i) => {
    items.push({ path: `misi.items.${i}.text`, label: `Misi ${i + 1}`, text: m.text });
    items.push({ path: `misi.items.${i}.detail`, label: `Penjelasan misi ${i + 1}`, text: m.detail });
  });
  (value?.roadmap?.items ?? []).forEach((m, i) => items.push({ path: `roadmap.items.${i}.body`, label: `Tonggak ${m.year || i + 1}`, text: m.body }));
  (value?.closing?.stops ?? []).forEach((m, i) => items.push({ path: `closing.stops.${i}.body`, label: `Halte ${m.title || i + 1}`, text: m.body }));
  // teks visi & misi resmi wajar beririsan kata; yang diperiksa = teks pendukung terhadap semuanya
  const official = (p) => p === "visi.text" || /^misi\.items\.\d+\.text$/.test(p);
  return core(items, threshold).filter((r) => !(official(r.a.path) && official(r.b.path)));
}
