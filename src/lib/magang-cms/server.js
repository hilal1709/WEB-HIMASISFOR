import "server-only";
import { randomUUID } from "node:crypto";
import { cache } from "react";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getPublishedKurikulumData } from "@/lib/kurikulum-cms/server";
import { DRAFT, LEGACY, LIVE, initialMagang, resolveMagang, validateMagang } from "./schema";

export class MagangConflict extends Error {}
export class MagangValidation extends Error {}

async function readState(db, admin = false) {
  const rows = await db.pageContent.findMany({ where: { section: { in: admin ? [LEGACY, LIVE, DRAFT] : [LEGACY, LIVE] } } });
  const legacy = rows.find((row) => row.section === LEGACY && row.isActive);
  const record = (section) => {
    const row = rows.find((item) => item.section === section);
    return row ? JSON.parse(row.data) : null;
  };
  const published = record(LIVE);
  const draft = record(DRAFT);
  const live = published?.value ?? initialMagang(legacy);
  return {
    value: draft?.value ?? live,
    revision: draft?.revision ?? published?.revision ?? "awal:" + (legacy?.updatedAt.toISOString() ?? "default"),
    draftAt: draft?.at ?? null,
    publishedAt: published?.at ?? null,
  };
}

const readCourses = cache(async () => {
  const { courses } = await getPublishedKurikulumData();
  return courses.map(({ id, slug, nama, sks, semester }) => ({ id: String(id), slug, nama, sks, semester }));
});

export const readPublicMagang = cache(async () => {
  const published = readState(prisma).catch((error) => {
    // Pertahankan hasil ISR sebelumnya saat koneksi terputus di runtime.
    if (process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD) throw error;
    console.warn("[magang-cms] prerender memakai konten awal", error.code ?? error.name);
    return { value: initialMagang() };
  });
  const [state, courses] = await Promise.all([published, readCourses()]);
  return resolveMagang(state.value, courses);
});

export async function magangSnapshot() {
  const [state, courses] = await Promise.all([readState(prisma, true), readCourses()]);
  return { ...state, courses };
}

export async function readPreviewMagang(revision) {
  const state = await magangSnapshot();
  if (revision && revision !== state.revision) throw new MagangConflict();
  return resolveMagang(state.value, state.courses);
}

export async function writeMagang(action, revision, input) {
  const courses = await readCourses();
  return prisma.$transaction(async (tx) => {
    const state = await readState(tx, true);
    if (state.revision !== revision) throw new MagangConflict();
    if (action === "discard") {
      await tx.pageContent.deleteMany({ where: { section: DRAFT } });
      return { ...await readState(tx, true), courses };
    }
    const publish = action === "publish";
    if (publish && !state.draftAt) return { ...state, courses };
    let value;
    try {
      value = validateMagang(publish ? state.value : input, { publish });
      if (publish && value.kp.source === "curriculum" && value.kp.courseId && !courses.some((course) => course.id === value.kp.courseId)) {
        throw new Error("Mata kuliah yang dipilih sudah tidak ada dalam kurikulum terbit.");
      }
    } catch (error) {
      throw new MagangValidation(error.message);
    }

    const section = publish ? LIVE : DRAFT;
    const next = { value, revision: randomUUID(), at: new Date().toISOString() };
    const row = { data: JSON.stringify(next), isActive: false };
    await tx.pageContent.upsert({ where: { section }, update: row, create: { section, ...row } });
    if (publish) await tx.pageContent.deleteMany({ where: { section: DRAFT } });
    return {
      value, revision: next.revision,
      draftAt: publish ? null : next.at,
      publishedAt: publish ? next.at : state.publishedAt,
      courses,
    };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}
