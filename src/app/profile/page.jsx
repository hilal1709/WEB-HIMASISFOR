"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { ArrowDown } from "@/icons/ArrowDown";
import JumbotronPromo from "@/components/JumbotronPromo";
import Footer from "@/components/Footer";
import InfiniteAlumni from "@/components/InfiniteAlumni";

export default function Profile() {
  const [isVisible, setIsVisible] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contents, setContents] = useState({});

  // Fetch content from CMS
  useEffect(() => {
    async function fetchContents() {
      try {
        const response = await fetch("/api/content");
        if (response.ok) {
          const data = await response.json();
          const contentBySection = data.reduce((acc, item) => {
            acc[item.section] = item;
            return acc;
          }, {});
          setContents(contentBySection);
        }
      } catch (error) {
        console.error("Error fetching contents:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchContents();
  }, []);

  const cardVisibility = (cardId) => {
    setIsVisible(isVisible === cardId ? null : cardId);
  };

  // Default values if CMS data is not available
  const heroProfile = contents["hero-profile"] || {
    title: "Sistem Informasi",
    subtitle: "Universitas Internasional Semen Indonesia",
    content: "Program studi S1 Sistem Informasi Universitas Internasional Semen Indonesia merupakan salah satu dari 10 Program Studi yang terdapat di Universitas Internasional Semen Indonesia (UISI). Program studi ini berdiri sejak 16 Oktober 2014 berdasarkan SK DIRJEN DIKTI Kementerian Pendidikan Nasional Nomor SK 502/E/0/2014 dan terklasifikasi dalam kelompok program studi rumpun ilmu teknologi.",
    image: "/img/heroprofile.png"
  };

  const videoProfile = contents["video-profile"] || {
    content: "https://www.youtube.com/watch?v=WQ4avou98wc&ab_channel=SistemInformasiUISI",
    image: "/img/video.png"
  };

  const visi = contents.visi || {
    title: "Visi",
    subtitle: "Program Studi Sistem Informasi UISI",
    content: '"Menjadi Departemen Sistem Informasi yang unggul dalam bidang Sistem Enterprise, Tata Kelola dan Audit TI serta Sains Data pada tahun 2030 melalui sistem pengajaran, penelitian dan pengabdian masyarakat yang inovatif, berkualitas tinggi, dan berdaya-saing internasional serta oleh praktik - praktik terbaik industri"'
  };

  const misi = contents.misi || {
    title: "Misi",
    subtitle: "Program Studi Sistem Informasi UISI",
    data: {
      items: [
        "Menyelenggarakan pengajaran, penelitian dan pengabdian masyarakat di bidang Sistem Informasi yang inovatif, berkualitas tinggi dan berdaya saing internasional.",
        "Menyusun dan melaksanakan kurikulum yang didasarkan pada kebutuhan masyarakat, bisnis dan industri.",
        "Menyelenggarakan tata kelola pendidikan yang profesional, akuntabel dengan dukungan teknologi informasi dan komunikasi.",
        "Membentuk sivitas akademika yang amanah, beretika dan berorientasi pada kemajuan, serta menjunjung tinggi budaya berbagi pengetahuan.",
        "Menghasilkan lulusan Sistem Informasi yang berbudi luhur, berwawasan internasional, menjunjung kearifan lokal dan profesional."
      ]
    }
  };

  const profilDosen = contents["profil-dosen"]?.data || {
    heading: "Profil Dosen",
    subheading: "Sistem Informasi UISI",
    dosens: [
      {
        name: "Brina Miftahurrohmah, S.Si., M.Si., MCE, MCF",
        expertise: "Intelligence Decision Support Systems; Statistics; Forecasting",
        image: "/img/profil/brina.jpg"
      },
      {
        name: "Grandys Frieska Prassida, S.Kom., M.Kom., Ph.D., MCE, CIIQA",
        expertise: "IS Strategic Planning; Enterprise Architecture; IT Governance & Risk Management",
        image: "/img/profil/grandys.jpg"
      },
      {
        name: "Catur Wulandari, S.Kom., M.Sc., MCE, MOS, MCF",
        expertise: "Education Technology; Data Science; Software Engineering",
        image: "/img/profil/catur.jpg"
      },
      {
        name: "Dr. Putri Amelia, S.T., M.T., M.Eng., MCE, MOS",
        expertise: "Modelling; System Dynamic; Supply Chain",
        image: "/img/profil/putri.jpg"
      },
      {
        name: "Tikno, S.T., M.Kom., MCE",
        expertise: "Enterprise Resource Planning; IT Audit; Customer Behavior",
        image: "/img/profil/tikno.jpg"
      },
      {
        name: "Ardhi Dwi Firmansyah, S.Kom., M.Kom., MCE",
        expertise: "IT Governance, Data Governance, IT Service Management",
        image: "/img/profil/ardhi.jpg"
      }
    ]
  };

  const akreditasi = contents.akreditasi || {
    title: "Sertifikat <span class='text-red-600'>Akreditasi</span>",
    subtitle: "Program Studi Sistem Informasi UISI",
    content: "Per tanggal 3 April 2023, Program Studi S1 Sistem Informasi UISI telah terakreditasi \"Baik Sekali\" oleh Lembaga Akreditasi Mandiri Informatika dan Komputer (LAM INFOKOM) yang dinyatakan dalam Keputusan LAM INFOKOM No.026/SK/LAM-INFOKOM/Ak/S/IV/2023.",
    image: "/img/sertif_akreditasi.png"
  };

  const profilAlumni = contents["profil-alumni"] || {
    title: "Profil Lulusan",
    subtitle: "Sistem Informasi UISI",
    content: "Lulusan Program Studi Sistem Informasi UISI telah terbukti dan sukses bekerja di berbagai perusahaan ternama",
    image: "https://www.youtube.com/watch?v=Pz30NmEzSew&ab_channel=SistemInformasiUISI"
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      {/* hero section */}
      <div 
        className="w-full h-64 md:h-96 lg:h-screen -mt-18 lg:-mt-16 flex flex-col justify-end bg-cover bg-center"
        style={{ backgroundImage: `url('${heroProfile.image}')` }}
      >
        <div className="px-4 md:px-8 lg:px-32 py-8 md:py-10 lg:py-12 text-white">
          <div className="border-l-2 md:border-l-3 lg:border-l-4 border-white pl-4 md:pl-5 lg:pl-6">
            <h1 className="font-bold italic text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl">
              {heroProfile.title}
            </h1>
            <h2 className="font-serif text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-[1.8rem] font-light mt-1 md:mt-2 lg:mt-4">
              {heroProfile.subtitle}
            </h2>
          </div>
          <p className="mt-4 md:mt-5 lg:mt-6 ml-4 md:ml-6 lg:ml-8 text-xs md:text-sm lg:text-base max-w-full lg:w-[58rem] text-zinc-300">
            {heroProfile.content}
          </p>
        </div>
      </div>

      {/* Video Profile */}
      <div className="my-12 md:my-16 lg:my-18 px-4 md:px-6 lg:px-8">
        <div className="flex justify-center items-center">
          <a
            href={videoProfile.content}
            className="w-full md:w-[36rem] lg:w-210 2xl:w-310 h-48 md:h-64 lg:h-100 2xl:h-144 bg-cover bg-center hover:scale-105 transition-all duration-500 border-4 md:border-6 lg:border-8 border-red-50 hover:border-white shadow-xl rounded-xl group"
            style={{ backgroundImage: `url('${videoProfile.image}')` }}
          >
            <div className="w-full h-full flex justify-center items-center group-hover:bg-black/20 rounded-lg transition-all duration-500">
              <img
                src="/img/play.svg"
                alt="play"
                className="h-8 md:h-10 lg:h-12 xl:h-24 opacity-50 group-hover:opacity-100 transition-all duration-500"
              />
            </div>
          </a>
        </div>

        {/* Visi dan Misi Container */}
        <div className="max-w-7xl mt-6 md:mt-8 lg:mt-12 mx-auto">
          {/* Visi */}
          <div className="flex flex-col lg:flex-row lg:gap-46 items-start lg:items-center">
            <div className="mb-4 lg:mb-0">
              <h1 className="font-bold italic text-2xl md:text-3xl lg:text-4xl 2xl:text-5xl text-red-600">
                {visi.title}
              </h1>
              <h2 className="font-serif text-sm md:text-base lg:text-xl mt-1 md:mt-2">
                {visi.subtitle}
              </h2>
            </div>
            <p className="w-full lg:w-[38rem] mt-4 lg:mt-0 text-xs md:text-sm lg:text-base text-zinc-600">
              {visi.content}
            </p>
          </div>

          {/* Misi */}
          <div className="flex flex-col lg:flex-row lg:gap-46 items-start lg:items-center border-t border-zinc-200 pt-6 md:pt-7 lg:pt-8 mt-8 md:mt-12 lg:mt-24">
            <div className="mb-4 lg:mb-0">
              <h1 className="font-bold italic text-2xl md:text-3xl lg:text-4xl 2xl:text-5xl text-red-600">
                {misi.title}
              </h1>
              <h2 className="font-serif text-sm md:text-base lg:text-xl mt-1 md:mt-2">
                {misi.subtitle}
              </h2>
            </div>
            <div className="w-full lg:w-[38rem] text-xs md:text-sm lg:text-base text-zinc-600 mt-4 lg:mt-0">
              <ol className="numbered-list list-decimal space-y-2">
                {misi.data?.items?.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* logo sisfor (Video Profile) - hidden on mobile/tablet */}
      <div className="hidden xl:block relative overflow-x-clip -z-20">
        <div className="flex justify-between">
          <div className="-mt-[51rem] -ml-8">
            <div className="flex gap-6">
              <img src="img/sisfor.svg" alt="sisfor" />
              <img
                src="img/sisfor.svg"
                alt="sisfor"
                className="rotate-90 -z-20"
              />
            </div>
            <img src="img/sisfor.svg" alt="sisfor" className="mt-6" />
          </div>

          <div className="-mt-[55.5rem]">
            <img src="img/sisfor.svg" alt="sisfor" />
            <img
              src="img/sisfor.svg"
              alt="sisfor"
              className="absolute lg:mt-56 ml-20"
            />
          </div>
        </div>
      </div>
      {/* End Video Profile */}

      {/* Kerja Sama */}
      {/* 

        <div className="flex flex-col justify-center items-center my-24 text-center">
          <h1 className="font-bold text-5xl text-red-600">Kerjasama</h1>
          <p className="mt-4 text-lg text-zinc-500">
            Program Studi Sistem Informasi UISI
          </p>

        
          <div className="flex flex-wrap justify-center gap-8 mt-8 mx-24">
            {logo.map((item, index) => (
              <img key={index} src={item} alt="img" className="h-28" />
            ))}
          </div>
        </div>
    
      */}

      {/* Profil Dosen */}
      <div className="flex flex-col justify-center items-center my-16 md:my-24 lg:my-32 text-center px-4">
        <h1 className="font-bold text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-zinc-900">
          {profilDosen.heading?.split(' ')[0]} {profilDosen.heading?.split(' ')[1]}
        </h1>
        <h1 className="mt-2 font-bold text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-red-600">
          {profilDosen.subheading}
        </h1>

        {/* card profil */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-4 xl:gap-8 my-8 md:my-10 lg:my-12 w-full max-w-7xl">
          {profilDosen.dosens?.map((dosen, index) => (
            <div
              key={index}
              className="bg-cover bg-no-repeat bg-center w-full max-w-[21rem] mx-auto h-[26rem] rounded-xl shadow-lg hover:shadow-red-100"
              style={{ backgroundImage: `url(${dosen.image})` }}
            >
              <div
                className={`w-full h-full flex justify-end items-end text-left p-2 transition-all duration-300 ${
                  isVisible === index ? "bg-black/30" : "bg-transparent"
                }`}
              >
                <div className="flex flex-col w-full p-4 bg-white rounded-lg">
                  <h1 className="text-xs md:text-sm lg:text-base font-medium">
                    {dosen.name}
                  </h1>

                  <button
                    onClick={() => cardVisibility(index)}
                    className="w-fit p-1 rounded-lg bg-white drop-shadow-md absolute -mt-8 ml-60 md:ml-64"
                  >
                    <ArrowDown
                      className={`text-red-600 h-4 md:h-5 transition-transform duration-300 ${
                        isVisible === index ? "rotate-0" : "rotate-180"
                      }`}
                    />
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${
                      isVisible === index
                        ? "max-h-40 opacity-100 mt-6"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <h3 className="mb-1 font-semibold text-[9px] md:text-[10px] text-zinc-400 uppercase">
                      Bidang Keahlian
                    </h3>
                    <p className="text-xs md:text-sm text-zinc-700">
                      {dosen.expertise}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* end card profil */}

      {/* akreditasi */}
      <div className="flex flex-col justify-center items-center my-16 md:my-24 lg:my-32 text-center px-4">
        <h1 className="font-bold text-2xl md:text-3xl lg:text-4xl xl:text-5xl" dangerouslySetInnerHTML={{ __html: akreditasi.title }} />
        <h4 className="mt-3 md:mt-4 text-sm md:text-base lg:text-lg text-zinc-500">
          {akreditasi.subtitle}
        </h4>
        <p className="mt-4 md:mt-5 lg:mt-6 text-xs md:text-sm lg:text-base text-zinc-500 max-w-full md:max-w-2xl lg:w-[56rem]">
          {akreditasi.content}
        </p>

        <img src={akreditasi.image} alt="Sertifikat Akreditasi" className="mt-8 w-full max-w-2xl" />
      </div>
      {/* end akreditasi */}

      {/* profil alumni */}
      <div className="bg-[url(/img/awardingbg.svg)] bg-cover p-6 md:p-8 lg:p-12 text-white">
        <div className="flex justify-center items-center">
          <a
            href={profilAlumni.image}
            className="w-full md:w-[36rem] lg:w-310 h-48 md:h-64 lg:h-144 bg-[url('/img/video.png')] bg-cover bg-center hover:scale-105 transition-all duration-500 border-4 md:border-6 lg:border-8 border-white shadow-xl rounded-xl group"
          >
            <div className="w-full h-full flex justify-center items-center group-hover:bg-black/20 rounded-lg transition-all duration-500">
              <img
                src="/img/play.svg"
                alt="play"
                className="h-8 md:h-10 lg:h-12 xl:h-24 opacity-50 group-hover:opacity-100 transition-all duration-500"
              />
            </div>
          </a>
        </div>
        <div className="flex flex-col lg:flex-row justify-between my-8 md:my-10 lg:my-12">
          <div className="font-bold text-2xl md:text-3xl lg:text-4xl xl:text-5xl mb-6 lg:mb-0">
            <h1>{profilAlumni.title}</h1>
            <h1>{profilAlumni.subtitle}</h1>
            <p className="w-full lg:w-[33rem] mt-3 md:mt-4 text-xs md:text-sm lg:text-base font-normal">
              {profilAlumni.content}
            </p>
          </div>
          <InfiniteAlumni />
        </div>
      </div>
      {/* end profil alumni */}
      <JumbotronPromo />
      <Footer />
    </>
  );
}
