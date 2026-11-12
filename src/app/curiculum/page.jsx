import prisma from "@/lib/prisma";
import { CURTAIN_KEY, mergeKurikulum } from "@/lib/kurikulum-content";
import { SiteHeader, Topbar } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { AosReady } from "@/components/motion/aos-provider";
import { PageCurtain } from "@/components/motion/page-curtain";
import { KurikulumProvider } from "@/components/kurikulum/kurikulum-provider";
import { KurikulumHero } from "@/components/kurikulum/kurikulum-hero";
import { StudyMap } from "@/components/kurikulum/study-map";
import { SemesterLedger } from "@/components/kurikulum/semester-ledger";
import { ElectiveTracks } from "@/components/kurikulum/elective-tracks";
import { RpsAnatomy } from "@/components/kurikulum/rps-anatomy";
import { Closing } from "@/components/kurikulum/closing";

export const revalidate = 300;

export const metadata = {
  title: "Kurikulum & RPS — Sistem Informasi UISI",
  description:
    "Struktur kurikulum S1 Sistem Informasi UISI per semester, mata kuliah pilihan, dan rencana pembelajaran semester (RPS) tiap mata kuliah.",
};

async function getData() {
  try {
    const row = await prisma.pageContent.findUnique({ where: { section: "curriculum" } });
    return mergeKurikulum(row?.isActive === false ? null : row);
  } catch {
    return mergeKurikulum(null);
  }
}

/** Kurikulum & RPS — tema beranda "Kampus v3" (maroon + navy + gold di atas cream). */
export default async function KurikulumPage() {
  const data = await getData();
  return (
    <div className="kampus" data-aos-wait>
      <PageCurtain storageKey={CURTAIN_KEY} title="Kurikulum" accent="& RPS" label="Memuat kurikulum" />
      <Topbar />
      <SiteHeader />
      <KurikulumProvider data={data}>
        <main>
          <KurikulumHero />
          <StudyMap />
          <SemesterLedger />
          <ElectiveTracks />
          <RpsAnatomy />
          <Closing />
        </main>
      </KurikulumProvider>
      <SiteFooter />
      <AosReady />
    </div>
  );
}
