import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { isStatus, noStore } from "@/lib/layanan-server";

export const dynamic = "force-dynamic";

/** Ubah status + catatan pengajuan; setiap perubahan tercatat sebagai peristiwa di linimasa. */
export async function PATCH(request, { params }) {
  const session = await auth();
  if (!session?.user) return noStore({ success: false, error: "Tidak berwenang" }, { status: 401 });

  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id)) return noStore({ success: false, error: "ID tidak valid" }, { status: 400 });

  let body;
  try {
    body = await request.json();
  } catch {
    return noStore({ success: false, error: "Format data tidak dikenali." }, { status: 400 });
  }
  const status = String(body.status ?? "");
  const note = String(body.note ?? "").trim().slice(0, 1500) || null;
  if (!isStatus(status)) return noStore({ success: false, error: "Status tidak dikenal." }, { status: 422 });
  if (["perlu-perbaikan", "ditolak"].includes(status) && !note) {
    return noStore({ success: false, error: "Tulis catatan agar mahasiswa tahu apa yang perlu diperbaiki." }, { status: 422 });
  }

  try {
    const updated = await prisma.serviceRequest.update({
      where: { id },
      data: {
        status,
        staffNote: note ?? undefined,
        events: { create: { status, note, by: session.user.name ?? session.user.email ?? null } },
      },
      include: { events: { orderBy: { createdAt: "asc" } } },
    });
    return noStore({ success: true, data: updated });
  } catch (error) {
    if (error?.code === "P2025") return noStore({ success: false, error: "Pengajuan tidak ditemukan." }, { status: 404 });
    console.error("[layanan] admin update", error);
    return noStore({ success: false, error: "Gagal menyimpan perubahan." }, { status: 500 });
  }
}
