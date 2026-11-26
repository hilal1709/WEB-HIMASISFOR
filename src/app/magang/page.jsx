import { readPublicMagang } from "@/lib/magang-cms/server";
import { MagangShell } from "@/components/magang/magang-shell";

export const revalidate = 300;

export async function generateMetadata() {
  const { seo } = await readPublicMagang();
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: "/magang" },
    openGraph: { title: seo.title, description: seo.description, url: "/magang", images: seo.image ? [seo.image] : [] },
  };
}

export default async function MagangPage() {
  return <MagangShell data={await readPublicMagang()} />;
}
