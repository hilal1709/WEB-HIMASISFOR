/**
 * Skema isi Kurikulum & RPS (aman untuk klien): bentuk data, pembersih input, dan daftar "stasiun"
 * Kartografer Kurikulum. Server selalu menjalankan `cleanKurikulum` sebelum menyimpan.
 */
import { b, clean, deepMerge, e, l, n, o, s, url } from "@/lib/cms/shape";
import { BOK_GROUPS, RUMPUN_COLORS, RUMPUN_STYLES } from "@/lib/kurikulum-content";

export { clean, deepMerge };

export const ROW = "kurikulum";
export const DRAFT_ROW = "kurikulum-draft";
export const LEGACY_ROW = "curriculum";
export const HISTORY_MAX = 5;

export const MASCOT_POSES = ["wave", "thumbs-up", "confident", "proud", "think", "laugh", "run"];
export const SECTION_IDS = ["bok", "peta", "semester", "pilihan", "rps"];
export const RPS_PARTS = ["identitas", "deskripsi", "capaian", "kajian", "minggu", "nilai"];

/** Stasiun Kartografer, urut seperti halaman publik. */
export const CHAPTERS = [
  { key: "pembuka", label: "Pembuka", hint: "Tirai, judul, daftar isi", anchor: "top" },
  { key: "rumpun", label: "Rumpun", hint: "Jalur warna mata kuliah", anchor: "peta" },
  { key: "bok", label: "Body of Knowledge", hint: "Blok bangunan ilmu", anchor: "bok" },
  { key: "peta", label: "Peta studi", hint: "Teks peta stasiun", anchor: "peta" },
  { key: "semester", label: "Jadwal semester", hint: "Mata kuliah wajib & RPS", anchor: "semester" },
  { key: "pilihan", label: "Bidang pilihan", hint: "Peminatan & mata kuliahnya", anchor: "pilihan" },
  { key: "rps", label: "Cara membaca RPS", hint: "Templat & enam bagian", anchor: "rps" },
  { key: "penutup", label: "Penutup", hint: "Ajakan & catatan kaki", anchor: "rps" },
  { key: "cari", label: "Pencarian", hint: "Palet Ctrl K", anchor: "top" },
  { key: "laci", label: "Laci RPS", hint: "Label panel RPS", anchor: "semester" },
  { key: "seo", label: "Meta", hint: "Judul & deskripsi mesin pencari", anchor: "top" },
];

const key = s(48, /^[a-z0-9-]+$/);
const coded = o({ kode: s(40), teks: s(800) });

export const RPS_SHAPE = o({
  deskripsi: s(4000),
  koordinator: s(160),
  dosen: s(300),
  tanggal: s(60),
  prasyarat: s(200),
  pdf: url,
  cpl: l(coded, 20),
  cpmk: l(o({ kode: s(40), teks: s(800), bobot: n(0, 100) }), 20),
  subcpmk: l(coded, 30),
  bahanKajian: l(s(400), 30),
  pustaka: o({ utama: l(s(500), 20), pendukung: l(s(500), 20) }),
  minggu: l(o({ judul: s(160), materi: s(800), metode: s(300), subcpmk: s(120), penilaian: s(300), ujian: b, bobot: n(0, 100) }), 16),
  penilaian: l(o({ label: s(80), rencana: s(300), bobot: n(0, 100), cpmk: s(120) }), 12),
});

export const COURSE_SHAPE = o({
  id: s(60),
  slug: key,
  nama: s(160),
  kode: s(30),
  sks: n(0, 24),
  slot: b,
  rumpun: s(48),
  smt: n(1, 14),
  bok: l(key, 12),
  rps: RPS_SHAPE,
});

const mascot = o({ show: b, pose: e(MASCOT_POSES), say: s(140) });
const cell = s(400);

export const SHAPE = o({
  curtain: o({ enabled: b, title: s(40), accent: s(40), label: s(60) }),
  hero: o({
    breadcrumb: l(o({ label: s(60), href: url }), 5),
    current: s(60),
    titleLines: l(s(60), 4),
    lead: s(400),
    ctaPrimary: s(40),
    ctaSearch: s(40),
    kbd: s(12),
    statsStrong: s(80),
    statsRest: s(200),
    tocTitle: s(40),
    toc: l(o({ target: e(SECTION_IDS), title: s(60), note: s(80), page: s(40) }), 6),
    tocAria: s(80),
    mascot,
  }),
  rumpun: l(o({ key, name: s(60), short: s(30), color: e(Object.keys(RUMPUN_COLORS)), style: e(RUMPUN_STYLES) }), 8),
  bok: o({
    title: l(s(40), 3),
    body: s(400),
    groupLabels: o(Object.fromEntries(BOK_GROUPS.map((g) => [g, s(40)]))),
    countLabel: s(80),
    emptyLabel: s(80),
    showSuggestedNote: b,
    suggestedNote: s(160),
    semesterShort: s(30),
    electiveShort: s(30),
    diagramAria: s(80),
    blocks: l(o({ key, group: e(BOK_GROUPS), name: s(80), lottie: url }), 20),
  }),
  peta: o({
    title: l(s(40), 3),
    body: s(400),
    chipsAria: s(80),
    station: s(40),
    sks: s(30),
    panel: s(120),
    panelSlots: s(60),
    open: s(60),
    stationAria: s(160),
  }),
  semester: o({
    title: l(s(40), 3),
    courseCount: s(40),
    tabsAria: s(60),
    prev: s(30),
    next: s(30),
    hint: s(60),
    cumulative: s(80),
    listAria: s(80),
    rumpunAria: s(60),
    slotPrefix: s(30),
    slotNote: s(160),
    slotLink: s(30),
    rpsNone: s(30),
    rpsReady: s(30),
    rpsPdf: s(30),
    list: l(o({ semester: n(1, 14), courses: l(COURSE_SHAPE, 20) }), 14),
  }),
  pilihan: o({
    title: l(s(40), 3),
    body: s(400),
    illustrationAria: s(80),
    tracks: l(o({ key, name: s(80), short: s(40), rumpun: s(48), lottie: url, lead: s(300), courses: l(COURSE_SHAPE, 16) }), 6),
  }),
  rps: o({
    title: l(s(40), 3),
    body: s(400),
    parts: l(o({ key: e(RPS_PARTS), title: s(60), body: s(300) }), 6),
    badgeAria: s(60),
    paperAria: s(60),
    header: l(s(120), 6),
    logo: url,
    logoAlt: s(120),
    template: o({
      identity: l(o({ label: s(60), value: cell }), 10),
      deskripsiLabel: s(60),
      deskripsi: s(1200),
      capaian: l(o({ label: s(80), items: l(o({ kode: s(40), bobot: s(20), teks: cell }), 6) }), 4),
      kajianLabel: s(60),
      kajian: l(cell, 8),
      pustakaLabel: s(60),
      pustaka: l(o({ label: s(40), items: l(cell, 6) }), 3),
      mingguHeaders: l(s(60), 6),
      minggu: l(o({ n: s(8), ujian: b, subcpmk: s(60), judul: s(120), materi: cell, metode: cell, penilaian: cell, bobot: s(20) }), 10),
      nilaiHeaders: l(s(60), 5),
      nilai: l(o({ label: s(80), rencana: cell, bobot: s(20), cpmk: s(80) }), 8),
      totalLabel: s(30),
      totalValue: s(10),
    }),
    captionLead: s(80),
    captionStrong: s(120),
    captionNote: s(120),
    banner: o({ show: b, title: s(120), body: s(300) }),
    ready: s(160),
    more: s(60),
  }),
  penutup: o({
    question: s(160),
    button: s(40),
    mascot,
    notes: l(o({ href: url, title: s(60), body: s(160) }), 6),
  }),
  cari: o({
    title: s(60),
    description: s(160),
    placeholder: s(80),
    readyLabel: s(80),
    semesterGroup: s(40),
    electiveGroup: s(40),
    emptyLottie: url,
    emptyTitle: s(120),
    tryLabel: s(20),
    suggestions: l(s(30), 8),
    hintNav: s(30),
    hintOpen: s(30),
    count: s(40),
    rpsTag: s(12),
  }),
  laci: o({
    wajib: s(40),
    pilihan: s(40),
    semester: s(30),
    srDescription: s(120),
    kode: s(20),
    sks: s(20),
    koordinator: s(30),
    pengampu: s(30),
    disusun: s(30),
    prasyarat: s(30),
    pending: s(30),
    close: s(30),
    tabs: o({ ringkasan: s(30), minggu: s(30), nilai: s(30), pustaka: s(30) }),
    deskripsi: s(60),
    cpl: s(80),
    cpmk: s(80),
    subcpmk: s(60),
    kajian: s(60),
    week: s(30),
    weekPending: s(60),
    weeksAria: s(60),
    metode: s(30),
    penilaian: s(30),
    weekHint: s(200),
    total: s(20),
    pustakaUtama: s(40),
    pustakaPendukung: s(40),
    emptyLottie: url,
    emptyAria: s(80),
    emptyTitle: s(80),
    emptyBody: s(300),
    prevAria: s(60),
    nextAria: s(60),
    download: s(30),
    downloadPdf: s(40),
    toastOpen: s(60),
    toastMissing: s(60),
    toastMissingBody: s(160),
  }),
  seo: o({ title: s(90), description: s(220) }),
});

/** null/"" pada angka berarti "kosong", bukan 0 → buang dulu sebelum dibersihkan. */
function dropNull(v) {
  if (Array.isArray(v)) return v.map(dropNull);
  if (!v || typeof v !== "object") return v;
  const out = {};
  for (const [k, x] of Object.entries(v)) if (x !== null && x !== undefined) out[k] = dropNull(x);
  return out;
}

export const cleanKurikulum = (v) => clean(SHAPE, dropNull(v)) ?? null;
export const cleanCourse = (v) => clean(COURSE_SHAPE, dropNull(v)) ?? null;

/** Stasiun mana yang berbeda antara dua versi (badge rel & modal terbit). */
export function changedChapters(a, b) {
  const keyOf = (k) => (k === "pembuka" ? ["curtain", "hero"] : [k]);
  return CHAPTERS.filter((c) => keyOf(c.key).some((k) => JSON.stringify(a?.[k] ?? null) !== JSON.stringify(b?.[k] ?? null))).map((c) => c.key);
}
