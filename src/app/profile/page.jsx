"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { ArrowDown } from "@/icons/ArrowDown";
import JumbotronPromo from "@/components/JumbotronPromo";
import Footer from "@/components/Footer";
import InfiniteAlumni from "@/components/InfiniteAlumni";
export default function Profile() {
  const logo = [
    "img/logo/adobe.svg",
    "img/logo/microsoft.svg",
    "img/logo/amd.svg",
    "img/logo/intel.svg",
    "img/logo/nvidia.svg",
    "img/logo/oracle.svg",
    "img/logo/vercel.svg",
    "img/logo/samsung.svg",
    "img/logo/apple.svg",
    "img/logo/google.svg",
    "img/logo/asus.svg",
    "img/logo/meta.svg",
  ];
  const profil = [
    {
      title: "Brina Miftahurrohmah, S.Si., M.Si., MCE, MCF",
      subtitle: "Bidang Keahlian",
      cardId: "a",
      description:
        "Intelligence Decision Support Systems; Statistics; Forecasting",
      background: "bg-[url(/img/profil/brina.jpg)]",
    },
    {
      title: "Grandys Frieska Prassida, S.Kom., M.Kom., Ph.D., MCE, CIIQA",
      subtitle: "Bidang Keahlian",
      cardId: "b",
      description: "IS Strategic Planning; Enterprise Architecture; IT Governance & Risk Management",
      background: "bg-[url(/img/profil/grandys.jpg)]",
    },
    {
      title: "Catur Wulandari, S.Kom., M.Sc., MCE, MOS, MCF",
      subtitle: "Bidang Keahlian",
      cardId: "c",
      description: "Education Technology; Data Science; Software Engineering",
      background: "bg-[url(/img/profil/catur.jpg)]",
    },
    {
      title: "Dr. Putri Amelia, S.T., M.T., M.Eng., MCE, MOS",
      subtitle: "Bidang Keahlian",
      cardId: "d",
      description: "Modelling; System Dynamic; Supply Chain",
      background: "bg-[url(/img/profil/putri.jpg)]",
    },
    {
      title: "Tikno, S.T., M.Kom., MCE",
      subtitle: "Bidang Keahlian",
      cardId: "e",
      description: "Enterprise Resource Planning; IT Audit; Customer Behavior",
      background: "bg-[url(/img/profil/tikno.jpg)]",
    },
    {
      title: "Ardhi Dwi Firmansyah, S.Kom., M.Kom., MCE",
      subtitle: "Bidang Keahlian",
      cardId: "f",
      description: "IT Governance, Data Governance, IT Service Management",
      background: "bg-[url(/img/profil/ardhi.jpg)]",
    },
  ];

  const [isVisible, setIsVisible] = useState(null);
  const cardVisibility = (cardId) => {
    setIsVisible(isVisible === cardId ? null : cardId);
    ``;
  };

  return (
    <>
      <Navbar />
      {/* hero section */}
      <div className="w-full h-screen -mt-18 lg:-mt-16 flex flex-col justify-end bg-[url('/img/heroprofile.png')] bg-cover bg-center">
        <div className="px-4 lg:px-32 py-12 text-white">
          <div className="border-l-2 lg:border-l-4 border-white pl-6">
            <h1 className="font-bold italic text-4xl lg:text-6xl">
              Sistem Informasi
            </h1>
            <h2 className="font-serif text-lg lg:text-[1.8rem] font-light mt-2 lg:mt-4">
              Universitas Internasional Semen Indonesia
            </h2>
          </div>
          <p className="mt-6 ml-8 text-sm lg:text-base lg:w-[58rem] text-zinc-300">
            Program studi S1 Sistem Informasi Universitas Internasional Semen
            Indonesia merupakan salah satu dari 10 Program Studi yang terdapat
            di Universitas Internasional Semen Indonesia (UISI). Program studi
            ini berdiri sejak 16 Oktober 2014 berdasarkan SK DIRJEN DIKTI
            Kementerian Pendidikan Nasional Nomor SK 502/E/0/2014 dan
            terklasifikasi dalam kelompok program studi rumpun ilmu teknologi.
          </p>
        </div>
      </div>

      {/* Video Profile */}
      <div className="my-18 mx-4 lg:mx-8">
        <div className="flex justify-center items-center">
          <a
            href="https://www.youtube.com/watch?v=WQ4avou98wc&ab_channel=SistemInformasiUISI"
            className="w-full lg:w-210 2xl:w-310 h-64 lg:h-100 2xl:h-144 mx-4 lg:mx-0 bg-[url('/img/video.png')] bg-cover bg-center hover:scale-105 transition-all duration-500 border-8 border-red-50 hover:border-white shadow-xl rounded-xl group"
          >
            <div className="w-full h-full flex justify-center items-center group-hover:bg-black/20 rounded-lg transition-all duration-500">
              <img
                src="/img/play.svg"
                alt="play"
                className="h-12 lg:h-24 opacity-50 group-hover:opacity-100 transition-all duration-500"
              />
            </div>
          </a>
        </div>

        {/* Visi dan Misi Container */}
        <div className="max-w-7xl mt-6 lg:mt-12 mx-auto px-4">
          {/* Visi */}
          <div className="flex flex-col lg:flex-row lg:gap-46 items-center">
            <div>
              <h1 className="font-bold italic text-3xl lg:text-4xl 2xl:text-5xl text-red-600">
                Visi
              </h1>
              <h2 className="font-serif lg:text-xl mt-2">
                Program Studi Sistem Informasi UISI
              </h2>
            </div>
            <p className="lg:w-[38rem] mt-4 lg:mt-0 text-sm lg:text-base text-zinc-600">
              “Menjadi Departemen Sistem Informasi yang unggul dalam bidang
              Sistem Enterprise, Tata Kelola dan Audit TI serta Sains Data pada
              tahun 2030 melalui sistem pengajaran, penelitian dan pengabdian
              masyarakat yang inovatif, berkualitas tinggi, dan berdaya-saing
              internasional serta oleh praktik - praktik terbaik industri”
            </p>
          </div>

          {/* Misi */}
          <div className="flex flex-col lg:flex-row lg:gap-46 items-center border-t border-zinc-200 pt-8 lg:pt-7 mt-8 lg:mt-24">
            <div>
              <h1 className="font-bold italic text-3xl lg:text-4xl 2xl:text-5xl text-red-600">
                Misi
              </h1>
              <h2 className="font-serif lg:text-xl mt-2">
                Program Studi Sistem Informasi UISI
              </h2>
            </div>
            <p className="lg:w-[38rem] text-sm lg:text-base text-zinc-600 mx-4 mt-4 lg:mt-0">
              <ol className="numbered-list list-decimal">
                <li>
                  Menyelenggarakan pengajaran, penelitian dan pengabdian
                  masyarakat di bidang Sistem Informasi yang inovatif,
                  berkualitas tinggi dan berdaya saing internasional.
                </li>
                <li>
                  Menyusun dan melaksanakan kurikulum yang didasarkan pada
                  kebutuhan masyarakat, bisnis dan industri.{" "}
                </li>
                <li>
                  Menyelenggarakan tata kelola pendidikan yang profesional,
                  akuntabel dengan dukungan teknologi informasi dan komunikasi.
                </li>
                <li>
                  Membentuk sivitas akademika yang amanah, beretika dan
                  berorientasi pada kemajuan, serta menjunjung tinggi budaya
                  berbagi pengetahuan.
                </li>
                <li>
                  Menghasilkan lulusan Sistem Informasi yang berbudi luhur,
                  berwawasan internasional, menjunjung kearifan lokal dan
                  profesional.
                </li>
              </ol>
            </p>
          </div>
        </div>
      </div>

      {/* logo sisfor (Video Profile) */}
      <div className="relative overflow-x-clip -z-20">
        <div className="flex justify-between">
          <div className="-mt-[70rem] lg:-mt-[51rem] -ml-8">
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

          <div className="-mt-16 lg:-mt-[55.5rem]">
            <img src="img/sisfor.svg" alt="sisfor" />
            <img
              src="img/sisfor.svg"
              alt="sisfor"
              className="absolute hidden lg:block lg:mt-56 ml-20"
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
      <div className="flex flex-col justify-center items-center my-32 text-center">
        <h1 className="font-bold text-3xl lg:text-5xl text-zinc-900">
          Profil Dosen
        </h1>
        <h1 className="mt-2 font-bold text-3xl lg:text-5xl text-red-600">
          Sistem Informasi UISI
        </h1>

        {/* card profil */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-8 mx-8 my-12">
          {profil.map((i, index) => (
            <div
              key={index}
              className={`bg-cover bg-no-repeat bg-center w-[21rem] h-[26rem] rounded-xl shadow-lg hover:shadow-red-100  ${i.background}`}
            >
              <div
                className={`w-full h-full flex justify-end items-end text-left p-2 transition-all duration-300 ${
                  isVisible === i.cardId ? "bg-black/30" : "bg-transparent"
                }`}
              >
                <div className="flex flex-col w-full p-4 bg-white rounded-lg">
                  <h1 className="text-sm lg:text-base font-medium">
                    {i.title}
                  </h1>

                  <button
                    onClick={() => cardVisibility(i.cardId)}
                    className="w-fit p-1 rounded-lg bg-white drop-shadow-md absolute -mt-8 ml-64"
                  >
                    <ArrowDown
                      className={`text-red-600 h-5 transition-transform duration-300 ${
                        isVisible === i.cardId ? "rotate-0" : "rotate-180"
                      }`}
                    />
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${
                      isVisible === i.cardId
                        ? "max-h-40 opacity-100 mt-6"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <h3 className="mb-1 font-semibold text-[10px] text-zinc-400 uppercase">
                      {i.subtitle}
                    </h3>
                    <p className="text-xs lg:text-sm text-zinc-700">
                      {i.description}
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
      <div className="flex flex-col justify-center items-center my-32 text-center">
        <h1 className="font-bold text-5xl">
          Sertifikat <span className="text-red-600">Akreditasi</span>
        </h1>
        <h4 className="mt-4 text-lg text-zinc-500">
          Program Studi Sistem Informasi UISI
        </h4>
        <p className="mt-6 text-zinc-500 w-[56rem]">
          Per tanggal 3 April 2023, Program Studi S1 Sistem Informasi UISI telah
          terakreditasi “Baik Sekali” oleh Lembaga Akreditasi Mandiri
          Informatika dan Komputer (LAM INFOKOM) yang dinyatakan dalam Keputusan
          LAM INFOKOM No.026/SK/LAM-INFOKOM/Ak/S/IV/2023.
        </p>

        <img src="img\sertif_akreditasi.png" alt="" />
      </div>
      {/* end akreditasi */}

      {/* profil alumni */}
      <div className="bg-[url(/img/awardingbg.svg)] bg-cover p-12 text-white">
        <div className="flex justify-center items-center">
          <a
            href="https://www.youtube.com/watch?v=Pz30NmEzSew&ab_channel=SistemInformasiUISI"
            className="w-full lg:w-310 h-64 lg:h-144 mx-4 lg:mx-0 bg-[url('/img/video.png')] bg-cover bg-center hover:scale-105 transition-all duration-500 border-8 border-white shadow-xl rounded-xl group"
          >
            <div className="w-full h-full flex justify-center items-center group-hover:bg-black/20 rounded-lg transition-all duration-500">
              <img
                src="/img/play.svg"
                alt="play"
                className="h-12 lg:h-24 opacity-50 group-hover:opacity-100 transition-all duration-500"
              />
            </div>
          </a>
        </div>
        <div className="flex flex-col lg:flex-row justify-between my-12 mx-6">
          <div className="font-bold text-3xl lg:text-5xl">
            <h1>Profil Lulusan</h1>
            <h1>Sistem Informasi UISI</h1>
            <p className="lg:w-[33rem] mt-4 mb-8 lg:mb-0 text-sm lg:text-base font-normal">
              Lulusan Program Studi Sistem Informasi UISI telah terbukti dan
              sukses bekerja di berbagai perusahaan ternama
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
