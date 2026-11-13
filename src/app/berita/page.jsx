import { CURTAIN_KEY } from "@/lib/berita-content";
import { getWarta } from "@/lib/berita-server";
import { SiteHeader, Topbar } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { AosReady } from "@/components/motion/aos-provider";
import { HeadingStyle } from "@/components/home/shared";
import { PageCurtain } from "@/components/motion/page-curtain";
import { WartaProvider } from "@/components/berita/warta-provider";
import { MastheadHero } from "@/components/berita/masthead-hero";
import { RubricIndex } from "@/components/berita/rubric-index";
import { WartaBanner } from "@/components/berita/warta-banner";
import { RubricPanels } from "@/components/berita/rubric-panels";
import { EventModal } from "@/components/berita/event-modal";
import { RedaksiClosing } from "@/components/berita/redaksi-closing";

export const revalidate = 300;

export const metadata = {
  title: "Warta — Berita, Artikel & Agenda | Sistem Informasi UISI",
  description: "Kabar kampus, tulisan dosen dan mahasiswa, serta agenda Program Studi Sistem Informasi UISI dalam satu halaman bergaya koran.",
  alternates: { types: { "application/rss+xml": "/berita/rss.xml" } },
};

/** Warta SISFOR — tema beranda "Kampus v3", konsep koran kampus broadsheet. */
export default async function BeritaPage() {
  const data = await getWarta();
  return (
    <div className="kampus" data-aos-wait>
      <PageCurtain storageKey={CURTAIN_KEY} title="Warta" accent="SISFOR" label="Mencetak edisi hari ini" />
      <Topbar />
      <SiteHeader />
      <WartaProvider data={data}>
        <HeadingStyle value="masthead">
          <main>
            <MastheadHero />
            <RubricIndex />
            <WartaBanner />
            <RubricPanels />
            <RedaksiClosing />
          </main>
          <EventModal />
        </HeadingStyle>
      </WartaProvider>
      <SiteFooter />
      <AosReady />
    </div>
  );
}
