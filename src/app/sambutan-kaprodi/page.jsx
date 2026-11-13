import { getSambutanContent } from "@/lib/sambutan-cms/server";
import { SiteHeader, Topbar } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { AosReady } from "@/components/motion/aos-provider";
import { PreviewBridge } from "@/components/home/preview-bridge";
import { SambutanHero } from "@/components/sambutan/sambutan-hero";
import { Letter } from "@/components/sambutan/letter";
import { ProfileModalProvider } from "@/components/sambutan/profile-modal";
import { PageCurtain } from "@/components/sambutan/page-curtain";

export const revalidate = 300;

export async function generateMetadata() {
  const { seo } = await getSambutanContent();
  return { title: seo.title, description: seo.description };
}

/** Sambutan Kaprodi — seluruh isi dari Meja Sambutan (CMS); desain "Kampus v3". */
export default async function SambutanKaprodiPage() {
  const c = await getSambutanContent();
  const curtain = c.curtain.enabled && !c.preview;
  return (
    <div className="kampus" data-aos-wait>
      {curtain && <PageCurtain content={c.curtain} />}
      <Topbar />
      <SiteHeader />
      <ProfileModalProvider content={c}>
        <main>
          <SambutanHero content={c} curtain={curtain} />
          <Letter content={c} />
        </main>
      </ProfileModalProvider>
      <SiteFooter />
      <AosReady />
      {c.preview && <PreviewBridge source="meja-sambutan" exitHref="/api/sambutan-cms/preview?off=1" />}
    </div>
  );
}
