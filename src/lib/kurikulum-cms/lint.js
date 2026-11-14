/**
 * Pemeriksa Kartografer Kurikulum (aman untuk klien):
 * - redundansi: kalimat sama/nyaris sama di antara teks halaman (inti di `@/lib/cms/redundancy`)
 * - integritas: slug/kode ganda, rumpun hilang, bobot ≠ 100, rencana ≠ 16 minggu, blok BoK kosong.
 * Tiap temuan membawa `chapter` (stasiun) dan `path` agar bisa dilompati dari panel sinyal.
 */
import { findRedundancy as core } from "@/lib/cms/redundancy";

const TEXTS = [
  ["hero.lead", "Lead pembuka", "pembuka"],
  ["hero.mascot.say", "Ucapan maskot pembuka", "pembuka"],
  ["bok.body", "Pengantar Body of Knowledge", "bok"],
  ["peta.body", "Pengantar peta studi", "peta"],
  ["semester.slotNote", "Keterangan slot pilihan", "semester"],
  ["pilihan.body", "Pengantar bidang pilihan", "pilihan"],
  ["rps.body", "Pengantar RPS", "rps"],
  ["rps.banner.body", "Isi banner RPS", "rps"],
  ["penutup.question", "Ajakan penutup", "penutup"],
  ["penutup.mascot.say", "Ucapan maskot penutup", "penutup"],
  ["cari.description", "Keterangan pencarian", "cari"],
  ["laci.emptyBody", "Isi RPS kosong", "laci"],
  ["laci.weekHint", "Petunjuk 16 minggu", "laci"],
  ["seo.description", "Deskripsi meta", "seo"],
];

const get = (obj, p) => p.split(".").reduce((o, k) => o?.[k], obj);
const chapterOf = (path) => TEXTS.find((t) => path.startsWith(t[0]))?.[2] ?? path.split(".")[0];

export function findRedundancy(value, threshold = 0.75) {
  const items = TEXTS.map(([path, label]) => ({ path, label, text: get(value, path) }));
  (value?.pilihan?.tracks ?? []).forEach((t, i) => items.push({ path: `pilihan.tracks.${i}.lead`, label: `Lead ${t.name || `bidang ${i + 1}`}`, text: t.lead }));
  (value?.rps?.parts ?? []).forEach((p, i) => items.push({ path: `rps.parts.${i}.body`, label: `Bagian RPS: ${p.title}`, text: p.body }));
  (value?.penutup?.notes ?? []).forEach((n, i) => items.push({ path: `penutup.notes.${i}.body`, label: `Catatan ${n.title}`, text: n.body }));
  return core(items, threshold).map((r) => ({ ...r, kind: "redundansi", chapter: chapterOf(r.a.path) }));
}

/** Semua mata kuliah beserta path-nya di dokumen. */
export function allCourses(value) {
  const out = [];
  (value?.semester?.list ?? []).forEach((s, si) => (s.courses ?? []).forEach((c, ci) => out.push({ c, path: `semester.list.${si}.courses.${ci}`, where: `Semester ${s.semester}`, chapter: "semester" })));
  (value?.pilihan?.tracks ?? []).forEach((t, ti) => (t.courses ?? []).forEach((c, ci) => out.push({ c, path: `pilihan.tracks.${ti}.courses.${ci}`, where: t.name || `Bidang ${ti + 1}`, chapter: "pilihan" })));
  return out;
}

export function findIssues(value) {
  const issues = [];
  const push = (chapter, path, text, tone = "warning") => issues.push({ kind: "integritas", chapter, path, text, tone });
  const rumpun = new Set((value?.rumpun ?? []).map((r) => r.key));
  const blocks = new Set((value?.bok?.blocks ?? []).map((b) => b.key));
  const courses = allCourses(value);
  const slugs = new Map();
  const codes = new Map();

  for (const { c, path, where, chapter } of courses) {
    if (c.slot) continue;
    const name = c.nama || "Tanpa nama";
    if (!c.nama?.trim()) push(chapter, `${path}.nama`, `Ada mata kuliah tanpa nama di ${where}.`, "danger");
    if (c.slug) slugs.set(c.slug, [...(slugs.get(c.slug) ?? []), { path, name }]);
    if (c.kode) codes.set(c.kode, [...(codes.get(c.kode) ?? []), { path, name }]);
    if (c.rumpun && !rumpun.has(c.rumpun)) push(chapter, `${path}.rumpun`, `${name}: rumpun “${c.rumpun}” sudah dihapus.`);
    (c.bok ?? []).filter((k) => !blocks.has(k)).forEach((k) => push(chapter, `${path}.bok`, `${name}: blok BoK “${k}” tidak ada lagi.`));
    const r = c.rps;
    if (r) {
      const total = (r.penilaian ?? []).reduce((t, p) => t + (Number(p.bobot) || 0), 0);
      if ((r.penilaian ?? []).length && total !== 100) push(chapter, `${path}.rps.penilaian`, `${name}: total bobot penilaian ${total}%, seharusnya 100%.`);
      const weeks = (r.minggu ?? []).length;
      if (weeks && weeks !== 16) push(chapter, `${path}.rps.minggu`, `${name}: rencana berisi ${weeks} minggu, format prodi 16.`);
    }
  }
  for (const [slug, list] of slugs) if (list.length > 1) push("semester", `${list[1].path}.slug`, `Tautan “${slug}” dipakai ${list.length} mata kuliah (${list.map((x) => x.name).join(", ")}).`, "danger");
  for (const [kode, list] of codes) if (list.length > 1) push("semester", `${list[1].path}.kode`, `Kode ${kode} dipakai ${list.length} mata kuliah.`);
  (value?.semester?.list ?? []).forEach((s, i) => !(s.courses ?? []).length && push("semester", `semester.list.${i}`, `Semester ${s.semester} belum punya mata kuliah.`));
  (value?.bok?.blocks ?? []).forEach((b, i) => {
    const used = courses.some(({ c }) => (c.bok ?? []).includes(b.key));
    if (!used) push("bok", `bok.blocks.${i}`, `Blok “${b.name}” belum dibangun mata kuliah apa pun.`, "info");
  });
  return issues;
}

/** Semua sinyal sekaligus (redundansi + integritas), dikelompokkan per stasiun. */
export function signals(value) {
  const list = [...findIssues(value), ...findRedundancy(value).map((r) => ({ kind: "redundansi", chapter: r.chapter, path: r.b.path, text: `“${r.text}” muncul di ${r.a.label} dan ${r.b.label}.`, tone: "info" }))];
  const byChapter = {};
  list.forEach((x) => (byChapter[x.chapter] = [...(byChapter[x.chapter] ?? []), x]));
  return { list, byChapter };
}
