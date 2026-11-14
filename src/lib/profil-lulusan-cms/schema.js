/**
 * Skema isi Profil Lulusan (aman untuk klien): bentuk data, pembersih input, daftar tile Galeri Wisuda.
 * Server selalu menjalankan `cleanProfilLulusan` sebelum menyimpan.
 */
import { b, clean, e, l, n, o, s, sameJson, url } from "@/lib/cms/shape";
import { MASCOT_POSES } from "@/lib/sambutan-cms/schema";

export { MASCOT_POSES };

export const ROW = "profil-lulusan";
export const DRAFT_ROW = "profil-lulusan-draft";
/** Baris lama editor Profil/Konten — dibaca sebagai warisan sampai Galeri Wisuda pertama kali terbit. */
export const LEGACY_INTRO = "profil-alumni";
export const LEGACY_CAREER = "career";
export const LEGACY_ALUMNI = "infinite-alumni";
export const HISTORY_MAX = 5;

export const LIMITS = { profiles: 8, chips: 8, roles: 10, cpl: 6, cplItems: 10, stats: 6, alumni: 30, links: 6, breadcrumb: 5 };

/**
 * Tile Galeri Wisuda, urut seperti halaman publik. `anchor` = id section publik,
 * `span` = ukuran tile di hub bento (kolom lg dari 6).
 */
export const SCENES = [
  { key: "hero", label: "Panggung", hint: "Judul, jabatan berganti, video alumni", anchor: "pl-hero", span: "lg:col-span-4 lg:row-span-2" },
  { key: "curtain", label: "Tirai", hint: "Layar pembuka sekali per sesi", anchor: "top", span: "lg:col-span-2" },
  { key: "seo", label: "Meta", hint: "Mesin pencari & label contoh", anchor: "top", span: "lg:col-span-2" },
  { key: "profiles", label: "Jalur Profil", hint: "Dek kartu profil lulusan", anchor: "profil", span: "lg:col-span-3 lg:row-span-2" },
  { key: "cpl", label: "Capaian", hint: "Ranah capaian pembelajaran", anchor: "cpl", span: "lg:col-span-3" },
  { key: "stats", label: "Angka", hint: "Sorotan tracer study", anchor: "pl-stats", span: "lg:col-span-3" },
  { key: "alumni", label: "Dinding Alumni", hint: "Buku tahunan & kutipan", anchor: "alumni", span: "lg:col-span-4" },
  { key: "closing", label: "Penutup", hint: "Ajakan & tautan lanjutan", anchor: "pl-closing", span: "lg:col-span-2" },
];

/** Ilustrasi garis untuk tile CPL (kunci dari `ILLUSTRATIONS`). */
export const CPL_ILLUSTRATIONS = [
  ["knowledge", "Pengetahuan"],
  ["lecturer", "Dosen"],
  ["career", "Karier"],
  ["erp", "Sistem ERP"],
  ["industry", "Industri"],
  ["compass", "Kompas"],
  ["curriculum-map", "Peta kurikulum"],
  ["graduate-path", "Jalur lulusan"],
  ["graduation-fork", "Persimpangan"],
  ["rulebook", "Pedoman"],
  ["lecturer-network", "Jejaring"],
  ["podium", "Podium"],
];
const ILLU_KEYS = CPL_ILLUSTRATIONS.map(([k]) => k);

/** Lottie bawaan yang cocok sebagai ilustrasi profil (permukaan navy). */
export const PROFILE_LOTTIES = [
  ["/lottie/erp-gears-dark.json", "Roda gigi ERP"],
  ["/lottie/shield-audit-dark.json", "Perisai audit"],
  ["/lottie/data-chart-dark.json", "Grafik data"],
  ["/lottie/strategy-target-dark.json", "Target strategi"],
  ["/lottie/rocket-pmb-dark.json", "Roket"],
  ["/lottie/laptop-code-dark.json", "Laptop kode"],
  ["/lottie/briefcase-dark.json", "Koper kerja"],
  ["/lottie/certificate-dark.json", "Sertifikat"],
  ["/lottie/pkm-bulb-dark.json", "Bohlam ide"],
  ["/lottie/biz-shop-dark.json", "Toko bisnis"],
  ["/lottie/trophy-dark.json", "Piala"],
  ["/lottie/thesis-book-dark.json", "Buku"],
];

const LOTTIE = /^\/[\w\-/]+\.json$/;
const SLUG = /^[a-z0-9][a-z0-9-]{0,39}$/;
const mascot = o({ show: b, pose: e(MASCOT_POSES), say: s(120) });
const chips = (max = LIMITS.chips, len = 60) => l(s(len), max);

export const SHAPE = o({
  curtain: o({ enabled: b, title: s(40), accent: s(40), label: s(60) }),
  hero: o({
    breadcrumb: l(o({ label: s(60), href: url }), LIMITS.breadcrumb),
    titleTop: s(40),
    titleAccent: s(40),
    body: s(320),
    ctaLabel: s(40),
    rolesLead: s(80),
    roles: chips(LIMITS.roles, 40),
    collage: n(0, 6),
    storyLabel: s(40),
    video: o({ show: b, label: s(40), title: s(120), src: url, poster: url, duration: s(8) }),
    mascot,
  }),
  profiles: o({
    titleTop: s(60),
    titleAccent: s(60),
    body: s(280),
    autoplay: b,
    rolesLabel: s(30),
    detailLabel: s(30),
    modal: o({ kicker: s(40), competenciesLabel: s(40), rolesLabel: s(40), coursesLabel: s(40) }),
    items: l(
      o({
        key: s(40, SLUG),
        title: s(80),
        short: s(40),
        lottie: s(200, LOTTIE),
        summary: s(400),
        competencies: chips(),
        roles: chips(),
        courses: chips(),
        sample: b,
      }),
      LIMITS.profiles
    ),
  }),
  cpl: o({
    titleTop: s(60),
    titleAccent: s(60),
    body: s(280),
    kicker: s(16),
    visible: n(1, 6),
    moreLabel: s(40),
    lessLabel: s(20),
    sample: b,
    items: l(o({ key: s(40, SLUG), title: s(60), illustration: e(ILLU_KEYS), wide: b, items: l(s(260), LIMITS.cplItems) }), LIMITS.cpl),
  }),
  stats: o({
    label: s(60),
    sample: b,
    items: l(o({ value: n(0, 1000000), suffix: s(10), label: s(80) }), LIMITS.stats),
  }),
  alumni: o({
    titleTop: s(60),
    titleAccent: s(60),
    body: s(280),
    kicker: s(60),
    fallbackQuote: s(240),
    lottie: s(200, LOTTIE),
    mascot,
    items: l(o({ name: s(80), role: s(140), photo: url, quote: s(280), sample: b }), LIMITS.alumni),
  }),
  closing: o({
    titleTop: s(40),
    titleAccent: s(40),
    body: s(240),
    cta: o({ label: s(40), href: url }),
    note: s(120),
    mascot,
    links: l(o({ kicker: s(30), title: s(60), body: s(160), href: url }), LIMITS.links),
  }),
  seo: o({ title: s(90), description: s(200), sampleNote: s(60) }),
});

/** Ubah judul jadi slug kunci (deep link `#pl-<key>`). */
export const slugify = (t) =>
  String(t ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "item";

/** Kunci unik per daftar: tabrakan diberi akhiran -2, -3, … */
function uniqueKeys(list, fallback) {
  const seen = new Set();
  return list.map((it, i) => {
    let k = it.key || slugify(it.title) || `${fallback}-${i + 1}`;
    const base = k;
    let n = 2;
    while (seen.has(k)) k = `${base}-${n++}`.slice(0, 40);
    seen.add(k);
    return { ...it, key: k };
  });
}

/** Bersihkan + tegakkan aturan lintas field (kunci unik, tanpa chip kosong/ganda). */
export function cleanProfilLulusan(v) {
  const out = clean(SHAPE, v);
  if (!out) return null;
  const tidy = (arr) => [...new Set((arr ?? []).map((x) => x.trim()).filter(Boolean))];
  if (out.hero?.roles) out.hero.roles = tidy(out.hero.roles);
  if (out.profiles?.items) {
    out.profiles.items = uniqueKeys(out.profiles.items, "profil").map((p) => ({
      ...p,
      competencies: tidy(p.competencies),
      roles: tidy(p.roles),
      courses: tidy(p.courses),
    }));
  }
  if (out.cpl?.items) out.cpl.items = uniqueKeys(out.cpl.items, "cpl");
  return out;
}

/** Ganti token `{jumlah}` dengan angka. */
export const fillCount = (text, count) => String(text ?? "").replace(/\{jumlah\}/gi, String(count));

/** Tile mana yang berbeda antara dua versi (titik "berubah" & modal terbit). */
export function changedScenes(a, b) {
  return SCENES.map((x) => x.key).filter((k) => !sameJson(a?.[k], b?.[k]));
}
