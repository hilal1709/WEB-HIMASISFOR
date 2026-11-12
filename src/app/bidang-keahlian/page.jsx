import prisma from "@/lib/prisma";
import { CURTAIN_KEY, mergeBidang } from "@/lib/bidang-keahlian-content";
import { mergeKurikulum } from "@/lib/kurikulum-content";
import { mergeDosen } from "@/lib/dosen-content";
import { SiteHeader, Topbar } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { AosReady } from "@/components/motion/aos-provider";
import { PageCurtain } from "@/components/motion/page-curtain";
import { BidangProvider } from "@/components/bidang/bidang-provider";
import { BidangHero } from "@/components/bidang/bidang-hero";
import { BidangBanner } from "@/components/bidang/bidang-banner";
import { FieldMosaic } from "@/components/bidang/field-mosaic";
import { InterestRadar } from "@/components/bidang/interest-radar";
import { CaseLens } from "@/components/bidang/case-lens";
import { ShortlistClosing } from "@/components/bidang/shortlist-closing";

export const revalidate = 300;

export const metadata = {
  title: "Bidang Keahlian — Sistem Informasi UISI",
  description:
    "Empat bidang keahlian S1 Sistem Informasi UISI: Enterprise Systems, IT Audit & Governance, Data Science, dan Manajemen SI — yang dipelajari, alat kerja, mata kuliah, dosen, dan prospek kariernya.",
};

async function getData() {
  try {
    const rows = await prisma.pageContent.findMany({ where: { section: { in: ["bidang-keahlian", "curriculum", "profil-dosen", "dosen"] }, isActive: true } });
    const row = (s) => rows.find((r) => r.section === s) ?? null;
    return mergeBidang(row("bidang-keahlian"), { kurikulum: mergeKurikulum(row("curriculum")), dosen: mergeDosen(rows) });
  } catch {
    return mergeBidang(null, { kurikulum: mergeKurikulum(null), dosen: mergeDosen([]) });
  }
}

/** Bidang Keahlian — tema beranda "Kampus v3" (maroon + navy + gold di atas cream). */
export default async function BidangKeahlianPage() {
  const data = await getData();
  return (
    <div className="kampus" data-aos-wait>
      <PageCurtain storageKey={CURTAIN_KEY} title="Bidang" accent="Keahlian" label="Memuat bidang keahlian" />
      <Topbar />
      <SiteHeader />
      <BidangProvider data={data}>
        <main>
          <BidangHero />
          <BidangBanner />
          <FieldMosaic />
          <InterestRadar />
          <CaseLens />
          <ShortlistClosing />
        </main>
      </BidangProvider>
      <SiteFooter />
      <AosReady />
    </div>
  );
}
