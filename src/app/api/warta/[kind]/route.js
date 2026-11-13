import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { noStore } from "@/lib/layanan-server";
import { KINDS, refresh, uniqueSlug } from "@/lib/berita-server";

/** /api/warta/post · /api/warta/event — khusus admin (sesi Auth.js). Publik membaca lewat server component. */

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const session = await auth();
  if (!session?.user) return noStore({ success: false, error: "Tidak berwenang" }, { status: 401 });
  const k = KINDS[(await params).kind];
  if (!k) return noStore({ success: false, error: "Tidak ditemukan" }, { status: 404 });
  try {
    const rows = await prisma[k.model].findMany({ orderBy: k.order, take: 500 });
    return noStore({ success: true, data: rows });
  } catch (error) {
    console.error("[warta] list", error);
    return noStore({ success: false, error: "Gagal memuat. Pastikan migrasi database sudah dijalankan." }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const session = await auth();
  if (!session?.user) return noStore({ success: false, error: "Tidak berwenang" }, { status: 401 });
  const k = KINDS[(await params).kind];
  if (!k) return noStore({ success: false, error: "Tidak ditemukan" }, { status: 404 });
  const body = await request.json().catch(() => ({}));
  const { data, errors } = k.clean(body);
  if (Object.keys(errors).length) return noStore({ success: false, error: "Periksa isian", errors }, { status: 422 });
  try {
    data.slug = await uniqueSlug(k.model, data.slug);
    const row = await prisma[k.model].create({ data });
    refresh();
    return noStore({ success: true, data: row }, { status: 201 });
  } catch (error) {
    console.error("[warta] create", error);
    return noStore({ success: false, error: "Gagal menyimpan" }, { status: 500 });
  }
}
