import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { noStore } from "@/lib/layanan-server";
import { ALL_KEYS, publish, snapshot } from "@/lib/home-cms/store";
import { broadcast, refreshSite } from "@/lib/realtime/server";

export const dynamic = "force-dynamic";

const GLOBAL = ["header", "footer"];

/** Terbitkan draf (semua atau sebagian). Pengunjung yang sedang membuka situs langsung diperbarui via Pusher. */
export async function POST(request) {
  const session = await auth();
  if (!session?.user) return noStore({ success: false, error: "Tidak berwenang" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const keys = Array.isArray(body?.sections) ? body.sections.filter((k) => ALL_KEYS.includes(k)) : ALL_KEYS;
  const by = session.user.name || session.user.email || "Admin";
  try {
    const done = await publish(keys, by);
    if (done.length) {
      // kepala/kaki situs tampil di semua halaman → segarkan seluruh situs
      const global = done.some((k) => GLOBAL.includes(k));
      revalidatePath("/", global ? "layout" : "page");
      await Promise.all([
        refreshSite(global ? ["*"] : ["/"]),
        broadcast("private-admin", "home:published", { sections: done, by }, body?.socketId),
      ]);
    }
    return noStore({ success: true, published: done, data: await snapshot() });
  } catch (e) {
    console.error("[home-cms] publish", e);
    return noStore({ success: false, error: "Gagal menerbitkan" }, { status: 500 });
  }
}
