import prisma from "@/lib/prisma";
import { CURTAIN_KEY, mergeRegulasi } from "@/lib/regulasi-content";
import { getKurikulumData } from "@/lib/kurikulum-cms/server";
import { SiteHeader, Topbar } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { AosReady } from "@/components/motion/aos-provider";
import { RegulasiProvider } from "@/components/regulasi/regulasi-provider";
import { RegulasiHero } from "@/components/regulasi/regulasi-hero";
import { RuleSimulator } from "@/components/regulasi/rule-simulator";
import { RuleReader } from "@/components/regulasi/rule-reader";
import { ScenarioFlow } from "@/components/regulasi/scenario-flow";
import { DocShelf } from "@/components/regulasi/doc-shelf";
import { RegulasiClosing } from "@/components/regulasi/regulasi-closing";
import { HeadingStyle } from "@/components/home/shared";
import { PageCurtain } from "@/components/motion/page-curtain";

export const revalidate = 300;

export const metadata = {
  title: "Regulasi Akademik — Sistem Informasi UISI",
  description:
    "Pedoman akademik S1 Sistem Informasi UISI: batas SKS, penilaian & IPK, kehadiran, cuti, evaluasi studi, dan etika — dengan pencarian pasal, simulator, prosedur, dan dokumen resmi.",
};

async function getData() {
  try {
    const rows = await prisma.pageContent.findMany({ where: { section: { in: ["regulasi-akademik", "curriculum"] }, isActive: true } });
    const row = (s) => rows.find((r) => r.section === s) ?? null;
    return mergeRegulasi(row("regulasi-akademik"), { kurikulum: await getKurikulumData() });
  } catch {
    return mergeRegulasi(null, { kurikulum: await getKurikulumData() });
  }
}

/** Regulasi Akademik — tema beranda "Kampus v3" (maroon + navy + gold di atas cream). */
export default async function RegulasiAkademikPage() {
  const data = await getData();
  return (
    <div className="kampus" data-aos-wait>
      <PageCurtain storageKey={CURTAIN_KEY} title="Regulasi" accent="Akademik" label="Memuat regulasi akademik" />
      <Topbar />
      <SiteHeader />
      <RegulasiProvider data={data}>
        <HeadingStyle value="bar">
        <main>
          <RegulasiHero />
          <RuleSimulator />
          <RuleReader />
          <ScenarioFlow />
          <DocShelf />
          <RegulasiClosing />
        </main>
        </HeadingStyle>
      </RegulasiProvider>
      <SiteFooter />
      <AosReady />
    </div>
  );
}
