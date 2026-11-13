import prisma from "@/lib/prisma";
import { estimateReady } from "@/lib/layanan-content";
import { clientIp, loadServices, makeCode, noStore, rateLimit, validateSubmission } from "@/lib/layanan-server";

export const dynamic = "force-dynamic";

/** Pengajuan layanan baru (publik). Mengembalikan kode tiket untuk pelacakan. */
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return noStore({ success: false, error: "Format data tidak dikenali." }, { status: 400 });
  }

  // honeypot: bot mengisi kolom tersembunyi → pura-pura berhasil tanpa menyimpan
  if (body?.website) return noStore({ success: true, code: "LA-0000-0000" }, { status: 201 });

  const limit = rateLimit(`ajukan:${clientIp(request)}`, { limit: 5, windowMs: 10 * 60 * 1000 });
  if (!limit.ok) {
    return noStore(
      { success: false, error: "Terlalu banyak pengajuan dari perangkat ini. Coba lagi beberapa menit lagi." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const data = await loadServices();
  const { errors, value, service } = validateSubmission(body, data.services);
  if (errors) return noStore({ success: false, error: "Periksa lagi isianmu.", errors }, { status: 422 });

  const resubmitOf = typeof body?.resubmitOf === "string" ? body.resubmitOf.slice(0, 20) : "";

  try {
    let created = null;
    for (let i = 0; i < 4 && !created; i++) {
      try {
        created = await prisma.serviceRequest.create({
          data: {
            code: makeCode(),
            ...value,
            fields: JSON.stringify(value.fields),
            events: { create: { status: "diterima", note: resubmitOf ? `Pengajuan ulang dari ${resubmitOf}` : null } },
          },
        });
      } catch (e) {
        if (e?.code !== "P2002") throw e; // kode kembar → ulangi
      }
    }
    if (!created) throw new Error("Kode tiket gagal dibuat");
    return noStore(
      { success: true, code: created.code, estimate: estimateReady(service.sla, created.createdAt, data.hours) },
      { status: 201 }
    );
  } catch (error) {
    console.error("[layanan] gagal menyimpan pengajuan", error);
    return noStore({ success: false, error: "Server sedang bermasalah. Isianmu tetap tersimpan di perangkat ini." }, { status: 500 });
  }
}
