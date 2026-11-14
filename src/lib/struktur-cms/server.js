import "server-only";
import { cache } from "react";
import { draftMode } from "next/headers";
import prisma from "@/lib/prisma";
import { deepMerge } from "@/lib/cms/shape";
import { STRUKTUR_DEFAULTS } from "./defaults";
import { DRAFT_ROW, LEGACY_ROW, ROW, cleanStruktur } from "./schema";

const parse = (s) => {
  if (!s) return null;
  if (typeof s === "object") return s;
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
};

/**
 * Baris lama `struktur-organisasi` ({ title, subtitle, data: { people, minilab, confirmed } }) → bentuk baru,
 * supaya isi yang pernah dimasukkan langsung ke database tidak hilang.
 */
function fromLegacy(row) {
  if (!row || row.isActive === false) return null;
  const data = parse(row.data) ?? {};
  const over = {};
  const body = row.subtitle || row.content;
  if (body) over.hero = { body };
  if (Array.isArray(data.people) && data.people.length) over.people = data.people.map((p) => ({ ...p, photo: p.photo ?? "" }));
  if (data.minilab && typeof data.minilab === "object") {
    const { title, body: mBody, uses, head } = data.minilab;
    over.minilab = { card: { ...(title && { title }), ...(mBody && { body: mBody }), ...(Array.isArray(uses) && { uses }), ...(head && { head }) } };
  }
  if (data.confirmed === true) over.chart = { banner: { show: false } };
  const cleaned = cleanStruktur(over);
  return cleaned && Object.keys(cleaned).length ? cleaned : null;
}

/** Baca tiga baris sekaligus: terbit, draf, warisan. */
export async function readRows() {
  try {
    const rows = await prisma.pageContent.findMany({
      where: { section: { in: [ROW, DRAFT_ROW, LEGACY_ROW] } },
      select: { section: true, title: true, subtitle: true, content: true, data: true, isActive: true, updatedAt: true },
    });
    const by = Object.fromEntries(rows.map((r) => [r.section, r]));
    const pub = parse(by[ROW]?.data);
    const draft = parse(by[DRAFT_ROW]?.data);
    const legacy = pub ? null : fromLegacy(by[LEGACY_ROW]);
    return {
      base: legacy ? deepMerge(STRUKTUR_DEFAULTS, legacy) : STRUKTUR_DEFAULTS,
      hasLegacy: Boolean(legacy),
      published: pub?.value ?? null,
      publishedAt: pub?.publishedAt ?? null,
      publishedBy: pub?.publishedBy ?? null,
      history: Array.isArray(pub?.history) ? pub.history : [],
      draft: draft?.value ?? null,
      draftAt: by[DRAFT_ROW]?.updatedAt ?? null,
    };
  } catch (error) {
    console.error("[struktur-cms] read", error);
    return { base: STRUKTUR_DEFAULTS, hasLegacy: false, published: null, history: [], draft: null };
  }
}

/** Isi halaman publik. Draft mode (pratinjau Studio Bagan) memakai draf; pengunjung hanya versi terbit. */
export const getStrukturContent = cache(async () => {
  let preview = false;
  try {
    preview = (await draftMode()).isEnabled;
  } catch {}
  const r = await readRows();
  const over = preview ? r.draft ?? r.published : r.published;
  const c = over ? deepMerge(r.base, over) : r.base;
  const people = c.people.filter((p) => !p.hidden);
  const keys = new Set(people.map((p) => p.key));
  // orang yang atasannya disembunyikan naik ke puncak yang terlihat
  const root = people.find((p) => p.group !== "staff" && (!p.reportsTo || !keys.has(p.reportsTo))) ?? people[0];
  const visible = people.map((p) => (p === root || keys.has(p.reportsTo) ? p : { ...p, reportsTo: root?.key ?? "" }));
  return { ...c, people: visible, allPeople: c.people, preview };
});
