/**
 * Skema isi Bidang Keahlian (aman untuk klien): bentuk data, pembersih input, dan daftar bus
 * yang dipakai Konsol Bidang. Server selalu menjalankan `cleanBidang` sebelum menyimpan.
 */
import { b, clean, deepMerge, e, l, n, o, s, url } from "@/lib/cms/shape";

export { clean, deepMerge };

export const ROW = "bidang";
export const DRAFT_ROW = "bidang-draft";
export const LEGACY_ROW = "bidang-keahlian";
export const HISTORY_MAX = 5;

export const FIELD_MIN = 2;
export const FIELD_MAX = 6;
export const DIM_MIN = 3;
export const DIM_MAX = 7;
export const SCALE = 10;

export const ACCENTS = ["maroon", "navy", "gold"];
export const TILES = ["besar", "lebar", "kecil"];
export const QUADRANTS = ["none", "0", "1", "2", "3"];
export const MASCOT_POSES = ["wave", "thumbs-up", "confident", "proud", "think", "laugh", "run"];
export const BANNER_VARIANTS = ["brand", "info", "success", "warning"];
export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Bus master (bagian halaman) — urut seperti halaman publik. `fields` = rak channel. */
export const BUSES = [
  { key: "hero", label: "Sampul", hint: "Breadcrumb, intro, tombol, maskot" },
  { key: "mosaic", label: "Mosaik", hint: "Judul & ajakan tile bidang" },
  { key: "dimensions", label: "Dimensi", hint: "Sumbu penakar minat" },
  { key: "radar", label: "Penakar", hint: "Slider minat & peringkat" },
  { key: "caseStudy", label: "Studi kasus", hint: "Satu masalah, banyak sudut" },
  { key: "modal", label: "Rangkuman", hint: "Label modal detail bidang" },
  { key: "shortlist", label: "Rak", hint: "Penutup, banner, tautan lanjutan" },
  { key: "toasts", label: "Notifikasi", hint: "Pesan saat menandai bidang" },
  { key: "curtain", label: "Tirai", hint: "Layar pembuka sekali per sesi" },
  { key: "seo", label: "Meta", hint: "Judul & deskripsi mesin pencari" },
];

const lines = (n = 3, max = 60) => l(s(max), n);
const link = o({ label: s(60), href: url });

export const FIELD_SHAPE = o({
  slug: s(40, SLUG_RE),
  visible: b,
  title: s(80),
  short: s(30),
  teaser: s(260),
  accent: e(ACCENTS),
  tile: e(TILES),
  question: s(160),
  summary: s(500),
  learn: l(s(160), 8),
  tools: l(s(40), 12),
  courses: l(s(120), 10),
  dosenField: s(40),
  profileKey: s(40),
  image: url,
  crop: b,
  lottie: url,
  careers: l(s(60), 8),
  profile: l(n(0, SCALE), DIM_MAX),
  quadrant: e(QUADRANTS),
  move: o({ role: s(60), step: s(300), output: s(120) }),
  sample: b,
});

export const SHAPE = o({
  seo: o({ title: s(90), description: s(220) }),
  curtain: o({ enabled: b, title: s(40), accent: s(40), label: s(60) }),
  hero: o({
    breadcrumb: l(link, 5),
    kicker: s(80),
    intro: s(400),
    primaryLabel: s(40),
    secondaryLabel: s(40),
    toolsLabel: s(40),
    mascot: o({ show: b, pose: e(MASCOT_POSES), say: s(120) }),
  }),
  mosaic: o({ title: lines(), body: s(300), openLabel: s(40) }),
  dimensions: l(o({ key: s(30, SLUG_RE), label: s(60), short: s(16), default: n(0, SCALE) }), DIM_MAX),
  radar: o({
    show: b,
    title: lines(),
    body: s(300),
    lowLabel: s(20),
    highLabel: s(20),
    resetLabel: s(40),
    topLabel: s(40),
    saveLabel: s(40),
    savedLabel: s(40),
    sampleTag: b,
  }),
  caseStudy: o({
    show: b,
    title: lines(),
    kicker: s(40),
    headline: s(160),
    body: s(400),
    nowLabel: s(40),
    stepLabel: s(30),
    outputLabel: s(30),
    linkLabel: s(40),
    dragHint: s(80),
    sampleTag: b,
  }),
  modal: o({
    kicker: s(30),
    careersLabel: s(40),
    peopleLabel: s(40),
    learnLabel: s(40),
    toolsLabel: s(40),
    coursesLabel: s(40),
    markLabel: s(40),
    markedLabel: s(40),
  }),
  shortlist: o({
    title: lines(2),
    emptyText: s(240),
    oneText: s(240),
    manyText: s(240),
    pmb: link,
    backLabel: s(40),
    removeLabel: s(60),
    banner: o({ show: b, variant: e(BANNER_VARIANTS), title: s(120), body: s(260), linkLabel: s(40), href: url }),
    next: l(o({ kicker: s(30), title: s(80), titleEmpty: s(80), href: s(200) }), 4),
  }),
  toasts: o({ added: s(80), addedDesc: s(140), removed: s(80), already: s(80), alreadyDesc: s(140), undo: s(20) }),
  fields: l(FIELD_SHAPE, FIELD_MAX),
});

/** Bersihkan + pastikan invarian: slug unik & terisi, profil sepanjang dimensi, jumlah dalam batas. */
export function cleanBidang(v) {
  const out = clean(SHAPE, v);
  if (!out) return null;
  if (out.fields) {
    const seen = new Set();
    out.fields = out.fields.filter((f) => f.slug && !seen.has(f.slug) && seen.add(f.slug));
    if (out.fields.length < FIELD_MIN) return null;
  }
  if (out.dimensions) {
    const seen = new Set();
    out.dimensions = out.dimensions.filter((d) => d.key && !seen.has(d.key) && seen.add(d.key));
    if (out.dimensions.length < DIM_MIN) return null;
  }
  return out;
}

/** Bagian mana yang berbeda antara dua versi (badge & modal Master Out). */
export function changedSections(a, b) {
  const keys = ["fields", ...BUSES.map((x) => x.key)];
  return keys.filter((k) => JSON.stringify(a?.[k] ?? null) !== JSON.stringify(b?.[k] ?? null));
}

/** Kerangka channel baru (dipakai Konsol saat menambah bidang). */
export function blankField(slug, dims = 5) {
  return {
    slug,
    visible: true,
    title: "Bidang baru",
    short: "Baru",
    teaser: "",
    accent: "navy",
    tile: "kecil",
    question: "",
    summary: "",
    learn: [],
    tools: [],
    courses: [],
    dosenField: "",
    profileKey: "",
    image: "/img/data.jpeg",
    crop: false,
    lottie: "",
    careers: [],
    profile: Array.from({ length: dims }, () => 5),
    quadrant: "none",
    move: { role: "", step: "", output: "" },
    sample: false,
  };
}

/** Ganti token `{n}`, `{title}`, `{short}` di teks CMS. */
export const fill = (text, vars = {}) => String(text ?? "").replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? String(vars[k]) : m));
