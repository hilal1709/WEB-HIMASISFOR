const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Start seeding...')

  // Seed Alumni Data
  const alumniData = [
    { name: 'Rusydani Basyir', nim: '202001001', tahunLulus: 2024, pekerjaan: 'Software Engineer at Tech Company', foto: '/img/rusydani.png' },
    { name: 'Melenia Ratna Putri', nim: '202001002', tahunLulus: 2024, pekerjaan: 'Data Analyst at Startup', foto: '/img/melenia.png' },
    { name: 'Rizqi Maulana', nim: '202001003', tahunLulus: 2024, pekerjaan: 'Web Developer at Agency', foto: '/img/rizqi.png' },
    { name: 'Tati Suharti', nim: '202001004', tahunLulus: 2024, pekerjaan: 'IT Consultant', foto: '/img/tati.png' },
  ]

  for (const alumni of alumniData) {
    await prisma.alumni.upsert({
      where: { nim: alumni.nim },
      update: alumni,
      create: alumni,
    })
  }
  console.log('✅ Alumni data seeded')

  // Seed Achievement Data
  const achievementDataDosen = [
    {
      achieverName: "Prof. Basuki Widodo, S.Si., M.Si., Ph.D.",
      title: "Editor in Chief International Journal of Computing and Optimization (IJCO) ISSN: 2348 - 1021",
      tingkatan: "Internasional",
      tahun: "2017 - Sekarang",
      category: "dosen",
      image: "../img/dosen/basuki.png"
    },
    {
      achieverName: "Prof. Basuki Widodo, S.Si., M.Si., Ph.D.",
      title: "Visiting Professor Universiti Teknologi Malaysia (UTM), Johor Bahru, Malaysia",
      tingkatan: "Internasional",
      tahun: "2015, 2018, 2022",
      category: "dosen",
      image: "../img/dosen/basuki.png"
    },
    {
      achieverName: "Prof. Basuki Widodo, S.Si., M.Si., Ph.D.",
      title: "Program Riset Malaysia (UTM)",
      tingkatan: "Internasional",
      tahun: "2022",
      category: "dosen",
      image: "../img/dosen/basuki.png"
    },
    {
      achieverName: "Dr. Teguh Yuwono, S.T., M.Kom.",
      title: "Reviewer dan Moderator Information Systems International Conference (ISICO) 2021 dan 2023",
      tingkatan: "Internasional",
      tahun: "2021, 2023",
      category: "dosen",
      image: "../img/dosen/teguh.png"
    },
    {
      achieverName: "Dr. Lailil Muflikhah, S.Kom., M.Kom.",
      title: "Moderator dan Reviewer Information Systems International Conference (ISICO) 2019, 2021, dan 2023",
      tingkatan: "Internasional",
      tahun: "2019, 2021, 2023",
      category: "dosen",
      image: "../img/dosen/lailil.png"
    },
    {
      achieverName: "Dr. Dian Eka Ratnawati, S.Kom., M.Kom.",
      title: "Reviewer, Moderator, dan Presenter (On-Site) Information Systems International Conference (ISICO) 2023",
      tingkatan: "Internasional",
      tahun: "2023",
      category: "dosen",
      image: "../img/dosen/dian.png"
    },
    {
      achieverName: "Dr. Dian Eka Ratnawati, S.Kom., M.Kom.",
      title: "Reviewer dan Moderator Information Systems International Conference (ISICO) 2021",
      tingkatan: "Internasional",
      tahun: "2021",
      category: "dosen",
      image: "../img/dosen/dian.png"
    },
    {
      achieverName: "Dr. Dian Eka Ratnawati, S.Kom., M.Kom.",
      title: "Reviewer Information Systems International Conference (ISICO) 2019",
      tingkatan: "Internasional",
      tahun: "2019",
      category: "dosen",
      image: "../img/dosen/dian.png"
    },
    {
      achieverName: "Dr. Ir. Dwi Mustika Kusumawardani, S.Kom., M.Kom.",
      title: "Reviewer Information Systems International Conference (ISICO) 2021",
      tingkatan: "Internasional",
      tahun: "2021",
      category: "dosen",
      image: "../img/dosen/dwi.png"
    },
    {
      achieverName: "Dr. Ir. Dwi Mustika Kusumawardani, S.Kom., M.Kom.",
      title: "Reviewer Information Systems International Conference (ISICO) 2019",
      tingkatan: "Internasional",
      tahun: "2019",
      category: "dosen",
      image: "../img/dosen/dwi.png"
    },
    {
      achieverName: "Catur Iswahyudi, S.Kom., M.Cs.",
      title: "Reviewer dan Moderator (Online) Information Systems International Conference (ISICO) 2023",
      tingkatan: "Internasional",
      tahun: "2023",
      category: "dosen",
      image: "../img/dosen/catur.png"
    },
    {
      achieverName: "Catur Iswahyudi, S.Kom., M.Cs.",
      title: "Reviewer Information Systems International Conference (ISICO) 2019",
      tingkatan: "Internasional",
      tahun: "2019",
      category: "dosen",
      image: "../img/dosen/catur.png"
    },
    {
      achieverName: "Dr. Putri Amelia, S.T., M.T., M.Eng., MCE, MOS",
      title: "Moderator dan Reviewer Information Systems International Conference (ISICO) 2019 dan 2021",
      tingkatan: "Internasional",
      tahun: "2019, 2021",
      category: "dosen",
      image: "../img/dosen/putri.png"
    }
  ];

  const achievementDataMahasiswa = [
    {
      achieverName: "Sony Abdhillah",
      title: "Finalis 10 Besar Lomba Desain Toko Online Kompetisi The 9th UTU Awards Universitas Teuku Umar Aceh",
      tingkatan: "Nasional",
      tahun: "2023",
      category: "mahasiswa",
      image: "../img/mhs/sony.png"
    },
    {
      achieverName: "Muhammad Fajar Ramadhoni",
      title: "Finalis 10 Besar Lomba Desain Toko Online Kompetisi The 9th UTU Awards Universitas Teuku Umar Aceh",
      tingkatan: "Nasional",
      tahun: "2023",
      category: "mahasiswa",
      image: "../img/mhs/fajar.png"
    },
    {
      achieverName: "Uston Nawawi Christanto",
      title: "Finalis 10 Besar Lomba Desain Toko Online Kompetisi The 9th UTU Awards Universitas Teuku Umar Aceh",
      tingkatan: "Nasional",
      tahun: "2023",
      category: "mahasiswa",
      image: "../img/mhs/uston.png"
    },
    {
      achieverName: "Arif Muhammad Iqbal",
      title: "Delegasi Mahasiswa The 4th Indonesia Human Capital Summit 2023",
      tingkatan: "Nasional",
      tahun: "2023",
      category: "mahasiswa",
      image: "../img/mhs/arif.png"
    },
    {
      achieverName: "Puji Astutik",
      title: "Presenter (On-Site) Information Systems International Conference (ISICO) 2023",
      tingkatan: "Internasional",
      tahun: "2023",
      category: "mahasiswa",
      image: "../img/mhs/puji.png"
    },
    {
      achieverName: "Felix Atmaja",
      title: "Presenter (Online) Information Systems International Conference (ISICO) 2023",
      tingkatan: "Internasional",
      tahun: "2023",
      category: "mahasiswa",
      image: "../img/mhs/felix.png"
    },
    {
      achieverName: "Ahmat Rendi Saputra",
      title: "Juara 1 Tanding Kelas Putra Tingkat Mahasiswa/Dewasa Kejuaraan Pencak Silat Jember National Championship 1 Tahun 2023",
      tingkatan: "Nasional",
      tahun: "2023",
      category: "mahasiswa",
      image: "../img/mhs/rendi.png"
    },
    {
      achieverName: "Ahmat Rendi Saputra",
      title: "Juara 2 Kejurnas Pencak Silat PSHT Kategori Seni Tunggal UNEJ CUP VI",
      tingkatan: "Nasional",
      tahun: "2023",
      category: "mahasiswa",
      image: "../img/mhs/rendi.png"
    },
    {
      achieverName: "Ahmat Rendi Saputra",
      title: "Juara 2 Seni Tunggal Tangan Kosong Tingkat Mahasiswa/Dewasa Kejuaraan Pencak Silat Jember National Championship 1 Tahun 2023",
      tingkatan: "Nasional",
      tahun: "2023",
      category: "mahasiswa",
      image: "../img/mhs/rendi.png"
    },
    {
      achieverName: "Fairianto Alfandy Firmanza",
      title: "Juara 1 & 2 Microsoft Office Specialist National Championship 2021",
      tingkatan: "Nasional",
      tahun: "2021",
      category: "mahasiswa",
      image: "../img/mhs/fairianto.png"
    },
    {
      achieverName: "Abror Aqomaddin",
      title: "Juara 1 & 2 Microsoft Office Specialist National Championship 2021",
      tingkatan: "Nasional",
      tahun: "2021",
      category: "mahasiswa",
      image: "../img/mhs/abror.png"
    }
  ];

  const achievementData = [...achievementDataDosen, ...achievementDataMahasiswa];

  for (const achievement of achievementData) {
    await prisma.achievement.create({
      data: achievement,
    })
  }
  console.log('✅ Achievement data seeded')

  // Seed Page Content
  const pageContentData = [
    {
      section: 'hero',
      title: 'Sistem Informasi UISI',
      subtitle: 'Program Studi S1',
      content: 'Membangun generasi profesional di bidang teknologi informasi dengan kurikulum berbasis industri',
      image: '/img/heroPict.png',
      isActive: true,
      order: 1
    },
    {
      section: 'bidang-keahlian',
      title: 'Bidang Keahlian',
      subtitle: 'Fokus Pembelajaran',
      content: 'Tiga bidang keahlian utama yang menjadi fokus pembelajaran',
      data: JSON.stringify({
        type: 'card',
        cards: [
          {
            title: 'IT Audit / Governance',
            description: 'Belajar mengenai bagaimana meningkatkan kemampuan organisasi untuk mencapai tujuan dan sasaran keseluruhannya',
            image: '/img/governance.jpeg'
          },
          {
            title: 'Enterprise System',
            description: 'Mempelajari sistem informasi terintegrasi untuk mengelola proses bisnis',
            image: '/img/erp.jpeg'
          },
          {
            title: 'Data Analytics',
            description: 'Menganalisis data untuk menghasilkan insights dan mendukung pengambilan keputusan',
            image: '/img/analytics.jpeg'
          }
        ]
      }),
      isActive: true,
      order: 2
    },
    {
      section: 'profile-program',
      title: 'Program Studi Sistem Informasi',
      subtitle: 'Tentang Kami',
      content: 'Program Studi Sistem Informasi UISI dirancang untuk menghasilkan lulusan yang kompeten di bidang teknologi informasi dengan pemahaman mendalam tentang bisnis dan manajemen. Kami menggabungkan teori dan praktik untuk mempersiapkan mahasiswa menghadapi tantangan industri 4.0.',
      image: '/img/profil/kampus.jpg',
      isActive: true,
      order: 1
    },
    {
      section: 'profile-visi',
      title: 'Visi & Misi',
      subtitle: 'Visi',
      content: 'Menjadi program studi unggulan yang menghasilkan lulusan berkompeten di bidang sistem informasi dengan jiwa kewirausahaan dan berwawasan global.\n\nMisi:\n1. Menyelenggarakan pendidikan berkualitas di bidang sistem informasi\n2. Mengembangkan penelitian yang inovatif dan aplikatif\n3. Memberikan pengabdian kepada masyarakat\n4. Membangun kerjasama dengan industri dan institusi lain',
      isActive: true,
      order: 2
    }
  ]

  for (const page of pageContentData) {
    await prisma.pageContent.upsert({
      where: { section: page.section },
      update: page,
      create: page,
    })
  }
  console.log('✅ Page content seeded')

  // Seed Navbar Items
  const navbarData = [
    { label: 'Beranda', href: '/', order: 1, isActive: true },
    { label: 'Profile', href: '/profile', order: 2, isActive: true },
    { label: 'Kurikulum', href: '/curiculum', order: 3, isActive: true },
    { label: 'Prestasi', href: '/achievement', order: 4, isActive: true },
  ]

  for (const nav of navbarData) {
    await prisma.navbarItem.create({
      data: nav,
    })
  }
  console.log('✅ Navbar items seeded')

  // Seed Pages
  const pagesData = [
    {
      name: 'Beranda',
      slug: 'beranda',
      title: 'Sistem Informasi UISI',
      description: 'Website resmi Program Studi S1 Sistem Informasi Universitas Internasional Semen Indonesia (UISI)',
      isActive: true,
      sections: JSON.stringify([]),
      sourceCode: ''
    },
    {
      name: 'Profil',
      slug: 'profile',
      title: 'Profil - Sistem Informasi UISI',
      description: 'Profil dosen dan tenaga pendidik Program Studi Sistem Informasi UISI',
      isActive: true,
      sections: JSON.stringify([]),
      sourceCode: ''
    },
    {
      name: 'Prestasi',
      slug: 'achievement',
      title: 'Prestasi - Sistem Informasi UISI',
      description: 'Daftar prestasi dosen dan mahasiswa Program Studi Sistem Informasi UISI',
      isActive: true,
      sections: JSON.stringify([]),
      sourceCode: ''
    },
    {
      name: 'Kurikulum',
      slug: 'curiculum',
      title: 'Kurikulum - Sistem Informasi UISI',
      description: 'Kurikulum dan struktur mata kuliah Program Studi Sistem Informasi UISI',
      isActive: true,
      sections: JSON.stringify([]),
      sourceCode: ''
    }
  ]

  for (const page of pagesData) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: page,
      create: page,
    })
  }
  console.log('✅ Pages seeded')

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
