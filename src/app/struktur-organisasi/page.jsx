import { getStrukturContent } from "@/lib/struktur-cms/server";
import { CURTAIN_KEY } from "@/lib/struktur-content";
import { SiteHeader, Topbar } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { AosReady } from "@/components/motion/aos-provider";
import { PreviewBridge } from "@/components/home/preview-bridge";
import { StrukturHero } from "@/components/struktur/struktur-hero";
import { PersonModalProvider } from "@/components/struktur/person-modal";
import { OrgChart } from "@/components/struktur/org-chart";
import { Minilab } from "@/components/struktur/minilab";
import { Closing } from "@/components/struktur/closing";
import { HeadingStyle } from "@/components/home/shared";
import { PageCurtain } from "@/components/motion/page-curtain";

export const revalidate = 300;

export async function generateMetadata() {
  const { seo } = await getStrukturContent();
  return { title: seo.title, description: seo.description };
}

/** Struktur Organisasi — seluruh isi dari Studio Bagan (CMS); tema "Kampus v3". */
export default async function StrukturOrganisasiPage() {
  const c = await getStrukturContent();
  const curtain = c.curtain.enabled && !c.preview;
  return (
    <div className="kampus" data-aos-wait>
      {curtain && <PageCurtain storageKey={CURTAIN_KEY} kicker={c.curtain.kicker} title={c.curtain.title} accent={c.curtain.accent} label={c.curtain.label} />}
      <Topbar />
      <SiteHeader />
      <PersonModalProvider people={c.people} labels={c.modal}>
        <HeadingStyle value="rule">
          <main>
            {c.people.length > 0 && <StrukturHero content={c.hero} people={c.people} curtain={curtain} />}
            {c.people.length > 0 && <OrgChart content={c.chart} people={c.people} />}
            <Minilab content={c.minilab} people={c.people} />
            <Closing content={c.closing} />
          </main>
        </HeadingStyle>
      </PersonModalProvider>
      <SiteFooter />
      <AosReady />
      {c.preview && <PreviewBridge source="studio-bagan" exitHref="/api/struktur-cms/preview?off=1" />}
    </div>
  );
}
