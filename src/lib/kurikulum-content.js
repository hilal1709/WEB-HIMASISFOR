/**
 * Kurikulum & RPS (/curiculum): pembantu bersama (aman untuk klien).
 * Isi halaman 100% dari Kartografer Kurikulum (CMS, `src/lib/kurikulum-cms`). Berkas ini hanya
 * mengubah isi CMS menjadi bentuk turunan yang dibaca komponen publik dan halaman lain
 * (Konversi SKS, Bidang Keahlian, Jalur Kelulusan, Regulasi Akademik, Magang).
 *
 * rps = format RPS resmi prodi: deskripsi, koordinator, dosen, tanggal, prasyarat, pdf,
 *       cpl[{kode,teks}], cpmk[{kode,teks,bobot}], subcpmk[], bahanKajian[], pustaka{utama,pendukung},
 *       minggu[16]{judul,materi,metode,subcpmk,penilaian,bobot?}, penilaian[{label,rencana,bobot,cpmk}]
 */
import { RUMPUN as SEED_RUMPUN } from "@/lib/kurikulum-cms/seed";

export const CURTAIN_KEY = "sisfor:curtain:kurikulum";
export const BANNER_KEY = "sisfor:banner:kurikulum-rps";

/** Warna rumpun = token tema (bukan hex). `ink` = warna teks di atas titik berisi. */
export const RUMPUN_COLORS = {
  navy: { css: "var(--navy)", ink: "white", label: "Navy" },
  maroon: { css: "var(--maroon)", ink: "white", label: "Maroon" },
  gold: { css: "var(--gold)", ink: "var(--navy)", label: "Emas" },
  "navy-deep": { css: "var(--navy-deep)", ink: "white", label: "Navy tua" },
  "maroon-deep": { css: "var(--maroon-deep)", ink: "white", label: "Maroon tua" },
  "gold-soft": { css: "var(--gold-soft)", ink: "var(--navy)", label: "Emas lembut" },
  success: { css: "var(--success)", ink: "white", label: "Hijau" },
};
export const RUMPUN_STYLES = ["solid", "ring"];

/** Rumpun bawaan (dipakai komponen di luar halaman Kurikulum yang belum menerima data rumpun). */
export const RUMPUN = SEED_RUMPUN.map(withColor);
export const RUMPUN_BY_KEY = Object.fromEntries(RUMPUN.map((r) => [r.key, r]));

export function withColor(r) {
  const c = RUMPUN_COLORS[r.color] ?? RUMPUN_COLORS.navy;
  return { ...r, css: c.css, ink: r.style === "ring" ? c.css : c.ink, dash: r.style === "ring" ? "2 7" : null };
}

/** Ganti token `{nama}` di teks CMS: fill("{n} SKS", { n: 144 }) → "144 SKS". */
export function fill(text, vars = {}) {
  return String(text ?? "").replace(/\{(\w+)\}/g, (m, k) => (vars[k] ?? vars[k] === 0 ? String(vars[k]) : m));
}

const splitPipe = (s) => String(s ?? "").split("|").map((x) => x.trim());

/** Seragamkan RPS (bentuk lama berupa string tetap diterima). Mengembalikan null bila RPS kosong. */
export function normRps(r) {
  if (!r || typeof r !== "object") return null;
  const arr = (v) => (Array.isArray(v) ? v : []);
  const code = (x) =>
    typeof x === "string"
      ? (() => {
          const [a, b] = splitPipe(x);
          return b ? { kode: a, teks: b } : { kode: "", teks: a };
        })()
      : { kode: x?.kode ?? "", teks: x?.teks ?? "", ...(x?.bobot != null && x.bobot !== "" ? { bobot: Number(x.bobot) } : {}) };
  const out = {
    deskripsi: r.deskripsi ?? "",
    koordinator: r.koordinator ?? "",
    dosen: r.dosen ?? "",
    tanggal: r.tanggal ?? r.revisi ?? "",
    prasyarat: r.prasyarat ?? "",
    pdf: r.pdf ?? "",
    cpl: arr(r.cpl).map(code).filter((x) => x.teks),
    cpmk: arr(r.cpmk).map(code).filter((x) => x.teks),
    subcpmk: arr(r.subcpmk).map(code).filter((x) => x.teks),
    bahanKajian: arr(r.bahanKajian).filter(Boolean),
    pustaka: { utama: arr(r.pustaka?.utama).filter(Boolean), pendukung: arr(r.pustaka?.pendukung).filter(Boolean) },
    minggu: arr(r.minggu)
      .slice(0, 16)
      .map((m) =>
        typeof m === "string"
          ? { judul: m, materi: "", metode: "", subcpmk: "", penilaian: "", bobot: null }
          : {
              judul: m?.judul ?? "",
              materi: m?.materi ?? "",
              metode: m?.metode ?? "",
              subcpmk: m?.subcpmk ?? "",
              penilaian: m?.penilaian ?? "",
              ujian: Boolean(m?.ujian),
              bobot: m?.bobot != null && m.bobot !== "" && !Number.isNaN(Number(m.bobot)) ? Number(m.bobot) : null,
            }
      ),
    penilaian: arr(r.penilaian)
      .map((p) => ({ label: p?.label ?? "", rencana: p?.rencana ?? "", bobot: Number(p?.bobot) || 0, cpmk: p?.cpmk ?? "" }))
      .filter((p) => p.label),
  };
  const empty = !out.pdf && !out.deskripsi && !out.cpmk.length && !out.minggu.some((m) => m.judul || m.materi) && !out.penilaian.length;
  return empty ? null : out;
}

export function slugify(s = "") {
  return String(s)
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/\(.*?\)/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Urutan grup Body of Knowledge dari bawah (fondasi) ke puncak; dipakai untuk tata letak & animasi. */
export const BOK_GROUPS = ["base", "pillar", "core", "band", "peak"];

const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : null);

/**
 * Isi CMS (value) → bentuk turunan halaman:
 * { copy, rumpun, rumpunByKey, semesters[{semester, items, sks}], electives[{…track, matkul}], courses,
 *   totals{sks,wajib,pilihan,rps}, maxSks, bok[{key,group,name,lottie,courses:slug[]}], bokSuggested }
 */
export function buildKurikulum(value) {
  const v = value ?? {};
  const rumpun = (v.rumpun?.length ? v.rumpun : SEED_RUMPUN).map(withColor);
  const rumpunByKey = Object.fromEntries(rumpun.map((r) => [r.key, r]));
  const fallbackRumpun = rumpun[0]?.key ?? "fondasi";
  const blocks = v.bok?.blocks ?? [];
  const bokKeys = new Set(blocks.map((b) => b.key));
  const used = new Set();

  const course = (c, extra) => {
    let slug = c.slug || slugify(c.nama) || "mata-kuliah";
    while (used.has(slug)) slug = `${slug}-${extra.semester ?? "p"}`;
    used.add(slug);
    return {
      id: c.id ?? slug,
      slug,
      nama: String(c.nama ?? "").trim(),
      sks: num(c.sks),
      kode: c.kode || "",
      rumpun: rumpunByKey[c.rumpun] ? c.rumpun : extra.rumpun && rumpunByKey[extra.rumpun] ? extra.rumpun : fallbackRumpun,
      smt: num(c.smt) ?? extra.semester ?? null,
      rps: normRps(c.rps),
      bok: (c.bok ?? []).filter((k) => bokKeys.has(k)),
      semester: extra.semester ?? null,
      ...(extra.track ? { track: extra.track } : {}),
    };
  };

  const semesters = (v.semester?.list ?? [])
    .map((s, i) => ({ semester: num(s.semester) ?? i + 1, courses: s.courses ?? [] }))
    .sort((a, b) => a.semester - b.semester)
    .map((s) => {
      const items = s.courses
        .filter((c) => c?.nama)
        .map((c) => (c.slot ? { slot: true, id: c.id ?? `slot-${s.semester}-${slugify(c.nama)}`, nama: c.nama.trim(), sks: num(c.sks), slug: `slot-${s.semester}-${slugify(c.nama)}` } : course(c, { semester: s.semester })));
      return { semester: s.semester, items, sks: items.reduce((t, c) => t + (c.sks ?? 0), 0) };
    });

  const electives = (v.pilihan?.tracks ?? []).map((t) => ({
    key: t.key,
    name: t.name ?? "",
    short: t.short || t.name || "",
    rumpun: rumpunByKey[t.rumpun] ? t.rumpun : fallbackRumpun,
    lottie: t.lottie ?? "",
    lead: t.lead ?? "",
    matkul: (t.courses ?? []).filter((c) => c?.nama).map((c) => course(c, { semester: null, track: t.key, rumpun: t.rumpun })),
  }));

  const core = semesters.flatMap((s) => s.items.filter((c) => !c.slot));
  const optional = electives.flatMap((e) => e.matkul);
  const courses = [...core, ...optional];
  const totalSks = semesters.reduce((t, s) => t + s.sks, 0);

  const bok = blocks.map((b) => ({ key: b.key, group: b.group, name: b.name, lottie: b.lottie ?? "", courses: courses.filter((c) => c.bok.includes(b.key)).map((c) => c.slug) }));

  return {
    copy: v,
    rumpun,
    rumpunByKey,
    semesters,
    electives,
    courses,
    totals: { sks: totalSks, wajib: core.length, pilihan: optional.length, rps: courses.filter((c) => c.rps).length },
    maxSks: Math.max(...courses.map((c) => c.sks ?? 0), 1),
    bok,
    bokSuggested: Boolean(v.bok?.showSuggestedNote),
  };
}
