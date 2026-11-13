/**
 * Skema isi Sambutan Kaprodi (aman untuk klien): bentuk data, pembersih input, dan daftar bab
 * yang dipakai Meja Sambutan. Server selalu menjalankan `cleanSambutan` sebelum menyimpan.
 */

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

/* ───────── bentuk ───────── */
const s = (max = 300) => ({ t: "s", max });
const url = { t: "url" };
const b = { t: "b" };
const n = (min, max) => ({ t: "n", min, max });
const e = (opts) => ({ t: "e", opts });
const l = (item, max = 20) => ({ t: "l", item, max });
const o = (fields) => ({ t: "o", fields });
const path = { t: "path" };
const viewBox = { t: "vb" };

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

const SAFE_URL = /^(\/(?!\/)|#|https?:\/\/|mailto:|tel:)/i;
const PATH_RE = /^[MmLlHhVvCcSsQqTtAaZz0-9.,\s-]+$/;
const VB_RE = /^-?\d+(\.\d+)?(\s+-?\d+(\.\d+)?){3}$/;

/** Bersihkan nilai sesuai bentuk; kunci tak dikenal dibuang, nilai buruk → undefined (pakai default). */
export function clean(spec, v) {
  switch (spec.t) {
    case "s":
      return typeof v === "string" ? v.replace(/\r\n/g, "\n").slice(0, spec.max) : undefined;
    case "url":
      if (typeof v !== "string") return undefined;
      return v === "" || SAFE_URL.test(v.trim()) ? v.trim().slice(0, 500) : undefined;
    case "b":
      return typeof v === "boolean" ? v : undefined;
    case "n": {
      const x = Number(v);
      return Number.isFinite(x) ? Math.min(spec.max, Math.max(spec.min, Math.round(x))) : undefined;
    }
    case "e":
      return spec.opts.includes(v) ? v : undefined;
    case "path":
      return typeof v === "string" && v.length <= 8000 && PATH_RE.test(v) ? v.trim() : undefined;
    case "vb":
      return typeof v === "string" && VB_RE.test(v.trim()) ? v.trim() : undefined;
    case "l":
      if (!Array.isArray(v)) return undefined;
      return v
        .slice(0, spec.max)
        .map((x) => clean(spec.item, x))
        .filter((x) => x !== undefined);
    case "o": {
      if (!v || typeof v !== "object" || Array.isArray(v)) return undefined;
      const out = {};
      for (const [k, f] of Object.entries(spec.fields)) {
        if (!(k in v)) continue;
        const c = clean(f, v[k]);
        if (c !== undefined) out[k] = c;
      }
      return out;
    }
    default:
      return undefined;
  }
}

export const cleanSambutan = (v) => clean(SHAPE, v) ?? null;

const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);

/** Gabung dalam: objek per kunci, array & primitif menimpa utuh. */
export function deepMerge(base, over) {
  if (!isObj(base) || !isObj(over)) return over === undefined ? base : over;
  const out = { ...base };
  for (const [k, v] of Object.entries(over)) out[k] = isObj(v) && isObj(base[k]) ? deepMerge(base[k], v) : v;
  return out;
}

/** Bab mana yang berbeda antara dua versi (untuk badge & modal terbit). */
export function changedChapters(a, b) {
  const keys = ["person", ...CHAPTERS.map((c) => c.key), "signature"];
  return keys.filter((k) => JSON.stringify(a?.[k] ?? null) !== JSON.stringify(b?.[k] ?? null));
}
