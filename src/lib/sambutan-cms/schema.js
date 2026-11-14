/**
 * Skema isi Sambutan Kaprodi (aman untuk klien): bentuk data, pembersih input, dan daftar bab
 * yang dipakai Meja Sambutan. Server selalu menjalankan `cleanSambutan` sebelum menyimpan.
 */

import { b, clean, deepMerge, e, l, n, o, path, s, url, viewBox } from "@/lib/cms/shape";

export { clean, deepMerge };

export const ROW = "sambutan";
export const DRAFT_ROW = "sambutan-draft";
export const LEGACY_ROW = "sambutan-kaprodi";
export const HISTORY_MAX = 5;

export const MASCOT_POSES = ["wave", "thumbs-up", "confident", "proud", "think", "laugh", "run"];
export const BANNER_VARIANTS = ["brand", "info", "success", "warning"];

/** Bab-bab Meja Sambutan, urut seperti halaman publik. */
export const CHAPTERS = [
  { key: "curtain", label: "Tirai", hint: "Layar pembuka sekali per sesi" },
  { key: "hero", label: "Sampul", hint: "Judul, potret, maskot" },
  { key: "letter", label: "Surat", hint: "Salam, paragraf, kutipan, tanda tangan" },
  { key: "profile", label: "Profil", hint: "Isi modal profil lengkap" },
  { key: "seo", label: "Meta", hint: "Judul & deskripsi mesin pencari" },
];

export const SHAPE = o({
  person: o({ name: s(120), credentials: s(160), role: s(160), photo: url, photoAlt: s(200) }),
  curtain: o({ enabled: b, title: s(40), accent: s(40), label: s(60) }),
  hero: o({
    breadcrumb: l(o({ label: s(60), href: url }), 5),
    titleTop: s(80),
    titleAccent: s(80),
    subtitle: s(280),
    readLabel: s(40),
    profileLabel: s(40),
    showLottie: b,
    lottie: url,
    mascot: o({ show: b, pose: e(MASCOT_POSES), say: s(120) }),
  }),
  letter: o({
    banner: o({ show: b, variant: e(BANNER_VARIANTS), title: s(120), body: s(240), linkLabel: s(40), href: url }),
    greeting: s(300),
    paragraphs: l(s(2000), 12),
    quote: s(400),
    quoteAfter: n(0, 12),
    closing: s(300),
    signOff: s(60),
    progressLabels: l(s(40), 4),
    profileButtonLabel: s(30),
  }),
  signature: o({ mode: e(["draw", "svg"]), viewBox, paths: l(path, 24), svgUrl: url, accentLast: b }),
  profile: o({
    intro: s(300),
    researchLabel: s(40),
    research: l(s(80), 12),
    educationLabel: s(40),
    education: l(o({ degree: s(120), place: s(160) }), 8),
    certificationsLabel: s(40),
    certifications: l(s(120), 12),
    contact: o({ label: s(40), href: url }),
  }),
  seo: o({ title: s(90), description: s(200) }),
});

export const cleanSambutan = (v) => clean(SHAPE, v) ?? null;

/** Bab mana yang berbeda antara dua versi (untuk badge & modal terbit). */
export function changedChapters(a, b) {
  const keys = ["person", ...CHAPTERS.map((c) => c.key), "signature"];
  return keys.filter((k) => JSON.stringify(a?.[k] ?? null) !== JSON.stringify(b?.[k] ?? null));
}
