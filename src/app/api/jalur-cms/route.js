import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { noStore } from "@/lib/layanan-server";
import { validateJalur } from "@/lib/jalur-cms/schema";
import { JalurConflict, JalurValidation, jalurSnapshot, writeJalur } from "@/lib/jalur-cms/server";
import { refreshSite } from "@/lib/realtime/server";

export const dynamic = "force-dynamic";

const fail = (status, error) => noStore({ success: false, error }, { status });

export async function GET() {
  if (!(await auth())?.user) return fail(401, "Sesi admin diperlukan.");
  try {
    return noStore({ success: true, data: await jalurSnapshot() });
  } catch (error) {
    console.error("[jalur-cms] snapshot", error);
    return fail(500, "Konten gagal dimuat.");
  }
}

async function write(request, publish) {
  if (!(await auth())?.user) return fail(401, "Sesi admin diperlukan.");
  const body = await request.json().catch(() => null);
  if (typeof body?.revision !== "string") return fail(422, "Revisi konten tidak valid.");
  let value;
  try {
    if (!publish) value = validateJalur(body.value);
  } catch (error) {
    return fail(422, error.message);
  }
  try {
    const data = await writeJalur({ value, revision: body.revision, publish });
    if (publish) {
      revalidatePath("/jalur-kelulusan");
      await refreshSite(["/jalur-kelulusan"]);
    }
    return noStore({ success: true, data });
  } catch (error) {
    if (error instanceof JalurConflict || ["P2034", "P2002"].includes(error.code)) return fail(409, "Versi di server sudah berubah.");
    if (error instanceof JalurValidation) return fail(422, error.message);
    console.error("[jalur-cms] write", error);
    return fail(500, publish ? "Konten gagal diterbitkan." : "Draf gagal disimpan.");
  }
}

export const PUT = (request) => write(request, false);
export const POST = (request) => write(request, true);
