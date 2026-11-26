import { readPublicRegulasi } from "@/lib/regulasi-cms/server";
import { RegulasiBody } from "@/components/regulasi/regulasi-body";
import { RegulasiShell } from "@/components/regulasi/regulasi-shell";

export const revalidate = 300;

export async function generateMetadata() {
  const { seo } = await readPublicRegulasi();
  return { ...seo, alternates: { canonical: "/regulasi-akademik" }, openGraph: { ...seo, url: "/regulasi-akademik" } };
}

export default async function RegulasiAkademikPage() {
  return <RegulasiShell><RegulasiBody data={await readPublicRegulasi()} /></RegulasiShell>;
}
