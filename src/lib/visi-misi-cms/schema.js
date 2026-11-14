/**
 * Skema isi Visi & Misi (aman untuk klien): bentuk data, pembersih input, daftar adegan Ruang Kompas.
 * Server selalu menjalankan `cleanVisiMisi` sebelum menyimpan.
 */
import { b, clean, e, l, n, o, s, sameJson, url } from "@/lib/cms/shape";
import { MASCOT_POSES } from "@/lib/sambutan-cms/schema";

export { MASCOT_POSES };

export const ROW = "visi-misi";
export const DRAFT_ROW = "visi-misi-draft";
/** Baris lama dari editor Profil — tetap dibaca (warisan) dan ikut diperbarui saat terbit. */
export const LEGACY_VISI = "visi";
export const LEGACY_MISI = "misi";
export const HISTORY_MAX = 5;

export const LIMITS = { misi: 8, roadmap: 10, stops: 6, highlights: 8, tags: 5 };

/** Adegan Ruang Kompas, urut seperti halaman publik. `anchor` = id section di halaman publik. */
export const SCENES = [
  { key: "curtain", label: "Tirai", hint: "Layar pembuka sekali per sesi", anchor: "top" },
  { key: "hero", label: "Cakrawala", hint: "Judul, tahun, maskot", anchor: "vm-hero" },
  { key: "visi", label: "Visi", hint: "Pernyataan & frasa sorotan", anchor: "visi" },
  { key: "misi", label: "Misi", hint: "Dek kartu misi", anchor: "misi" },
  { key: "roadmap", label: "Perjalanan", hint: "Tonggak menuju tujuan", anchor: "vm-roadmap" },
  { key: "closing", label: "Langkah", hint: "Halte tautan penutup", anchor: "vm-closing" },
  { key: "seo", label: "Meta", hint: "Tampilan di mesin pencari", anchor: "top" },
];

/** Ilustrasi garis yang cocok untuk kartu misi (kunci dari `ILLUSTRATIONS`). */
export const MISI_ILLUSTRATIONS = [
  ["lecturer", "Dosen"],
  ["industry", "Industri"],
  ["erp", "Sistem ERP"],
  ["knowledge", "Pengetahuan"],
  ["career", "Karier"],
  ["compass", "Kompas"],
  ["curriculum-map", "Peta kurikulum"],
  ["graduate-path", "Jalur lulusan"],
  ["lecturer-network", "Jejaring"],
  ["rulebook", "Pedoman"],
];
const ILLU_KEYS = MISI_ILLUSTRATIONS.map(([k]) => k);

const YEAR = /^\d{4}$/;
const mascot = o({ show: b, pose: e(MASCOT_POSES), say: s(120) });

export const SHAPE = o({
  curtain: o({ enabled: b, title: s(40), accent: s(40), label: s(60) }),
  hero: o({
    breadcrumb: l(o({ label: s(60), href: url }), 5),
    kicker: s(80),
    titleTop: s(60),
    titleAccent: s(60),
    subtitle: s(280),
    ctaLabel: s(40),
    yearFrom: n(1900, 2100),
    yearTo: n(1900, 2100),
    showHorizon: b,
    mascot,
  }),
  visi: o({
    label: s(40),
    sublabel: s(120),
    text: s(900),
    highlights: l(s(60), LIMITS.highlights),
    caption: s(120),
    mascot,
  }),
  misi: o({
    titleTop: s(60),
    titleAccent: s(60),
    intro: s(240),
    moreLabel: s(30),
    sampleNote: s(80),
    items: l(o({ key: s(40), text: s(400), detail: s(600), tags: l(s(40), LIMITS.tags), illustration: e(ILLU_KEYS), sample: b }), LIMITS.misi),
  }),
  roadmap: o({
    titleTop: s(60),
    titleAccent: s(60),
    body: s(240),
    sampleLabel: s(30),
    prevLabel: s(30),
    nextLabel: s(30),
    items: l(o({ year: s(4, YEAR), title: s(80), body: s(240), sample: b, goal: b }), LIMITS.roadmap),
  }),
  closing: o({
    titleTop: s(60),
    titleAccent: s(60),
    mascot,
    stops: l(o({ kicker: s(30), title: s(60), body: s(160), href: url, final: b }), LIMITS.stops),
  }),
  seo: o({ title: s(90), description: s(200) }),
});

/** Hanya satu item boleh bertanda `key` (tujuan / halte akhir). */
function onlyOne(list, key) {
  let seen = false;
  return list.map((it) => {
    if (!it[key]) return it;
    if (seen) return { ...it, [key]: false };
    seen = true;
    return it;
  });
}

/** Bersihkan + tegakkan aturan lintas field (frasa sorotan harus ada di teks visi, satu tujuan, satu halte akhir). */
export function cleanVisiMisi(v) {
  const out = clean(SHAPE, v);
  if (!out) return null;
  if (out.visi?.highlights && typeof out.visi.text === "string") {
    const t = out.visi.text.toLowerCase();
    out.visi.highlights = [...new Set(out.visi.highlights.map((h) => h.trim()).filter((h) => h && t.includes(h.toLowerCase())))];
  }
  if (out.roadmap?.items) out.roadmap.items = onlyOne(out.roadmap.items, "goal");
  if (out.closing?.stops) out.closing.stops = onlyOne(out.closing.stops, "final");
  return out;
}

const NUM = ["Nol", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh"];
/** Ganti token `{jumlah}` dengan jumlah misi dalam kata ("Lima"). */
export const fillCount = (text, count) => String(text ?? "").replace(/\{jumlah\}/gi, NUM[count] ?? String(count));

/** Adegan mana yang berbeda antara dua versi (untuk titik rel & modal terbit). */
export function changedScenes(a, b) {
  return SCENES.map((x) => x.key).filter((k) => !sameJson(a?.[k], b?.[k]));
}
