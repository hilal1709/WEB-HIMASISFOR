import prisma from "@/lib/prisma";
import { CURTAIN_KEY, mergeLayanan } from "@/lib/layanan-content";
import { SiteHeader, Topbar } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { AosReady } from "@/components/motion/aos-provider";
import { HeadingStyle } from "@/components/home/shared";
import { PageCurtain } from "@/components/motion/page-curtain";
import { LayananProvider } from "@/components/layanan/layanan-provider";
import { LayananHero } from "@/components/layanan/layanan-hero";
import { ServiceMenu } from "@/components/layanan/service-menu";
import { Tracker } from "@/components/layanan/tracker";
import { FindUs } from "@/components/layanan/find-us";
import { AskElvo } from "@/components/layanan/ask-elvo";

export const revalidate = 300;

export const metadata = {
  title: "Layanan Akademik — Sistem Informasi UISI",
  description:
    "Ajukan surat keterangan, persetujuan Kaprodi, dan janji konsultasi Program Studi Sistem Informasi UISI secara daring, lalu lacak statusnya dengan kode pengajuan.",
};

async function getData() {
  try {
    const row = await prisma.pageContent.findFirst({ where: { section: "layanan-akademik", isActive: true } });
    return mergeLayanan(row);
  } catch {
    return mergeLayanan(null);
  }
}

/** Layanan Akademik — tema beranda "Kampus v3" (maroon + navy + gold di atas cream). */
export default async function LayananAkademikPage() {
  const data = await getData();
  return (
    <div className="kampus" data-aos-wait>
      <PageCurtain storageKey={CURTAIN_KEY} title="Layanan" accent="Akademik" label="Membuka loket layanan" />
      <Topbar />
      <SiteHeader />
      <LayananProvider data={data}>
        <HeadingStyle value="split">
          <main>
            <LayananHero />
            <ServiceMenu />
            <Tracker />
            <FindUs />
            <AskElvo />
          </main>
        </HeadingStyle>
      </LayananProvider>
      <SiteFooter />
      <AosReady />
    </div>
  );
}
