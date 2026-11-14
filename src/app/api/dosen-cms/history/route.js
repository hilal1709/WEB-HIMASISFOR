import { auth } from "@/auth";
import { noStore } from "@/lib/layanan-server";
import { restore } from "@/lib/dosen-cms/store";
import { broadcast } from "@/lib/realtime/server";

export const dynamic = "force-dynamic";

/** Pulihkan satu versi terbit sebelumnya ke draf. */
export async function POST(request) {
  const session = await auth();
  if (!session?.user) return noStore({ success: false, error: "Tidak berwenang" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const index = Number(body?.index);
  if (!Number.isInteger(index) || index < 0) return noStore({ success: false, error: "Versi tidak valid" }, { status: 422 });
  try {
    const data = await restore(index);
    if (!data) return noStore({ success: false, error: "Versi tidak ditemukan" }, { status: 404 });
    await broadcast("private-admin", "dosen:draft", { by: session.user.name || "Admin", data }, body?.socketId);
    return noStore({ success: true, data });
  } catch (e) {
    console.error("[dosen-cms] restore", e);
    return noStore({ success: false, error: "Gagal memulihkan versi" }, { status: 500 });
  }
}
