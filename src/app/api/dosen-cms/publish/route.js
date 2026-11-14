import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { noStore } from "@/lib/layanan-server";
import { publish, snapshot } from "@/lib/dosen-cms/store";
import { broadcast, refreshSite } from "@/lib/realtime/server";

export const dynamic = "force-dynamic";

/** Terbitkan draf halaman dosen; pengunjung yang sedang membuka halaman langsung diperbarui. */
export async function POST(request) {
  const session = await auth();
  if (!session?.user) return noStore({ success: false, error: "Tidak berwenang" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const by = session.user.name || session.user.email || "Admin";
  try {
    const changed = await publish(by);
    if (changed) {
      for (const p of ["/dosen", "/bidang-keahlian", "/bootcamp"]) revalidatePath(p);
      await Promise.all([
        refreshSite(["/dosen", "/bidang-keahlian", "/bootcamp"]),
        broadcast("private-admin", "dosen:published", { by }, body?.socketId),
      ]);
    }
    return noStore({ success: true, published: changed, data: await snapshot() });
  } catch (e) {
    console.error("[dosen-cms] publish", e);
    return noStore({ success: false, error: "Gagal menerbitkan" }, { status: 500 });
  }
}
