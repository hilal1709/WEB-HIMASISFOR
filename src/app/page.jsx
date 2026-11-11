import { existsSync } from "node:fs";
import path from "node:path";
import prisma from "@/lib/prisma";
import { IntroLoader } from "@/components/intro-loader";
import { SiteHeader, Topbar } from "@/components/home/site-header";
import { HeroScene } from "@/components/home/hero-scene";
import { QuickLinks } from "@/components/home/quick-links";
import { AboutScene } from "@/components/home/about-scene";
import { AccreditationBand } from "@/components/home/accreditation-band";
import { PartnersMarquee } from "@/components/home/partners-marquee";
import { ExpertiseScene } from "@/components/home/expertise-scene";
import { AlumniScene } from "@/components/home/alumni-scene";
import { AchievementScene } from "@/components/home/achievement-scene";
import { NewsScene } from "@/components/home/news-scene";
import { JoinScene } from "@/components/home/join-scene";
import { SiteFooter } from "@/components/home/site-footer";
import { AosReady } from "@/components/motion/aos-provider";

export const revalidate = 300;

/** CMS menyimpan path relatif (mis. "../img/dosen/x.png") → jadikan "/img/dosen/x.png". */
function normalizeSrc(src) {
  if (!src) return null;
  if (/^https?:\/\//.test(src)) return src;
  const rel = "/" + src.replace(/^(\.\.?\/)+/, "").replace(/^\/+/, "");
  // file yang direferensikan CMS tapi tidak ada di /public → tanpa foto
  return existsSync(path.join(process.cwd(), "public", rel)) ? rel : null;
}

/** Prestasi terbaru dari CMS (model Achievement). Gagal/kosong → komponen memakai contoh. */
async function getAchievements() {
  try {
    const [rows, total] = await Promise.all([
      prisma.achievement.findMany({ orderBy: [{ tahun: "desc" }, { createdAt: "desc" }], take: 60 }),
      prisma.achievement.count(),
    ]);
    const map = (a) => ({
      level: a.tingkatan,
      year: a.tahun,
      title: a.title,
      body: a.description || a.achieverName,
      image: normalizeSrc(a.image),
    });
    // satu kartu per orang supaya tidak ada prestasi yang tampil berulang
    const pick = (cat) => {
      const seen = new Set();
      return rows
        .filter((r) => r.category === cat && !seen.has(r.achieverName) && seen.add(r.achieverName))
        .slice(0, 6)
        .map(map);
    };
    return { dosen: pick("dosen"), mahasiswa: pick("mahasiswa"), total };
  } catch {
    return null;
  }
}

/** Beranda — "Kampus v3": situs kampus dengan sentuhan premium (maroon + navy + gold di atas cream). */
export default async function Home() {
  const achievements = await getAchievements();
  return (
    <div className="kampus" data-aos-wait>
      <IntroLoader />
      <Topbar />
      <SiteHeader />
      <main>
        <HeroScene />
        <QuickLinks />
        <AboutScene total={achievements?.total} />
        <AccreditationBand />
        <ExpertiseScene />
        <AchievementScene data={achievements} />
        <NewsScene />
        <AlumniScene />
        <PartnersMarquee />
        <JoinScene />
      </main>
      <SiteFooter />
      <AosReady />
    </div>
  );
}
