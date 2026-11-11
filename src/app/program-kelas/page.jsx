import prisma from "@/lib/prisma";
import { CURTAIN_KEY, mergeProgramKelas } from "@/lib/program-kelas-content";
import { SiteHeader, Topbar } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { AosReady } from "@/components/motion/aos-provider";
import { PageCurtain } from "@/components/motion/page-curtain";
import { KelasProvider } from "@/components/program-kelas/kelas-provider";
import { KelasHero } from "@/components/program-kelas/kelas-hero";
import { PmbBanner } from "@/components/program-kelas/pmb-banner";
import { ClassSwitcher } from "@/components/program-kelas/class-switcher";
import { WeekSchedule } from "@/components/program-kelas/week-schedule";
import { CompareTable } from "@/components/program-kelas/compare-table";
import { Faq } from "@/components/program-kelas/faq";
import { Closing } from "@/components/program-kelas/closing";

export const revalidate = 300;

export const metadata = {
  title: "Program Kelas — Sistem Informasi UISI",
  description:
    "Pilihan program kelas Sistem Informasi UISI: Kelas Reguler, Kelas Karyawan, dan Kelas Kemitraan Industri, lengkap dengan jadwal, biaya, dan perbandingannya.",
};

async function getData() {
  try {
    const rows = await prisma.pageContent.findMany({ where: { section: "program-kelas", isActive: true } });
    return mergeProgramKelas(rows);
  } catch {
    return mergeProgramKelas([]);
  }
}

/** Program Kelas — tema beranda "Kampus v3" (maroon + navy + gold di atas cream). */
export default async function ProgramKelasPage() {
  const data = await getData();
  return (
    <div className="kampus" data-aos-wait>
      <PageCurtain storageKey={CURTAIN_KEY} title="Program" accent="Kelas" label="Memuat program kelas" />
      <Topbar />
      <SiteHeader />
      <KelasProvider data={data}>
        <main>
          <KelasHero />
          <PmbBanner />
          <ClassSwitcher />
          <WeekSchedule />
          <CompareTable />
          <Faq />
          <Closing />
        </main>
      </KelasProvider>
      <SiteFooter />
      <AosReady />
    </div>
  );
}
