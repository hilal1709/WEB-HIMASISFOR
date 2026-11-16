import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { noStore } from "@/lib/layanan-server";

const STATUSES = ["baru", "diverifikasi", "dihubungi", "selesai", "ditolak"];

export async function PATCH(request, { params }) {
  const session = await auth();
  if (!session?.user) return noStore({ success: false, error: "Tidak berwenang" }, { status: 401 });
  const id = Number((await params).id);
  let body;
  try { body = await request.json(); } catch { return noStore({ success: false, error: "Format data tidak dikenali." }, { status: 400 }); }
  if (!Number.isInteger(id) || !STATUSES.includes(body?.status)) return noStore({ success: false, error: "Data perubahan tidak valid." }, { status: 422 });
  try {
    const data = await prisma.scholarshipApplication.update({ where: { id }, data: { status: body.status, staffNote: String(body.note ?? "").trim().slice(0, 1500) || null } });
    return noStore({ success: true, data });
  } catch (error) {
    if (error?.code === "P2025") return noStore({ success: false, error: "Pendaftar tidak ditemukan." }, { status: 404 });
    console.error("[scholarship-application] update", error);
    return noStore({ success: false, error: "Gagal menyimpan perubahan." }, { status: 500 });
  }
}
