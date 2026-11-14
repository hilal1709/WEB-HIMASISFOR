import { auth } from "@/auth";
import { noStore } from "@/lib/layanan-server";
import { cleanPrestasi } from "@/lib/prestasi-cms/schema";
import { discardDraft, saveDraft, snapshot } from "@/lib/prestasi-cms/store";
import { broadcast } from "@/lib/realtime/server";

export const dynamic = "force-dynamic";

async function guard() {
  const session = await auth();
  if (!session?.user) return { error: noStore({ success: false, error: "Tidak berwenang" }, { status: 401 }) };
  return { by: session.user.name || session.user.email || "Admin" };
}

/** Keadaan Ruang Kurator: isi kerja, versi live, draf, riwayat. */
export async function GET() {
  const { by, error } = await guard();
  if (error) return error;
  try {
    return noStore({ success: true, data: await snapshot(), user: { name: by } });
  } catch (e) {
    console.error("[prestasi-cms] snapshot", e);
    return noStore({ success: false, error: "Gagal memuat ruang kurator" }, { status: 500 });
  }
}

/** Autosave draf. Admin lain menerima perubahan via Pusher. */
export async function PUT(request) {
  const { by, error } = await guard();
  if (error) return error;
  const body = await request.json().catch(() => null);
  const value = cleanPrestasi(body?.value);
  if (!value) return noStore({ success: false, error: "Isian tidak valid" }, { status: 422 });
  try {
    const data = await saveDraft(value);
    await broadcast("private-admin", "prestasi:draft", { by, data }, body?.socketId);
    return noStore({ success: true, data });
  } catch (e) {
    console.error("[prestasi-cms] save", e);
    return noStore({ success: false, error: "Gagal menyimpan draf" }, { status: 500 });
  }
}

/** Buang draf → kembali ke versi live. */
export async function DELETE(request) {
  const { by, error } = await guard();
  if (error) return error;
  try {
    const data = await discardDraft();
    await broadcast("private-admin", "prestasi:draft", { by, data }, request.headers.get("x-socket-id"));
    return noStore({ success: true, data });
  } catch (e) {
    console.error("[prestasi-cms] discard", e);
    return noStore({ success: false, error: "Gagal membuang draf" }, { status: 500 });
  }
}
