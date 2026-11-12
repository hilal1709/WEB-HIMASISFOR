import prisma from "@/lib/prisma";
import { CURTAIN_KEY, mergeJalur } from "@/lib/jalur-kelulusan-content";
import { mergeKurikulum } from "@/lib/kurikulum-content";
import { SiteHeader, Topbar } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { AosReady } from "@/components/motion/aos-provider";
import { PageCurtain } from "@/components/motion/page-curtain";
import { JalurProvider } from "@/components/jalur/jalur-provider";
import { JalurHero } from "@/components/jalur/jalur-hero";
import { JalurBanner } from "@/components/jalur/jalur-banner";
import { RouteStory } from "@/components/jalur/route-story";
import { ReadinessCheck } from "@/components/jalur/readiness-check";
import { TradeoffCards } from "@/components/jalur/tradeoff-cards";
import { JalurClosing } from "@/components/jalur/jalur-closing";

export const revalidate = 300;

export const metadata = {
  title: "Jalur Kelulusan — Sistem Informasi UISI",
  description:
    "Empat jalur tugas akhir S1 Sistem Informasi UISI: skripsi, lomba, PKM, dan bisnis — tahapan, syarat, luaran, risiko, dan cek kesiapan untuk tiap jalur.",
};

async function getData() {
  try {
    const rows = await prisma.pageContent.findMany({ where: { section: { in: ["jalur-kelulusan", "curriculum"] }, isActive: true } });
    const row = (s) => rows.find((r) => r.section === s) ?? null;
    return mergeJalur(row("jalur-kelulusan"), { kurikulum: mergeKurikulum(row("curriculum")) });
  } catch {
    return mergeJalur(null, { kurikulum: mergeKurikulum(null) });
  }
}

/** Jalur Kelulusan — tema beranda "Kampus v3" (maroon + navy + gold di atas cream). */
export default async function JalurKelulusanPage() {
  const data = await getData();
  return (
    <div className="kampus" data-aos-wait>
      <PageCurtain storageKey={CURTAIN_KEY} title="Jalur" accent="Kelulusan" label="Memuat jalur kelulusan" />
      <Topbar />
      <SiteHeader />
      <JalurProvider data={data}>
        <main>
          <JalurHero />
          <JalurBanner />
          <RouteStory />
          <ReadinessCheck />
          <TradeoffCards />
          <JalurClosing />
        </main>
      </JalurProvider>
      <SiteFooter />
      <AosReady />
    </div>
  );
}
