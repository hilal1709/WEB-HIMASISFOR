import "server-only";
import { cache } from "react";
import { draftMode } from "next/headers";
import prisma from "@/lib/prisma";
import { getDosenData } from "@/lib/dosen-cms/server";
import { getKurikulumData } from "@/lib/kurikulum-cms/server";
import { BIDANG_DEFAULTS } from "./defaults";
import { DRAFT_ROW, LEGACY_ROW, ROW, SCALE, deepMerge } from "./schema";

/** Baris terbit kartu bidang di Studio Beranda (sebelum Konsol Bidang menjadi sumber tunggal). */
const HOME_ROW = "home:expertise";

const parse = (s) => {
  if (!s) return null;
  if (typeof s === "object") return s;
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
};

const str = (v) => (typeof v === "string" && v.trim() ? v : undefined);

/**
 * Isi warisan → bentuk baru supaya tidak hilang:
 * - `bidang-keahlian` (editor lama Konten Web Utama): intro + override per slug
 * - `home:expertise` (Studio Beranda): judul, ringkasan, karier, foto, Lottie per slug
 */
function fromLegacy(legacyRow, homeRow) {
  const legacy = legacyRow && legacyRow.isActive !== false ? parse(legacyRow.data) : null;
  const home = parse(homeRow?.data)?.value ?? null;
  const items = Array.isArray(legacy?.items) ? legacy.items : [];
  const homeItems = Array.isArray(home?.items) ? home.items : [];
  if (!items.length && !homeItems.length && !str(legacy?.intro)) return null;

  const fields = BIDANG_DEFAULTS.fields.map((f) => {
    const h = homeItems.find((x) => x?.slug === f.slug) ?? {};
    const o = items.find((x) => x?.slug === f.slug) ?? {};
    const out = { ...f };
    for (const k of ["title", "image", "lottie"]) if (str(h[k])) out[k] = h[k];
    if (str(h.body)) out.teaser = h.body;
    if (Array.isArray(h.careers) && h.careers.length) out.careers = h.careers.filter((c) => typeof c === "string");
    if (typeof h.crop === "boolean") out.crop = h.crop;
    for (const k of ["question", "summary", "short"]) if (str(o[k])) out[k] = o[k];
    for (const k of ["learn", "tools", "courses"]) if (Array.isArray(o[k]) && o[k].length) out[k] = o[k];
    if (o.learn || o.tools) out.sample = false;
    return out;
  });
  const intro = str(legacy?.intro);
  return { fields, ...(intro && intro.length > 40 ? { hero: { intro } } : {}) };
}

/** Baca baris terbit, draf, dan warisan sekaligus. */
export async function readRows() {
  try {
    const rows = await prisma.pageContent.findMany({
      where: { section: { in: [ROW, DRAFT_ROW, LEGACY_ROW, HOME_ROW] } },
      select: { section: true, data: true, isActive: true, updatedAt: true },
    });
    const by = Object.fromEntries(rows.map((r) => [r.section, r]));
    const pub = parse(by[ROW]?.data);
    const draft = parse(by[DRAFT_ROW]?.data);
    const legacy = fromLegacy(by[LEGACY_ROW], by[HOME_ROW]);
    return {
      base: legacy ? deepMerge(BIDANG_DEFAULTS, legacy) : BIDANG_DEFAULTS,
      hasLegacy: Boolean(legacy),
      published: pub?.value ?? null,
      publishedAt: pub?.publishedAt ?? null,
      publishedBy: pub?.publishedBy ?? null,
      history: Array.isArray(pub?.history) ? pub.history : [],
      draft: draft?.value ?? null,
      draftAt: by[DRAFT_ROW]?.updatedAt ?? null,
    };
  } catch (error) {
    console.error("[bidang-cms] read", error);
    return { base: BIDANG_DEFAULTS, hasLegacy: false, published: null, history: [], draft: null };
  }
}

/** Profil tiap bidang disejajarkan dengan jumlah dimensi (dimensi baru → nilai tengah). */
export function alignProfiles(content) {
  const n = content.dimensions.length;
  return {
    ...content,
    fields: content.fields.map((f) => ({
      ...f,
      profile: Array.from({ length: n }, (_, i) => Math.max(0, Math.min(SCALE, Number(f.profile?.[i] ?? SCALE / 2)))),
    })),
  };
}

/** Isi CMS mentah (setelah merge). Pratinjau (draft mode) memakai draf; pengunjung hanya versi terbit. */
export const getBidangContent = cache(async () => {
  let preview = false;
  try {
    preview = (await draftMode()).isEnabled;
  } catch {}
  const r = await readRows();
  const over = preview ? r.draft ?? r.published : r.published;
  const content = alignProfiles(over ? deepMerge(r.base, over) : r.base);
  return { ...content, preview };
});

/** Kartu bidang untuk beranda: satu sumber dengan /bidang-keahlian. */
export async function getBidangCards() {
  const c = await getBidangContent();
  return c.fields
    .filter((f) => f.visible !== false)
    .map((f) => ({ slug: f.slug, title: f.title, body: f.teaser, careers: f.careers, image: f.image, lottie: f.lottie, crop: f.crop }));
}

/** Data siap render halaman publik: bidang tampil + tautan mata kuliah (kurikulum) & dosen (direktori). */
export async function getBidangPage() {
  const [c, kurikulum, dosen] = await Promise.all([
    getBidangContent(),
    getKurikulumData().catch(() => null),
    getDosenData().catch(() => null),
  ]);
  const courseByName = new Map((kurikulum?.courses ?? []).map((x) => [String(x.nama).toLowerCase(), x]));
  const lecturers = dosen?.lecturers ?? [];
  const fields = c.fields
    .filter((f) => f.visible !== false)
    .map((f) => ({
      ...f,
      courseLinks: (f.courses ?? [])
        .map((nm) => courseByName.get(String(nm).toLowerCase()))
        .filter(Boolean)
        .map((x) => ({ slug: x.slug, nama: x.nama, sks: x.sks, rps: !!x.rps })),
      people: f.dosenField
        ? lecturers.filter((l) => l.fields?.includes(f.dosenField)).map((l) => ({ slug: l.slug, name: l.name, photo: l.photo, initials: l.initials }))
        : [],
    }));
  return { ...c, fields };
}

/** Pilihan referensi untuk Konsol: mata kuliah, rumpun dosen, kunci profil lulusan. */
export async function getReferences() {
  const [kurikulum, dosen] = await Promise.all([getKurikulumData().catch(() => null), getDosenData().catch(() => null)]);
  let profiles = [];
  try {
    const { getProfilLulusanContent } = await import("@/lib/profil-lulusan-cms/server");
    const pl = await getProfilLulusanContent();
    profiles = (pl?.profiles?.items ?? []).map((p) => ({ key: p.key, title: p.title })).filter((p) => p.key);
  } catch {}
  return {
    courses: (kurikulum?.courses ?? []).map((x) => ({ nama: x.nama, sks: x.sks, semester: x.semester ?? null, rps: !!x.rps })),
    dosenFields: (dosen?.fields ?? []).map((f) => ({
      key: f.key,
      name: f.name,
      people: (dosen?.lecturers ?? []).filter((l) => l.fields?.includes(f.key)).map((l) => ({ slug: l.slug, name: l.name, photo: l.photo, initials: l.initials })),
    })),
    profiles,
  };
}
