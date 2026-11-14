import { getVisiMisiContent } from "@/lib/visi-misi-cms/server";
import { CURTAIN_KEY } from "@/lib/visi-misi-content";
import { SiteHeader, Topbar } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { AosReady } from "@/components/motion/aos-provider";
import { PreviewBridge } from "@/components/home/preview-bridge";
import { VisiHero, VisiStatement } from "@/components/visi-misi/visi-hero";
import { MisiStack } from "@/components/visi-misi/misi-stack";
import { MisiModalProvider } from "@/components/visi-misi/misi-modal";
import { Roadmap } from "@/components/visi-misi/roadmap";
import { Closing } from "@/components/visi-misi/closing";
import { HeadingStyle } from "@/components/home/shared";
import { PageCurtain } from "@/components/motion/page-curtain";

export const revalidate = 300;

export async function generateMetadata() {
  const { seo } = await getVisiMisiContent();
  return { title: seo.title, description: seo.description };
}

/** Visi & Misi — seluruh isi dari Ruang Kompas (CMS); tema "Kampus v3". */
export default async function VisiMisiPage() {
  const c = await getVisiMisiContent();
  const curtain = c.curtain.enabled && !c.preview;
  return (
    <div className="kampus" data-aos-wait>
      {curtain && <PageCurtain storageKey={CURTAIN_KEY} title={c.curtain.title} accent={c.curtain.accent} label={c.curtain.label} />}
      <Topbar />
      <SiteHeader />
      <MisiModalProvider misi={c.misi}>
        <HeadingStyle value="centered">
          <main>
            <VisiHero content={c.hero} curtain={curtain} />
            <VisiStatement content={c.visi} />
            {c.misi.items.length > 0 && <MisiStack content={c.misi} />}
            {c.roadmap.items.length > 0 && <Roadmap content={c.roadmap} />}
            {c.closing.stops.length > 0 && <Closing content={c.closing} />}
          </main>
        </HeadingStyle>
      </MisiModalProvider>
      <SiteFooter />
      <AosReady />
      {c.preview && <PreviewBridge source="ruang-kompas" exitHref="/api/visi-misi-cms/preview?off=1" />}
    </div>
  );
}
