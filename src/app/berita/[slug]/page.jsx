import { notFound } from "next/navigation";
import { getPost, getWarta } from "@/lib/berita-server";
import { parseMarkdown, plain, tocOf } from "@/lib/markdown";
import { SiteHeader, Topbar } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { AosReady } from "@/components/motion/aos-provider";
import { Reader } from "@/components/berita/reader";

export const revalidate = 300;
export const dynamicParams = true;

const BASE = "https://sisfor.uisi.ac.id";

export async function generateStaticParams() {
  const { posts } = await getWarta();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await getPost(slug);
  if (!data) return { title: "Tulisan tidak ditemukan — Warta SISFOR" };
  const { post } = data;
  const description = post.excerpt || plain(post.content).slice(0, 160);
  return {
    title: `${post.title} — Warta SISFOR`,
    description,
    alternates: { canonical: `/berita/${post.slug}` },
    openGraph: { type: "article", title: post.title, description, publishedTime: post.publishedAt, images: post.cover ? [post.cover] : undefined },
  };
}

/** Halaman baca Warta SISFOR (berita & artikel). */
export default async function BacaPage({ params }) {
  const { slug } = await params;
  const data = await getPost(slug);
  if (!data) notFound();
  const { post, related } = data;
  const toc = tocOf(parseMarkdown(post.content));
  const ld = {
    "@context": "https://schema.org",
    "@type": post.type === "artikel" ? "Article" : "NewsArticle",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    image: post.cover ? [`${BASE}${post.cover.startsWith("/") ? post.cover : `/${post.cover}`}`] : undefined,
    author: { "@type": post.authorSlug ? "Person" : "Organization", name: post.author },
    publisher: { "@type": "Organization", name: "Program Studi Sistem Informasi UISI" },
    mainEntityOfPage: `${BASE}/berita/${post.slug}`,
  };
  return (
    <div className="kampus" data-aos-wait>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <Topbar />
      <SiteHeader />
      <main>
        <Reader post={post} related={related} toc={toc} />
      </main>
      <SiteFooter />
      <AosReady />
    </div>
  );
}
