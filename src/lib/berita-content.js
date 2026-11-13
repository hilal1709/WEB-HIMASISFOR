/**
 * Warta SISFOR — berita, artikel, dan agenda prodi (/berita).
 * Sumber utama: model Prisma `Post` & `Event` (Admin › Warta). Bila DB kosong/gagal, halaman memakai
 * contoh di bawah (ditandai `sample` → <PlaceholderTag/>). Contoh berita diturunkan dari `NEWS` beranda
 * dan contoh agenda dari `AGENDA` beranda agar tidak ada dua versi data yang berbeda.
 */
import { SEED_EVENTS, SEED_POSTS } from "./berita-seed";
import { LECTURERS } from "./dosen-content";

export const CURTAIN_KEY = "sisfor:curtain:berita";
export const BANNER_KEY = "sisfor:banner:berita";
export const TZ = "Asia/Jakarta";
export const PAGE_SIZE = 7;

export const RUBRICS = [
  { key: "berita", label: "Berita", hint: "Kabar dari kampus" },
  { key: "artikel", label: "Artikel", hint: "Tulisan & gagasan" },
  { key: "agenda", label: "Agenda", hint: "Acara terdekat" },
];

export const CATEGORIES = {
  berita: ["Prestasi", "Kegiatan", "Akademik", "Kerja Sama"],
  artikel: ["Opini", "Riset", "Tips Kuliah", "Industri"],
  agenda: ["Akademik", "Kuliah Tamu", "Workshop", "Karier"],
};

export const MODES = { luring: "Luring", daring: "Daring", hibrid: "Hibrid" };

/* ---------------- util ---------------- */

export const slugify = (s = "") =>
  String(s)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);

/** Perkiraan menit baca (± 200 kata/menit), minimal 1. */
export function readMinutes(text = "") {
  const words = String(text).replace(/[#>*_`!\[\]()-]/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

const fmt = (opts) => new Intl.DateTimeFormat("id-ID", { timeZone: TZ, ...opts });
export const fmtDate = (d) => (d ? fmt({ day: "numeric", month: "long", year: "numeric" }).format(new Date(d)) : "");
export const fmtShort = (d) => (d ? fmt({ day: "2-digit", month: "short" }).format(new Date(d)) : "");
export const fmtWeekday = (d) => (d ? fmt({ weekday: "long" }).format(new Date(d)) : "");
export const fmtTime = (d) => (d ? fmt({ hour: "2-digit", minute: "2-digit" }).format(new Date(d)).replace(":", ".") : "");

/** Bagian tanggal (WIB) untuk lembar kalender. */
export function dateParts(d) {
  const parts = Object.fromEntries(
    fmt({ day: "numeric", month: "long", year: "numeric", weekday: "long" })
      .formatToParts(new Date(d))
      .map((p) => [p.type, p.value])
  );
  return { day: parts.day, month: parts.month, year: parts.year, weekday: parts.weekday };
}

/** Kunci bulan "YYYY-MM" (WIB). */
export function monthKey(d) {
  const p = Object.fromEntries(fmt({ year: "numeric", month: "2-digit" }).formatToParts(new Date(d)).map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}`;
}

/** Edisi koran = jumlah tulisan terbit; tanggal edisi = tulisan terbaru. Tidak dikarang. */
export function edition(posts) {
  const latest = posts.reduce((a, p) => (!a || new Date(p.publishedAt) > new Date(a) ? p.publishedAt : a), null);
  return { number: posts.length, date: latest };
}

/** Penulis yang cocok dengan dosen → foto & tautan profil. */
export function authorInfo(name) {
  if (!name) return null;
  const n = name.toLowerCase();
  const l = LECTURERS.find((x) => n.includes(x.name.toLowerCase().replace(/^dr\.?\s*/, "").split(" ")[0]));
  return l ? { photo: l.photo, slug: l.slug, initials: l.initials } : null;
}

/* ---------------- normalisasi ---------------- */

export function normalizePost(p, sample = false) {
  const content = p.content ?? "";
  const author = authorInfo(p.author);
  return {
    id: p.id ?? null,
    slug: p.slug,
    type: p.type === "artikel" ? "artikel" : "berita",
    title: p.title,
    excerpt: p.excerpt || content.replace(/[#>*_`]/g, "").split(/\n\s*\n/).find((x) => x.trim() && !x.trim().startsWith("!"))?.trim().slice(0, 180) || "",
    content,
    cover: p.cover || null,
    category: p.category || "Kegiatan",
    author: p.author || "Redaksi Warta SISFOR",
    authorRole: p.authorRole || null,
    authorPhoto: author?.photo ?? null,
    authorSlug: author?.slug ?? null,
    featured: !!p.featured,
    publishedAt: new Date(p.publishedAt ?? p.createdAt ?? Date.now()).toISOString(),
    readMinutes: readMinutes(content),
    sample,
  };
}

export function normalizeEvent(e, sample = false) {
  return {
    id: e.id ?? null,
    slug: e.slug,
    title: e.title,
    summary: e.summary || "",
    content: e.content || "",
    category: e.category || "Akademik",
    startAt: new Date(e.startAt).toISOString(),
    endAt: e.endAt ? new Date(e.endAt).toISOString() : null,
    place: e.place,
    mode: MODES[e.mode] ? e.mode : "luring",
    link: e.link || null,
    registerUrl: e.registerUrl || null,
    cover: e.cover || null,
    sample,
  };
}

/** Event → bentuk `AGENDA` lama (day, month, title, place, time) untuk `downloadIcs`. */
export function toIcsItem(ev) {
  const p = dateParts(ev.startAt);
  return { day: p.day, month: p.month.slice(0, 3), title: ev.title, place: ev.place, time: fmtTime(ev.startAt) };
}

/* ---------------- contoh (fallback) ---------------- */

export const SAMPLE_POSTS = SEED_POSTS.map((p) => normalizePost(p, true));
export const SAMPLE_EVENTS = SEED_EVENTS.map((e) => normalizeEvent(e, true));
