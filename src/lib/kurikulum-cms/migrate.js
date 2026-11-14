/**
 * Baris lama `curriculum` (array semester atau { semesters, electives }) → bagian data Kartografer:
 * semester.list, pilihan.tracks, rumpun, bok.blocks. Dipakai sekali untuk default & migrasi, sehingga
 * isi yang pernah diisi admin tidak hilang. Slug dibekukan di sini supaya tautan #rps-<slug> tetap.
 */
import { slugify } from "@/lib/kurikulum-content";
import { BOK, COURSE_RUMPUN, ELECTIVES, FALLBACK_SEMESTERS, RUMPUN } from "./seed";

const parse = (v) => {
  if (!v) return null;
  if (typeof v === "object") return v;
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
};
const isSlot = (nama = "") => /^elective\b/i.test(nama.trim());
const num = (v) => (v === null || v === "" || v === undefined || !Number.isFinite(Number(v)) ? undefined : Number(v));
const BOK_BY_NAME = Object.fromEntries(BOK.flatMap((b) => b.courses.map((nm) => [nm.toLowerCase(), b.key])));

export function fromLegacyData(rawData) {
  const raw = parse(rawData);
  const obj = Array.isArray(raw) ? { semesters: raw } : raw ?? {};
  const cmsSem = Array.isArray(obj.semesters) && obj.semesters.some((s) => Array.isArray(s?.matkul) && s.matkul.length) ? obj.semesters : null;
  const used = new Set();

  const course = (mk, semester, track) => {
    const nama = String(mk?.nama ?? "").trim();
    let slug = slugify(nama) || "mata-kuliah";
    while (used.has(slug)) slug = `${slug}-${semester ?? "p"}`;
    used.add(slug);
    const bokIn = (Array.isArray(mk?.bok) ? mk.bok : mk?.bok ? [mk.bok] : []).filter(Boolean);
    const mapped = BOK_BY_NAME[nama.toLowerCase()];
    const out = {
      id: slug,
      slug,
      nama,
      sks: num(mk?.sks),
      kode: mk?.kode || undefined,
      rumpun: mk?.rumpun || track?.rumpun || COURSE_RUMPUN[nama.toLowerCase()] || "fondasi",
      smt: num(mk?.smt),
      bok: bokIn.length ? bokIn : mapped ? [mapped] : [],
      rps: mk?.rps && typeof mk.rps === "object" ? mk.rps : undefined,
    };
    return Object.fromEntries(Object.entries(out).filter(([, v]) => v !== undefined));
  };

  const list = (cmsSem ?? FALLBACK_SEMESTERS)
    .map((s, i) => ({ semester: num(s.semester) ?? i + 1, matkul: Array.isArray(s.matkul) ? s.matkul : [] }))
    .sort((a, b) => a.semester - b.semester)
    .map((s) => ({
      semester: s.semester,
      courses: s.matkul.map((mk) =>
        isSlot(mk?.nama)
          ? Object.fromEntries(Object.entries({ id: `slot-${s.semester}-${slugify(mk.nama)}`, slot: true, nama: String(mk.nama).trim(), sks: num(mk.sks) }).filter(([, v]) => v !== undefined))
          : course(mk, s.semester)
      ),
    }));

  const cmsEl = Array.isArray(obj.electives) ? obj.electives : [];
  const tracks = ELECTIVES.map((t) => {
    const o = cmsEl.find((x) => x?.key === t.key);
    const cmsList = Array.isArray(o?.matkul) ? o.matkul.filter((m) => m?.nama) : [];
    const names = new Set(cmsList.map((m) => String(m.nama).trim().toLowerCase()));
    const all = [...cmsList, ...t.matkul.filter((m) => !names.has(m.nama.toLowerCase()))];
    return {
      key: t.key,
      name: o?.name || t.name,
      short: o?.short || t.short,
      rumpun: t.rumpun,
      lottie: t.lottie,
      lead: o?.lead || t.lead,
      courses: all.map((mk) => course(mk, null, t)),
    };
  });

  return {
    rumpun: RUMPUN.map((r) => ({ ...r })),
    blocks: BOK.map(({ key, group, name, lottie }) => ({ key, group, name, ...(lottie ? { lottie } : {}) })),
    list,
    tracks,
  };
}
