import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { noStore } from "@/lib/layanan-server";
import { refreshSite } from "@/lib/realtime/server";
import { KonversiConflict, KonversiValidation, konversiSnapshot, writeKonversi } from "@/lib/konversi-cms/server";

export const dynamic = "force-dynamic";
const paths = ["/konversi-sks", "/bootcamp"];
const fail = (status, error) => noStore({ success: false, error }, { status });

export async function GET() {
  if (!(await auth())?.user) return fail(401, "Sesi admin diperlukan.");
  try {
    return noStore({ success: true, data: await konversiSnapshot() });
  } catch (error) {
    console.error("[konversi-cms] read", error);
    return fail(500, "Konten gagal dimuat.");
  }
}

async function write(request, action) {
  if (!(await auth())?.user) return fail(401, "Sesi admin diperlukan.");
  const body = await request.json().catch(() => null);
  if (typeof body?.revision !== "string") return fail(422, "Revisi tidak valid.");
  try {
    const data = await writeKonversi(action, body.revision, body.value);
    if (action === "publish") {
      paths.forEach((path) => revalidatePath(path));
      await refreshSite(paths);
    }
    return noStore({ success: true, data });
  } catch (error) {
    if (error instanceof KonversiConflict || ["P2034", "P2002"].includes(error.code)) return fail(409, "Versi di server sudah berubah.");
    if (error instanceof KonversiValidation) return fail(422, error.message);
    console.error("[konversi-cms]", action, error);
    return fail(500, "Perubahan gagal diproses. Coba lagi.");
  }
}

export const PUT = (request) => write(request, "save");
export const POST = (request) => write(request, "publish");
export const DELETE = (request) => write(request, "discard");
