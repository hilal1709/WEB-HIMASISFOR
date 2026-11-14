import "server-only";
import { cache } from "react";
import { draftMode } from "next/headers";
import prisma from "@/lib/prisma";
import { getStrukturContent } from "@/lib/struktur-cms/server";
import { baganLecturers, firstToken, resolveLecturers, slugify, splitList, splitName } from "@/lib/dosen-content";
import { DOSEN_DEFAULTS } from "./defaults";
import { DRAFT_ROW, LEGACY_ROWS, ROW, cleanDosen, deepMerge } from "./schema";

const parse = (v) => {
  if (!v) return null;
  if (typeof v === "object") return v;
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
};

/**
 * Baris lama `profil-dosen` (editor Admin › Profil) dan `dosen` (override per slug) → bentuk Katalog,
 * supaya isi yang pernah dimasukkan tidak hilang. Dicocokkan ke orang Bagan per nama depan / slug.
 */
function fromLegacy(rows, people) {
  const profil = rows.find((r) => r.section === "profil-dosen" && r.isActive !== false);
  const page = rows.find((r) => r.section === "dosen" && r.isActive !== false);
  if (!profil && !page) return null;
  const bagan = baganLecturers(people);
  const resolved = resolveLecturers(people, [], { withHidden: true });
  const entries = new Map();
  const touch = (key, patch) => entries.set(key, { key, ...(entries.get(key) ?? {}), ...patch });

  const dosens = parse(profil?.data)?.dosens;
  for (const d of Array.isArray(dosens) ? dosens.filter((x) => x?.name) : []) {
    const { name, credentials } = splitName(d.name);
    const hit = bagan.find((p) => firstToken(p.name) === firstToken(name));
    const links = { ...(d.scholar && { scholar: d.scholar }), ...(d.scopus && { scopus: d.scopus }), ...(d.sinta && { sinta: d.sinta }) };
    const patch = {
      ...(d.image && { photo: d.image }),
      ...(splitList(d.expertise).length && { expertise: splitList(d.expertise) }),
      ...(d.nuptk && { nuptk: String(d.nuptk) }),
      ...(d.email && { email: d.email }),
      ...(Object.keys(links).length && { links }),
    };
    if (hit) {
      if (name && name !== hit.name) patch.name = name;
      if (credentials && credentials !== hit.credentials) patch.credentials = credentials;
      touch(hit.key, { source: "bagan", ...patch });
    } else {
      touch(slugify(name) || `dosen-${entries.size + 1}`, { source: "custom", name, credentials, role: "Dosen", ...patch });
    }
  }

  const pageData = parse(page?.data) ?? {};
  for (const o of Array.isArray(pageData.lecturers) ? pageData.lecturers : []) {
    const hit = resolved.find((l) => l.slug === o?.slug);
    if (!hit) continue;
    const { slug, ...rest } = o;
    touch(hit.key, { source: "bagan", ...rest });
  }

  const over = {};
  const body = page?.content?.trim();
  if (body && body.length > 40) over.hero = { intro: body };
  if (entries.size) {
    // urutan bawaan dipertahankan: entri hanya untuk orang yang punya timpaan
    const order = resolveLecturers(people, [], { withHidden: true }).map((l) => l.key);
    over.lecturers = [...entries.values()].sort((a, b) => (order.indexOf(a.key) + 1 || 99) - (order.indexOf(b.key) + 1 || 99));
  }
  const cleaned = cleanDosen(over);
  return cleaned && Object.keys(cleaned).length ? cleaned : null;
}

/** Baca baris terbit, draf, dan warisan sekaligus (+ orang Bagan untuk penggabungan). */
export async function readRows() {
  let people = [];
  try {
    people = (await getStrukturContent()).allPeople ?? [];
  } catch {}
  try {
    const rows = await prisma.pageContent.findMany({
      where: { section: { in: [ROW, DRAFT_ROW, ...LEGACY_ROWS] } },
      select: { section: true, content: true, data: true, isActive: true, updatedAt: true },
    });
    const by = Object.fromEntries(rows.map((r) => [r.section, r]));
    const pub = parse(by[ROW]?.data);
    const draft = parse(by[DRAFT_ROW]?.data);
    const legacy = fromLegacy(rows, people);
    return {
      people,
      base: legacy ? deepMerge(DOSEN_DEFAULTS, legacy) : DOSEN_DEFAULTS,
      hasLegacy: Boolean(legacy),
      published: pub?.value ?? null,
      publishedAt: pub?.publishedAt ?? null,
      publishedBy: pub?.publishedBy ?? null,
      history: Array.isArray(pub?.history) ? pub.history : [],
      draft: draft?.value ?? null,
      draftAt: by[DRAFT_ROW]?.updatedAt ?? null,
    };
  } catch (error) {
    console.error("[dosen-cms] read", error);
    return { people, base: DOSEN_DEFAULTS, hasLegacy: false, published: null, history: [], draft: null };
  }
}

/** Isi halaman publik + daftar dosen siap tampil. Draft mode (pratinjau Katalog) memakai draf. */
export const getDosenContent = cache(async () => {
  let preview = false;
  try {
    preview = (await draftMode()).isEnabled;
  } catch {}
  const r = await readRows();
  const over = preview ? r.draft ?? r.published : r.published;
  const content = over ? deepMerge(r.base, over) : r.base;
  const lecturers = resolveLecturers(r.people.length ? r.people : undefined, content.lecturers, { certs: content.certs });
  return { ...content, lecturers, entries: content.lecturers, preview };
});

/** Bentuk ringkas untuk halaman lain (/bidang-keahlian, /bootcamp): { intro, fields, lecturers }. */
export async function getDosenData() {
  const c = await getDosenContent();
  return { intro: { body: c.hero.intro }, fields: c.fields, lecturers: c.lecturers, certs: c.certs };
}
