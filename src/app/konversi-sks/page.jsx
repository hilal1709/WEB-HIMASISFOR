import { readPublicKonversi } from "@/lib/konversi-cms/server";
import { KonversiShell } from "@/components/konversi/konversi-shell";

export const revalidate = 300;

export async function generateMetadata() {
  const { seo } = await readPublicKonversi();
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: "/konversi-sks" },
    openGraph: { title: seo.title, description: seo.description, url: "/konversi-sks", images: seo.image ? [seo.image] : [] },
  };
}

export default async function KonversiSksPage() {
  return <KonversiShell data={await readPublicKonversi()} />;
}
