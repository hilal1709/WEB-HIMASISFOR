import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { noStore } from "@/lib/layanan-server";
import { KINDS, refresh, uniqueSlug } from "@/lib/berita-server";

export const dynamic = "force-dynamic";

async function guard(params) {
  const session = await auth();
  if (!session?.user) return { res: noStore({ success: false, error: "Tidak berwenang" }, { status: 401 }) };
  const { kind, id } = await params;
  const k = KINDS[kind];
  const n = Number(id);
  if (!k || !Number.isInteger(n)) return { res: noStore({ success: false, error: "Tidak ditemukan" }, { status: 404 }) };
  return { k, id: n };
}

export async function PATCH(request, { params }) {
  const g = await guard(params);
  if (g.res) return g.res;
  const body = await request.json().catch(() => ({}));
  const { data, errors } = g.k.clean(body);
  if (Object.keys(errors).length) return noStore({ success: false, error: "Periksa isian", errors }, { status: 422 });
  try {
    data.slug = await uniqueSlug(g.k.model, data.slug, g.id);
    const row = await prisma[g.k.model].update({ where: { id: g.id }, data });
    refresh();
    return noStore({ success: true, data: row });
  } catch (error) {
    console.error("[warta] update", error);
    return noStore({ success: false, error: "Gagal menyimpan" }, { status: error?.code === "P2025" ? 404 : 500 });
  }
}

export async function DELETE(request, { params }) {
  const g = await guard(params);
  if (g.res) return g.res;
  try {
    await prisma[g.k.model].delete({ where: { id: g.id } });
    refresh();
    return noStore({ success: true });
  } catch (error) {
    console.error("[warta] delete", error);
    return noStore({ success: false, error: "Gagal menghapus" }, { status: error?.code === "P2025" ? 404 : 500 });
  }
}
