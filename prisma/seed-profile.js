const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding profile page content...");

  // Hero Profile Section
  const heroProfile = await prisma.pageContent.upsert({
    where: { section: "hero-profile" },
    update: {},
    create: {
      section: "hero-profile",
      title: "Sistem Informasi",
      subtitle: "Universitas Internasional Semen Indonesia",
      content:
        "Program studi S1 Sistem Informasi Universitas Internasional Semen Indonesia merupakan salah satu dari 10 Program Studi yang terdapat di Universitas Internasional Semen Indonesia (UISI). Program studi ini berdiri sejak 16 Oktober 2014 berdasarkan SK DIRJEN DIKTI Kementerian Pendidikan Nasional Nomor SK 502/E/0/2014 dan terklasifikasi dalam kelompok program studi rumpun ilmu teknologi.",
      image: "/img/heroprofile.png",
      isActive: true,
      order: 1,
    },
  });
  console.log("✅ Created/Updated hero-profile section");

  // Video Profile Section
  const videoProfile = await prisma.pageContent.upsert({
    where: { section: "video-profile" },
    update: {},
    create: {
      section: "video-profile",
      title: "Video Profile",
      content:
        "https://www.youtube.com/watch?v=WQ4avou98wc&ab_channel=SistemInformasiUISI",
      image: "/img/video.png",
      isActive: true,
      order: 2,
    },
  });
  console.log("✅ Created/Updated video-profile section");

  // Visi Section
  const visi = await prisma.pageContent.upsert({
    where: { section: "visi" },
    update: {},
    create: {
      section: "visi",
      title: "Visi",
      subtitle: "Program Studi Sistem Informasi UISI",
      content:
        '"Menjadi Departemen Sistem Informasi yang unggul dalam bidang Sistem Enterprise, Tata Kelola dan Audit TI serta Sains Data pada tahun 2030 melalui sistem pengajaran, penelitian dan pengabdian masyarakat yang inovatif, berkualitas tinggi, dan berdaya-saing internasional serta oleh praktik - praktik terbaik industri"',
      isActive: true,
      order: 3,
    },
  });
  console.log("✅ Created/Updated visi section");

  // Misi Section
  const misi = await prisma.pageContent.upsert({
    where: { section: "misi" },
    update: {},
    create: {
      section: "misi",
      title: "Misi",
      subtitle: "Program Studi Sistem Informasi UISI",
      data: JSON.stringify({
        items: [
          "Menyelenggarakan pengajaran, penelitian dan pengabdian masyarakat di bidang Sistem Informasi yang inovatif, berkualitas tinggi dan berdaya saing internasional.",
          "Menyusun dan melaksanakan kurikulum yang didasarkan pada kebutuhan masyarakat, bisnis dan industri.",
          "Menyelenggarakan tata kelola pendidikan yang profesional, akuntabel dengan dukungan teknologi informasi dan komunikasi.",
          "Membentuk sivitas akademika yang amanah, beretika dan berorientasi pada kemajuan, serta menjunjung tinggi budaya berbagi pengetahuan.",
          "Menghasilkan lulusan Sistem Informasi yang berbudi luhur, berwawasan internasional, menjunjung kearifan lokal dan profesional.",
        ],
      }),
      isActive: true,
      order: 4,
    },
  });
  console.log("✅ Created/Updated misi section");

  // Profil Dosen Section
  const profilDosen = await prisma.pageContent.upsert({
    where: { section: "profil-dosen" },
    update: {},
    create: {
      section: "profil-dosen",
      title: "Profil Dosen",
      subtitle: "Sistem Informasi UISI",
      data: JSON.stringify({
        heading: "Profil Dosen",
        subheading: "Sistem Informasi UISI",
        dosens: [
          {
            name: "Brina Miftahurrohmah, S.Si., M.Si., MCE, MCF",
            expertise:
              "Intelligence Decision Support Systems; Statistics; Forecasting",
            image: "/img/profil/brina.jpg",
          },
          {
            name: "Grandys Frieska Prassida, S.Kom., M.Kom., Ph.D., MCE, CIIQA",
            expertise:
              "IS Strategic Planning; Enterprise Architecture; IT Governance & Risk Management",
            image: "/img/profil/grandys.jpg",
          },
          {
            name: "Catur Wulandari, S.Kom., M.Sc., MCE, MOS, MCF",
            expertise:
              "Education Technology; Data Science; Software Engineering",
            image: "/img/profil/catur.jpg",
          },
          {
            name: "Dr. Putri Amelia, S.T., M.T., M.Eng., MCE, MOS",
            expertise: "Modelling; System Dynamic; Supply Chain",
            image: "/img/profil/putri.jpg",
          },
          {
            name: "Tikno, S.T., M.Kom., MCE",
            expertise:
              "Enterprise Resource Planning; IT Audit; Customer Behavior",
            image: "/img/profil/tikno.jpg",
          },
          {
            name: "Ardhi Dwi Firmansyah, S.Kom., M.Kom., MCE",
            expertise:
              "IT Governance, Data Governance, IT Service Management",
            image: "/img/profil/ardhi.jpg",
          },
        ],
      }),
      isActive: true,
      order: 5,
    },
  });
  console.log("✅ Created/Updated profil-dosen section");

  // Akreditasi Section
  const akreditasi = await prisma.pageContent.upsert({
    where: { section: "akreditasi" },
    update: {},
    create: {
      section: "akreditasi",
      title: "Sertifikat <span class='text-red-600'>Akreditasi</span>",
      subtitle: "Program Studi Sistem Informasi UISI",
      content:
        'Per tanggal 3 April 2023, Program Studi S1 Sistem Informasi UISI telah terakreditasi "Baik Sekali" oleh Lembaga Akreditasi Mandiri Informatika dan Komputer (LAM INFOKOM) yang dinyatakan dalam Keputusan LAM INFOKOM No.026/SK/LAM-INFOKOM/Ak/S/IV/2023.',
      image: "/img/sertif_akreditasi.png",
      isActive: true,
      order: 6,
    },
  });
  console.log("✅ Created/Updated akreditasi section");

  // Profil Alumni Section
  const profilAlumni = await prisma.pageContent.upsert({
    where: { section: "profil-alumni" },
    update: {},
    create: {
      section: "profil-alumni",
      title: "Profil Lulusan",
      subtitle: "Sistem Informasi UISI",
      content:
        "Lulusan Program Studi Sistem Informasi UISI telah terbukti dan sukses bekerja di berbagai perusahaan ternama",
      image:
        "https://www.youtube.com/watch?v=Pz30NmEzSew&ab_channel=SistemInformasiUISI",
      isActive: true,
      order: 7,
    },
  });
  console.log("✅ Created/Updated profil-alumni section");

  // Infinite Alumni Section
  const infiniteAlumni = await prisma.pageContent.upsert({
    where: { section: "infinite-alumni" },
    update: {},
    create: {
      section: "infinite-alumni",
      title: "Daftar Alumni",
      data: JSON.stringify({
        alumni: [
          {
            name: "Rizqi A. W. Y., S.Kom",
            img: "img/alumni/rizqi.png",
            job: "Surveyor SPBE PT. Tatacipta Teknologi Indonesia",
          },
          {
            name: "Edwin R. Putra, S.Kom",
            img: "img/alumni/edwin.png",
            job: "Management Information System PT. Wilmar Nabati Indonesia",
          },
          {
            name: "Felix Atmaja, S.Kom",
            img: "img/alumni/felix.png",
            job: "Officer Program Retailership Semen Indonesia Group",
          },
          {
            name: "Juliana Kristi, S.Kom",
            img: "img/alumni/juliana.png",
            job: "IT Planning & Control di PT. Petrokimia Gresik",
          },
        ]
      }),
      isActive: true,
      order: 8,
    },
  });
  console.log("✅ Created/Updated infinite-alumni section");

  console.log("\n🎉 Profile page content seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding profile content:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
