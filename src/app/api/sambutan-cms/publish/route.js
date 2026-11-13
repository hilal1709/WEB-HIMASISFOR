import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { noStore } from "@/lib/layanan-server";
import { publish, snapshot } from "@/lib/sambutan-cms/store";
import { broadcast, refreshSite } from "@/lib/realtime/server";

export const dynamic = "force-dynamic";

/** Terbitkan draf sambutan; pengunjung yang sedang membuka halaman langsung diperbarui. */
export async function POST(request) {
  const session = await auth();
  if (!session?.user) return noStore({ success: false, error: "Tidak berwenang" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const by = session.user.name || session.user.email || "Admin";
  try {
    const changed = await publish(by);
    if (changed) {
      revalidatePath("/sambutan-kaprodi");
      await Promise.all([
        refreshSite(["/sambutan-kaprodi"]),
        broadcast("private-admin", "sambutan:published", { by }, body?.socketId),
      ]);
    }
    return noStore({ success: true, published: changed, data: await snapshot() });
  } catch (e) {
    console.error("[sambutan-cms] publish", e);
    return noStore({ success: false, error: "Gagal menerbitkan" }, { status: 500 });
  }
}
