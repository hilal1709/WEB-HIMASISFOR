import prisma from "@/lib/prisma";
import { CURTAIN_KEY, mergeMagang } from "@/lib/magang-content";
import { getKurikulumData } from "@/lib/kurikulum-cms/server";
import { SiteHeader, Topbar } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { AosReady } from "@/components/motion/aos-provider";
import { MagangProvider } from "@/components/magang/magang-provider";
import { MagangHero } from "@/components/magang/magang-hero";
import { RouteDoors } from "@/components/magang/route-doors";
import { JobBoard } from "@/components/magang/job-board";
import { ApplicationTracker } from "@/components/magang/application-tracker";
import { Logbook } from "@/components/magang/logbook";
import { MagangClosing } from "@/components/magang/magang-closing";
import { HeadingStyle } from "@/components/home/shared";
import { PageCurtain } from "@/components/motion/page-curtain";

export const revalidate = 300;

export const metadata = {
  title: "Magang — Sistem Informasi UISI",
  description:
    "Kerja Praktik, Magang Mandiri, dan Program Dikti untuk mahasiswa S1 Sistem Informasi UISI: lowongan dari mitra industri, pelacak lamaran, dan berkas administrasi magang.",
};

async function getData() {
  try {
    const rows = await prisma.pageContent.findMany({ where: { section: { in: ["magang", "curriculum"] }, isActive: true } });
    const row = (s) => rows.find((r) => r.section === s) ?? null;
    return mergeMagang(row("magang"), { kurikulum: await getKurikulumData() });
  } catch {
    return mergeMagang(null, { kurikulum: await getKurikulumData() });
  }
}

/** Magang — tema beranda "Kampus v3" (maroon + navy + gold di atas cream). */
export default async function MagangPage() {
  const data = await getData();
  return (
    <div className="kampus" data-aos-wait>
      <PageCurtain storageKey={CURTAIN_KEY} title="Magang" accent="Sisfor" label="Memuat info magang" />
      <Topbar />
      <SiteHeader />
      <MagangProvider data={data}>
        <HeadingStyle value="centered">
        <main>
          <MagangHero />
          <RouteDoors />
          <JobBoard />
          <ApplicationTracker />
          <Logbook />
          <MagangClosing />
        </main>
        </HeadingStyle>
      </MagangProvider>
      <SiteFooter />
      <AosReady />
    </div>
  );
}
