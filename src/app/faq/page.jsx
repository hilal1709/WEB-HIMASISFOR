import prisma from "@/lib/prisma";
import { CURTAIN_KEY, mergeFaq } from "@/lib/faq-content";
import { mergeKontak } from "@/lib/kontak-content";
import { SiteHeader, Topbar } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { AosReady } from "@/components/motion/aos-provider";
import { HeadingStyle } from "@/components/home/shared";
import { PageCurtain } from "@/components/motion/page-curtain";
import { FaqProvider } from "@/components/faq/faq-provider";
import { FaqHero } from "@/components/faq/faq-hero";
import { CatalogCards } from "@/components/faq/catalog-cards";
import { AskModal } from "@/components/faq/ask-modal";
import { FaqClosing } from "@/components/faq/faq-closing";

export const revalidate = 300;

export const metadata = {
  title: "FAQ — Sistem Informasi UISI",
  description:
    "Pertanyaan yang paling sering sampai ke Program Studi Sistem Informasi UISI: pendaftaran, perkuliahan, beasiswa, kelulusan, magang, dan kampus.",
};

async function getData() {
  try {
    const [faq, kontak, layanan] = await Promise.all([
      prisma.pageContent.findFirst({ where: { section: "faq", isActive: true } }),
      prisma.pageContent.findFirst({ where: { section: "kontak", isActive: true } }),
      prisma.pageContent.findFirst({ where: { section: "layanan-akademik", isActive: true } }),
    ]);
    return { ...mergeFaq(faq), desks: mergeKontak(kontak, layanan).desks };
  } catch {
    return { ...mergeFaq(null), desks: mergeKontak(null, null).desks };
  }
}

/** FAQ — tema beranda "Kampus v3", konsep lemari katalog perpustakaan. */
export default async function FaqPage() {
  const data = await getData();
  return (
    <div className="kampus" data-aos-wait>
      <PageCurtain storageKey={CURTAIN_KEY} title="Tanya" accent="Jawab" label="Membuka lemari katalog" />
      <Topbar />
      <SiteHeader />
      <FaqProvider data={data}>
        <HeadingStyle value="catalog">
          <main>
            <FaqHero />
            <CatalogCards />
            <FaqClosing />
          </main>
        </HeadingStyle>
        <AskModal />
      </FaqProvider>
      <SiteFooter />
      <AosReady />
    </div>
  );
}
