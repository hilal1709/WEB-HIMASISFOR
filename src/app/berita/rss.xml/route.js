import { getWarta } from "@/lib/berita-server";
import { plain } from "@/lib/markdown";

export const revalidate = 600;

const BASE = "https://sisfor.uisi.ac.id";
const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Umpan RSS 2.0 Warta SISFOR (berita + artikel terbit). */
export async function GET() {
  const { posts } = await getWarta();
  const items = posts
    .slice(0, 40)
    .map(
      (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${BASE}/berita/${p.slug}</link>
      <guid isPermaLink="true">${BASE}/berita/${p.slug}</guid>
      <pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>
      <category>${esc(p.type === "artikel" ? "Artikel" : "Berita")}: ${esc(p.category)}</category>
      <description>${esc(p.excerpt || plain(p.content).slice(0, 280))}</description>
    </item>`
    )
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Warta SISFOR — Sistem Informasi UISI</title>
    <link>${BASE}/berita</link>
    <atom:link href="${BASE}/berita/rss.xml" rel="self" type="application/rss+xml" />
    <description>Berita, artikel, dan agenda Program Studi Sistem Informasi UISI.</description>
    <language>id</language>
${items}
  </channel>
</rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" } });
}
