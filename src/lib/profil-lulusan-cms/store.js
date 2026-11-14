import "server-only";
import prisma from "@/lib/prisma";
import { deepMerge, sameJson } from "@/lib/cms/shape";
import { DRAFT_ROW, HISTORY_MAX, LEGACY_ALUMNI, ROW } from "./schema";
import { readRows } from "./server";

/** Keadaan lengkap Galeri Wisuda: isi kerja, versi live, status draf, dan riwayat terbit. */
export async function snapshot() {
  const r = await readRows();
  const live = r.published ? deepMerge(r.base, r.published) : r.base;
  const working = r.draft ? deepMerge(r.base, r.draft) : live;
  return {
    value: working,
    live,
    dirty: r.draft != null && !sameJson(working, live),
    hasLegacy: r.hasLegacy,
    publishedAt: r.publishedAt ?? null,
    publishedBy: r.publishedBy ?? null,
    draftAt: r.draftAt ?? null,
    history: r.history.map((h, i) => ({ index: i, publishedAt: h.publishedAt, publishedBy: h.publishedBy })),
  };
}

const upsert = (section, fields) =>
  prisma.pageContent.upsert({ where: { section }, update: fields, create: { section, isActive: true, ...fields } });

export async function saveDraft(value) {
  await upsert(DRAFT_ROW, { data: JSON.stringify({ value }), title: "Profil Lulusan (draf)" });
  return snapshot();
}

export async function discardDraft() {
  await prisma.pageContent.deleteMany({ where: { section: DRAFT_ROW } });
  return snapshot();
}

/**
 * Draf → terbit. Versi utuh disimpan, versi sebelumnya masuk riwayat.
 * Daftar alumni ikut dicerminkan ke baris lama `infinite-alumni` (dipakai halaman /profile lama).
 */
export async function publish(by) {
  const r = await readRows();
  if (r.draft == null) return false;
  const next = deepMerge(r.base, r.draft);
  const prev = r.published ? deepMerge(r.base, r.published) : r.base;
  const changed = !sameJson(next, prev) || !r.published;
  if (changed) {
    const history = r.published
      ? [{ value: r.published, publishedAt: r.publishedAt, publishedBy: r.publishedBy }, ...r.history].slice(0, HISTORY_MAX)
      : r.history;
    await prisma.$transaction([
      upsert(ROW, { data: JSON.stringify({ value: next, publishedAt: new Date().toISOString(), publishedBy: by, history }), title: "Profil Lulusan" }),
      upsert(LEGACY_ALUMNI, {
        data: JSON.stringify({ alumni: next.alumni.items.map((a) => ({ name: a.name, img: a.photo, job: a.role })) }),
        title: "Daftar Alumni",
        isActive: true,
      }),
    ]);
  }
  await prisma.pageContent.deleteMany({ where: { section: DRAFT_ROW } });
  return changed;
}

/** Salin satu versi riwayat ke draf (belum terbit sampai admin menerbitkan). */
export async function restore(index) {
  const r = await readRows();
  const h = r.history[index];
  if (!h) return null;
  return saveDraft(h.value);
}
