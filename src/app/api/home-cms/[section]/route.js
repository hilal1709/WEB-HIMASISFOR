import { auth } from "@/auth";
import { noStore } from "@/lib/layanan-server";
import { cleanSection } from "@/lib/home-cms/schema";
import { ALL_KEYS, discardDraft, saveDraft } from "@/lib/home-cms/store";
import { broadcast } from "@/lib/realtime/server";

export const dynamic = "force-dynamic";

async function guard(params) {
  const session = await auth();
  if (!session?.user) return { error: noStore({ success: false, error: "Tidak berwenang" }, { status: 401 }) };
  const key = (await params).section;
  if (!ALL_KEYS.includes(key)) return { error: noStore({ success: false, error: "Section tidak dikenal" }, { status: 404 }) };
  return { key, by: session.user.name || session.user.email || "Admin" };
}

/** Simpan draf satu section (autosave Studio). Admin lain menerima perubahannya via Pusher. */
export async function PUT(request, { params }) {
  const { key, by, error } = await guard(params);
  if (error) return error;
  const body = await request.json().catch(() => null);
  const value = cleanSection(key, body?.value);
  if (!value) return noStore({ success: false, error: "Isian tidak valid" }, { status: 422 });
  try {
    const data = await saveDraft(key, value);
    await broadcast("private-admin", "home:draft", { section: key, by, data }, body?.socketId);
    return noStore({ success: true, data });
  } catch (e) {
    console.error("[home-cms] save", e);
    return noStore({ success: false, error: "Gagal menyimpan draf" }, { status: 500 });
  }
}

/** Buang draf → kembali ke versi live. */
export async function DELETE(request, { params }) {
  const { key, by, error } = await guard(params);
  if (error) return error;
  try {
    const data = await discardDraft(key);
    await broadcast("private-admin", "home:draft", { section: key, by, data }, request.headers.get("x-socket-id"));
    return noStore({ success: true, data });
  } catch (e) {
    console.error("[home-cms] discard", e);
    return noStore({ success: false, error: "Gagal membuang draf" }, { status: 500 });
  }
}
