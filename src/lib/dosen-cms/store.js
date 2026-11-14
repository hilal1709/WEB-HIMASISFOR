import "server-only";
import prisma from "@/lib/prisma";
import { baganLecturers } from "@/lib/dosen-content";
import { DRAFT_ROW, HISTORY_MAX, ROW, deepMerge } from "./schema";
import { readRows } from "./server";

const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/** Orang Bagan (non-staf) yang dikirim ke Katalog untuk menghitung nilai warisan di klien. */
const baganFor = (people) =>
  baganLecturers(people).map((p) => ({ key: p.key, name: p.name, credentials: p.credentials ?? "", role: p.role ?? "", photo: p.photo ?? "", expertise: p.expertise ?? [], group: p.group, hidden: Boolean(p.hidden) }));

/** Keadaan lengkap Katalog: isi kerja, versi live, status draf, riwayat, dan orang Bagan. */
export async function snapshot() {
  const r = await readRows();
  const live = r.published ? deepMerge(r.base, r.published) : r.base;
  const working = r.draft ? deepMerge(r.base, r.draft) : live;
  return {
    value: working,
    live,
    bagan: baganFor(r.people),
    dirty: r.draft != null && !same(working, live),
    publishedAt: r.publishedAt ?? null,
    publishedBy: r.publishedBy ?? null,
    draftAt: r.draftAt ?? null,
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
  await upsert(DRAFT_ROW, { value }, "Dosen (draf)");
  return snapshot();
}

export async function discardDraft() {
  await prisma.pageContent.deleteMany({ where: { section: DRAFT_ROW } });
  return snapshot();
}

/** Draf → terbit. Versi terbit sebelumnya masuk riwayat (maks HISTORY_MAX). */
export async function publish(by) {
  const r = await readRows();
  if (r.draft == null) return false;
  const changed = !same(deepMerge(r.base, r.draft), r.published ? deepMerge(r.base, r.published) : r.base);
  if (changed) {
    const history = r.published
      ? [{ value: r.published, publishedAt: r.publishedAt, publishedBy: r.publishedBy }, ...r.history].slice(0, HISTORY_MAX)
      : r.history;
    await upsert(ROW, { value: r.draft, publishedAt: new Date().toISOString(), publishedBy: by, history }, "Dosen");
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
