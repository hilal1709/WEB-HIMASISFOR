import prisma from "@/lib/prisma";
import { clientIp, loadServices, noStore, normalizeCode, normalizeNim, publicView, rateLimit } from "@/lib/layanan-server";

export const dynamic = "force-dynamic";

/** Lacak pengajuan dengan kode + NIM (POST agar NIM tidak masuk URL / log). */
export async function POST(request) {
  const limit = rateLimit(`lacak:${clientIp(request)}`, { limit: 30, windowMs: 10 * 60 * 1000 });
  if (!limit.ok) return noStore({ success: false, error: "Terlalu banyak percobaan. Tunggu sebentar." }, { status: 429 });

  let body;
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const code = normalizeCode(body.code);
  const nim = normalizeNim(body.nim);
  if (!/^LA-\d{4}-[A-Z0-9]{4}$/.test(code) || nim.length < 8) {
    return noStore({ success: false, error: "Lengkapi kode pengajuan dan NIM." }, { status: 400 });
  }

  try {
    const req = await prisma.serviceRequest.findUnique({ where: { code }, include: { events: { orderBy: { createdAt: "asc" } } } });
    // pesan sama untuk kode salah maupun NIM salah → tidak membocorkan keberadaan kode
    if (!req || req.nim !== nim) {
      return noStore({ success: false, error: "Pengajuan tidak ditemukan. Periksa kode dan NIM-mu." }, { status: 404 });
    }
    const data = await loadServices();
    return noStore({ success: true, data: publicView(req, data) });
  } catch (error) {
    console.error("[layanan] gagal melacak", error);
    return noStore({ success: false, error: "Server sedang bermasalah. Coba lagi sebentar lagi." }, { status: 500 });
  }
}
