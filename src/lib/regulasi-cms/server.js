import "server-only";
import { randomUUID } from "node:crypto";
import { cache } from "react";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getPublishedKurikulumData } from "@/lib/kurikulum-cms/server";
import { DRAFT, LEGACY, LIVE, initialRegulasi, readRegulasiValue, resolveRegulasi, validateRegulasi } from "./schema";

export class RegulasiConflict extends Error {}
export class RegulasiValidation extends Error {}

async function readState(db, withDraft = false) {
  const sections = withDraft ? [LEGACY, LIVE, DRAFT] : [LEGACY, LIVE];
  const rows = await db.pageContent.findMany({ where: { section: { in: sections } } });
  const legacy = rows.find((row) => row.section === LEGACY && row.isActive);
  const record = (section) => {
    const row = rows.find((item) => item.section === section);
    return row ? JSON.parse(row.data) : null;
  };
  const published = record(LIVE);
  const draft = record(DRAFT);
  const live = published?.value ? readRegulasiValue(published.value) : initialRegulasi(legacy);
  return {
    value: draft?.value ? readRegulasiValue(draft.value) : live,
    live,
    revision: draft?.revision ?? published?.revision ?? `awal:${legacy?.updatedAt.toISOString() ?? "default"}`,
    draftAt: draft?.at ?? null,
    publishedAt: published?.at ?? null,
  };
}

const readCurriculum = cache(async () => {
  const curriculum = await getPublishedKurikulumData();
  return { sks: curriculum.totals?.sks, semester: curriculum.semesters?.length };
});

export const readPublicRegulasi = cache(async () => {
  const [state, curriculum] = await Promise.all([
    readState(prisma).catch((error) => {
      console.error("[regulasi-cms] public read", error.message);
      return { live: initialRegulasi() };
    }),
    readCurriculum(),
  ]);
  return resolveRegulasi(state.live, curriculum);
});

export async function regulasiSnapshot() {
  const [state, curriculum] = await Promise.all([readState(prisma, true), readCurriculum()]);
  return { ...state, curriculum };
}

export async function writeRegulasi(action, revision, value) {
  const curriculum = await readCurriculum();
  return prisma.$transaction(async (tx) => {
    const state = await readState(tx, true);
    if (state.revision !== revision) throw new RegulasiConflict();
    if (action === "discard") {
      await tx.pageContent.deleteMany({ where: { section: DRAFT } });
      return { ...await readState(tx, true), curriculum };
    }

    const publish = action === "publish";
    if (publish && !state.draftAt) return { ...state, curriculum };
    let content;
    try {
      content = validateRegulasi(publish ? state.value : value, { publish, curriculum });
    } catch (error) {
      throw new RegulasiValidation(error.message);
    }
    const section = publish ? LIVE : DRAFT;
    const next = { value: content, revision: randomUUID(), at: new Date().toISOString() };
    const row = { data: JSON.stringify(next), isActive: false };
    await tx.pageContent.upsert({ where: { section }, update: row, create: { section, ...row } });
    if (publish) await tx.pageContent.deleteMany({ where: { section: DRAFT } });
    return {
      value: content, live: publish ? content : state.live, revision: next.revision,
      draftAt: publish ? null : next.at, publishedAt: publish ? next.at : state.publishedAt, curriculum,
    };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}
