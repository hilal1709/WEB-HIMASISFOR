import { getProfilLulusanContent } from "@/lib/profil-lulusan-cms/server";
import { CURTAIN_KEY } from "@/lib/profil-lulusan-content";
import { SiteHeader, Topbar } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { AosReady } from "@/components/motion/aos-provider";
import { PreviewBridge } from "@/components/home/preview-bridge";
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

export async function generateMetadata() {
  const { seo } = await getProfilLulusanContent();
  return { title: seo.title, description: seo.description };
}

/** Profil Lulusan — seluruh isi dari Galeri Wisuda (CMS); tema "Kampus v3". */
export default async function ProfilLulusanPage() {
  const c = await getProfilLulusanContent();
  const curtain = c.curtain.enabled && !c.preview;
  const note = c.seo.sampleNote;
  return (
    <div className="kampus" data-aos-wait>
      {curtain && <PageCurtain storageKey={CURTAIN_KEY} title={c.curtain.title} accent={c.curtain.accent} label={c.curtain.label} />}
      <Topbar />
      <SiteHeader />
      <ProfileModalProvider content={c.profiles} note={note}>
        <HeadingStyle value="numbered">
          <main>
            <LulusanHero content={c.hero} alumni={c.alumni.items} hasAlumni={c.alumni.items.length > 0} curtain={curtain} />
            {c.profiles.items.length > 0 && <ProfileExplorer content={c.profiles} note={note} />}
            {c.cpl.items.length > 0 && <CplBento content={c.cpl} note={note} />}
            {c.stats.items.length > 0 && <StatsBand content={c.stats} note={note} />}
            {c.alumni.items.length > 0 && <AlumniWall content={c.alumni} note={note} />}
            <Closing content={c.closing} />
          </main>
        </HeadingStyle>
      </ProfileModalProvider>
      <SiteFooter />
      <AosReady />
      {c.preview && <PreviewBridge source="galeri-wisuda" exitHref="/api/profil-lulusan-cms/preview?off=1" />}
    </div>
  );
}
