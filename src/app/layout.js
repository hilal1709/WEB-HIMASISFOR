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
  title: "Sistem Informasi - UISI",
  description:
    "Program Studi Sistem Informasi UISI - Info kurikulum, prestasi, profil dosen dan mahasiswa",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning className={`${inter.variable} ${notoSerif.variable} ${bricolage.variable}`}>
      <head>
        <meta charSet="UTF-8" />
        {/* Tahan konten halaman sampai hidrasi + kondisi awal animasi siap (dibuka oleh <AosReady/>); lihat globals.css */}
        <script dangerouslySetInnerHTML={{ __html: 'document.documentElement.setAttribute("data-prehydrate","")' }} />
        <meta
          name="description"
          content="Program Studi Sistem Informasi UISI - Info kurikulum, prestasi, profil dosen dan mahasiswa"
        />
        <meta
          name="keywords"
          content="Sistem Informasi, UISI, Kurikulum, Prestasi, Dosen, Mahasiswa"
        />
        <meta name="author" content="UISI" />
        <meta
          name="robots"
          content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
        />
        <link rel="canonical" href="https://si.uisi.ac.id/" />
        <meta property="og:locale" content="id_ID" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Sistem Informasi - UISI" />
        <meta
          property="og:description"
          content="Info lengkap tentang Program Studi Sistem Informasi UISI."
        />
        <meta property="og:image" content="/img/logo.png" />
        <meta property="og:type" content="website" />
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