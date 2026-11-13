import { SAMBUTAN } from "@/lib/sambutan-content";
import { CONTACT_URL, PMB_URL } from "@/lib/home-content";

/** Tanda tangan dekoratif bawaan (tiga goresan; goresan terakhir = garis emas). */
export const SIGNATURE_PATHS = [
  "M6 58c10-22 22-44 30-48 6-3 4 14-2 30-5 13-9 22-6 22 6 0 18-30 26-30 5 0 0 18 4 18s10-14 16-14c4 0 2 10 6 10 6 0 12-16 20-16",
  "M108 44c-4 8-6 16 0 16 8 0 14-22 22-22-6 0-8 20 0 20 6 0 10-10 14-18 2 10 2 18 8 18 8 0 16-26 26-26",
  "M60 74c40-6 90-10 140-8",
];

/**
 * Isi default halaman Sambutan Kaprodi — setiap teks yang tampil di halaman publik ada di sini,
 * tidak ada lagi literal di komponen. CMS (Meja Sambutan) hanya menimpa yang diubah.
 */
export const SAMBUTAN_DEFAULTS = {
  person: {
    name: SAMBUTAN.name,
    credentials: SAMBUTAN.credentials,
    role: SAMBUTAN.role,
    photo: SAMBUTAN.photo,
    photoAlt: "",
  },
  curtain: { enabled: true, title: "Sambutan", accent: "Kaprodi", label: "Memuat sambutan" },
  hero: {
    breadcrumb: [
      { label: "Beranda", href: "/" },
      { label: "Profil", href: "" },
      { label: "Sambutan Kaprodi", href: "" },
    ],
    titleTop: "Sambutan",
    titleAccent: "Ketua Program Studi",
    subtitle: "Arah, nilai, dan harapan yang kami pegang dalam mendidik Sisforians.",
    readLabel: "Baca sambutan",
    profileLabel: "Profil lengkap",
    showLottie: true,
    lottie: "/lottie/lecturer.json",
    mascot: { show: true, pose: "wave", say: "Halo! Yuk baca pesan dari Kaprodi kami." },
  },
  letter: {
    banner: {
      show: true,
      variant: "brand",
      title: "Pendaftaran mahasiswa baru telah dibuka",
      body: "Bergabunglah bersama Sisforians angkatan berikutnya.",
      linkLabel: "Daftar",
      href: PMB_URL,
    },
    greeting: SAMBUTAN.greeting,
    paragraphs: SAMBUTAN.paragraphs,
    quote: SAMBUTAN.quote,
    quoteAfter: 3,
    closing: SAMBUTAN.closing,
    signOff: "Salam hangat,",
    progressLabels: ["Salam pembuka", "Tentang kami", "Pesan Kaprodi", "Penutup"],
    profileButtonLabel: "Profil",
  },
  signature: { mode: "draw", viewBox: "0 0 210 84", paths: SIGNATURE_PATHS, svgUrl: "", accentLast: true },
  profile: {
    intro: "Profil singkat ketua program studi.",
    researchLabel: "Bidang riset",
    research: SAMBUTAN.research,
    educationLabel: "Pendidikan",
    education: SAMBUTAN.education.map((e) => ({ degree: e.degree, place: e.place ?? "" })),
    certificationsLabel: "Sertifikasi",
    certifications: SAMBUTAN.certifications,
    contact: { label: "Hubungi prodi", href: CONTACT_URL },
  },
  seo: {
    title: "Sambutan Ketua Program Studi — Sistem Informasi UISI",
    description: "Pesan dan sambutan Ketua Program Studi Sistem Informasi Universitas Internasional Semen Indonesia.",
  },
};
