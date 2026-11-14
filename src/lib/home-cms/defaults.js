/**
 * Isi default Studio Beranda — sama persis dengan beranda sebelum CMS ada, sehingga
 * beranda tetap utuh walau database kosong. CMS menimpa per section (lihat server.js).
 */
import {
  ABOUT,
  ABOUT_V3,
  ACCREDITATION,
  ACHIEVEMENTS,
  ALUMNI,
  AUDIENCE,
  CONTACT_URL,
  EXPERTISE,
  FOOTER,
  HERO,
  HERO_V3,
  JOIN,
  MEGA_FEATURE,
  NAV,
  NEWS,
  PMB_URL,
  QUICK_LINKS,
  VIDEOS,
  WHY,
} from "@/lib/home-content";

const link = (label, href) => ({ label, href });
const mascot = (pose, say) => ({ pose, say });

export const HOME_DEFAULTS = {
  layout: {
    sections: ["hero", "quicklinks", "about", "accreditation", "expertise", "achievements", "news", "alumni", "partners", "join"].map((key) => ({ key, visible: true })),
  },

  header: {
    logo: "/img/logo-lockup.png",
    logoAlt: "Sistem Informasi UISI",
    pmb: link("PMB 2027", PMB_URL),
    mobileCta: "PMB 2027: Daftar Sekarang",
    audience: AUDIENCE.map((a) => link(a.label, a.href)),
    utility: [link("Beasiswa", "/beasiswa"), link("FAQ", "/faq"), link("Kontak", "/kontak"), link("UISI", "https://uisi.ac.id")],
    lang: "ID · EN",
    langNote: "Versi bahasa Inggris segera hadir",
    searchPlaceholder: "Cari halaman, mis. kurikulum, magang…",
    searchEmpty: "Tidak ada halaman yang cocok.",
    nav: NAV.map((n) => ({
      label: n.label,
      href: n.href,
      items: (n.items ?? []).map((s) => ({ label: s.label, href: s.href, desc: s.desc })),
      feature: MEGA_FEATURE[n.label] ? { ...MEGA_FEATURE[n.label] } : { image: "", title: "", body: "", href: "" },
    })),
  },

  intro: {
    enabled: true,
    title: "Sistem Informasi",
    subtitle: "Universitas Internasional Semen Indonesia",
    caption: "Sistem Informasi · UISI",
  },

  hero: {
    background: { ...VIDEOS.heroLoop },
    titleLead: HERO_V3.title[0],
    titleAccent: HERO_V3.title[1],
    titleTail: HERO_V3.title[2],
    body: HERO_V3.body,
    primary: link("Daftar PMB", PMB_URL),
    secondary: link("Jelajahi Program", "#bidang"),
    story: { ...VIDEOS.mawapres },
    storyLabel: "Tonton kisah mawapres",
    mascot: mascot("wave", "Hai! Aku Si Elvo, maskot Sistem Informasi UISI. Yuk jelajahi!"),
  },

  quicklinks: {
    items: QUICK_LINKS.map((q) => ({ title: q.title, body: q.body, href: q.href, lottie: q.lottie })),
  },

  about: {
    photo: ABOUT_V3.photo,
    photoAlt: "Ketua Program Studi Sistem Informasi",
    title: [...ABOUT_V3.title],
    quote: ABOUT_V3.quote,
    quoteBy: ABOUT_V3.quoteBy,
    body: ABOUT.body[0],
    more: link("Selengkapnya tentang prodi", "/sambutan-kaprodi"),
    stats: [
      { value: "2014", label: "Tahun berdiri" },
      { value: "4", label: "Bidang keahlian" },
      { value: "Baik Sekali", label: "Akreditasi LAM INFOKOM" },
    ],
    totalLabel: "Prestasi tercatat",
    showTotal: true,
    features: WHY.items.map((w) => ({ title: w.title, body: w.body, lottie: w.lottie, illustration: w.illustration })),
    video: { ...VIDEOS.dosen },
    videoLabel: "Dosen kami",
    mascot: mascot("confident", "Terakreditasi “Baik Sekali” dari LAM INFOKOM, lho!"),
  },

  accreditation: {
    certificate: ACCREDITATION.certificate,
    lottie: "/lottie/badge-dark.json",
    lead: "Terakreditasi",
    grade: ACCREDITATION.grade,
    issuer: ACCREDITATION.issuer,
    issuerFull: "Lembaga Akreditasi Mandiri Informatika dan Komputer",
    rows: ACCREDITATION.rows.slice(0, 2).map(([k, v]) => ({ label: k, value: v })),
  },

  expertise: {
    title: [...EXPERTISE.title],
    body: EXPERTISE.body,
    more: link("Jelajahi bidang keahlian", "/bidang-keahlian"),
    careersLabel: "Prospek karier",
    mascot: mascot("think", "Bingung pilih bidang? Arahkan kursor ke kartunya."),
  },

  achievements: {
    title: ["Mahasiswa", "berprestasi", "& rekognisi dosen"],
    body: ACHIEVEMENTS.body,
    more: link("Semua prestasi", "/achievement"),
    lottie: "/lottie/trophy-dark.json",
    tabStudent: "Mahasiswa",
    tabLecturer: "Dosen",
    video: { ...VIDEOS.mawapres },
    videoLabel: "Kisah sukses",
    caption: "Felix Atmaja, mahasiswa berprestasi Sistem Informasi UISI 2023, bercerita tentang magang bersertifikat, pertukaran mahasiswa, dan kompetisi.",
    fallbackStudent: ACHIEVEMENTS.tabs.mahasiswa.map((a) => ({ ...a })),
    fallbackLecturer: ACHIEVEMENTS.tabs.dosen.map((a) => ({ ...a })),
    mascot: mascot("proud", "Bangga sama prestasi kakak-kakak tingkat!"),
  },

  news: {
    title: ["Berita", "&", "agenda"],
    body: NEWS.body,
    more: link("Buka Warta SISFOR", "/berita"),
    agendaTitle: "Agenda",
    calendar: link("Kalender", "/berita?rubrik=agenda"),
    agendaLottie: "/lottie/calendar.json",
    emptyLottie: "/lottie/empty-news.json",
    emptyText: "Belum ada agenda terdekat.",
    mascot: mascot("thumbs-up", "Catat tanggalnya, jangan sampai ketinggalan!"),
  },

  alumni: {
    title: ["Cerita", "alumni", "kami"],
    body: ALUMNI.body,
    lottie: "/lottie/grad-cap.json",
    video: { ...VIDEOS.alumni },
    videoLabel: "Profil alumni",
    items: ALUMNI.items.map((a) => ({ quote: a.quote, name: a.name, role: a.role, photo: a.photo ?? "" })),
    mascot: mascot("laugh", "Seru dengar cerita kakak-kakak alumni!"),
  },

  partners: {
    heading: "Jejaring mitra industri",
    items: HERO.partners.map((p) => ({ name: p.name, logo: p.logo ?? "" })),
  },

  join: {
    eyebrow: JOIN.eyebrow,
    title: [...JOIN.title],
    body: JOIN.body,
    primary: link("Daftar sekarang", PMB_URL),
    secondary: link("Hubungi kami", CONTACT_URL),
    image: "/img/heroprofile.png",
    imageAlt: "Mahasiswa Sistem Informasi UISI",
    lottie: "/lottie/rocket-pmb-dark.json",
    mascot: mascot("run", "Ayo daftar, aku tunggu di kampus!"),
  },

  footer: {
    logo: "/img/logo-lockup.png",
    address: FOOTER.address,
    map: link("Lihat di peta", "https://maps.google.com/?q=Universitas+Internasional+Semen+Indonesia"),
    socials: FOOTER.socials.map((s) => ({ name: s.name, href: s.href })),
    columns: FOOTER.columns.map((c) => ({ title: c.title, links: c.links.map(([label, href]) => link(label, href)) })),
    copyright: "© {tahun} Program Studi Sistem Informasi · Universitas Internasional Semen Indonesia",
    bottomLinks: AUDIENCE.slice(0, 3).map((a) => link(a.label, a.href)),
    toTop: "Ke atas",
    mascot: mascot("wave", "Sampai jumpa di kampus, Sisforians!"),
  },
};
