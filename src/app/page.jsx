import { existsSync } from "node:fs";
import path from "node:path";
import prisma from "@/lib/prisma";
import { getWarta } from "@/lib/berita-server";
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
import { PreviewBridge } from "@/components/home/preview-bridge";
import { getHomeContent } from "@/lib/home-cms/server";

// Dinamis: isi diambil dari Studio Beranda setiap permintaan; perubahan terbit disiarkan via Pusher.
export const dynamic = "force-dynamic";

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

const SCENES = {
  hero: (c) => <HeroScene content={c.hero} />,
  quicklinks: (c) => <QuickLinks content={c.quicklinks} />,
  about: (c, d) => <AboutScene content={c.about} total={d.achievements?.total} />,
  accreditation: (c) => <AccreditationBand content={c.accreditation} />,
  expertise: (c) => <ExpertiseScene content={c.expertise} />,
  achievements: (c, d) => <AchievementScene content={c.achievements} data={d.achievements} />,
  news: (c, d) => <NewsScene content={c.news} data={d.warta} />,
  alumni: (c) => <AlumniScene content={c.alumni} />,
  partners: (c) => <PartnersMarquee content={c.partners} />,
  join: (c) => <JoinScene content={c.join} />,
};

/** Beranda — seluruh isi, urutan, dan visibilitas section dikelola di Studio Beranda (/admin/home). */
export default async function Home() {
  const [achievements, warta, c] = await Promise.all([getAchievements(), getWarta(), getHomeContent()]);
  const data = { achievements, warta };
  return (
    <div className="kampus" data-aos-wait>
      {/* pratinjau Studio: intro dimatikan, tetapi tetap memberi sinyal "siap" agar animasi hero berjalan */}
      <IntroLoader content={c.preview ? { ...c.intro, enabled: false } : c.intro} />
      <Topbar />
      <SiteHeader />
      <main>
        {c.layout.sections
          .filter((s) => s.visible && SCENES[s.key])
          .map((s) => (
            <div key={s.key} data-home-section={s.key} className="contents">
              {SCENES[s.key](c, data)}
            </div>
          ))}
      </main>
      <SiteFooter />
      <AosReady />
      {c.preview && <PreviewBridge />}
    </div>
  );
}
