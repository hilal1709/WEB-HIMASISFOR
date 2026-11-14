import { getDosenContent } from "@/lib/dosen-cms/server";
import { CURTAIN_KEY } from "@/lib/dosen-content";
import { SiteHeader, Topbar } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { AosReady } from "@/components/motion/aos-provider";
import { PreviewBridge } from "@/components/home/preview-bridge";
import { DosenProvider } from "@/components/dosen/dosen-provider";
import { DosenHero } from "@/components/dosen/dosen-hero";
import { Directory } from "@/components/dosen/directory";
import { ExpertiseMap } from "@/components/dosen/expertise-map";
import { Closing } from "@/components/dosen/closing";
import { HeadingStyle } from "@/components/home/shared";
import { PageCurtain } from "@/components/motion/page-curtain";

export const revalidate = 300;

export async function generateMetadata() {
  const { seo } = await getDosenContent();
  return { title: seo.title, description: seo.description };
}

/** Halaman Dosen — seluruh isi dari Katalog Dosen (CMS); tema "Kampus v3". */
export default async function DosenPage() {
  const c = await getDosenContent();
  const curtain = c.curtain.enabled && !c.preview;
  return (
    <div className="kampus" data-aos-wait>
      {curtain && <PageCurtain storageKey={CURTAIN_KEY} title={c.curtain.title} accent={c.curtain.accent} label={c.curtain.label} />}
      <Topbar />
      <SiteHeader />
      <DosenProvider data={c}>
        <HeadingStyle value="edge">
          <main>
            <DosenHero />
            <Directory />
            {c.map.show && c.fields.length > 0 && <ExpertiseMap />}
            {c.closing.show && <Closing />}
          </main>
        </HeadingStyle>
      </DosenProvider>
      <SiteFooter />
      <AosReady />
      {c.preview && <PreviewBridge source="katalog-dosen" exitHref="/api/dosen-cms/preview?off=1" />}
    </div>
  );
}
