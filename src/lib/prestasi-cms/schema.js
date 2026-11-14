/**
 * Skema isi halaman Prestasi (aman untuk klien): bentuk data, pembersih input, dan daftar ruang
 * Ruang Kurator. Server selalu menjalankan `cleanPrestasi` sebelum menyimpan.
 * Data prestasi (baris `Achievement`) tidak ada di sini — dikelola langsung lewat /api/achievements.
 */
import { b, clean, deepMerge, e, l, n, o, s, url } from "@/lib/cms/shape";

export { clean, deepMerge };

export const ROW = "prestasi-page";
export const DRAFT_ROW = "prestasi-page-draft";
export const LEGACY_ROWS = ["kisah-mawapres"];
export const HISTORY_MAX = 5;

export const LEVEL_KEYS = ["internasional", "nasional", "regional"];
export const CATEGORY_KEYS = ["mahasiswa", "dosen"];
export const MASCOT_POSES = ["wave", "thumbs-up", "confident", "proud", "think", "laugh", "run"];

/** Bab Panggung (teks halaman), urut seperti halaman publik. */
export const CHAPTERS = [
  { key: "hero", label: "Sampul", hint: "Judul, kata berputar, angka, pita juara" },
  { key: "archive", label: "Arsip", hint: "Kepala arsip, saringan, hasil kosong" },
  { key: "labels", label: "Istilah", hint: "Nama tingkat, kategori, dan peran" },
  { key: "story", label: "Kisah", hint: "Kutipan, video, dan pemeran kisah" },
  { key: "closing", label: "Penutup", hint: "Ajakan, tautan lapor, jalan lanjut" },
  { key: "modal", label: "Profil", hint: "Label modal peraih" },
  { key: "curtain", label: "Tirai", hint: "Layar pembuka sekali per sesi" },
  { key: "seo", label: "Meta", hint: "Judul & deskripsi mesin pencari" },
];

const mascot = o({ show: b, pose: e(MASCOT_POSES), say: s(120) });
const link = o({ label: s(60), href: url });

export const SHAPE = o({
  curtain: o({ enabled: b, title: s(40), accent: s(40), label: s(60) }),
  hero: o({
    breadcrumb: l(o({ label: s(60), href: url }), 5),
    titleTop: s(80),
    titleAccent: s(80),
    lead: s(40),
    rotateWords: l(s(40), 12),
    countTemplate: s(120),
    spanTemplate: s(80),
    body: s(400),
    ctaLabel: s(40),
    storyLinkLabel: s(60),
    chipsLabel: s(30),
    fame: o({ show: b, limit: n(3, 24) }),
    mascot,
  }),
  labels: o({
    levels: o({ internasional: s(30), nasional: s(30), regional: s(30) }),
    categories: o({ all: s(24), mahasiswa: s(24), dosen: s(24) }),
    ongoing: s(24),
    now: s(16),
  }),
  roles: l(o({ keyword: s(80), label: s(30) }), 16),
  roleFallback: s(30),
  archive: o({
    titleTop: s(60),
    titleAccent: s(60),
    body: s(280),
    lottie: url,
    searchPlaceholder: s(60),
    yearAllLabel: s(30),
    countLabel: s(80),
    clearLabel: s(40),
    groupLabel: s(40),
    pageSize: n(4, 40),
    moreLabel: s(40),
    doneToast: s(80),
    doneDetail: s(120),
    empty: o({ lottie: url, title: s(80), body: s(200), resetLabel: s(40) }),
  }),
  story: o({
    show: b,
    kicker: s(40),
    quote: s(400),
    accentWords: n(0, 12),
    lottie: url,
    people: l(o({ name: s(80), role: s(140), photo: url }), 6),
    video: o({ src: url, poster: url, title: s(120), duration: s(10) }),
    mascot,
  }),
  closing: o({
    show: b,
    lottie: url,
    titleTop: s(80),
    titleAccent: s(80),
    body: s(280),
    cta: link,
    report: link,
    next: l(o({ href: url, title: s(40), body: s(120) }), 6),
  }),
  modal: o({ countLabel: s(40), sinceLabel: s(40), description: s(160), prevLabel: s(40), nextLabel: s(40), lottie: url }),
  sample: o({ enabled: b }),
  seo: o({ title: s(90), description: s(200) }),
});

export const cleanPrestasi = (v) => clean(SHAPE, v) ?? null;

/** Bab mana yang berbeda antara dua versi (badge & modal terbit). `roles`/`roleFallback` ikut Istilah. */
export function changedChapters(a, b) {
  const diff = (k) => JSON.stringify(a?.[k] ?? null) !== JSON.stringify(b?.[k] ?? null);
  return CHAPTERS.map((c) => c.key).filter((k) => diff(k) || (k === "labels" && (diff("roles") || diff("roleFallback"))) || (k === "archive" && diff("sample")));
}

/** Isi `{token}` dengan nilai — untuk teks biasa (lihat juga `fillNodes` di klien). */
export const fill = (tpl = "", vars = {}) => String(tpl).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
