import prisma from "@/lib/prisma";
import { CURTAIN_KEY, mergeKontak } from "@/lib/kontak-content";
import { SiteHeader, Topbar } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { AosReady } from "@/components/motion/aos-provider";
import { HeadingStyle } from "@/components/home/shared";
import { PageCurtain } from "@/components/motion/page-curtain";
import { KontakProvider } from "@/components/kontak/kontak-provider";
import { PostcardHero } from "@/components/kontak/postcard-hero";
import { Switchboard } from "@/components/kontak/switchboard";
import { LetterForm } from "@/components/kontak/letter-form";
import { AddressMap } from "@/components/kontak/address-map";
import { StampSheet } from "@/components/kontak/stamp-sheet";

export const revalidate = 300;

export const metadata = {
  title: "Kontak — Sistem Informasi UISI",
  description:
    "Hubungi Program Studi Sistem Informasi UISI: pilih urusanmu, tulis surat ke meja yang tepat, atau datang langsung ke kampus di Gresik.",
};

async function getData() {
  try {
    const [row, layanan] = await Promise.all([
      prisma.pageContent.findFirst({ where: { section: "kontak", isActive: true } }),
      prisma.pageContent.findFirst({ where: { section: "layanan-akademik", isActive: true } }),
    ]);
    return mergeKontak(row, layanan);
  } catch {
    return mergeKontak(null, null);
  }
}

/** Kontak — tema beranda "Kampus v3", konsep kantor pos & papan sambung. */
export default async function KontakPage() {
  const data = await getData();
  return (
    <div className="kampus" data-aos-wait>
      <PageCurtain storageKey={CURTAIN_KEY} title="Kontak" accent="Prodi" label="Menyiapkan kertas surat" />
      <Topbar />
      <SiteHeader />
      <KontakProvider data={data}>
        <HeadingStyle value="postmark">
          <main>
            <PostcardHero />
            <Switchboard />
            <LetterForm />
            <AddressMap />
            <StampSheet />
          </main>
        </HeadingStyle>
      </KontakProvider>
      <SiteFooter />
      <AosReady />
    </div>
  );
}
