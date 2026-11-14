import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { broadcast, refreshSite } from "@/lib/realtime/server";
import { CATEGORY_KEYS, LEVEL_KEYS } from "@/lib/prestasi-cms/schema";

export const dynamic = "force-dynamic";

const LEVEL_LABEL = { internasional: "Internasional", nasional: "Nasional", regional: "Regional" };
const json = (body, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

async function guard() {
  const session = await auth();
  if (!session?.user) return { error: json({ success: false, error: "Tidak berwenang" }, 401) };
  return { by: session.user.name || session.user.email || "Admin" };
}

/** Prestasi tayang langsung (tanpa draf): halaman Prestasi & Beranda ikut diperbarui. */
async function changed(by, socketId) {
  revalidatePath("/achievement");
  revalidatePath("/");
  await Promise.all([refreshSite(["/achievement", "/"]), broadcast("private-admin", "prestasi:records", { by }, socketId)]).catch(() => {});
}

const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : undefined);

/** Bersihkan isian satu prestasi. `partial` = PUT (hanya field yang dikirim). */
function clean(body, partial = false) {
  const out = {};
  const name = str(body.achieverName, 200);
  const title = str(body.title, 300);
  const tahun = str(body.tahun, 60);
  if (name !== undefined) out.achieverName = name;
  if (title !== undefined) out.title = title;
  if (tahun !== undefined) out.tahun = tahun;
  if (body.description !== undefined) out.description = str(body.description, 1000) || null;
  if (body.image !== undefined) out.image = str(body.image, 500) || null;
  if (body.category !== undefined) {
    if (!CATEGORY_KEYS.includes(body.category)) return { error: "Kategori tidak dikenal" };
    out.category = body.category;
  }
  if (body.tingkatan !== undefined) {
    const k = String(body.tingkatan).toLowerCase();
    if (!LEVEL_KEYS.includes(k)) return { error: "Tingkat tidak dikenal" };
    out.tingkatan = LEVEL_LABEL[k];
  }
  if (!partial && (!out.achieverName || !out.title || !out.tahun || !out.category || !out.tingkatan)) return { error: "Nama, judul, tahun, kategori, dan tingkat wajib diisi" };
  if (partial && ["achieverName", "title", "tahun"].some((k) => k in out && !out[k])) return { error: "Nama, judul, dan tahun tidak boleh kosong" };
  return { data: out };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const format = searchParams.get("format");
    const search = searchParams.get("search");

    const where = {};
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { achieverName: { contains: search, mode: "insensitive" } },
        { title: { contains: search, mode: "insensitive" } },
      ];
    }

    const achievements = await prisma.achievement.findMany({ where, orderBy: [{ tahun: "desc" }, { achieverName: "asc" }] });
    if (format === "list") return json({ success: true, data: achievements });

    const grouped = achievements.reduce((acc, a) => {
      const existing = acc.find((item) => item.nama === a.achieverName);
      const entry = { nama: a.title, tingkatan: a.tingkatan, tahun: a.tahun };
      if (existing) existing.pencapaian.push(entry);
      else acc.push({ nama: a.achieverName, img: a.image, pencapaian: [entry] });
      return acc;
    }, []);
    return json({ success: true, data: grouped });
  } catch (error) {
    console.error("[achievements] GET", error);
    return json({ success: false, error: "Gagal memuat prestasi" }, 500);
  }
}

export async function POST(request) {
  const { by, error } = await guard();
  if (error) return error;
  const body = await request.json().catch(() => ({}));
  const c = clean(body);
  if (c.error) return json({ success: false, error: c.error }, 422);
  try {
    const data = await prisma.achievement.create({ data: c.data });
    await changed(by, body.socketId);
    return json({ success: true, data });
  } catch (e) {
    console.error("[achievements] POST", e);
    return json({ success: false, error: "Gagal menyimpan prestasi" }, 500);
  }
}

export async function PUT(request) {
  const { by, error } = await guard();
  if (error) return error;
  const body = await request.json().catch(() => ({}));
  const id = Number.parseInt(body.id, 10);
  if (!Number.isInteger(id)) return json({ success: false, error: "ID prestasi wajib" }, 400);
  const c = clean(body, true);
  if (c.error) return json({ success: false, error: c.error }, 422);
  try {
    const data = await prisma.achievement.update({ where: { id }, data: c.data });
    await changed(by, body.socketId);
    return json({ success: true, data });
  } catch (e) {
    console.error("[achievements] PUT", e);
    return json({ success: false, error: "Gagal memperbarui prestasi" }, 500);
  }
}

/** Aksi massal: `{ ids: [], action: "delete" | "set", set: { tingkatan?, category? } }`. */
export async function PATCH(request) {
  const { by, error } = await guard();
  if (error) return error;
  const body = await request.json().catch(() => ({}));
  const ids = (Array.isArray(body.ids) ? body.ids : []).map((x) => Number.parseInt(x, 10)).filter(Number.isInteger).slice(0, 500);
  if (!ids.length) return json({ success: false, error: "Tidak ada prestasi dipilih" }, 400);
  try {
    if (body.action === "delete") {
      const r = await prisma.achievement.deleteMany({ where: { id: { in: ids } } });
      await changed(by, body.socketId);
      return json({ success: true, count: r.count });
    }
    if (body.action === "set") {
      const c = clean({ ...(body.set?.tingkatan && { tingkatan: body.set.tingkatan }), ...(body.set?.category && { category: body.set.category }) }, true);
      if (c.error || !Object.keys(c.data).length) return json({ success: false, error: c.error || "Tidak ada perubahan" }, 422);
      const r = await prisma.achievement.updateMany({ where: { id: { in: ids } }, data: c.data });
      await changed(by, body.socketId);
      return json({ success: true, count: r.count });
    }
    return json({ success: false, error: "Aksi tidak dikenal" }, 400);
  } catch (e) {
    console.error("[achievements] PATCH", e);
    return json({ success: false, error: "Aksi massal gagal" }, 500);
  }
}

export async function DELETE(request) {
  const { by, error } = await guard();
  if (error) return error;
  const id = Number.parseInt(new URL(request.url).searchParams.get("id"), 10);
  if (!Number.isInteger(id)) return json({ success: false, error: "ID prestasi wajib" }, 400);
  try {
    await prisma.achievement.delete({ where: { id } });
    await changed(by, request.headers.get("x-socket-id"));
    return json({ success: true });
  } catch (e) {
    console.error("[achievements] DELETE", e);
    return json({ success: false, error: "Gagal menghapus prestasi" }, 500);
  }
}
