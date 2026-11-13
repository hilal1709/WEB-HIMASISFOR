import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { isStatus, noStore } from "@/lib/layanan-server";

export const dynamic = "force-dynamic";

/** Daftar pengajuan untuk staf (butuh sesi admin). ?status=&q= */
export async function GET(request) {
  const session = await auth();
  if (!session?.user) return noStore({ success: false, error: "Tidak berwenang" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const q = (searchParams.get("q") ?? "").trim().slice(0, 80);

  const where = {};
  if (status && isStatus(status)) where.status = status;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { nim: { contains: q } },
      { code: { contains: q.toUpperCase() } },
    ];
  }

  try {
    const [rows, grouped] = await Promise.all([
      prisma.serviceRequest.findMany({ where, orderBy: { createdAt: "desc" }, take: 200, include: { events: { orderBy: { createdAt: "asc" } } } }),
      prisma.serviceRequest.groupBy({ by: ["status"], _count: { _all: true } }),
    ]);
    const counts = Object.fromEntries(grouped.map((g) => [g.status, g._count._all]));
    return noStore({ success: true, data: rows, counts });
  } catch (error) {
    console.error("[layanan] admin list", error);
    return noStore({ success: false, error: "Gagal memuat pengajuan. Pastikan migrasi database sudah dijalankan." }, { status: 500 });
  }
}
