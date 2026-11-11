import prisma from "@/lib/prisma";
import { CURTAIN_KEY, mergeVisiMisi } from "@/lib/visi-misi-content";
import { SiteHeader, Topbar } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { AosReady } from "@/components/motion/aos-provider";
import { PageCurtain } from "@/components/motion/page-curtain";
import { VisiHero, VisiStatement } from "@/components/visi-misi/visi-hero";
import { MisiStack } from "@/components/visi-misi/misi-stack";
import { MisiModalProvider } from "@/components/visi-misi/misi-modal";
import { Roadmap } from "@/components/visi-misi/roadmap";
import { Closing } from "@/components/visi-misi/closing";

export const revalidate = 300;

export const metadata = {
  title: "Visi & Misi — Sistem Informasi UISI",
  description: "Visi, misi, dan arah Program Studi Sistem Informasi Universitas Internasional Semen Indonesia menuju 2030.",
};

async function getVisiMisi() {
  try {
    const rows = await prisma.pageContent.findMany({ where: { section: { in: ["visi", "misi"] }, isActive: true } });
    return mergeVisiMisi(rows.find((r) => r.section === "visi"), rows.find((r) => r.section === "misi"));
  } catch {
    return mergeVisiMisi(null, null);
  }
}

/** Visi & Misi — tema beranda "Kampus v3" (maroon + navy + gold di atas cream). */
export default async function VisiMisiPage() {
  const data = await getVisiMisi();
  return (
    <div className="kampus" data-aos-wait>
      <PageCurtain storageKey={CURTAIN_KEY} title="Visi" accent="& Misi" label="Memuat visi dan misi" />
      <Topbar />
      <SiteHeader />
      <MisiModalProvider misi={data.misi}>
        <main>
          <VisiHero />
          <VisiStatement visi={data.visi} highlights={data.highlights} />
          <MisiStack misi={data.misi} />
          <Roadmap milestones={data.milestones} />
          <Closing />
        </main>
      </MisiModalProvider>
      <SiteFooter />
      <AosReady />
    </div>
  );
}
