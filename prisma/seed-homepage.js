const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedHomepage() {
  console.log('🌱 Seeding homepage content...');

  // 1. Hero Section
  await prisma.pageContent.upsert({
    where: { section: 'hero' },
    update: {},
    create: {
      section: 'hero',
      title: 'Program Studi Sistem Informasi UISI',
      subtitle: 'SISFOR UISI',
      content: 'Keberhasilan Semen Indonesia Group dalam penerapan Good Corporate Governance salah satunya melalui implementasi Enterprise Resource Planning (ERP), mampu menjadi dukungan best practice dalam sistem pembelajaran di Program Studi Sistem Informasi Universitas Internasional Semen Indonesia.',
      image: '/img/heroPict.png',
      data: JSON.stringify({
        badge: 'SISFOR UISI',
        buttons: [
          {
            text: 'Hubungi Kami',
            url: 'https://s.id/DaftarSisforUISI',
            type: 'primary'
          },
          {
            text: 'Video Profile',
            url: 'https://www.youtube.com/watch?v=WQ4avou98wc&ab_channel=SistemInformasiUISI',
            type: 'secondary'
          }
        ],
        akreditasi: {
          image: '/img/akreditasi.png',
          title: 'Terakreditasi "Baik Sekali"',
          description: 'LAM INFOKOM No.026/SK/LAM-INFOKOM/Ak/S/IV/2023.'
        }
      }),
      isActive: true,
      order: 1
    }
  });

  // 2. Sistem Informasi Section
  await prisma.pageContent.upsert({
    where: { section: 'about' },
    update: {},
    create: {
      section: 'about',
      title: 'Sistem Informasi',
      subtitle: 'Universitas Internasional Semen Indonesia',
      content: `Program studi S1 Sistem Informasi Universitas Internasional Semen Indonesia merupakan salah satu dari 10 Program Studi yang terdapat di Universitas Internasional Semen Indonesia (UISI). Program studi ini berdiri sejak 16 Oktober 2014 berdasarkan SK DIRJEN DIKTI Kementerian Pendidikan Nasional Nomor SK 502/E/0/2014 dan terklasifikasi dalam kelompok program studi rumpun ilmu teknologi.

Per tanggal 3 April 2023, Program Studi S1 Sistem Informasi UISI telah terakreditasi "Baik Sekali" oleh Lembaga Akreditasi Mandiri Informatika dan Komputer (LAM INFOKOM) yang dinyatakan dalam Keputusan LAM INFOKOM No.026/SK/LAM-INFOKOM/Ak/S/IV/2023.`,
      isActive: true,
      order: 2
    }
  });

  // 3. Bidang Keahlian Section
  await prisma.pageContent.upsert({
    where: { section: 'bidang-keahlian' },
    update: {},
    create: {
      section: 'bidang-keahlian',
      title: 'Bidang Keahlian Sistem Informasi UISI',
      subtitle: 'Program Studi S1 Sistem Informasi Universitas Internasional Semen Indonesia memiliki 3 fokus utama bidang keahlian, diantaranya sebagai berikut',
      data: JSON.stringify([
        {
          title: 'IT Audit / Governance',
          subtitle: 'Apa itu IT / Audit & Governance ?',
          cardId: 'audit',
          description: 'Belajar mengenai bagaimana meningkatkan kemampuan organisasi untuk mencapai tujuan dan sasaran keseluruhannya, dan bagaimana mengevaluasi implementasi tata kelola TI',
          background: 'bg-[url(/img/governance.jpeg)]'
        },
        {
          title: 'Enterprise System',
          subtitle: 'Apa itu Enterprise System ?',
          cardId: 'erp',
          description: 'Belajar mengenai sistem informasi lintas fungsi yang menyediakan integrasi proses bisnis utama dan membantu dalam perencanaan sumber daya organisasi.',
          background: 'bg-[url(/img/erp.jpeg)]'
        },
        {
          title: 'Data Science',
          subtitle: 'Apa itu Data Science ?',
          cardId: 'data',
          description: 'Belajar mengenai bagaimana menerapkan prinsip dan teknik penanganan data untuk memberikan informasi yang berarti dan mendukung pengambilan keputusan dalam suatu organisasi.',
          background: 'bg-[url(/img/data.jpeg)]'
        }
      ]),
      isActive: true,
      order: 3
    }
  });

  // 4. Profil Karir Lulusan Section
  await prisma.pageContent.upsert({
    where: { section: 'career' },
    update: {},
    create: {
      section: 'career',
      title: 'Prospek Karir Lulusan <br /><span class="text-transparent bg-clip-text bg-gradient-to-r from-red-700 to-red-500">Sistem Informasi UISI</span>',
      data: JSON.stringify({
        careers: [
          {
            id: 'erp',
            title: 'Enterprise System Analyst',
            description: 'Berperan dalam analisis kebutuhan bisnis dan solusi/implementasi sistem (ERP, SCM, CRM) sesuaifungsi dan skala perusahaan.',
            image: 'img/bidangerp.png'
          },
          {
            id: 'auditor',
            title: 'IT/IS Auditor',
            description: 'Berperan dalam perencanaan, pemantauan dan evaluasi, serta pengukuran kinerja TI perusahaan, termasuk perancangan hingga evaluasi tingkat kematangan Tata Kelola TI.',
            image: 'img/bidangauditor.png'
          },
          {
            id: 'consultant',
            title: 'IT Consultant',
            description: 'IT Consultant Berperan dalam pengolahan data dan informasi yang mendukung pengambilan keputusan atau meningkatkan nilai tambah perusahaan.',
            image: 'img/bidangconsultant.png'
          },
          {
            id: 'analyst',
            title: 'Data Analyst',
            description: 'Berperan dalam proses supervisi, konsultasi, dan eksekusi pengelolaan proyek TI, termasuk juga dalam pengembangan sistem atau aplikasi dan penjaminan kualitas TI.',
            image: 'img/bidanganalyst.png'
          }
        ]
      }),
      isActive: true,
      order: 4
    }
  });

  // 5. Testimoni Alumni Section
  await prisma.pageContent.upsert({
    where: { section: 'testimoni' },
    update: {},
    create: {
      section: 'testimoni',
      title: 'Apa Kata Alumni?',
      subtitle: 'testimoni alumni',
      data: JSON.stringify([
        {
          name: 'M. Rusydani S., S.Kom.',
          work: 'ERP Solution Analyst',
          image: 'img/rusydani.png',
          companyLogo: 'img/kompas.png',
          description: '"Selama saya menjadi mahasiswa di Sistem Informasi UISI, pengembangan studi, karir, dan organisasi sangat di dukung penuh oleh dosen-dosen serta rekan kuliah. Semangat dari bapak/ibu dosen dan rekan kuliah menular kepada diri saya untuk terus aktif dalam belajar serta aktif dalam berpikir kreatif."'
        },
        {
          name: 'Melenia Yolanda F., S.Kom.',
          work: 'Business Analyst Functional Odoo',
          image: 'img/melenia.png',
          companyLogo: 'img/alugra.png',
          description: '"Active, Dosen SISFOR identik dengan kata ini karena semangat dan antusias yang selalu mengajarkan kita untuk competitive, creative, dan open-challenging. Tidak hanya berkutat di bidang keilmuan, organisasi dan interaksi atau networking di lingkungan kampus juga ditekankan di sini, jadi sangat organized. Sistem dan mata kuliah yang ada di SISFOR juga sangat menarik seperti penjurusan di bidang yang diminati, sehingga bisa jadi batu loncatan untuk praktik di dunia kerja."'
        },
        {
          name: 'Rizqi A. W. Y., S.Kom.',
          work: 'Surveyor SPBE',
          image: 'img/rizqi.png',
          companyLogo: 'img/tati.png',
          description: '"Saya sangat puas dengan pengalaman kuliah di program studi Sistem Informasi UISI. Dosen-dosen yang kompeten, kurikulum yang  relevan dengan lapangan kerja dimasa sekarang, dan fasilitas pendukung teknologi yang memadai membuat perjalanan akademik saya  menjadi sangat  berharga. Terima kasih atas pengalaman berharga ini!"'
        }
      ]),
      isActive: true,
      order: 5
    }
  });

  // 6. Jumbotron Promo Section
  await prisma.pageContent.upsert({
    where: { section: 'jumbotron-promo' },
    update: {},
    create: {
      section: 'jumbotron-promo',
      title: 'Mari Bergabung Bersama Kami',
      subtitle: 'sisfor uisi',
      content: 'Bergabung bersama kami dan menjadi bagian dari keluarga Sistem Informasi Universitas Internasional Semen Indonesia',
      image: 'img/gabung.png',
      data: JSON.stringify({
        buttonText: 'Mari Bergabung',
        buttonUrl: 'https://s.id/DaftarSisforUISI'
      }),
      isActive: true,
      order: 6
    }
  });

  // 7. Social Media Section
  await prisma.pageContent.upsert({
    where: { section: 'social-media' },
    update: {},
    create: {
      section: 'social-media',
      title: '@sisforuisi',
      subtitle: 'Official Account Departemen & HIMASISFOR',
      content: 'Universitas Internasional Semen Indonesia | @sayauisi',
      image: 'img/logo2.png',
      data: JSON.stringify({
        username: '@sisforuisi',
        instagramUrl: 'https://www.instagram.com/sisforuisi/',
        uisiInstagram: '@sayauisi',
        buttonText: 'Follow On Instagram'
      }),
      isActive: true,
      order: 7
    }
  });

  console.log('✅ Homepage content seeded successfully!');
}

async function main() {
  try {
    await seedHomepage();
  } catch (error) {
    console.error('❌ Error seeding homepage:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
