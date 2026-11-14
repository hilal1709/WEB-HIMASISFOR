import "server-only";
import { cache } from "react";
import { existsSync } from "node:fs";
import path from "node:path";
import { draftMode } from "next/headers";
import prisma from "@/lib/prisma";
import { mergePrestasi } from "@/lib/prestasi-content";
import { PRESTASI_DEFAULTS } from "./defaults";
import { DRAFT_ROW, LEGACY_ROWS, ROW, cleanPrestasi, deepMerge } from "./schema";

const parse = (v) => {
  if (!v) return null;
  if (typeof v === "object") return v;
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
};

/** Path relatif lama ("../img/mhs/x.png") → "/img/mhs/x.png"; file lokal yang hilang → null. */
export function normalizeSrc(src) {
  if (!src) return null;
  if (/^https?:\/\//.test(src)) return src;
  const rel = "/" + String(src).replace(/^(\.\.?\/)+/, "").replace(/^\/+/, "");
  return existsSync(path.join(process.cwd(), "public", rel)) ? rel : null;
}

/**
 * Baris lama `kisah-mawapres` (Konten Profil) → bab Kisah, supaya isi yang pernah dimasukkan tetap ada:
 * `title` → kicker, `content` → kutipan, `subtitle` → video, `image` → poster, `data.people[]`.
 */
function fromLegacy(rows) {
  const row = rows.find((r) => r.section === "kisah-mawapres" && r.isActive !== false);
  if (!row) return null;
  const data = parse(row.data);
  const people = (Array.isArray(data?.people) ? data.people : [])
    .filter((p) => p?.name?.trim())
    .map((p) => ({ name: p.name.trim(), role: p.role?.trim() || "", ...(p.photo && { photo: normalizeSrc(p.photo) || "" }) }));
  const story = {
    ...(row.title?.trim() && { kicker: row.title.trim() }),
    ...(row.content?.trim() && { quote: row.content.trim() }),
    ...(people.length && { people }),
  };
  const video = {
    ...(row.subtitle?.trim() && { src: row.subtitle.trim(), duration: "" }),
    ...(normalizeSrc(row.image) && { poster: normalizeSrc(row.image) }),
  };
  if (Object.keys(video).length) story.video = video;
  const cleaned = cleanPrestasi({ story });
  return cleaned?.story && Object.keys(cleaned.story).length ? cleaned : null;
}

/** Baca baris terbit, draf, dan warisan sekaligus. */
export async function readRows() {
  try {
    const rows = await prisma.pageContent.findMany({
      where: { section: { in: [ROW, DRAFT_ROW, ...LEGACY_ROWS] } },
      select: { section: true, title: true, subtitle: true, content: true, image: true, data: true, isActive: true, updatedAt: true },
    });
    const by = Object.fromEntries(rows.map((r) => [r.section, r]));
    const pub = parse(by[ROW]?.data);
    const draft = parse(by[DRAFT_ROW]?.data);
    const legacy = fromLegacy(rows);
    return {
      base: legacy ? deepMerge(PRESTASI_DEFAULTS, legacy) : PRESTASI_DEFAULTS,
      hasLegacy: Boolean(legacy),
      published: pub?.value ?? null,
      publishedAt: pub?.publishedAt ?? null,
      publishedBy: pub?.publishedBy ?? null,
      history: Array.isArray(pub?.history) ? pub.history : [],
      draft: draft?.value ?? null,
      draftAt: by[DRAFT_ROW]?.updatedAt ?? null,
    };
  } catch (error) {
    console.error("[prestasi-cms] read", error);
    return { base: PRESTASI_DEFAULTS, hasLegacy: false, published: null, history: [], draft: null };
  }
}

/** Isi halaman + data prestasi siap tampil. Draft mode (pratinjau Ruang Kurator) memakai draf. */
export const getPrestasiContent = cache(async () => {
  let preview = false;
  try {
    preview = (await draftMode()).isEnabled;
  } catch {}
  const [r, rows] = await Promise.all([
    readRows(),
    prisma.achievement.findMany({ orderBy: [{ tahun: "desc" }, { id: "asc" }] }).catch(() => []),
  ]);
  const over = preview ? r.draft ?? r.published : r.published;
  const content = over ? deepMerge(r.base, over) : r.base;
  const data = mergePrestasi(
    rows.map((x) => ({ ...x, image: normalizeSrc(x.image) })),
    content
  );
  const story = {
    ...content.story,
    people: (content.story.people ?? []).filter((p) => p.name?.trim()).map((p) => ({ ...p, photo: normalizeSrc(p.photo) })),
  };
  return { ...content, ...data, story, preview };
});
