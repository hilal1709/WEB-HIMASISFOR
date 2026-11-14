import { PEOPLE, initials } from "@/lib/struktur-content";
import { DOSEN_DEFAULTS, LECTURER_EXTRA } from "@/lib/dosen-cms/defaults";

/**
 * Data dosen (aman untuk klien) — dipakai /dosen, /bidang-keahlian, /bootcamp, dan Katalog Dosen.
 *
 * Sumber berlapis:
 *   1. Studio Bagan (Struktur Organisasi): nama, gelar, foto, jabatan, keahlian — semua anggota non-staf.
 *   2. Bawaan akademik `LECTURER_EXTRA` (mata kuliah & riset = CONTOH → tampil dengan PlaceholderTag).
 *   3. Katalog Dosen (`content.lecturers[]`): timpaan per field + dosen tambahan + sembunyi + urutan.
 * Jenjang pendidikan & sertifikasi diturunkan dari gelar kecuali ditimpa.
 */

export const CURTAIN_KEY = "sisfor:curtain:dosen";
export const BANNER_KEY = "sisfor:banner:dosen";

/** Gelar → jenjang pendidikan (urut tertinggi dulu). */
const DEGREES = [
  { re: /\bPh\.?D\b/, level: "S3", label: "Doctor of Philosophy" },
  { re: /^Dr\.?\s/, level: "S3", label: "Doktor", onName: true },
  { re: /\bM\.Eng\b/, level: "S2", label: "Master of Engineering" },
  { re: /\bM\.Kom\b/, level: "S2", label: "Magister Komputer" },
  { re: /\bM\.Sc\b/, level: "S2", label: "Master of Science" },
  { re: /\bM\.Si\b/, level: "S2", label: "Magister Sains" },
  { re: /\bM\.T\b/, level: "S2", label: "Magister Teknik" },
  { re: /\bS\.Kom\b/, level: "S1", label: "Sarjana Komputer" },
  { re: /\bS\.Si\b/, level: "S1", label: "Sarjana Sains" },
  { re: /\bS\.T\b/, level: "S1", label: "Sarjana Teknik" },
];

/** Kamus sertifikasi { KODE: label } dari daftar CMS. */
export const certMap = (certs = DOSEN_DEFAULTS.certs) => Object.fromEntries(certs.map((c) => [c.code.toUpperCase(), c.label]));

export function parseCredentials(name = "", credentials = "", certs = DOSEN_DEFAULTS.certs) {
  const education = [];
  const seen = new Set();
  for (const d of DEGREES) {
    const src = d.onName ? name : credentials;
    if (d.re.test(src)) {
      const key = `${d.level}-${d.label}`;
      if (seen.has(key)) continue;
      seen.add(key);
      education.push({ level: d.level, label: d.label });
    }
  }
  const dict = certMap(certs);
  const found = credentials
    .split(/[,\s]+/)
    .map((t) => t.replace(/\./g, "").toUpperCase())
    .filter((t) => dict[t]);
  return { education, certs: [...new Set(found)] };
}

export const splitList = (v) =>
  Array.isArray(v)
    ? v.filter(Boolean)
    : String(v ?? "")
        .split(/[;,]/)
        .map((s) => s.trim())
        .filter(Boolean);

/** Pecah "Nama, S.Kom., M.Kom." → { name, credentials }. */
export function splitName(full = "") {
  const i = full.indexOf(",");
  return i < 0 ? { name: full.trim(), credentials: "" } : { name: full.slice(0, i).trim(), credentials: full.slice(i + 1).trim() };
}

export const firstToken = (n = "") => n.replace(/^Dr\.?\s*/, "").split(/\s+/)[0]?.toLowerCase();
export const slugify = (s = "") =>
  s
    .toLowerCase()
    .replace(/^dr\.?\s*/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/** Orang Bagan yang dihitung dosen (non-staf). Yang disembunyikan di Bagan tetap boleh ditampilkan Katalog. */
export const baganLecturers = (people = PEOPLE) => people.filter((p) => p.group !== "staff");

/** Nilai dasar (sebelum timpaan Katalog) untuk satu orang Bagan. */
export function baseOf(p) {
  const extra = LECTURER_EXTRA[p.key] ?? {};
  return {
    name: p.name ?? "",
    credentials: p.credentials ?? "",
    role: p.role ?? "Dosen",
    photo: p.photo || "",
    photoAlt: "",
    slug: extra.slug ?? slugify(p.name),
    fields: extra.fields ?? [],
    quote: extra.quote ?? "",
    expertise: p.expertise ?? [],
    courses: extra.courses ?? [],
    research: extra.research ?? [],
    nuptk: "",
    email: "",
    links: { scholar: "", scopus: "", sinta: "" },
    education: [],
  };
}

const BLANK = baseOf({ key: "", name: "", role: "Dosen" });

/**
 * Gabungkan Bagan + Katalog → daftar dosen siap tampil.
 * `entries` = content.lecturers (timpaan). Urutan: urutan entri Katalog, lalu sisa orang Bagan (kaprodi dulu).
 * `withHidden` dipakai Katalog untuk menampilkan kartu yang disembunyikan.
 */
export function resolveLecturers(people = PEOPLE, entries = [], { certs = DOSEN_DEFAULTS.certs, withHidden = false } = {}) {
  const bagan = baganLecturers(people);
  const byKey = new Map(entries.map((e) => [e.key, e]));
  const ordered = [
    ...entries.filter((e) => e.source === "custom" || bagan.some((p) => p.key === e.key)).map((e) => e.key),
    ...bagan
      .filter((p) => !byKey.has(p.key))
      .sort((a, b) => (a.key === "kaprodi" ? -1 : b.key === "kaprodi" ? 1 : 0))
      .map((p) => p.key),
  ];

  const out = [];
  for (const key of ordered) {
    const person = bagan.find((p) => p.key === key);
    const entry = byKey.get(key) ?? {};
    const custom = entry.source === "custom" || !person;
    const base = person ? baseOf(person) : { ...BLANK, slug: slugify(entry.name || key) };
    const hidden = entry.hidden ?? (person ? Boolean(person.hidden) : false);
    if (hidden && !withHidden) continue;

    const pick = (k) => (entry[k] !== undefined ? entry[k] : base[k]);
    const name = pick("name");
    const credentials = pick("credentials");
    const derived = parseCredentials(name, credentials, certs);
    const education = entry.education?.length ? entry.education : derived.education;
    const links = { ...base.links, ...(entry.links ?? {}) };
    const clean = (v) => (v ? v : null);

    out.push({
      key,
      custom,
      hidden,
      slug: pick("slug") || slugify(name) || key,
      name,
      credentials,
      role: pick("role"),
      photo: clean(pick("photo")),
      photoAlt: pick("photoAlt"),
      initials: initials(name || "?"),
      expertise: pick("expertise"),
      fields: pick("fields"),
      quote: clean(pick("quote")),
      education,
      certs: derived.certs,
      courses: pick("courses"),
      research: pick("research"),
      nuptk: clean(pick("nuptk")),
      email: clean(pick("email")),
      links: { scholar: clean(links.scholar), scopus: clean(links.scopus), sinta: clean(links.sinta) },
      // contoh bawaan sampai diisi di Katalog
      sample: {
        courses: entry.courses === undefined && !custom && (LECTURER_EXTRA[key]?.courses?.length ?? 0) > 0,
        research: entry.research === undefined && !custom && (LECTURER_EXTRA[key]?.research?.length ?? 0) > 0,
      },
      inherited: Object.fromEntries(["name", "credentials", "role", "photo"].map((k) => [k, !custom && entry[k] === undefined])),
      base: person ? { name: base.name, credentials: base.credentials, role: base.role, photo: base.photo } : null,
    });
  }

  // slug unik
  const seen = new Map();
  for (const l of out) {
    const n = seen.get(l.slug) ?? 0;
    seen.set(l.slug, n + 1);
    if (n) l.slug = `${l.slug}-${n + 1}`;
  }
  return out;
}

/** Daftar bawaan (tanpa CMS). */
export const LECTURERS = resolveLecturers(PEOPLE);

/** Statistik turunan data nyata. */
export function lecturerStats(lecturers) {
  const doctors = lecturers.filter((l) => l.education.some((e) => e.level === "S3")).length;
  const certs = lecturers.reduce((n, l) => n + l.certs.length, 0);
  const topics = new Set(lecturers.flatMap((l) => l.expertise)).size;
  return [
    { value: lecturers.length, label: "Dosen tetap" },
    { value: doctors, label: "Bergelar doktor" },
    { value: certs, label: "Sertifikasi profesional" },
    { value: topics, label: "Topik keahlian" },
  ];
}
