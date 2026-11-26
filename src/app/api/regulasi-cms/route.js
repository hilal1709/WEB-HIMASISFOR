import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { noStore } from "@/lib/layanan-server";
import { refreshSite } from "@/lib/realtime/server";
import { RegulasiConflict, RegulasiValidation, regulasiSnapshot, writeRegulasi } from "@/lib/regulasi-cms/server";

export const dynamic = "force-dynamic";
const fail = (status, error) => noStore({ success: false, error }, { status });

export async function GET() {
  if (!(await auth())?.user) return fail(401, "Sesi admin diperlukan.");
  try {
    return noStore({ success: true, data: await regulasiSnapshot() });
  } catch (error) {
    console.error("[regulasi-cms] read", error);
    return fail(500, "Naskah gagal dimuat.");
  }
}

async function write(request, action) {
  if (!(await auth())?.user) return fail(401, "Sesi admin diperlukan.");
  const body = await request.json().catch(() => null);
  if (typeof body?.revision !== "string") return fail(422, "Revisi naskah tidak valid.");
  try {
    const data = await writeRegulasi(action, body.revision, body.value);
    if (action === "publish" && data.revision !== body.revision) {
      revalidatePath("/regulasi-akademik");
      await refreshSite(["/regulasi-akademik"]);
    }
    return noStore({ success: true, data });
  } catch (error) {
    if (error instanceof RegulasiConflict || ["P2034", "P2002"].includes(error.code)) {
      return fail(409, "Naskah di server sudah berubah.");
    }
    if (error instanceof RegulasiValidation) return fail(422, error.message);
    console.error("[regulasi-cms]", action, error);
    return fail(500, "Perubahan gagal diproses. Coba lagi.");
  }
}

export const PUT = (request) => write(request, "save");
export const POST = (request) => write(request, "publish");
export const DELETE = (request) => write(request, "discard");
