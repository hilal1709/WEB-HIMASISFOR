import "server-only";
import { cache } from "react";
import { draftMode } from "next/headers";
import prisma from "@/lib/prisma";
import { deepMerge } from "@/lib/cms/shape";
import { VISI_MISI_DEFAULTS } from "./defaults";
import { DRAFT_ROW, LEGACY_MISI, LEGACY_VISI, ROW, fillCount } from "./schema";

const parse = (s) => {
  if (!s) return null;
  if (typeof s === "object") return s;
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
};

const unquote = (t) => t.trim().replace(/^["“]|["”]$/g, "");

/**
 * Baris lama editor Profil (`visi`.content, `misi`.data.items) → bentuk baru, supaya teks yang
 * sudah diketik admin sebelum Ruang Kompas tidak hilang. Metadata misi (kata kunci, ilustrasi) dari default.
 */
function fromLegacy(visiRow, misiRow) {
  const over = {};
  const visi = visiRow && visiRow.isActive !== false && visiRow.content ? unquote(visiRow.content) : "";
  if (visi) over.visi = { text: visi };
  const items = misiRow && misiRow.isActive !== false ? parse(misiRow.data)?.items : null;
  if (Array.isArray(items) && items.length) {
    const base = VISI_MISI_DEFAULTS.misi.items;
    over.misi = {
      items: items
        .map((t) => String(t).trim())
        .filter(Boolean)
        .map((text, i) => ({ ...(base[i] ?? { key: `Misi ${i + 1}`, detail: "", tags: [], illustration: "lecturer", sample: false }), text })),
    };
  }
  return Object.keys(over).length ? over : null;
}

/** Baca empat baris sekaligus: terbit, draf, dan dua baris warisan. */
export async function readRows() {
  try {
    const rows = await prisma.pageContent.findMany({
      where: { section: { in: [ROW, DRAFT_ROW, LEGACY_VISI, LEGACY_MISI] } },
      select: { section: true, content: true, data: true, isActive: true, updatedAt: true },
    });
    const by = Object.fromEntries(rows.map((r) => [r.section, r]));
    const pub = parse(by[ROW]?.data);
    const draft = parse(by[DRAFT_ROW]?.data);
    // setelah Ruang Kompas pernah terbit, baris lama hanya cermin → tidak dipakai lagi sebagai base
    const legacy = pub ? null : fromLegacy(by[LEGACY_VISI], by[LEGACY_MISI]);
    return {
      base: legacy ? deepMerge(VISI_MISI_DEFAULTS, legacy) : VISI_MISI_DEFAULTS,
      hasLegacy: Boolean(legacy),
      published: pub?.value ?? null,
      publishedAt: pub?.publishedAt ?? null,
      publishedBy: pub?.publishedBy ?? null,
      history: Array.isArray(pub?.history) ? pub.history : [],
      draft: draft?.value ?? null,
      draftAt: by[DRAFT_ROW]?.updatedAt ?? null,
    };
  } catch (error) {
    console.error("[visi-misi-cms] read", error);
    return { base: VISI_MISI_DEFAULTS, hasLegacy: false, published: null, history: [], draft: null };
  }
}

/** Isi halaman publik. Draft mode (Teropong) memakai draf; pengunjung hanya versi terbit. */
export const getVisiMisiContent = cache(async () => {
  let preview = false;
  try {
    preview = (await draftMode()).isEnabled;
  } catch {}
  const r = await readRows();
  const over = preview ? r.draft ?? r.published : r.published;
  const c = over ? deepMerge(r.base, over) : r.base;
  const count = c.misi.items.length;
  return {
    ...c,
    misi: { ...c.misi, titleTop: fillCount(c.misi.titleTop, count), titleAccent: fillCount(c.misi.titleAccent, count) },
    preview,
  };
});
