import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { noStore } from "@/lib/layanan-server";
import { publish, snapshot } from "@/lib/struktur-cms/store";
import { broadcast, refreshSite } from "@/lib/realtime/server";

export const dynamic = "force-dynamic";

/** Halaman yang memakai data orang dari Studio Bagan. */
const PATHS = ["/struktur-organisasi", "/dosen", "/bidang-keahlian", "/bootcamp"];

/** Terbitkan draf struktur; pengunjung yang sedang membuka halaman terkait langsung diperbarui. */
export async function POST(request) {
  const session = await auth();
  if (!session?.user) return noStore({ success: false, error: "Tidak berwenang" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const by = session.user.name || session.user.email || "Admin";
  try {
    const changed = await publish(by);
    if (changed) {
      PATHS.forEach((p) => revalidatePath(p));
      await Promise.all([refreshSite(PATHS), broadcast("private-admin", "struktur:published", { by }, body?.socketId)]);
    }
    return noStore({ success: true, published: changed, data: await snapshot() });
  } catch (e) {
    console.error("[struktur-cms] publish", e);
    return noStore({ success: false, error: "Gagal menerbitkan" }, { status: 500 });
  }
}
