/** Pemeriksa redundansi Studio Bagan: kalimat yang sama/nyaris sama di seluruh halaman Struktur Organisasi. */
import { findRedundancy as core } from "@/lib/cms/redundancy";

const FIELDS = [
  ["hero.body", "Paragraf pembuka"],
  ["hero.mascot.say", "Ucapan Elvo (pembuka)"],
  ["chart.body", "Petunjuk bagan"],
  ["chart.banner.body", "Isi pengumuman bagan"],
  ["minilab.body", "Pengantar fasilitas"],
  ["minilab.card.body", "Deskripsi minilab"],
  ["minilab.directory.body", "Deskripsi direktori dosen"],
  ["closing.service.body", "Kartu layanan akademik"],
  ["closing.mascot.say", "Ucapan Elvo (penutup)"],
  ["seo.description", "Deskripsi meta"],
];

const get = (obj, p) => p.split(".").reduce((o, k) => o?.[k], obj);

/** → [{ text, a: {path,label}, b: {path,label}, score }]. Path orang memakai `people.<i>.…`. */
export function findRedundancy(value, threshold = 0.75) {
  const items = FIELDS.map(([path, label]) => ({ path, label, text: get(value, path) }));
  (value?.closing?.next ?? []).forEach((n, i) => items.push({ path: `closing.next.${i}.body`, label: `Tautan ${n.title || i + 1}`, text: n.body }));
  (value?.chart?.divisions ?? []).forEach((d, i) => items.push({ path: `chart.divisions.${i}.body`, label: `Divisi ${d.name || i + 1}`, text: d.body }));
  (value?.people ?? []).forEach((p, i) =>
    (p.duties ?? []).forEach((d, j) => items.push({ path: `people.${i}.duties.${j}`, label: `Tugas ${p.name || i + 1}`, text: d }))
  );
  return core(items, threshold);
}

/** Masalah isi orang yang perlu perhatian (bukan galat simpan). */
export function peopleIssues(people = []) {
  const out = [];
  people.forEach((p, i) => {
    if (!p.role?.trim()) out.push({ path: `people.${i}.role`, key: p.key, label: `${p.name || "Tanpa nama"} belum punya jabatan` });
    if (!p.expertise?.length) out.push({ path: `people.${i}.expertise`, key: p.key, label: `${p.name || "Tanpa nama"} belum punya ${p.group === "staff" ? "layanan" : "bidang keahlian"}` });
  });
  return out;
}
