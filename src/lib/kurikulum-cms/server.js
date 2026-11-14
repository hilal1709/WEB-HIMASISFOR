import "server-only";
import { cache } from "react";
import { draftMode } from "next/headers";
import prisma from "@/lib/prisma";
import { buildKurikulum } from "@/lib/kurikulum-content";
import { withData, KURIKULUM_DEFAULTS } from "./defaults";
import { fromLegacyData } from "./migrate";
import { DRAFT_ROW, LEGACY_ROW, ROW, deepMerge } from "./schema";

const parse = (s) => {
  try {
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
};

/** Baca tiga baris sekaligus: terbit, draf, dan baris lama `curriculum` (sumber migrasi). */
export async function readRows() {
  try {
    const rows = await prisma.pageContent.findMany({
      where: { section: { in: [ROW, DRAFT_ROW, LEGACY_ROW] } },
      select: { section: true, data: true, isActive: true, updatedAt: true },
    });
    const by = Object.fromEntries(rows.map((r) => [r.section, r]));
    const pub = parse(by[ROW]?.data);
    const draft = parse(by[DRAFT_ROW]?.data);
    const legacy = by[LEGACY_ROW] && by[LEGACY_ROW].isActive !== false ? by[LEGACY_ROW] : null;
    return {
      base: legacy ? withData(fromLegacyData(legacy.data)) : KURIKULUM_DEFAULTS,
      hasLegacy: Boolean(legacy),
      published: pub?.value ?? null,
      publishedAt: pub?.publishedAt ?? null,
      publishedBy: pub?.publishedBy ?? null,
      history: Array.isArray(pub?.history) ? pub.history : [],
      draft: draft?.value ?? null,
      draftAt: by[DRAFT_ROW]?.updatedAt ?? null,
    };
  } catch (error) {
    console.error("[kurikulum-cms] read", error);
    return { base: KURIKULUM_DEFAULTS, hasLegacy: false, published: null, history: [], draft: null };
  }
}

/** Isi CMS mentah. Pratinjau (draft mode) memakai draf; pengunjung hanya versi terbit. */
export const getKurikulumContent = cache(async () => {
  let preview = false;
  try {
    preview = (await draftMode()).isEnabled;
  } catch {}
  const r = await readRows();
  const over = preview ? r.draft ?? r.published : r.published;
  return { value: over ? deepMerge(r.base, over) : r.base, preview };
});

/** Bentuk turunan untuk halaman publik dan halaman lain yang memakai data kurikulum. */
export const getKurikulumData = cache(async () => {
  const { value, preview } = await getKurikulumContent();
  return { ...buildKurikulum(value), preview };
});
