import "server-only";
import { randomUUID } from "node:crypto";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { cache } from "react";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getPublishedKurikulumData } from "@/lib/kurikulum-cms/server";
import { mergeKonversi } from "@/lib/konversi-content";
import { DEFAULT_RULES, DRAFT, LEGACY, LIVE, initialKonversi, readKonversiValue, resolveKonversi, validateKonversi } from "./schema";

export class KonversiConflict extends Error {}
export class KonversiValidation extends Error {}

async function readRows(db, withDraft = false) {
  const rows = await db.pageContent.findMany({ where: { section: { in: withDraft ? [LEGACY, LIVE, DRAFT] : [LEGACY, LIVE] } } });
  const find = (section) => rows.find((row) => row.section === section);
  const parse = (section) => {
    const row = find(section);
    return row ? JSON.parse(row.data) : null;
  };
  return { legacy: find(LEGACY)?.isActive ? find(LEGACY) : null, live: parse(LIVE), draft: parse(DRAFT) };
}

const publicRows = cache(async () => {
  try {
    return await readRows(prisma);
  } catch (error) {
    // ISR keeps its last successful result if the database becomes unavailable.
    if (process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD) throw error;
    console.warn("[konversi-cms] prerender memakai data awal", error.code ?? error.name);
    return { legacy: null, live: null };
  }
});

const readCatalog = cache(async () => {
  const { courses } = await getPublishedKurikulumData();
  return courses.filter((course) => course.sks > 0 && !course.slot);
});

export const readPublicKonversi = cache(async () => {
  const [{ legacy, live }, catalog] = await Promise.all([publicRows(), readCatalog()]);
  return resolveKonversi(live?.value ?? initialKonversi(legacy, catalog), catalog);
});

export const readPublicKonversiRules = cache(async () => {
  const { legacy, live } = await publicRows();
  if (live) return live.value.rules;
  const { cap, rulesSample } = mergeKonversi(legacy);
  return { ...DEFAULT_RULES, cap, sample: rulesSample };
});

function snapshot({ legacy, live, draft }, catalog) {
  const value = draft?.value ?? live?.value;
  return {
    value: value ? readKonversiValue(value) : initialKonversi(legacy, catalog),
    revision: draft?.revision ?? live?.revision ?? "awal:" + (legacy?.updatedAt.toISOString() ?? "default"),
    draftAt: draft?.at ?? null,
    publishedAt: live?.at ?? null,
  };
}

export async function konversiSnapshot() {
  const [rows, catalog] = await Promise.all([readRows(prisma, true), readCatalog()]);
  return { ...snapshot(rows, catalog), catalog: catalog.map(({ id, nama, sks, semester }) => ({ id: String(id), nama, sks, semester })) };
}

export async function readPreviewKonversi(revision) {
  const [rows, catalog] = await Promise.all([readRows(prisma, true), readCatalog()]);
  const state = snapshot(rows, catalog);
  if (!state.draftAt || revision !== state.revision) throw new KonversiConflict();
  return resolveKonversi(state.value, catalog);
}

export async function writeKonversi(action, revision, input) {
  const catalog = await readCatalog();
  return prisma.$transaction(async (tx) => {
    const rows = await readRows(tx, true);
    const state = snapshot(rows, catalog);
    if (revision !== state.revision) throw new KonversiConflict();
    if (action === "discard") {
      await tx.pageContent.deleteMany({ where: { section: DRAFT } });
      return snapshot({ ...rows, draft: null }, catalog);
    }

    const publish = action === "publish";
    if (publish && !rows.draft) throw new KonversiValidation("Simpan draf sebelum menerbitkan.");
    let value;
    try {
      value = validateKonversi(publish ? state.value : input, { publish, catalog });
    } catch (error) {
      throw new KonversiValidation(error.message);
    }
    const section = publish ? LIVE : DRAFT;
    const next = { value, revision: randomUUID(), at: new Date().toISOString() };
    const row = { data: JSON.stringify(next), isActive: false };
    await tx.pageContent.upsert({ where: { section }, update: row, create: { section, ...row } });
    if (publish) await tx.pageContent.deleteMany({ where: { section: DRAFT } });
    return snapshot(publish ? { ...rows, live: next, draft: null } : { ...rows, draft: next }, catalog);
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}
