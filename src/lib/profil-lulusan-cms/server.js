import "server-only";
import { cache } from "react";
import { draftMode } from "next/headers";
import prisma from "@/lib/prisma";
import { deepMerge } from "@/lib/cms/shape";
import { PROFIL_LULUSAN_DEFAULTS } from "./defaults";
import { DRAFT_ROW, LEGACY_ALUMNI, LEGACY_CAREER, LEGACY_INTRO, ROW, fillCount } from "./schema";

const parse = (s) => {
  if (!s) return null;
  if (typeof s === "object") return s;
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
};

/** Kunci profil default ↔ `id` di baris lama `career`. */
const LEGACY_CAREER_IDS = { erp: "erp", audit: "auditor", data: "analyst", strategi: "consultant" };
const normImg = (src) => (!src ? "" : /^(https?:)?\//.test(src) ? src : `/${src}`);
const firstWord = (t) => String(t).toLowerCase().split(/[ .,]+/)[0];

/**
 * Baris lama (intro `profil-alumni`, ringkasan `career`, daftar `infinite-alumni`) → bentuk baru,
 * supaya isi yang sudah diketik admin sebelum Galeri Wisuda tidak hilang.
 */
function fromLegacy(by) {
  const over = {};
  const D = PROFIL_LULUSAN_DEFAULTS;
  const intro = by[LEGACY_INTRO];
  const body = intro && intro.isActive !== false ? intro.content?.trim() : "";
  if (body && body.length > 40) over.hero = { body };

  const careers = by[LEGACY_CAREER]?.isActive !== false ? parse(by[LEGACY_CAREER]?.data)?.careers : null;
  if (Array.isArray(careers) && careers.length) {
    let touched = false;
    const items = D.profiles.items.map((p) => {
      const c = careers.find((x) => x?.id === LEGACY_CAREER_IDS[p.key]);
      let desc = c?.description?.trim() || "";
      // sebagian deskripsi lama diawali judulnya sendiri ("IT Consultant Berperan …")
      if (c?.title && desc.toLowerCase().startsWith(c.title.toLowerCase() + " ")) desc = desc.slice(c.title.length).trim();
      if (!desc) return p;
      touched = true;
      return { ...p, summary: desc[0].toUpperCase() + desc.slice(1) };
    });
    if (touched) over.profiles = { items };
  }

  const alumni = by[LEGACY_ALUMNI]?.isActive !== false ? parse(by[LEGACY_ALUMNI]?.data)?.alumni : null;
  if (Array.isArray(alumni) && alumni.length) {
    const quotes = D.alumni.items.filter((a) => a.quote);
    const list = alumni
      .filter((a) => a?.name)
      .map((a) => ({ name: String(a.name).slice(0, 80), role: String(a.job ?? "").slice(0, 140), photo: normImg(a.img), quote: "", sample: false }))
      .filter((a) => !quotes.some((q) => firstWord(q.name) === firstWord(a.name)));
    over.alumni = { items: [...quotes, ...list] };
  }
  return Object.keys(over).length ? over : null;
}

/** Baca baris terbit, draf, dan tiga baris warisan sekaligus. */
export async function readRows() {
  try {
    const rows = await prisma.pageContent.findMany({
      where: { section: { in: [ROW, DRAFT_ROW, LEGACY_INTRO, LEGACY_CAREER, LEGACY_ALUMNI] } },
      select: { section: true, content: true, data: true, isActive: true, updatedAt: true },
    });
    const by = Object.fromEntries(rows.map((r) => [r.section, r]));
    const pub = parse(by[ROW]?.data);
    const draft = parse(by[DRAFT_ROW]?.data);
    // setelah Galeri Wisuda pernah terbit, baris lama hanya cermin → tidak dipakai sebagai base
    const legacy = pub ? null : fromLegacy(by);
    return {
      base: legacy ? deepMerge(PROFIL_LULUSAN_DEFAULTS, legacy) : PROFIL_LULUSAN_DEFAULTS,
      hasLegacy: Boolean(legacy),
      published: pub?.value ?? null,
      publishedAt: pub?.publishedAt ?? null,
      publishedBy: pub?.publishedBy ?? null,
      history: Array.isArray(pub?.history) ? pub.history : [],
      draft: draft?.value ?? null,
      draftAt: by[DRAFT_ROW]?.updatedAt ?? null,
    };
  } catch (error) {
    console.error("[profil-lulusan-cms] read", error);
    return { base: PROFIL_LULUSAN_DEFAULTS, hasLegacy: false, published: null, history: [], draft: null };
  }
}

/** Isi halaman publik. Draft mode (pratinjau Galeri Wisuda) memakai draf; pengunjung hanya versi terbit. */
export const getProfilLulusanContent = cache(async () => {
  let preview = false;
  try {
    preview = (await draftMode()).isEnabled;
  } catch {}
  const r = await readRows();
  const over = preview ? r.draft ?? r.published : r.published;
  const c = over ? deepMerge(r.base, over) : r.base;
  const items = c.profiles.items.map((p, i) => ({ ...p, n: i + 1 }));
  return {
    ...c,
    profiles: { ...c.profiles, items, titleTop: fillCount(c.profiles.titleTop, items.length), titleAccent: fillCount(c.profiles.titleAccent, items.length) },
    preview,
  };
});
