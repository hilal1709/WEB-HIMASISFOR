import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { noStore } from "@/lib/layanan-server";

const STATUSES = ["baru", "dihubungi", "selesai", "dibatalkan"];

export async function PATCH(request, { params }) {
  const session = await auth();
  if (!session?.user) return noStore({ success: false, error: "Tidak berwenang" }, { status: 401 });
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return noStore({ success: false, error: "ID tidak valid." }, { status: 400 });
  let body;
  try {
    body = await request.json();
  } catch {
    return noStore({ success: false, error: "Format data tidak dikenali." }, { status: 400 });
  }
  if (!STATUSES.includes(body?.status)) return noStore({ success: false, error: "Status tidak dikenal." }, { status: 422 });
  try {
    const data = await prisma.courseRegistration.update({
      where: { id },
      data: { status: body.status, staffNote: String(body.note ?? "").trim().slice(0, 1500) || null },
    });
    return noStore({ success: true, data });
  } catch (error) {
    if (error?.code === "P2025") return noStore({ success: false, error: "Pendaftar tidak ditemukan." }, { status: 404 });
    console.error("[course-registration] update", error);
    return noStore({ success: false, error: "Gagal menyimpan perubahan." }, { status: 500 });
  }
}
