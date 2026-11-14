import "server-only";
import prisma from "@/lib/prisma";
import { DRAFT_ROW, HISTORY_MAX, ROW, deepMerge } from "./schema";
import { readRows } from "./server";

const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/** Keadaan lengkap untuk Kartografer: isi kerja, versi live, status draf, dan riwayat terbit. */
export async function snapshot() {
  const r = await readRows();
  const live = r.published ? deepMerge(r.base, r.published) : r.base;
  const working = r.draft ? deepMerge(r.base, r.draft) : live;
  return {
    value: working,
    live,
    dirty: r.draft != null && !same(working, live),
    publishedAt: r.publishedAt ?? null,
    publishedBy: r.publishedBy ?? null,
    draftAt: r.draftAt ?? null,
    fromLegacy: r.hasLegacy && !r.published,
    history: r.history.map((h, i) => ({ index: i, publishedAt: h.publishedAt, publishedBy: h.publishedBy })),
  };
}

const upsert = (section, data, title) =>
  prisma.pageContent.upsert({
    where: { section },
    update: { data: JSON.stringify(data), title },
    create: { section, data: JSON.stringify(data), title, isActive: true },
  });

export async function saveDraft(value) {
  await upsert(DRAFT_ROW, { value }, "Kurikulum & RPS (draf)");
  return snapshot();
}

export async function discardDraft() {
  await prisma.pageContent.deleteMany({ where: { section: DRAFT_ROW } });
  return snapshot();
}

/** Draf → terbit. Versi terbit sebelumnya masuk riwayat (maks HISTORY_MAX). */
export async function publish(by) {
  const r = await readRows();
  // terbit pertama setelah migrasi: isi hasil migrasi baris lama boleh terbit tanpa diubah dulu
  const firstFromLegacy = r.draft == null && !r.published && r.hasLegacy;
  if (r.draft == null && !firstFromLegacy) return false;
  const draft = r.draft ?? r.base;
  const changed = firstFromLegacy || !same(deepMerge(r.base, draft), r.published ? deepMerge(r.base, r.published) : r.base);
  if (changed) {
    const history = r.published
      ? [{ value: r.published, publishedAt: r.publishedAt, publishedBy: r.publishedBy }, ...r.history].slice(0, HISTORY_MAX)
      : r.history;
    await upsert(ROW, { value: draft, publishedAt: new Date().toISOString(), publishedBy: by, history }, "Kurikulum & RPS");
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
