import { getDosenData } from "@/lib/dosen-cms/server";
import prisma from "@/lib/prisma";
import { CURTAIN_KEY, mergeBootcamp } from "@/lib/bootcamp-content";
import { SiteHeader, Topbar } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { AosReady } from "@/components/motion/aos-provider";
import { HeadingStyle } from "@/components/home/shared";
import { PageCurtain } from "@/components/motion/page-curtain";
import { BootcampProvider } from "@/components/bootcamp/bootcamp-provider";
import { BootcampHero } from "@/components/bootcamp/bootcamp-hero";
import { Catalog } from "@/components/bootcamp/catalog";
import { SyllabusPlayhead } from "@/components/bootcamp/syllabus-playhead";
import { MentorStack } from "@/components/bootcamp/mentor-stack";
import { CertificateLens } from "@/components/bootcamp/certificate-lens";
import { PricingTiers } from "@/components/bootcamp/pricing-tiers";
import { PlanDock } from "@/components/bootcamp/plan-dock";
import { BootcampClosing } from "@/components/bootcamp/bootcamp-closing";

export const revalidate = 300;

export const metadata = {
  title: "Bootcamp & Course — Sistem Informasi UISI",
  description:
    "Bootcamp kohort intensif dan kursus mandiri bersertifikat di bidang ERP, data, audit TI, dan pengembangan aplikasi dari S1 Sistem Informasi UISI — lengkap dengan silabus per minggu, mentor, dan biaya.",
};

async function getData() {
  try {
    const rows = await prisma.pageContent.findMany({ where: { section: { in: ["bootcamp"] }, isActive: true } });
    return mergeBootcamp(rows.find((r) => r.section === "bootcamp") ?? null, { dosen: await getDosenData() });
  } catch {
    return mergeBootcamp(null, { dosen: await getDosenData() });
  }
}

/** Bootcamp & Course — tema beranda "Kampus v3" (maroon + navy + gold di atas cream). */
export default async function BootcampPage() {
  const data = await getData();
  return (
    <div className="kampus" data-aos-wait>
      <PageCurtain storageKey={CURTAIN_KEY} title="Bootcamp" accent="& Course" label="Memuat bootcamp dan course" />
      <Topbar />
      <SiteHeader />
      <BootcampProvider data={data}>
        <HeadingStyle value="split">
          <main>
            <BootcampHero />
            <Catalog />
            <SyllabusPlayhead />
            <MentorStack />
            <CertificateLens />
            <PricingTiers />
            <BootcampClosing />
          </main>
        </HeadingStyle>
        <PlanDock />
      </BootcampProvider>
      <SiteFooter />
      <AosReady />
    </div>
  );
}
