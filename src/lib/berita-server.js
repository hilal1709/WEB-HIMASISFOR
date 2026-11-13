/**
 * Akses data Warta SISFOR di server (halaman, RSS, sitemap, API admin).
 * Publik hanya melihat status "terbit". DB kosong/gagal → contoh (`sample: true`).
 */
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { SAMPLE_EVENTS, SAMPLE_POSTS, normalizeEvent, normalizePost, slugify } from "@/lib/berita-content";

const byDateDesc = (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt);

/** Semua tulisan terbit + agenda terbit. */
export async function getWarta() {
  let posts = [];
  let events = [];
  try {
    const now = new Date();
    [posts, events] = await Promise.all([
      prisma.post.findMany({ where: { status: "terbit", OR: [{ publishedAt: null }, { publishedAt: { lte: now } }] }, orderBy: { publishedAt: "desc" }, take: 300 }),
      prisma.event.findMany({ where: { status: "terbit" }, orderBy: { startAt: "asc" }, take: 300 }),
    ]);
  } catch {
    // tabel belum ada / DB tak terjangkau → contoh
  }
  const hasPosts = posts.length > 0;
  const hasEvents = events.length > 0;
  return {
    posts: hasPosts ? posts.map((p) => normalizePost(p)).sort(byDateDesc) : [...SAMPLE_POSTS].sort(byDateDesc),
    events: hasEvents ? events.map((e) => normalizeEvent(e)) : SAMPLE_EVENTS,
    sample: { posts: !hasPosts, events: !hasEvents },
  };
}

/** Satu tulisan + tulisan terkait. */
export async function getPost(slug) {
  const { posts } = await getWarta();
  const post = posts.find((p) => p.slug === slug);
  if (!post) return null;
  const same = posts.filter((p) => p.slug !== slug && p.type === post.type);
  const related = [...same.filter((p) => p.category === post.category), ...same.filter((p) => p.category !== post.category)].slice(0, 3);
  return { post, related };
}

/* ---------------- validasi admin ---------------- */

const str = (v, max = 300) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const opt = (v, max = 500) => str(v, max) || null;
const date = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};
const url = (v) => {
  const s = opt(v, 600);
  return s && /^(https?:\/\/|\/)/i.test(s) ? s : null;
};

export function cleanPost(b = {}) {
  const errors = {};
  const data = {
    type: b.type === "artikel" ? "artikel" : "berita",
    title: str(b.title, 200),
    slug: slugify(str(b.slug, 120) || str(b.title, 200)),
    excerpt: opt(b.excerpt, 400),
    content: str(b.content, 60000),
    cover: url(b.cover),
    category: str(b.category, 40) || "Kegiatan",
    author: opt(b.author, 120),
    authorRole: opt(b.authorRole, 120),
    featured: !!b.featured,
    status: b.status === "terbit" ? "terbit" : "draf",
    publishedAt: date(b.publishedAt),
  };
  if (!data.title) errors.title = "Judul wajib diisi";
  if (!data.content) errors.content = "Isi wajib diisi";
  if (!data.slug) errors.slug = "Slug tidak valid";
  if (data.status === "terbit" && !data.publishedAt) data.publishedAt = new Date();
  return { data, errors };
}

export function cleanEvent(b = {}) {
  const errors = {};
  const data = {
    title: str(b.title, 200),
    slug: slugify(str(b.slug, 120) || str(b.title, 200)),
    summary: opt(b.summary, 400),
    content: opt(b.content, 20000),
    category: str(b.category, 40) || "Akademik",
    startAt: date(b.startAt),
    endAt: date(b.endAt),
    place: str(b.place, 160),
    mode: ["luring", "daring", "hibrid"].includes(b.mode) ? b.mode : "luring",
    link: url(b.link),
    registerUrl: url(b.registerUrl),
    cover: url(b.cover),
    status: b.status === "draf" ? "draf" : "terbit",
  };
  if (!data.title) errors.title = "Judul wajib diisi";
  if (!data.startAt) errors.startAt = "Waktu mulai wajib diisi";
  if (!data.place) errors.place = "Tempat wajib diisi";
  if (data.endAt && data.startAt && data.endAt < data.startAt) errors.endAt = "Selesai harus setelah mulai";
  return { data, errors };
}

/** Slug unik: tambah -2, -3, … bila sudah dipakai baris lain. */
export async function uniqueSlug(model, base, exceptId) {
  let s = base;
  for (let i = 2; i < 50; i++) {
    const hit = await prisma[model].findUnique({ where: { slug: s }, select: { id: true } });
    if (!hit || hit.id === exceptId) return s;
    s = `${base}-${i}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

/** Model per jenis untuk API admin /api/warta/[kind]. */
export const KINDS = {
  post: { model: "post", clean: cleanPost, order: [{ publishedAt: "desc" }, { createdAt: "desc" }] },
  event: { model: "event", clean: cleanEvent, order: [{ startAt: "desc" }] },
};

export function refresh() {
  revalidatePath("/berita", "layout");
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
}

