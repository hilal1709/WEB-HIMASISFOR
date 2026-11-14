/**
 * Olahan data halaman Prestasi (`/achievement`) — util murni, tanpa teks paten.
 * Sumber baris: model `Achievement` (Ruang Kurator › Vitrin). Semua label (tingkat, kategori, peran,
 * "berjalan") datang dari isi CMS (`@/lib/prestasi-cms`). Baris kembar (seed ganda) dibuang.
 * Bila DB kosong & `sample.enabled` → contoh dari kartu beranda, ditandai `sample` (PlaceholderTag).
 */
import { ACHIEVEMENTS } from "./home-content";
import { LEVEL_KEYS } from "./prestasi-cms/schema";

export const CURTAIN_KEY = "sisfor:curtain:prestasi";

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
export function parseYears(raw = "", now = "kini") {
  const text = String(raw ?? "");
  const years = [...text.matchAll(/(19|20)\d{2}/g)].map((m) => Number(m[0])).sort((a, b) => a - b);
  const ongoing = /sekarang|kini|present|now/i.test(text);
  const label = ongoing ? `${years[0] ?? ""}–${now}` : years.join(" · ") || text;
  return { years, ongoing, label, latest: ongoing ? THIS_YEAR + 1 : years.at(-1) ?? 0 };
}

/** Tingkat berurutan (anak tangga podium) dengan label dari CMS. */
export const levelList = (labels) => LEVEL_KEYS.map((key, i) => ({ key, label: labels?.levels?.[key] || key, step: i + 1 }));
export const categoryList = (labels) => ["all", "mahasiswa", "dosen"].map((key) => ({ key, label: labels?.categories?.[key] || key }));

/** Peran dibaca dari judul: kata kunci (dipisah koma) → label. Urutan daftar = prioritas sorotan. */
function roleOf(title, roles, fallback) {
  const t = String(title).toLowerCase();
  const i = roles.findIndex((r) =>
    String(r.keyword ?? "")
      .split(",")
      .map((k) => k.trim().toLowerCase())
      .some((k) => k && t.includes(k))
  );
  return i < 0 ? { role: fallback, rank: 0 } : { role: roles[i].label, rank: roles.length - i };
}

function build(rows, sample, content) {
  const labels = content.labels ?? {};
  const levels = levelList(labels);
  const roles = content.roles ?? [];
  const seen = new Set();
  const items = [];
  for (const r of rows) {
    const key = `${r.achieverName}|${r.title}|${r.tahun}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const y = parseYears(r.tahun, labels.now);
    const level = normalizeLevel(r.tingkatan);
    const { role, rank } = roleOf(r.title, roles, content.roleFallback || "");
    items.push({
      id: String(r.id ?? items.length),
      title: r.title,
      description: r.description || null,
      name: r.achieverName,
      short: shortName(r.achieverName),
      slug: slugify(r.achieverName),
      category: r.category === "dosen" ? "dosen" : "mahasiswa",
      level,
      levelLabel: levels.find((l) => l.key === level)?.label ?? level,
      role,
      roleRank: rank,
      years: y.years,
      yearLabel: y.label,
      ongoing: y.ongoing,
      latest: y.latest,
      group: y.ongoing ? labels.ongoing || "—" : String(y.latest || "—"),
      photo: r.image || null,
    });
  }
  // terbaru dulu; dalam satu tahun: internasional → nasional → regional
  const step = (l) => levels.find((x) => x.key === l)?.step ?? 9;
  items.sort((a, b) => b.latest - a.latest || step(a.level) - step(b.level) || a.short.localeCompare(b.short));

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
    top: a.items.reduce((best, it) => (step(it.level) < step(best) ? it.level : best), "regional"),
    since: Math.min(...a.items.flatMap((i) => i.years).filter(Boolean)),
  }));
  // foto peraih dipakai juga untuk item tanpa foto
  for (const it of items) it.photo ||= map.get(it.slug)?.photo ?? null;

  const allYears = items.flatMap((i) => i.years);
  return {
    sample,
    items,
    achievers,
    levels,
    categories: categoryList(labels),
    years: [...new Set(items.map((i) => i.group))],
    span: allYears.length ? [Math.min(...allYears), Math.max(...allYears)] : null,
    featured: pickFeatured(items),
  };
}

/** Pita juara: satu sorotan per orang; utamakan peran teratas & internasional, mahasiswa, yang berfoto. */
function pickFeatured(items) {
  const score = (i) =>
    i.roleRank * 5 +
    (i.level === "internasional" ? 30 : i.level === "nasional" ? 15 : 0) +
    (i.category === "mahasiswa" ? 12 : 0) +
    (i.photo ? 10 : 0) +
    i.latest / 1000;
  const seen = new Set();
  return [...items]
    .sort((a, b) => score(b) - score(a))
    .filter((i) => !seen.has(i.slug) && seen.add(i.slug))
    .slice(0, 24);
}

/** Contoh bila tabel kosong (dari kartu beranda). */
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

/** Baris DB + isi CMS → data siap tampil. */
export function mergePrestasi(rows, content) {
  if (Array.isArray(rows) && rows.length) return build(rows, false, content);
  if (content.sample?.enabled === false) return build([], false, content);
  return build(sampleRows(), true, content);
}
