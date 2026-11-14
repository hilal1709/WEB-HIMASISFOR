/**
 * Skema isi halaman Dosen (aman untuk klien): bentuk data, pembersih input, dan daftar laci
 * Katalog Dosen. Server selalu menjalankan `cleanDosen` sebelum menyimpan.
 *
 * `lecturers[]` hanya menyimpan TIMPAAN: kunci yang tidak ada = ikut Studio Bagan / bawaan.
 */
import { b, clean, deepMerge, e, l, o, s, url } from "@/lib/cms/shape";

export { clean, deepMerge };

export const ROW = "dosen-page";
export const DRAFT_ROW = "dosen-page-draft";
export const LEGACY_ROWS = ["profil-dosen", "dosen"];
export const HISTORY_MAX = 5;

export const MASCOT_POSES = ["wave", "thumbs-up", "confident", "proud", "think", "laugh", "run"];
export const LEVELS = ["S1", "S2", "S3"];
export const LINK_KEYS = ["scholar", "scopus", "sinta"];
/** Field identitas yang bisa ditimpa (default dari Studio Bagan). */
export const IDENTITY = ["name", "credentials", "role", "photo"];

/** Laci Katalog Dosen, urut seperti halaman publik. */
export const DRAWERS = [
  { key: "lecturers", label: "Dosen", code: "A", hint: "Kartu tiap dosen: identitas, rumpun, ajar, riset" },
  { key: "curtain", label: "Tirai", code: "B", hint: "Layar pembuka sekali per sesi" },
  { key: "hero", label: "Sampul", code: "C", hint: "Judul, pencarian, video, maskot" },
  { key: "directory", label: "Direktori", code: "D", hint: "Kepala direktori & hasil kosong" },
  { key: "fields", label: "Rumpun", code: "E", hint: "Rumpun keahlian & ilustrasinya" },
  { key: "map", label: "Peta", code: "F", hint: "Section peta rumpun" },
  { key: "closing", label: "Penutup", code: "G", hint: "Ajakan kolaborasi & tautan lanjut" },
  { key: "modal", label: "Profil", code: "H", hint: "Label modal profil & sertifikasi" },
  { key: "seo", label: "Meta", code: "I", hint: "Judul & deskripsi mesin pencari" },
];

const mascot = o({ show: b, pose: e(MASCOT_POSES), say: s(120) });
const slug = s(60, /^[a-z0-9-]*$/);

export const LECTURER = o({
  key: s(60, /^[a-z0-9-]+$/),
  source: e(["bagan", "custom"]),
  hidden: b,
  name: s(120),
  credentials: s(160),
  role: s(160),
  photo: url,
  photoAlt: s(200),
  slug,
  fields: l(s(40), 8),
  quote: s(280),
  expertise: l(s(80), 16),
  courses: l(s(100), 16),
  research: l(s(200), 12),
  nuptk: s(30),
  email: s(120),
  links: o({ scholar: url, scopus: url, sinta: url }),
  education: l(o({ level: e(LEVELS), label: s(120) }), 6),
});

export const SHAPE = o({
  curtain: o({ enabled: b, title: s(40), accent: s(40), label: s(60) }),
  hero: o({
    breadcrumb: l(o({ label: s(60), href: url }), 5),
    titleTop: s(80),
    titleAccent: s(80),
    rotatePrefix: s(40),
    rotateWords: l(s(40), 12),
    countLabel: s(40),
    topicLabel: s(40),
    intro: s(400),
    search: o({ placeholder: s(100), tryLabel: s(20), allLabel: s(30), submitLabel: s(20) }),
    mascot,
    video: o({ show: b, label: s(40), src: url, poster: url, title: s(120), duration: s(10) }),
  }),
  directory: o({
    titleTop: s(60),
    titleAccent: s(60),
    body: s(280),
    sampleLabel: s(60),
    cardCta: s(30),
    leadBadge: s(20),
    empty: o({ title: s(80), body: s(200), resetLabel: s(30) }),
  }),
  fields: l(o({ key: s(40, /^[a-z0-9-]+$/), name: s(60), short: s(24), body: s(200), lottie: url }), 8),
  map: o({ show: b, titleTop: s(60), titleAccent: s(60), body: s(280), ctaLabel: s(40) }),
  closing: o({
    show: b,
    titleTop: s(80),
    titleAccent: s(80),
    body: s(280),
    ways: l(s(40), 8),
    cta: o({ label: s(40), href: url }),
    mascot,
    next: l(o({ href: url, kicker: s(24), title: s(60), body: s(120) }), 6),
  }),
  modal: o({
    labels: o({
      tabProfile: s(24), tabTeach: s(24), tabResearch: s(24),
      expertise: s(40), education: s(40), certs: s(40), courses: s(40), research: s(40),
      nuptk: s(24), email: s(24), pending: s(24), fallback: s(60), prev: s(40), next: s(40),
    }),
    links: o({ scholar: s(30), scopus: s(30), sinta: s(30) }),
  }),
  certs: l(o({ code: s(12, /^[A-Za-z0-9]+$/), label: s(120) }), 24),
  lecturers: l(LECTURER, 40),
  seo: o({ title: s(90), description: s(200) }),
});

export const cleanDosen = (v) => clean(SHAPE, v) ?? null;

/** Laci mana yang berbeda antara dua versi (badge & slip terbit). `certs` ikut laci Profil. */
export function changedDrawers(a, b) {
  const diff = (k) => JSON.stringify(a?.[k] ?? null) !== JSON.stringify(b?.[k] ?? null);
  return DRAWERS.map((d) => d.key).filter((k) => diff(k) || (k === "modal" && diff("certs")));
}

/** Dosen mana yang berubah (per key). */
export function changedLecturers(a = [], b = []) {
  const keys = new Set([...a, ...b].map((x) => x.key));
  const by = (list, k) => JSON.stringify(list.find((x) => x.key === k) ?? null);
  return [...keys].filter((k) => by(a, k) !== by(b, k));
}
