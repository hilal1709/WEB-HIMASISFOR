/**
 * Konten halaman Prestasi (`/achievement`).
 * Sumber utama: model `Achievement` (Admin › Prestasi). Baris kembar (seed ganda) dibuang.
 * Bila DB kosong/gagal → contoh dari `ACHIEVEMENTS` beranda, ditandai `sample` (PlaceholderTag).
 */
import { ACHIEVEMENTS } from "./home-content";

export const CURTAIN_KEY = "sisfor:curtain:prestasi";
export const BANNER_KEY = "sisfor:banner:prestasi";

export const INTRO = {
  title: ["Jejak juara,", "dari kelas ke panggung"],
  lead: "Panggung",
  rotate: ["konferensi internasional", "kejuaraan nasional", "kompetisi desain", "sertifikasi Microsoft", "forum human capital"],
  body: "Dosen yang dipercaya menjadi editor, reviewer, dan profesor tamu di luar negeri; mahasiswa yang naik podium kejuaraan nasional dan tampil di konferensi internasional. Semuanya tercatat di sini.",
};

/**
 * Band "Kisah sukses" — bisa ditimpa CMS `PageContent` section `kisah-mawapres`
 * (Admin › Konten Profil › Kisah Mawapres): `title` judul kecil, `content` kutipan/cerita,
 * `subtitle` URL video (.mp4), `image` poster video, `data.people[] {name, role, photo}` para mahasiswa di video.
 */
export const STORY_SECTION = "kisah-mawapres";
export const STORY = {
  kicker: "Kisah sukses",
  quote: "Magang bersertifikat, pertukaran mahasiswa, dan kompetisi: cerita mahasiswa berprestasi Sistem Informasi UISI tentang belajar di luar kelas.",
  people: [{ name: "Felix Atmaja", role: "Mahasiswa Berprestasi Sistem Informasi UISI 2023", photo: "/img/mhs/felix.png" }],
  video: { src: "/video/mawapres.mp4", poster: "/video/mawapres.jpg", title: "Kisah Sukses Mawapres Sistem Informasi UISI", duration: "2:31" },
};

/** Gabungkan baris CMS `kisah-mawapres` dengan default. `sample` = belum diisi CMS. */
export function mergeStory(row, normalize = (x) => x) {
  if (!row) return { ...STORY, sample: true };
  let data = row.data;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      data = null;
    }
  }
  const people = (Array.isArray(data?.people) ? data.people : [])
    .filter((p) => p?.name?.trim())
    .map((p) => ({ name: p.name.trim(), role: p.role?.trim() || "", photo: normalize(p.photo) }));
  return {
    kicker: row.title?.trim() || STORY.kicker,
    quote: row.content?.trim() || STORY.quote,
    people: people.length ? people : STORY.people,
    video: {
      ...STORY.video,
      src: row.subtitle?.trim() || STORY.video.src,
      poster: normalize(row.image) || STORY.video.poster,
      duration: row.subtitle?.trim() ? "" : STORY.video.duration,
    },
    sample: !people.length,
  };
}

/** Tingkat prestasi: urutan = anak tangga podium (tertinggi di tengah). */
export const LEVELS = [
  { key: "internasional", label: "Internasional", step: 1 },
  { key: "nasional", label: "Nasional", step: 2 },
  { key: "regional", label: "Regional", step: 3 },
];

export const CATEGORIES = [
  { key: "all", label: "Semua" },
  { key: "mahasiswa", label: "Mahasiswa" },
  { key: "dosen", label: "Dosen" },
];

/** Peran dibaca dari judul prestasi — hanya untuk label kecil di kartu. */
const ROLES = [
  [/juara/i, "Juara"],
  [/finalis/i, "Finalis"],
  [/editor/i, "Editor"],
  [/visiting/i, "Profesor tamu"],
  [/presenter/i, "Presenter"],
  [/reviewer|moderator/i, "Reviewer"],
  [/delegasi/i, "Delegasi"],
  [/riset|hibah/i, "Riset"],
];

const THIS_YEAR = new Date().getFullYear();

export function slugify(s = "") {
  return String(s)
    .split(",")[0]
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\b(prof|dr|ir)\.?\s+/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** "Prof. Basuki Widodo, S.Si., M.Si., Ph.D." → "Prof. Basuki Widodo" */
export const shortName = (name = "") => String(name).split(",")[0].trim();

export function initials(name = "") {
  return shortName(name)
    .replace(/\b(Prof|Dr|Ir)\.?\s+/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function normalizeLevel(raw = "") {
  const t = String(raw).toLowerCase();
  if (t.includes("inter")) return "internasional";
  if (t.includes("nasi")) return "nasional";
  return "regional";
}

/** "2015, 2018, 2022" → { years:[2015,2018,2022] }, "2017 - Sekarang" → { years:[2017], ongoing:true } */
export function parseYears(raw = "") {
  const text = String(raw ?? "");
  const years = [...text.matchAll(/(19|20)\d{2}/g)].map((m) => Number(m[0])).sort((a, b) => a - b);
  const ongoing = /sekarang|kini|present|now/i.test(text);
  const label = ongoing ? `${years[0] ?? ""}–kini` : years.join(" · ") || text;
  return { years, ongoing, label, latest: ongoing ? THIS_YEAR + 1 : years.at(-1) ?? 0 };
}

function role(title) {
  return ROLES.find(([re]) => re.test(title))?.[1] ?? "Rekognisi";
}

function build(rows, sample) {
  const seen = new Set();
  const items = [];
  for (const r of rows) {
    const key = `${r.achieverName}|${r.title}|${r.tahun}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const y = parseYears(r.tahun);
    items.push({
      id: String(r.id ?? items.length),
      title: r.title,
      description: r.description || null,
      name: r.achieverName,
      short: shortName(r.achieverName),
      slug: slugify(r.achieverName),
      category: r.category === "dosen" ? "dosen" : "mahasiswa",
      level: normalizeLevel(r.tingkatan),
      levelLabel: r.tingkatan || "Regional",
      role: role(r.title),
      years: y.years,
      yearLabel: y.label,
      ongoing: y.ongoing,
      latest: y.latest,
      group: y.ongoing ? "Berjalan" : String(y.latest || "—"),
      photo: r.image || null,
    });
  }
  // terbaru dulu; dalam satu tahun: internasional → nasional → regional
  const rank = (l) => LEVELS.find((x) => x.key === l)?.step ?? 9;
  items.sort((a, b) => b.latest - a.latest || rank(a.level) - rank(b.level) || a.short.localeCompare(b.short));

  const map = new Map();
  for (const it of items) {
    if (!map.has(it.slug)) {
      map.set(it.slug, { slug: it.slug, name: it.name, short: it.short, initials: initials(it.name), category: it.category, photo: it.photo, items: [] });
    }
    const a = map.get(it.slug);
    a.items.push(it);
    a.photo ||= it.photo;
  }
  const achievers = [...map.values()].map((a) => ({
    ...a,
    top: a.items.reduce((best, it) => (rank(it.level) < rank(best) ? it.level : best), "regional"),
    since: Math.min(...a.items.flatMap((i) => i.years).filter(Boolean)),
  }));
  // foto peraih dipakai juga untuk item tanpa foto
  for (const it of items) it.photo ||= map.get(it.slug)?.photo ?? null;

  const groups = [];
  for (const it of items) {
    const g = groups.find((x) => x.key === it.group);
    g ? g.items.push(it) : groups.push({ key: it.group, items: [it] });
  }

  const allYears = items.flatMap((i) => i.years);
  const stats = [
    { label: "Prestasi tercatat", value: items.length },
    { label: "Tingkat internasional", value: items.filter((i) => i.level === "internasional").length },
    { label: "Tingkat nasional", value: items.filter((i) => i.level === "nasional").length },
    { label: "Dosen & mahasiswa peraih", value: achievers.length },
  ];

  return {
    sample,
    items,
    achievers,
    groups,
    years: [...new Set(items.map((i) => i.group))],
    span: allYears.length ? [Math.min(...allYears), Math.max(...allYears)] : null,
    stats,
    featured: pickFeatured(items),
    rotate: INTRO.rotate,
  };
}

/** Hall of fame: satu sorotan per orang, utamakan juara & internasional, mahasiswa dulu, yang berfoto. */
function pickFeatured(items) {
  const score = (i) =>
    (i.role === "Juara" ? 40 : 0) +
    (i.level === "internasional" ? 30 : i.level === "nasional" ? 15 : 0) +
    (i.category === "mahasiswa" ? 12 : 0) +
    (i.photo ? 10 : 0) +
    (["Editor", "Profesor tamu", "Presenter"].includes(i.role) ? 8 : 0) +
    i.latest / 1000;
  const seen = new Set();
  return [...items]
    .sort((a, b) => score(b) - score(a))
    .filter((i) => !seen.has(i.slug) && seen.add(i.slug))
    .slice(0, 8);
}

/** Contoh bila CMS kosong (dari kartu beranda). */
function sampleRows() {
  const out = [];
  for (const [cat, list] of Object.entries(ACHIEVEMENTS.tabs)) {
    list.forEach((a, i) =>
      out.push({
        id: `${cat}-${i}`,
        achieverName: cat === "dosen" ? `Dosen Sisfor ${i + 1}` : `Tim Mahasiswa ${i + 1}`,
        title: a.title,
        description: a.body,
        category: cat,
        tingkatan: a.level,
        tahun: String(2026 - i),
        image: a.image,
      })
    );
  }
  return out;
}

export function mergePrestasi(rows) {
  if (Array.isArray(rows) && rows.length) return build(rows, false);
  return build(sampleRows(), true);
}
