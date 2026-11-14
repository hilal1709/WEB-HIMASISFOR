import { CURTAIN_KEY } from "@/lib/kurikulum-content";
import { getKurikulumData } from "@/lib/kurikulum-cms/server";
import { SiteHeader, Topbar } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { AosReady } from "@/components/motion/aos-provider";
import { PreviewBridge } from "@/components/home/preview-bridge";
import { KurikulumProvider } from "@/components/kurikulum/kurikulum-provider";
import { KurikulumHero } from "@/components/kurikulum/kurikulum-hero";
import { BodyOfKnowledge } from "@/components/kurikulum/body-of-knowledge";
import { StudyMap } from "@/components/kurikulum/study-map";
import { SemesterLedger } from "@/components/kurikulum/semester-ledger";
import { ElectiveTracks } from "@/components/kurikulum/elective-tracks";
import { RpsAnatomy } from "@/components/kurikulum/rps-anatomy";
import { Closing } from "@/components/kurikulum/closing";
import { HeadingStyle } from "@/components/home/shared";
import { PageCurtain } from "@/components/motion/page-curtain";

export const revalidate = 300;

export async function generateMetadata() {
  const { copy } = await getKurikulumData();
  return { title: copy.seo.title, description: copy.seo.description };
}

/** Kurikulum & RPS — seluruh isi dari Kartografer Kurikulum (CMS); tema "Kampus v3". */
export default async function KurikulumPage() {
  const { preview, ...data } = await getKurikulumData();
  const curtain = data.copy.curtain;
  return (
    <div className="kampus overflow-x-clip" data-aos-wait>
      {curtain.enabled && !preview && <PageCurtain storageKey={CURTAIN_KEY} title={curtain.title} accent={curtain.accent} label={curtain.label} />}
      <Topbar />
      <SiteHeader />
      <KurikulumProvider data={data}>
        <HeadingStyle value="numbered">
          <main>
            <KurikulumHero />
            <BodyOfKnowledge />
            <StudyMap />
            <SemesterLedger />
            <ElectiveTracks />
            <RpsAnatomy />
            <Closing />
          </main>
        </HeadingStyle>
      </KurikulumProvider>
      <SiteFooter />
      <AosReady />
      {preview && <PreviewBridge source="kartografer" exitHref="/api/kurikulum-cms/preview?off=1" />}
    </div>
  );
}
