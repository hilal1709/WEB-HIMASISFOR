import "server-only";
import { cache } from "react";
import { draftMode } from "next/headers";
import prisma from "@/lib/prisma";
import { deepMerge } from "@/lib/cms/shape";
import { PROGRAM_KELAS_DEFAULTS } from "./defaults";
import { DRAFT_ROW, LEGACY_ROW, ROW, cleanProgramKelas, fill } from "./schema";

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
 * Baris lama "program-kelas" (intro + override kelas per key + FAQ) → bentuk baru,
 * supaya isi yang pernah diketik admin tidak hilang sebelum Papan Jadwal terbit pertama kali.
 */
function fromLegacy(row) {
  if (!row || row.isActive === false) return null;
  const D = PROGRAM_KELAS_DEFAULTS;
  const data = parse(row.data) ?? {};
  const over = {};
  const body = row.content?.trim();
  if (body && body.length > 40) over.hero = { body };
  const cms = Array.isArray(data.classes) ? data.classes : [];
  if (cms.length) {
    over.classes = {
      items: D.classes.items.map((c) => {
        const o = cms.find((x) => x?.key === c.key);
        if (!o) return c;
        const week = Array.isArray(o.week) ? o.week.map((w) => ({ ...w, kind: w.industry ? "industri" : w.online ? "daring" : "kampus" })) : c.week;
        return { ...c, ...o, week, sample: false };
      }),
    };
  }
  const faq = Array.isArray(data.faq) ? data.faq.filter((f) => f?.q && f?.a) : [];
  if (faq.length) over.faq = { items: faq.map((f) => ({ q: String(f.q), a: String(f.a) })) };
  if (!Object.keys(over).length) return null;
  return cleanProgramKelas(deepMerge(D, over));
}

/** Baca baris terbit, draf, dan baris warisan sekaligus. */
export async function readRows() {
  try {
    const rows = await prisma.pageContent.findMany({
      where: { section: { in: [ROW, DRAFT_ROW, LEGACY_ROW] } },
      select: { section: true, content: true, data: true, isActive: true, updatedAt: true },
    });
    const by = Object.fromEntries(rows.map((r) => [r.section, r]));
    const pub = parse(by[ROW]?.data);
    const draft = parse(by[DRAFT_ROW]?.data);
    const legacy = pub ? null : fromLegacy(by[LEGACY_ROW]);
    return {
      base: legacy ? deepMerge(PROGRAM_KELAS_DEFAULTS, legacy) : PROGRAM_KELAS_DEFAULTS,
      hasLegacy: Boolean(legacy),
      published: pub?.value ?? null,
      publishedAt: pub?.publishedAt ?? null,
      publishedBy: pub?.publishedBy ?? null,
      history: Array.isArray(pub?.history) ? pub.history : [],
      draft: draft?.value ?? null,
      draftAt: by[DRAFT_ROW]?.updatedAt ?? null,
    };
  } catch (error) {
    console.error("[program-kelas-cms] read", error);
    return { base: PROGRAM_KELAS_DEFAULTS, hasLegacy: false, published: null, history: [], draft: null };
  }
}

/**
 * Isi halaman publik. Draft mode (pratinjau Papan Jadwal) memakai draf; pengunjung hanya versi terbit.
 * Token judul (`{jumlah}`) diisi di sini supaya komponen tinggal menampilkan.
 */
export const getProgramKelasContent = cache(async () => {
  let preview = false;
  try {
    preview = (await draftMode()).isEnabled;
  } catch {}
  const r = await readRows();
  const over = preview ? r.draft ?? r.published : r.published;
  const c = over ? deepMerge(r.base, over) : r.base;
  const count = c.classes.items.length;
  const titled = (t) => (t ?? []).map((x) => fill(x, { jumlah: count }));
  return {
    ...c,
    hero: { ...c.hero, title: titled(c.hero.title) },
    classes: { ...c.classes, title: titled(c.classes.title), items: c.classes.items.map((x, i) => ({ ...x, n: i + 1 })) },
    compare: { ...c.compare, title: titled(c.compare.title) },
    faq: { ...c.faq, title: titled(c.faq.title) },
    closing: { ...c.closing, title: titled(c.closing.title) },
    preview,
  };
});
