import prisma from "@/lib/prisma";
import { CURTAIN_KEY, mergeProfilLulusan } from "@/lib/profil-lulusan-content";
import { SiteHeader, Topbar } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { AosReady } from "@/components/motion/aos-provider";
import { LulusanHero } from "@/components/profil-lulusan/lulusan-hero";
import { StatsBand } from "@/components/profil-lulusan/stats-band";
import { ProfileExplorer } from "@/components/profil-lulusan/profile-explorer";
import { ProfileModalProvider } from "@/components/profil-lulusan/profile-modal";
import { CplBento } from "@/components/profil-lulusan/cpl-bento";
import { AlumniWall } from "@/components/profil-lulusan/alumni-wall";
import { Closing } from "@/components/profil-lulusan/closing";
import { HeadingStyle } from "@/components/home/shared";
import { PageCurtain } from "@/components/motion/page-curtain";

export const revalidate = 300;

export const metadata = {
  title: "Profil Lulusan — Sistem Informasi UISI",
  description:
    "Profil lulusan, capaian pembelajaran, dan jejak karier alumni Program Studi Sistem Informasi Universitas Internasional Semen Indonesia.",
};

async function getData() {
  try {
    const rows = await prisma.pageContent.findMany({
      where: { section: { in: ["profil-alumni", "career", "infinite-alumni"] }, isActive: true },
    });
    return mergeProfilLulusan(rows);
  } catch {
    return mergeProfilLulusan([]);
  }
}

/** Profil Lulusan — tema beranda "Kampus v3" (maroon + navy + gold di atas cream). */
export default async function ProfilLulusanPage() {
  const data = await getData();
  return (
    <div className="kampus" data-aos-wait>
      <PageCurtain storageKey={CURTAIN_KEY} title="Profil" accent="Lulusan" label="Memuat profil lulusan" />
      <Topbar />
      <SiteHeader />
      <ProfileModalProvider profiles={data.profiles}>
        <HeadingStyle value="numbered">
        <main>
          <LulusanHero intro={data.intro} roles={data.roles} alumni={data.alumni} />
          <ProfileExplorer profiles={data.profiles} />
          <CplBento cpl={data.cpl} />
          <StatsBand stats={data.stats} />
          <AlumniWall alumni={data.alumni} />
          <Closing />
        </main>
        </HeadingStyle>
      </ProfileModalProvider>
      <SiteFooter />
      <AosReady />
    </div>
  );
}
