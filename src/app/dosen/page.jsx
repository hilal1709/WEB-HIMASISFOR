import prisma from "@/lib/prisma";
import { CURTAIN_KEY, mergeDosen } from "@/lib/dosen-content";
import { SiteHeader, Topbar } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { AosReady } from "@/components/motion/aos-provider";
import { PageCurtain } from "@/components/motion/page-curtain";
import { DosenProvider } from "@/components/dosen/dosen-provider";
import { DosenHero } from "@/components/dosen/dosen-hero";
import { StatsBand } from "@/components/dosen/stats-band";
import { Directory } from "@/components/dosen/directory";
import { KaprodiFeature } from "@/components/dosen/kaprodi-feature";
import { ExpertiseMap } from "@/components/dosen/expertise-map";
import { Closing } from "@/components/dosen/closing";

export const revalidate = 300;

export const metadata = {
  title: "Dosen — Sistem Informasi UISI",
  description:
    "Profil dosen Program Studi Sistem Informasi UISI: bidang keahlian, jenjang pendidikan, sertifikasi, mata kuliah, dan topik riset.",
};

async function getData() {
  try {
    const rows = await prisma.pageContent.findMany({ where: { section: { in: ["profil-dosen", "dosen"] }, isActive: true } });
    return mergeDosen(rows);
  } catch {
    return mergeDosen([]);
  }
}

/** Halaman Dosen — tema beranda "Kampus v3" (maroon + navy + gold di atas cream). */
export default async function DosenPage() {
  const data = await getData();
  return (
    <div className="kampus" data-aos-wait>
      <PageCurtain storageKey={CURTAIN_KEY} title="Dosen" accent="Sisfor" label="Memuat profil dosen" />
      <Topbar />
      <SiteHeader />
      <DosenProvider data={data}>
        <main>
          <DosenHero />
          <StatsBand />
          <Directory />
          <KaprodiFeature />
          <ExpertiseMap />
          <Closing />
        </main>
      </DosenProvider>
      <SiteFooter />
      <AosReady />
    </div>
  );
}
