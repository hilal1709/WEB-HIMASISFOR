import { getPrestasiContent } from "@/lib/prestasi-cms/server";
import { CURTAIN_KEY } from "@/lib/prestasi-content";
import { SiteHeader, Topbar } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { AosReady } from "@/components/motion/aos-provider";
import { PreviewBridge } from "@/components/home/preview-bridge";
import { PrestasiProvider } from "@/components/prestasi/prestasi-provider";
import { PrestasiHero } from "@/components/prestasi/prestasi-hero";
import { Archive } from "@/components/prestasi/archive";
import { StoryBand } from "@/components/prestasi/story-band";
import { Closing } from "@/components/prestasi/closing";
import { HeadingStyle } from "@/components/home/shared";
import { PageCurtain } from "@/components/motion/page-curtain";

export const revalidate = 300;

export async function generateMetadata() {
  const { seo } = await getPrestasiContent();
  return { title: seo.title, description: seo.description };
}

/** Halaman Prestasi — isi dari Ruang Kurator (CMS) + tabel Achievement; tema "Kampus v3". */
export default async function PrestasiPage() {
  const c = await getPrestasiContent();
  const curtain = c.curtain.enabled && !c.preview;
  return (
    <div className="kampus" data-aos-wait>
      {curtain && <PageCurtain storageKey={CURTAIN_KEY} title={c.curtain.title} accent={c.curtain.accent} label={c.curtain.label} />}
      <Topbar />
      <SiteHeader />
      <PrestasiProvider data={c}>
        <HeadingStyle value="bar">
          <main>
            <PrestasiHero />
            <Archive />
            {c.story.show && <StoryBand />}
            {c.closing.show && <Closing />}
          </main>
        </HeadingStyle>
      </PrestasiProvider>
      <SiteFooter />
      <AosReady />
      {c.preview && <PreviewBridge source="ruang-kurator" exitHref="/api/prestasi-cms/preview?off=1" />}
    </div>
  );
}
