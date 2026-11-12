import prisma from "@/lib/prisma";
import { CURTAIN_KEY, mergeStruktur } from "@/lib/struktur-content";
import { SiteHeader, Topbar } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { AosReady } from "@/components/motion/aos-provider";
import { StrukturHero } from "@/components/struktur/struktur-hero";
import { PersonModalProvider } from "@/components/struktur/person-modal";
import { OrgChart } from "@/components/struktur/org-chart";
import { Minilab } from "@/components/struktur/minilab";
import { Closing } from "@/components/struktur/closing";
import { HeadingStyle } from "@/components/home/shared";
import { PageCurtain } from "@/components/motion/page-curtain";

export const revalidate = 300;

export const metadata = {
  title: "Struktur Organisasi — Sistem Informasi UISI",
  description:
    "Pimpinan, dosen, dan minilab Program Studi Sistem Informasi Universitas Internasional Semen Indonesia.",
};

async function getData() {
  try {
    const row = await prisma.pageContent.findFirst({ where: { section: "struktur-organisasi", isActive: true } });
    return mergeStruktur(row);
  } catch {
    return mergeStruktur(null);
  }
}

/** Struktur Organisasi — tema beranda "Kampus v3" (maroon + navy + gold di atas cream). */
export default async function StrukturOrganisasiPage() {
  const data = await getData();
  return (
    <div className="kampus" data-aos-wait>
      <PageCurtain storageKey={CURTAIN_KEY} title="Struktur" accent="Organisasi" label="Memuat struktur organisasi" />
      <Topbar />
      <SiteHeader />
      <PersonModalProvider people={data.people}>
        <HeadingStyle value="rule">
        <main>
          <StrukturHero intro={data.intro} people={data.people} />
          <OrgChart people={data.people} confirmed={data.confirmed} />
          <Minilab minilab={data.minilab} people={data.people} />
          <Closing />
        </main>
        </HeadingStyle>
      </PersonModalProvider>
      <SiteFooter />
      <AosReady />
    </div>
  );
}
