import "server-only";
import { randomUUID } from "node:crypto";
import { cache } from "react";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getPublishedKurikulumData } from "@/lib/kurikulum-cms/server";
import { initialJalur, JALUR_DRAFT, JALUR_LIVE, JALUR_SECTION, resolveJalur, validateJalur } from "./schema";

export class JalurConflict extends Error {}
export class JalurValidation extends Error {}

async function readState(db, drafts = false) {
  const sections = [JALUR_LIVE, JALUR_SECTION];
  if (drafts) sections.push(JALUR_DRAFT);
  const rows = await db.pageContent.findMany({ where: { section: { in: sections } } });
  const legacy = rows.find((row) => row.section === JALUR_SECTION && row.isActive);
  const parse = (section) => {
    const row = rows.find((item) => item.section === section);
    return row ? JSON.parse(row.data) : null;
  };
  const published = parse(JALUR_LIVE);
  const draft = parse(JALUR_DRAFT);
  const live = published?.value ?? initialJalur(legacy);
  return {
    value: draft?.value ?? live,
    live,
    revision: draft?.revision ?? published?.revision ?? `awal:${legacy?.updatedAt.toISOString() ?? "default"}`,
    draftAt: draft?.at ?? null,
    publishedAt: published?.at ?? null,
  };
}

export const readPublicJalur = cache(async () => {
  const curriculum = await getPublishedKurikulumData();
  const state = await readState(prisma).catch((error) => {
    console.error("[jalur-cms] public read", error.message);
    return { live: initialJalur() };
  });
  return resolveJalur(state.live, curriculum.courses);
});

export async function readPreviewJalur() {
  const [state, curriculum] = await Promise.all([readState(prisma, true), getPublishedKurikulumData()]);
  return resolveJalur(state.value, curriculum.courses, { preview: true });
}

export async function jalurSnapshot() {
  const [state, curriculum] = await Promise.all([readState(prisma, true), getPublishedKurikulumData()]);
  return { ...state, courses: curriculum.courses.map(({ id, slug, nama, sks, semester }) => ({ id: String(id), slug, nama, sks, semester })) };
}

export async function writeJalur({ value, revision, publish = false }) {
  return prisma.$transaction(async (tx) => {
    const state = await readState(tx, true);
    if (revision !== state.revision) throw new JalurConflict();
    let content = value;
    if (publish) {
      try {
        content = validateJalur(state.value, { publish: true });
      } catch (error) {
        throw new JalurValidation(error.message);
      }
    }
    const section = publish ? JALUR_LIVE : JALUR_DRAFT;
    const next = { value: content, revision: randomUUID(), at: new Date().toISOString() };
    const data = JSON.stringify(next);
    await tx.pageContent.upsert({ where: { section }, update: { data, isActive: false }, create: { section, data, isActive: false } });
    if (publish) await tx.pageContent.deleteMany({ where: { section: JALUR_DRAFT } });
    return { value: content, live: publish ? content : state.live, revision: next.revision, draftAt: publish ? null : next.at, publishedAt: publish ? next.at : state.publishedAt };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}
