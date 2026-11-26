import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { noStore } from "@/lib/layanan-server";
import { refreshSite } from "@/lib/realtime/server";
import { MagangConflict, MagangValidation, magangSnapshot, writeMagang } from "@/lib/magang-cms/server";

export const dynamic = "force-dynamic";
const fail = (status, error) => noStore({ success: false, error }, { status });

export async function GET() {
  if (!(await auth())?.user) return fail(401, "Sesi admin diperlukan.");
  try {
    return noStore({ success: true, data: await magangSnapshot() });
  } catch (error) {
    console.error("[magang-cms] read", error);
    return fail(500, "Konten Magang gagal dimuat.");
  }
}

async function write(request, action) {
  if (!(await auth())?.user) return fail(401, "Sesi admin diperlukan.");
  const body = await request.json().catch(() => null);
  if (typeof body?.revision !== "string") return fail(422, "Revisi konten tidak valid.");
  try {
    const data = await writeMagang(action, body.revision, body.value);
    if (action === "publish" && data.revision !== body.revision) {
      revalidatePath("/magang");
      await refreshSite(["/magang"]);
    }
    return noStore({ success: true, data });
  } catch (error) {
    if (error instanceof MagangConflict || ["P2034", "P2002"].includes(error.code)) return fail(409, "Konten Magang sudah berubah di server.");
    if (error instanceof MagangValidation) return fail(422, error.message);
    console.error("[magang-cms]", action, error);
    return fail(500, "Perubahan gagal diproses. Coba lagi.");
  }
}

export const PUT = (request) => write(request, "save");
export const POST = (request) => write(request, "publish");
export const DELETE = (request) => write(request, "discard");
