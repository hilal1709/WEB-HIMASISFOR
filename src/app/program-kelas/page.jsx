import { getProgramKelasContent } from "@/lib/program-kelas-cms/server";
import { CURTAIN_KEY } from "@/lib/program-kelas-content";
import { SiteHeader, Topbar } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { AosReady } from "@/components/motion/aos-provider";
import { PreviewBridge } from "@/components/home/preview-bridge";
import { KelasProvider } from "@/components/program-kelas/kelas-provider";
import { KelasHero } from "@/components/program-kelas/kelas-hero";
import { PmbBanner } from "@/components/program-kelas/pmb-banner";
import { ClassSwitcher } from "@/components/program-kelas/class-switcher";
import { WeekSchedule } from "@/components/program-kelas/week-schedule";
import { CompareTable } from "@/components/program-kelas/compare-table";
import { Faq } from "@/components/program-kelas/faq";
import { Closing } from "@/components/program-kelas/closing";
import { HeadingStyle } from "@/components/home/shared";
import { PageCurtain } from "@/components/motion/page-curtain";

export const revalidate = 300;

export async function generateMetadata() {
  const { seo } = await getProgramKelasContent();
  return { title: seo.title, description: seo.description };
}

/** Program Kelas — seluruh isi dari Papan Jadwal (CMS); tema "Kampus v3". */
export default async function ProgramKelasPage() {
  const c = await getProgramKelasContent();
  const curtain = c.curtain.enabled && !c.preview;
  const hasClasses = c.classes.items.length > 0;
  return (
    <div className="kampus" data-aos-wait>
      {curtain && <PageCurtain storageKey={CURTAIN_KEY} title={c.curtain.title} accent={c.curtain.accent} label={c.curtain.label} />}
      <Topbar />
      <SiteHeader />
      <KelasProvider data={c}>
        <HeadingStyle value="split">
          <main>
            <KelasHero />
            {c.banner.show && (c.banner.title || c.banner.body) && <PmbBanner content={c.banner} />}
            {hasClasses && <ClassSwitcher />}
            {hasClasses && <WeekSchedule />}
            {hasClasses && c.compare.rows.length > 0 && <CompareTable />}
            {c.faq.items.length > 0 && <Faq />}
            <Closing />
          </main>
        </HeadingStyle>
      </KelasProvider>
      <SiteFooter />
      <AosReady />
      {c.preview && <PreviewBridge source="papan-jadwal" exitHref="/api/program-kelas-cms/preview?off=1" />}
    </div>
  );
}
