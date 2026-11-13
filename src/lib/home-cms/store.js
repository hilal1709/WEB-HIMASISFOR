import "server-only";
import prisma from "@/lib/prisma";
import { HOME_DEFAULTS } from "./defaults";
import { draftKey, rowKey, sectionOf } from "./schema";
import { ALL_KEYS, deepMerge, readRows } from "./server";

export { ALL_KEYS };

const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
const titleOf = (key) => (key === "layout" ? "Beranda — urutan section" : `Beranda — ${sectionOf(key)?.label ?? key}`);

/** Bentuk satu section untuk Studio: isi kerja (draf ⊕ default), versi live, dan status. */
export function shape(key, r = {}) {
  const working = r.draft ?? r.published;
  return {
    value: working ? deepMerge(HOME_DEFAULTS[key], working) : HOME_DEFAULTS[key],
    live: r.published ? deepMerge(HOME_DEFAULTS[key], r.published) : HOME_DEFAULTS[key],
    dirty: r.draft != null && !same(r.draft, r.published),
    publishedAt: r.publishedAt ?? null,
    publishedBy: r.publishedBy ?? null,
    updatedAt: r.updatedAt ?? null,
  };
}

export async function snapshot() {
  const rows = await readRows({ drafts: true });
  return Object.fromEntries(ALL_KEYS.map((k) => [k, shape(k, rows[k])]));
}

async function rowsOf(key) {
  return (await readRows({ drafts: true }))[key] ?? {};
}

const upsert = (section, data, title) =>
  prisma.pageContent.upsert({
    where: { section },
    update: { data: JSON.stringify(data), title },
    create: { section, data: JSON.stringify(data), title, isActive: true },
  });

export async function saveDraft(key, value) {
  await upsert(draftKey(key), { value }, `${titleOf(key)} (draf)`);
  return shape(key, await rowsOf(key));
}

export async function discardDraft(key) {
  await prisma.pageContent.deleteMany({ where: { section: draftKey(key) } });
  return shape(key, await rowsOf(key));
}

/** Terbitkan draf → versi publik. Mengembalikan section yang benar-benar berubah. */
export async function publish(keys, by) {
  const rows = await readRows({ drafts: true });
  const at = new Date().toISOString();
  const done = [];
  for (const key of keys) {
    const r = rows[key];
    if (r?.draft == null) continue;
    if (!same(r.draft, r.published)) {
      await upsert(rowKey(key), { value: r.draft, publishedAt: at, publishedBy: by }, titleOf(key));
      done.push(key);
    }
    await prisma.pageContent.deleteMany({ where: { section: draftKey(key) } });
  }
  return done;
}
