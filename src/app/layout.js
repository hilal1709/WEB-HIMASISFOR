import "./globals.css";
import { Inter, Noto_Serif_Display } from 'next/font/google';

// Optimize font loading
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const notoSerif = Noto_Serif_Display({ 
  subsets: ['latin'],
  weight: '300',
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
    <html lang="en" className={`${inter.variable} ${notoSerif.variable}`}>
      <head>
        <meta charSet="UTF-8" />
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
        <link rel="canonical" href="https://sisfor.uisi.ac.id/" />
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
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}