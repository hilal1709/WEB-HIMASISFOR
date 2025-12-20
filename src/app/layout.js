/* eslint-disable @next/next/no-page-custom-font */
import "./globals.css";

export const metadata = {
  title: "Sistem Informasi - UISI",
  description:
    "Program Studi Sistem Informasi UISI - Info kurikulum, prestasi, profil dosen dan mahasiswa",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+Display:wght@300&display=swap"
          rel="stylesheet"
        />

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
      <body>{children}</body>
    </html>
  );
}
