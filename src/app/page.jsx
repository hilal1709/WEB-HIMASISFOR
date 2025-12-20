import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SisforCard from "@/components/SisforCard";
import CareerSection from "@/components/CareerSection";
import Testimoni from "@/components/Testimoni";
import JumbotronPromo from "../components/JumbotronPromo";

export const metadata = {
  title: "Sistem Informasi UISI",
  description:
    "Website resmi Program Studi S1 Sistem Informasi Universitas Internasional Semen Indonesia (UISI). Info kurikulum, bidang keahlian, prestasi, profil dosen & mahasiswa, serta peluang karir.",
  keywords:
    "Sistem Informasi, UISI, Universitas Internasional Semen Indonesia, S1, Kurikulum, Bidang Keahlian, Prestasi, Karir, Dosen, Mahasiswa, Informatika, Gresik, Surabaya, Indonesia",
  openGraph: {
    title: "Sistem Informasi UISI",
    description:
      "Website resmi Program Studi S1 Sistem Informasi UISI. Temukan info lengkap kurikulum, bidang keahlian, prestasi, profil dosen & mahasiswa.",
    url: "https://sisfor.uisi.ac.id/",
    siteName: "Sistem Informasi UISI",
    images: [
      {
        url: "/img/logo.png",
        width: 800,
        height: 600,
        alt: "Logo Sistem Informasi UISI",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  alternates: {
    canonical: "https://sisfor.uisi.ac.id/",
  },
};

export default function Home() {
  const bidangKeahlian = [
    {
      title: "IT Audit / Governance",
      subtitle: "Apa itu IT / Audit & Governance ?",
      cardId: "audit",
      description:
        "Belajar mengenai bagaimana meningkatkan kemampuan organisasi untuk mencapai tujuan dan sasaran keseluruhannya, dan bagaimana mengevaluasi implementasi tata kelola TI",
      background: "bg-[url(/img/governance.jpeg)]",
    },
    {
      title: "Enterprise System",
      subtitle: "Apa itu Enterprise System ?",
      cardId: "erp",
      description:
        "Belajar mengenai sistem informasi lintas fungsi yang menyediakan integrasi proses bisnis utama dan membantu dalam perencanaan sumber daya organisasi.",
      background: "bg-[url(/img/erp.jpeg)]",
    },
    {
      title: "Data Science",
      subtitle: "Apa itu Data Science ?",
      cardId: "data",
      description:
        "Belajar mengenai bagaimana menerapkan prinsip dan teknik penanganan data untuk memberikan informasi yang berarti dan mendukung pengambilan keputusan dalam suatu organisasi.",
      background: "bg-[url(/img/data.jpeg)]",
    },
  ];

  return (
    <section>
      <Navbar />
      <Hero />

      {/* Sistem Informasi */}
      <div className="px-4 lg:px-24 py-6 lg:py-12 bg-red-600 text-white relative">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between">
          {/* sisfor */}
          <div>
            <h1 className="font-bold italic text-4xl 2xl:text-6xl tracking-wide lg:mb-2">
              Sistem Informasi
            </h1>
            <h2 className="font-serif text-lg 2xl:text-xl">
              Universitas Internasional Semen Indonesia
            </h2>
          </div>

          {/* deskripsi */}
          <div className="lg:w-[37rem] mt-8 lg:mt-0 text-sm 2xl:text-base">
            <p className="mb-4">
              Program studi S1 Sistem Informasi Universitas Internasional Semen
              Indonesia merupakan salah satu dari 10 Program Studi yang terdapat
              di Universitas Internasional Semen Indonesia (UISI). Program studi
              ini berdiri sejak 16 Oktober 2014 berdasarkan SK DIRJEN DIKTI
              Kementerian Pendidikan Nasional Nomor SK 502/E/0/2014 dan
              terklasifikasi dalam kelompok program studi rumpun ilmu teknologi.
            </p>
            <p>
              Per tanggal 3 April 2023, Program Studi S1 Sistem Informasi UISI
              telah terakreditasi “Baik Sekali” oleh Lembaga Akreditasi Mandiri
              Informatika dan Komputer (LAM INFOKOM) yang dinyatakan dalam
              Keputusan LAM INFOKOM No.026/SK/LAM-INFOKOM/Ak/S/IV/2023.
            </p>
          </div>
        </div>
      </div>
      {/* End Sistem Informasi */}

      {/* Bidang Keahlian */}
      <div className="my-20">
        <h1 className="text-4xl 2xl:text-5xl font-bold text-center mb-4">
          Bidang Keahlian <br />
          <span className="text-red-600">Sistem Informasi UISI</span>
        </h1>
        <p className="mx-8 md:mx-[23rem] 2xl:mx-[40rem] text-sm 2xl:text-base text-center text-zinc-500">
          Program Studi S1 Sistem Informasi Universitas Internasional Semen
          Indonesia memiliki 3 fokus utama bidang keahlian, diantaranya sebagai
          berikut
        </p>

        {/* Bidang Keahlian (data masing" bidang menggunaan const bidangKeahlian) */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-2 2xl:gap-4 mt-12">
          {bidangKeahlian.map((item, index) => (
            <SisforCard
              key={index}
              title={item.title}
              subtitle={item.subtitle}
              cardId={item.cardId}
              description={item.description}
              background={item.background}
            />
          ))}
        </div>
      </div>

      {/* logo sisfor (Bidang Keahlian) */}
      <div className="relative overflow-x-clip -z-20">
        <div className="flex justify-between">
          <div className="-mt-[42rem] -ml-8">
            <div className="flex gap-6">
              <img
                src="img/sisfor.svg"
                alt="Logo Sistem Informasi UISI Gresik"
              />
              <img
                src="img/sisfor.svg"
                alt="sisfor"
                className="rotate-90 -z-20"
              />
            </div>
            <img src="img/sisfor.svg" alt="sisfor" className="mt-6" />
          </div>

          <div className="-mt-[46.5rem]">
            <img src="img/sisfor.svg" alt="sisfor" />
            <img
              src="img/sisfor.svg"
              alt="sisfor"
              className="absolute mt-56 ml-20"
            />
          </div>
        </div>
      </div>
      {/* End Bidang Keahlian */}

      {/* Profil Karir Lulusan */}
      <CareerSection />
      {/* EndProfil Karir Lulusan */}

      {/* 
          Prestasi dan Rekognisi 

          Dihidden karena konten prestasi 
          masih kurang, bisa dihilangkan
          komentarnya untuk menampilkan
          komponen <AwardingRecognition />
          
      */}

      {/* <AwardingRecognition /> */}

      <JumbotronPromo />

      {/* testimoni */}
      <Testimoni />
      {/* end testimoni */}

      {/* sosial media */}
      <div className="flex flex-col lg:flex-row lg:justify-between items-center lg:mx-12 2xl:mx-32 my-24">
        {/* container kiri */}
        <div className="flex items-center gap-4 mx-4 lg:mx-0">
          <div className="px-6 lg:px-8 py-4 border border-zinc-200 rounded-full">
            <img
              src="img/logo2.png"
              alt="Sistem Informasi UISI Gresik"
              className="lg:h-20 h-16 w-14"
            />
          </div>
          <div>
            <h1 className="font-bold text-lg lg:text-3xl">@sisforuisi</h1>
            <p className="mt-2 text-xs lg:text-base text-zinc-600">
              Official Account Departemen & HIMASISFOR
            </p>
            <p className="text-xs lg:text-base text-zinc-600">
              Universitas Internasional Semen Indonesia |{" "}
              <a
                href="https://www.instagram.com/sisforuisi/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                @sayauisi
              </a>{" "}
            </p>
          </div>
        </div>

        {/* container kanan */}
        <a
          target="blank"
          href="https://www.instagram.com/sisforuisi/"
          className="mt-4 lg:mt-0 ml-8 lg:ml-0 bg-gradient-to-r from-[#C10F11] to-[#E31515] hover:scale-95 text-sm lg:text-base px-6 py-3 rounded-xl font-medium text-white"
        >
          Follow On Instagram
        </a>
      </div>
      {/* end sosial media */}

      <Footer />
    </section>
  );
}
