import prisma from "@/lib/prisma";
import { CURTAIN_KEY, mergeBeasiswa } from "@/lib/beasiswa-content";
import { SiteHeader, Topbar } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { AosReady } from "@/components/motion/aos-provider";
import { HeadingStyle } from "@/components/home/shared";
import { PageCurtain } from "@/components/motion/page-curtain";
import { BeasiswaProvider } from "@/components/beasiswa/beasiswa-provider";
import { BeasiswaHero } from "@/components/beasiswa/beasiswa-hero";
import { CoverageRuler } from "@/components/beasiswa/coverage-ruler";
import { PassportCheck } from "@/components/beasiswa/passport-check";
import { YearDial } from "@/components/beasiswa/year-dial";
import { Obligations } from "@/components/beasiswa/obligations";
import { WalletClosing } from "@/components/beasiswa/wallet-closing";

export const revalidate = 300;

export const metadata = {
  title: "Beasiswa — Sistem Informasi UISI",
  description:
    "Beasiswa untuk mahasiswa S1 Sistem Informasi UISI: berapa persen UKT yang ditanggung, cek kelayakan, kalender pendaftaran, dan kewajiban selama menerima.",
};

async function getData() {
  try {
    const row = await prisma.pageContent.findFirst({ where: { section: "beasiswa", isActive: true } });
    return mergeBeasiswa(row);
  } catch {
    return mergeBeasiswa(null);
  }
}

/** Beasiswa — tema beranda "Kampus v3" (maroon + navy + gold di atas cream). Lihat DESIGN.md › Halaman Beasiswa. */
export default async function BeasiswaPage() {
  const data = await getData();
  return (
    <div className="kampus" data-aos-wait>
      <PageCurtain storageKey={CURTAIN_KEY} title="Beasiswa" accent="Sisfor" label="Memuat info beasiswa" />
      <Topbar />
      <SiteHeader />
      <BeasiswaProvider data={data}>
        <HeadingStyle value="ticks">
          <main>
            <BeasiswaHero />
            <CoverageRuler />
            <PassportCheck />
            <YearDial />
            <Obligations />
            <WalletClosing />
          </main>
        </HeadingStyle>
      </BeasiswaProvider>
      <SiteFooter />
      <AosReady />
    </div>
  );
}
