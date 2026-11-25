import { JalurView } from "@/components/jalur/jalur-view";
import { readPublicJalur } from "@/lib/jalur-cms/server";
import { safeJalurUrl } from "@/lib/jalur-cms/schema";

export const revalidate = 300;

export async function generateMetadata() {
  const { copy: { identity } } = await readPublicJalur();
  const image = safeJalurUrl(identity.seoImage);
  return {
    title: identity.seoTitle,
    description: identity.seoDescription,
    alternates: { canonical: "/jalur-kelulusan" },
    openGraph: {
      title: identity.seoTitle, description: identity.seoDescription, url: "/jalur-kelulusan", locale: "id_ID", type: "website",
      images: image && !image.startsWith("#") ? [{ url: image, alt: identity.seoImageAlt || undefined }] : [],
    },
  };
}

/** Jalur Kelulusan — tema beranda "Kampus v3" (maroon + navy + gold di atas cream). */
export default async function JalurKelulusanPage() {
  return <JalurView data={await readPublicJalur()} />;
}
