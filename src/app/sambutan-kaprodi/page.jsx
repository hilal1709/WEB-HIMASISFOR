import prisma from "@/lib/prisma";
import { mergeSambutan } from "@/lib/sambutan-content";
import { SiteHeader, Topbar } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { AosReady } from "@/components/motion/aos-provider";
import { PageCurtain } from "@/components/sambutan/page-curtain";
import { SambutanHero } from "@/components/sambutan/sambutan-hero";
import { Letter } from "@/components/sambutan/letter";
import { ProfileModalProvider } from "@/components/sambutan/profile-modal";

export const revalidate = 300;

export const metadata = {
  title: "Sambutan Ketua Program Studi — Sistem Informasi UISI",
  description: "Pesan dan sambutan Ketua Program Studi Sistem Informasi Universitas Internasional Semen Indonesia.",
};

async function getSambutan() {
  try {
    const row = await prisma.pageContent.findFirst({ where: { section: "sambutan-kaprodi", isActive: true } });
    return mergeSambutan(row);
  } catch {
    return mergeSambutan(null);
  }
}

/** Sambutan Kaprodi — mengikuti tema beranda "Kampus v3" (maroon + navy + gold di atas cream). */
export default async function SambutanKaprodiPage() {
  const data = await getSambutan();
  return (
    <div className="kampus" data-aos-wait>
      <PageCurtain />
      <Topbar />
      <SiteHeader />
      <ProfileModalProvider data={data}>
        <main>
          <SambutanHero data={data} />
          <Letter data={data} />
        </main>
      </ProfileModalProvider>
      <SiteFooter />
      <AosReady />
    </div>
  );
}
