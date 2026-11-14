import { auth } from "@/auth";
import { noStore } from "@/lib/layanan-server";
import { cleanBidang } from "@/lib/bidang-cms/schema";
import { discardDraft, saveDraft, snapshot } from "@/lib/bidang-cms/store";
import { getReferences } from "@/lib/bidang-cms/server";
import { broadcast } from "@/lib/realtime/server";

export const dynamic = "force-dynamic";

async function guard() {
  const session = await auth();
  if (!session?.user) return { error: noStore({ success: false, error: "Tidak berwenang" }, { status: 401 }) };
  return { by: session.user.name || session.user.email || "Admin" };
}

/** Keadaan Konsol Bidang: isi kerja, versi live, draf, riwayat. */
export async function GET() {
  const { by, error } = await guard();
  if (error) return error;
  try {
    const [data, refs] = await Promise.all([snapshot(), getReferences()]);
    return noStore({ success: true, data, refs, user: { name: by } });
  } catch (e) {
    console.error("[bidang-cms] snapshot", e);
    return noStore({ success: false, error: "Gagal memuat bidang" }, { status: 500 });
  }
}

/** Autosave draf. Admin lain menerima perubahan via Pusher. */
export async function PUT(request) {
  const { by, error } = await guard();
  if (error) return error;
  const body = await request.json().catch(() => null);
  const value = cleanBidang(body?.value);
  if (!value) return noStore({ success: false, error: "Isian tidak valid" }, { status: 422 });
  try {
    const data = await saveDraft(value);
    await broadcast("private-admin", "bidang:draft", { by, data }, body?.socketId);
    return noStore({ success: true, data });
  } catch (e) {
    console.error("[bidang-cms] save", e);
    return noStore({ success: false, error: "Gagal menyimpan draf" }, { status: 500 });
  }
}

/** Buang draf → kembali ke versi live. */
export async function DELETE(request) {
  const { by, error } = await guard();
  if (error) return error;
  try {
    const data = await discardDraft();
    await broadcast("private-admin", "bidang:draft", { by, data }, request.headers.get("x-socket-id"));
    return noStore({ success: true, data });
  } catch (e) {
    console.error("[bidang-cms] discard", e);
    return noStore({ success: false, error: "Gagal membuang draf" }, { status: 500 });
  }
}
