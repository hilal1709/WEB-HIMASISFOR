import { getBidangContent, getBidangPage } from "@/lib/bidang-cms/server";
import { CURTAIN_KEY } from "@/lib/bidang-keahlian-content";
import { SiteHeader, Topbar } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { AosReady } from "@/components/motion/aos-provider";
import { PreviewBridge } from "@/components/home/preview-bridge";
import { BidangProvider } from "@/components/bidang/bidang-provider";
import { BidangHero } from "@/components/bidang/bidang-hero";
import { FieldMosaic } from "@/components/bidang/field-mosaic";
import { InterestRadar } from "@/components/bidang/interest-radar";
import { CaseLens } from "@/components/bidang/case-lens";
import { ShortlistClosing } from "@/components/bidang/shortlist-closing";
import { HeadingStyle } from "@/components/home/shared";
import { PageCurtain } from "@/components/motion/page-curtain";

export const revalidate = 300;

export async function generateMetadata() {
  const { seo } = await getBidangContent();
  return { title: seo.title, description: seo.description };
}

/** Bidang Keahlian — seluruh isi dari Konsol Bidang (CMS); tema "Kampus v3". */
export default async function BidangKeahlianPage() {
  const data = await getBidangPage();
  const curtain = data.curtain.enabled && !data.preview;
  return (
    <div className="kampus" data-aos-wait>
      {curtain && <PageCurtain storageKey={CURTAIN_KEY} title={data.curtain.title} accent={data.curtain.accent} label={data.curtain.label} />}
      <Topbar />
      <SiteHeader />
      <BidangProvider data={{ ...data, curtainOn: curtain }}>
        <HeadingStyle value="split">
          <main>
            <BidangHero />
            <FieldMosaic />
            {data.radar.show && <InterestRadar />}
            {data.caseStudy.show && <CaseLens />}
            <ShortlistClosing />
          </main>
        </HeadingStyle>
      </BidangProvider>
      <SiteFooter />
      <AosReady />
      {data.preview && <PreviewBridge source="konsol-bidang" exitHref="/api/bidang-cms/preview?off=1" />}
    </div>
  );
}
