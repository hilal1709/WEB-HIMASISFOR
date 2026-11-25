import "./globals.css";
import { Inter, Noto_Serif_Display, Bricolage_Grotesque } from 'next/font/google';
import { Providers } from "@/components/providers";

// Optimize font loading
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Display face beranda (Negeri Kapur Gresik): grotesk tebal, sumbu lebar untuk judul padat
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  axes: ['wdth', 'opsz'],
});

// Variable font (tanpa `weight`): bobot statis membuat Google mengembalikan URL `l/font?kit=…&skey=…`
// yang gagal di-resolve Turbopack ("next/font/google queries have exactly one entry"). 300/400 tetap tersedia.
const notoSerif = Noto_Serif_Display({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-noto-serif',
});

export const metadata = {
  metadataBase: new URL("https://si.uisi.ac.id"),
  title: "Sistem Informasi - UISI",
  description:
    "Program Studi Sistem Informasi UISI - Info kurikulum, prestasi, profil dosen dan mahasiswa",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large", "max-video-preview": -1 },
  openGraph: { locale: "id_ID", type: "website", title: "Sistem Informasi - UISI", description: "Info lengkap tentang Program Studi Sistem Informasi UISI.", images: ["/img/logo.png"] },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning className={`${inter.variable} ${notoSerif.variable} ${bricolage.variable}`}>
      <head>
        <meta charSet="UTF-8" />
        {/* Tahan konten halaman sampai hidrasi + kondisi awal animasi siap (dibuka oleh <AosReady/>); lihat globals.css */}
        <script dangerouslySetInnerHTML={{ __html: 'document.documentElement.setAttribute("data-prehydrate","")' }} />
        <meta
          name="keywords"
          content="Sistem Informasi, UISI, Kurikulum, Prestasi, Dosen, Mahasiswa"
        />
        <meta name="author" content="UISI" />
        <link rel="icon" type="image" href="/icon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <script type="application/ld+json">
          {`
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://sisfor.uisi.ac.id/"
            }
          ]
        }
        `}
        </script>
        <title>Sistem Informasi - UISI</title>
      </head>
      <body className={`${inter.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
