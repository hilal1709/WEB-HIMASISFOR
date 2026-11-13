import "server-only";
import { cache } from "react";
import { draftMode } from "next/headers";
import prisma from "@/lib/prisma";
import { HOME_DEFAULTS } from "./defaults";
import { SECTION_KEYS, rowKey, draftKey } from "./schema";

export const ALL_KEYS = ["layout", ...SECTION_KEYS];

const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);

/** Gabung dalam: objek digabung per kunci, array & nilai primitif menimpa utuh. */
export function deepMerge(base, over) {
  if (!isObj(base) || !isObj(over)) return over === undefined ? base : over;
  const out = { ...base };
  for (const [k, v] of Object.entries(over)) out[k] = isObj(v) && isObj(base[k]) ? deepMerge(base[k], v) : v;
  return out;
}

const parse = (s) => {
  try {
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
};

/**
 * Baca baris CMS beranda. Versi terbit ada di `home:<key>`, draf di `home-draft:<key>` —
 * dipisah supaya jalur publik tidak pernah memuat isi draf sama sekali.
 */
export async function readRows({ drafts = false } = {}) {
  const names = ALL_KEYS.map(rowKey);
  if (drafts) names.push(...ALL_KEYS.map(draftKey));
  try {
    const rows = await prisma.pageContent.findMany({ where: { section: { in: names } }, select: { section: true, data: true, updatedAt: true } });
    const out = {};
    for (const r of rows) {
      const isDraft = r.section.startsWith("home-draft:");
      const key = r.section.slice(isDraft ? 11 : 5);
      const d = parse(r.data);
      out[key] ??= {};
      if (isDraft) {
        out[key].draft = d?.value ?? null;
        out[key].updatedAt = r.updatedAt;
      } else {
        out[key].published = d?.value ?? null;
        out[key].publishedAt = d?.publishedAt ?? null;
        out[key].publishedBy = d?.publishedBy ?? null;
      }
    }
    return out;
  } catch (error) {
    console.error("[home-cms] read", error);
    return {};
  }
}

/** Isi beranda siap render. Pratinjau Studio (draft mode) memakai draf; publik hanya versi terbit. */
export const getHomeContent = cache(async () => {
  let preview = false;
  try {
    preview = (await draftMode()).isEnabled;
  } catch {}
  const rows = await readRows({ drafts: preview });
  const out = { preview };
  for (const key of ALL_KEYS) {
    const r = rows[key];
    const over = preview ? r?.draft ?? r?.published : r?.published;
    out[key] = over ? deepMerge(HOME_DEFAULTS[key], over) : HOME_DEFAULTS[key];
  }
  return out;
});
