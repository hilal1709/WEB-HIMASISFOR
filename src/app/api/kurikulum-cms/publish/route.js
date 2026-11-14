import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { noStore } from "@/lib/layanan-server";
import { publish, snapshot } from "@/lib/kurikulum-cms/store";
import { broadcast, refreshSite } from "@/lib/realtime/server";

export const dynamic = "force-dynamic";

/** Halaman yang membaca data kurikulum (tautan #rps-<slug>, daftar mata kuliah, rumpun). */
const PATHS = ["/curiculum", "/konversi-sks", "/bidang-keahlian", "/jalur-kelulusan", "/regulasi-akademik", "/magang"];

/** Terbitkan draf kurikulum; pengunjung yang sedang membuka halaman langsung diperbarui. */
export async function POST(request) {
  const session = await auth();
  if (!session?.user) return noStore({ success: false, error: "Tidak berwenang" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const by = session.user.name || session.user.email || "Admin";
  try {
    const changed = await publish(by);
    if (changed) {
      PATHS.forEach((p) => revalidatePath(p));
      await Promise.all([
        refreshSite(PATHS),
        broadcast("private-admin", "kurikulum:published", { by }, body?.socketId),
      ]);
    }
    return noStore({ success: true, published: changed, data: await snapshot() });
  } catch (e) {
    console.error("[kurikulum-cms] publish", e);
    return noStore({ success: false, error: "Gagal menerbitkan" }, { status: 500 });
  }
}
