import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { noStore } from "@/lib/layanan-server";

export const dynamic = "force-dynamic";

const PENDING = ["diterima", "diverifikasi"];

/**
 * Ringkasan dashboard CMS (butuh sesi admin). Tiap bagian dibungkus sendiri supaya satu tabel yang
 * belum termigrasi tidak menjatuhkan seluruh dashboard — bagian itu cukup kosong.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user) return noStore({ success: false, error: "Tidak berwenang" }, { status: 401 });

  const safe = async (fn, fallback) => {
    try {
      return await fn();
    } catch (error) {
      console.error("[dashboard]", error);
      return fallback;
    }
  };

  const [achievements, gallery, requestGroups, recentRequests, postGroups, recentPosts, upcomingEvents] = await Promise.all([
    safe(() => prisma.achievement.count(), 0),
    safe(() => prisma.gallery.count({ where: { isActive: true } }), 0),
    safe(() => prisma.serviceRequest.groupBy({ by: ["status"], _count: { _all: true } }), []),
    safe(
      () =>
        prisma.serviceRequest.findMany({
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { id: true, code: true, serviceKey: true, name: true, nim: true, status: true, createdAt: true },
        }),
      []
    ),
    safe(() => prisma.post.groupBy({ by: ["status"], _count: { _all: true } }), []),
    safe(
      () =>
        prisma.post.findMany({
          orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
          take: 6,
          select: { id: true, slug: true, title: true, cover: true, category: true, status: true, publishedAt: true },
        }),
      []
    ),
    safe(
      () =>
        prisma.event.findMany({
          where: { status: "terbit", startAt: { gte: new Date() } },
          orderBy: { startAt: "asc" },
          take: 3,
          select: { id: true, slug: true, title: true, place: true, mode: true, startAt: true },
        }),
      []
    ),
  ]);

  const byStatus = Object.fromEntries(requestGroups.map((g) => [g.status, g._count._all]));
  const postCounts = Object.fromEntries(postGroups.map((g) => [g.status, g._count._all]));

  return noStore({
    success: true,
    data: {
      viewer: session.user.name ?? "",
      counts: {
        achievements,
        gallery,
        requestsPending: PENDING.reduce((sum, key) => sum + (byStatus[key] ?? 0), 0),
        requestsTotal: Object.values(byStatus).reduce((sum, n) => sum + n, 0),
        postsPublished: postCounts.terbit ?? 0,
        postsDraft: postCounts.draf ?? 0,
      },
      recentRequests,
      recentPosts,
      upcomingEvents,
    },
  });
}
