import { existsSync } from "node:fs";
import path from "node:path";
import prisma from "@/lib/prisma";
import { CURTAIN_KEY, STORY_SECTION, mergePrestasi, mergeStory } from "@/lib/prestasi-content";
import { SiteHeader, Topbar } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { AosReady } from "@/components/motion/aos-provider";
import { PageCurtain } from "@/components/motion/page-curtain";
import { PrestasiProvider } from "@/components/prestasi/prestasi-provider";
import { PrestasiHero } from "@/components/prestasi/prestasi-hero";
import { Archive } from "@/components/prestasi/archive";
import { StoryBand } from "@/components/prestasi/story-band";
import { Closing } from "@/components/prestasi/closing";

export const revalidate = 300;

export const metadata = {
  title: "Prestasi — Sistem Informasi UISI",
  description:
    "Prestasi dan rekognisi dosen serta mahasiswa Program Studi Sistem Informasi UISI di tingkat nasional dan internasional.",
};

/** CMS menyimpan path relatif (mis. "../img/mhs/x.png") → "/img/mhs/x.png"; file yang tidak ada → tanpa foto. */
function normalizeSrc(src) {
  if (!src) return null;
  if (/^https?:\/\//.test(src)) return src;
  const rel = "/" + src.replace(/^(\.\.?\/)+/, "").replace(/^\/+/, "");
  return existsSync(path.join(process.cwd(), "public", rel)) ? rel : null;
}

async function getData() {
  const [rows, storyRow] = await Promise.all([
    prisma.achievement.findMany({ orderBy: [{ tahun: "desc" }, { id: "asc" }] }).catch(() => []),
    prisma.pageContent.findFirst({ where: { section: STORY_SECTION, isActive: true } }).catch(() => null),
  ]);
  return {
    ...mergePrestasi(rows.map((r) => ({ ...r, image: normalizeSrc(r.image) }))),
    story: mergeStory(storyRow, normalizeSrc),
  };
}

/** Halaman Prestasi — tema beranda "Kampus v3" (maroon + navy + gold di atas cream). */
export default async function PrestasiPage() {
  const data = await getData();
  return (
    <div className="kampus" data-aos-wait>
      <PageCurtain storageKey={CURTAIN_KEY} title="Prestasi" accent="Sisfor" label="Memuat prestasi" />
      <Topbar />
      <SiteHeader />
      <PrestasiProvider data={data}>
        <main>
          <PrestasiHero />
          <Archive />
          <StoryBand />
          <Closing />
        </main>
      </PrestasiProvider>
      <SiteFooter />
      <AosReady />
    </div>
  );
}
