import { auth } from "@/auth";
import { noStore } from "@/lib/layanan-server";
import { snapshot } from "@/lib/home-cms/store";

export const dynamic = "force-dynamic";

/** Seluruh section beranda untuk Studio: isi kerja, versi live, dan status draf. */
export async function GET() {
  const session = await auth();
  if (!session?.user) return noStore({ success: false, error: "Tidak berwenang" }, { status: 401 });
  try {
    return noStore({ success: true, data: await snapshot(), user: { name: session.user.name || session.user.email || "Admin" } });
  } catch (error) {
    console.error("[home-cms] snapshot", error);
    return noStore({ success: false, error: "Gagal memuat isi beranda" }, { status: 500 });
  }
}
