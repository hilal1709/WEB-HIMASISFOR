import prisma from "@/lib/prisma";
import { CURTAIN_KEY, mergeKonversi } from "@/lib/konversi-content";
import { mergeKurikulum } from "@/lib/kurikulum-content";
import { SiteHeader, Topbar } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { AosReady } from "@/components/motion/aos-provider";
import { KonversiProvider } from "@/components/konversi/konversi-provider";
import { KonversiHero } from "@/components/konversi/konversi-hero";
import { ExchangeDesk } from "@/components/konversi/exchange-desk";
import { ClaimStepper } from "@/components/konversi/claim-stepper";
import { TranscriptCompare } from "@/components/konversi/transcript-compare";
import { KonversiClosing } from "@/components/konversi/konversi-closing";
import { HeadingStyle } from "@/components/home/shared";
import { PageCurtain } from "@/components/motion/page-curtain";

export const revalidate = 300;

export const metadata = {
  title: "Konversi SKS — Sistem Informasi UISI",
  description:
    "Hitung berapa SKS yang setara dengan magang, studi independen, riset, atau kegiatan MBKM lain, pilih mata kuliah penggantinya, dan ikuti enam langkah pengajuan konversi di S1 Sistem Informasi UISI.",
};

async function getData() {
  try {
    const rows = await prisma.pageContent.findMany({ where: { section: { in: ["konversi-sks", "curriculum"] }, isActive: true } });
    const row = (s) => rows.find((r) => r.section === s) ?? null;
    return mergeKonversi(row("konversi-sks"), { kurikulum: mergeKurikulum(row("curriculum")) });
  } catch {
    return mergeKonversi(null, { kurikulum: mergeKurikulum(null) });
  }
}

/** Konversi SKS — tema beranda "Kampus v3" (maroon + navy + gold di atas cream). */
export default async function KonversiSksPage() {
  const data = await getData();
  return (
    <div className="kampus" data-aos-wait>
      <PageCurtain storageKey={CURTAIN_KEY} title="Konversi" accent="SKS" label="Memuat konversi SKS" />
      <Topbar />
      <SiteHeader />
      <KonversiProvider data={data}>
        <HeadingStyle value="rule">
        <main>
          <KonversiHero />
          <ExchangeDesk />
          <ClaimStepper />
          <TranscriptCompare />
          <KonversiClosing />
        </main>
        </HeadingStyle>
      </KonversiProvider>
      <SiteFooter />
      <AosReady />
    </div>
  );
}
