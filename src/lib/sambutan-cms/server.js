import "server-only";
import { cache } from "react";
import { draftMode } from "next/headers";
import prisma from "@/lib/prisma";
import { mergeSambutan } from "@/lib/sambutan-content";
import { SAMBUTAN_DEFAULTS } from "./defaults";
import { DRAFT_ROW, LEGACY_ROW, ROW, deepMerge } from "./schema";

const parse = (s) => {
  try {
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
};

/** Baris lama `sambutan-kaprodi` (sebelum Meja Sambutan) → bentuk baru, supaya isinya tidak hilang. */
function fromLegacy(row) {
  if (!row || row.isActive === false) return null;
  const m = mergeSambutan(row);
  return {
    person: { name: m.name, credentials: m.credentials, role: m.role, photo: m.photo },
    letter: { greeting: m.greeting, paragraphs: m.paragraphs, quote: m.quote, closing: m.closing },
    profile: {
      research: m.research,
      education: (m.education ?? []).map((e) => ({ degree: e.degree ?? "", place: e.place ?? "" })),
      certifications: m.certifications ?? [],
    },
  };
}

/** Baca tiga baris sekaligus: terbit, draf, dan warisan. */
export async function readRows() {
  try {
    const rows = await prisma.pageContent.findMany({
      where: { section: { in: [ROW, DRAFT_ROW, LEGACY_ROW] } },
      select: { section: true, title: true, subtitle: true, content: true, image: true, data: true, isActive: true, updatedAt: true },
    });
    const by = Object.fromEntries(rows.map((r) => [r.section, r]));
    const pub = parse(by[ROW]?.data);
    const draft = parse(by[DRAFT_ROW]?.data);
    const legacy = fromLegacy(by[LEGACY_ROW]);
    return {
      base: legacy ? deepMerge(SAMBUTAN_DEFAULTS, legacy) : SAMBUTAN_DEFAULTS,
      hasLegacy: Boolean(legacy),
      published: pub?.value ?? null,
      publishedAt: pub?.publishedAt ?? null,
      publishedBy: pub?.publishedBy ?? null,
      history: Array.isArray(pub?.history) ? pub.history : [],
      draft: draft?.value ?? null,
      draftAt: by[DRAFT_ROW]?.updatedAt ?? null,
    };
  } catch (error) {
    console.error("[sambutan-cms] read", error);
    return { base: SAMBUTAN_DEFAULTS, hasLegacy: false, published: null, history: [], draft: null };
  }
}

/** Isi halaman publik. Draft mode (pratinjau Meja) memakai draf; pengunjung hanya versi terbit. */
export const getSambutanContent = cache(async () => {
  let preview = false;
  try {
    preview = (await draftMode()).isEnabled;
  } catch {}
  const r = await readRows();
  const over = preview ? r.draft ?? r.published : r.published;
  const content = over ? deepMerge(r.base, over) : r.base;
  return { ...content, preview, isPlaceholder: !over && !r.hasLegacy };
});
