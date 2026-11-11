import { PEOPLE, initials } from "@/lib/struktur-content";

/**
 * Konten halaman Dosen (/dosen).
 *
 * Data PASTI: nama, gelar, foto, jabatan, dan bidang keahlian (sama dengan Struktur Organisasi & /profile).
 * Data TURUNAN (bukan karangan): jenjang pendidikan & sertifikasi dibaca dari `credentials`.
 * Data CONTOH (`sample`): mata kuliah & topik riset → tampil dengan PlaceholderTag.
 * NUPTK, email, dan tautan Google Scholar / Scopus / SINTA kosong ("menyusul") sampai diisi dari CMS (tidak dikarang).
 *
 * CMS:
 *   PageContent section "profil-dosen" (editor Admin › Profil)  → data.dosens[] { name, expertise, image, nuptk?, email?, scholar?, scopus?, sinta? }
 *     dicocokkan per nama depan; dosen baru di CMS ikut tampil.
 *   PageContent section "dosen" (opsional) → content = intro hero,
 *     data.lecturers[] ditimpa per `slug` (field apa pun di bawah: nuptk, email, courses, research, links { scholar, scopus, sinta }, fields…).
 */

export const CURTAIN_KEY = "sisfor:curtain:dosen";
export const BANNER_KEY = "sisfor:banner:dosen";

export const INTRO = {
  body: "Akademisi bersertifikat yang juga praktisi: tata kelola TI, ERP, data, dan strategi sistem informasi diajarkan langsung oleh orang yang mengerjakannya di industri.",
};

/** Rumpun keahlian. `lottie` = ilustrasi versi gelap (dipasang di cakram navy). */
export const FIELDS = [
  { key: "tata-kelola", name: "Tata Kelola & Audit TI", short: "Tata Kelola", lottie: "/lottie/shield-audit-dark.json", body: "IT governance, data governance, layanan TI, dan audit sistem." },
  { key: "enterprise", name: "Enterprise & ERP", short: "Enterprise", lottie: "/lottie/erp-gears-dark.json", body: "Sistem ERP, rantai pasok, dan proses bisnis perusahaan." },
  { key: "data", name: "Data & Keputusan", short: "Data", lottie: "/lottie/data-chart-dark.json", body: "Statistika, peramalan, data science, dan sistem pendukung keputusan." },
  { key: "strategi", name: "Strategi & Arsitektur SI", short: "Strategi", lottie: "/lottie/strategy-target-dark.json", body: "Perencanaan strategis SI, enterprise architecture, dan teknologi pendidikan." },
];

/** Tambahan per dosen (key = key PEOPLE). courses & research = CONTOH. */
const EXTRA = {
  kaprodi: {
    slug: "grandys",
    fields: ["strategi", "tata-kelola"],
    quote: "Sistem informasi yang baik selalu berangkat dari strategi bisnis, bukan dari teknologinya.",
    courses: ["Perencanaan Strategis SI", "Arsitektur Enterprise", "Manajemen Risiko TI"],
    research: ["Penyelarasan strategi bisnis dan TI di industri manufaktur", "Kerangka arsitektur enterprise untuk BUMN"],
  },
  ardhi: {
    slug: "ardhi",
    fields: ["tata-kelola"],
    courses: ["Tata Kelola TI", "Manajemen Layanan TI", "Tata Kelola Data"],
    research: ["Kematangan tata kelola data di perguruan tinggi", "Penerapan ITIL pada layanan TI korporat"],
  },
  putri: {
    slug: "putri",
    fields: ["enterprise", "data"],
    courses: ["Pemodelan Sistem", "Sistem Dinamik", "Manajemen Rantai Pasok"],
    research: ["Model sistem dinamik untuk rantai pasok semen", "Simulasi kebijakan persediaan berbasis data"],
  },
  brina: {
    slug: "brina",
    fields: ["data"],
    courses: ["Statistika", "Peramalan Bisnis", "Sistem Pendukung Keputusan"],
    research: ["Peramalan permintaan dengan model hibrida", "Sistem pendukung keputusan cerdas untuk UMKM"],
  },
  catur: {
    slug: "catur",
    fields: ["data", "strategi"],
    courses: ["Data Science", "Rekayasa Perangkat Lunak", "Teknologi Pendidikan"],
    research: ["Analitik pembelajaran pada platform daring", "Rekayasa kebutuhan aplikasi pendidikan"],
  },
  tikno: {
    slug: "tikno",
    fields: ["enterprise", "tata-kelola"],
    courses: ["Sistem Enterprise (ERP)", "Audit Sistem Informasi", "Perilaku Konsumen Digital"],
    research: ["Evaluasi pasca-implementasi ERP", "Audit TI berbasis COBIT di sektor industri"],
  },
};

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

/** Sertifikasi profesional yang muncul di gelar. */
export const CERTS = {
  MCE: "Microsoft Certified Educator",
  MOS: "Microsoft Office Specialist",
  MCF: "Microsoft Certified Fundamentals",
  CIIQA: "Certified International Indonesian Quality Assurance",
};

export function parseCredentials(name = "", credentials = "") {
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
  const certs = credentials
    .split(/[,\s]+/)
    .map((t) => t.replace(/\./g, ""))
    .filter((t) => CERTS[t]);
  return { education, certs: [...new Set(certs)] };
}

const splitList = (v) =>
  Array.isArray(v)
    ? v.filter(Boolean)
    : String(v ?? "")
        .split(/[;,]/)
        .map((s) => s.trim())
        .filter(Boolean);

/** Pecah "Nama, S.Kom., M.Kom." → { name, credentials }. */
function splitName(full = "") {
  const i = full.indexOf(",");
  return i < 0 ? { name: full.trim(), credentials: "" } : { name: full.slice(0, i).trim(), credentials: full.slice(i + 1).trim() };
}

const firstToken = (n) => n.replace(/^Dr\.?\s*/, "").split(/\s+/)[0]?.toLowerCase();
const slugify = (s) => s.toLowerCase().replace(/^dr\.?\s*/, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function build(p, extra = {}) {
  const { education, certs } = parseCredentials(p.name, p.credentials);
  return {
    key: p.key,
    slug: extra.slug ?? slugify(p.name),
    name: p.name,
    credentials: p.credentials,
    role: p.role,
    photo: p.photo,
    initials: initials(p.name),
    expertise: p.expertise ?? [],
    fields: extra.fields ?? [],
    quote: extra.quote ?? null,
    education,
    certs,
    courses: extra.courses ?? [],
    research: extra.research ?? [],
    nuptk: extra.nuptk ?? null,
    email: extra.email ?? null,
    links: { scholar: null, scopus: null, sinta: null, ...(extra.links ?? {}) },
    sample: { courses: true, research: true },
  };
}

export const LECTURERS = PEOPLE.filter((p) => p.group !== "staff").map((p) => build(p, EXTRA[p.key]));

const parse = (v) => {
  if (!v) return null;
  if (typeof v === "object") return v;
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
};

/** Gabungkan baris CMS (`profil-dosen`, `dosen`) ke fallback. */
export function mergeDosen(rows = []) {
  const profil = parse(rows.find((r) => r.section === "profil-dosen")?.data);
  const page = rows.find((r) => r.section === "dosen");
  const pageData = parse(page?.data) ?? {};

  let lecturers = LECTURERS.map((l) => ({ ...l }));

  // 1) editor lama Admin › Profil › Profil Dosen
  const cms = Array.isArray(profil?.dosens) ? profil.dosens.filter((d) => d?.name) : [];
  for (const d of cms) {
    const { name, credentials } = splitName(d.name);
    const hit = lecturers.find((l) => firstToken(l.name) === firstToken(name));
    if (hit) {
      Object.assign(hit, {
        name,
        credentials: credentials || hit.credentials,
        photo: d.image || hit.photo,
        expertise: splitList(d.expertise).length ? splitList(d.expertise) : hit.expertise,
        nuptk: d.nuptk || hit.nuptk,
        email: d.email || hit.email,
        links: { ...hit.links, ...(d.scholar && { scholar: d.scholar }), ...(d.scopus && { scopus: d.scopus }), ...(d.sinta && { sinta: d.sinta }) },
      });
      Object.assign(hit, parseCredentials(hit.name, hit.credentials));
    } else {
      lecturers.push(build({ key: slugify(name), name, credentials, role: "Dosen", photo: d.image || null, expertise: splitList(d.expertise) }));
    }
  }

  // 2) override per slug dari section "dosen"
  const over = Array.isArray(pageData.lecturers) ? pageData.lecturers : [];
  lecturers = lecturers.map((l) => {
    const o = over.find((x) => x?.slug === l.slug);
    if (!o) return l;
    return {
      ...l,
      ...o,
      links: { ...l.links, ...(o.links ?? {}) },
      sample: { courses: o.courses ? false : l.sample.courses, research: o.research ? false : l.sample.research },
    };
  });

  // Kaprodi selalu pertama
  lecturers.sort((a, b) => (a.key === "kaprodi" ? -1 : b.key === "kaprodi" ? 1 : 0));

  const body = page?.content?.trim();
  return {
    intro: { body: body && body.length > 40 ? body : INTRO.body },
    fields: FIELDS,
    lecturers,
  };
}

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
