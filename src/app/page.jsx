"use client";
import { useState, useEffect, useMemo } from "react";
import dynamic from 'next/dynamic';
import Image from 'next/image';

// Helper function to ensure image paths are valid
const normalizeImagePath = (path) => {
  if (!path) return '/img/logo.png'; // fallback image
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return path.startsWith('/') ? path : `/${path}`;
};
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SisforCard from "@/components/SisforCard";

// Dynamic imports untuk komponen yang berat dengan lazy loading
const CareerSection = dynamic(() => import("@/components/CareerSection"), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded-lg" />,
  ssr: false, // Client-side only untuk performa lebih baik
});

const Testimoni = dynamic(() => import("@/components/Testimoni"), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded-lg" />,
  ssr: false,
});

const JumbotronPromo = dynamic(() => import("../components/JumbotronPromo"), {
  loading: () => <div className="h-64 animate-pulse bg-gray-100 rounded-lg" />,
  ssr: false,
});

export default function Home() {
  const [pageData, setPageData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPageData() {
      try {
        const response = await fetch('/api/content', {
          // Add caching headers
          next: { revalidate: 3600 } // Cache for 1 hour
        });
        if (response.ok) {
          const data = await response.json();
          // Convert array to object keyed by section
          const dataBySection = data.reduce((acc, item) => {
            acc[item.section] = item;
            return acc;
          }, {});
          setPageData(dataBySection);
        }
      } catch (error) {
        console.error('Error fetching page data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPageData();
  }, []);

  // Memoize computed values untuk menghindari re-calculation
  const aboutData = useMemo(() => pageData['about'] || {}, [pageData]);
  const bidangKeahlianData = useMemo(() => pageData['bidang-keahlian'] || {}, [pageData]);
  const socialMediaData = useMemo(() => pageData['social-media'] || {}, [pageData]);
  
  const bidangKeahlian = useMemo(() => 
    Array.isArray(bidangKeahlianData.data) ? bidangKeahlianData.data : [],
    [bidangKeahlianData.data]
  );

  return (
    <section>
      <Navbar />
      <Hero />

      {/* Sistem Informasi */}
      <div className="px-4 md:px-8 lg:px-24 py-8 md:py-10 lg:py-12 bg-red-600 text-white relative">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between gap-6 lg:gap-8">
          {/* sisfor */}
          <div>
            <h1 className="font-bold italic text-2xl md:text-3xl lg:text-4xl 2xl:text-6xl tracking-wide lg:mb-2">
              {aboutData.title || "Sistem Informasi"}
            </h1>
            <h2 className="font-serif text-base md:text-lg 2xl:text-xl mt-2">
              {aboutData.subtitle || "Universitas Internasional Semen Indonesia"}
            </h2>
          </div>

          {/* deskripsi */}
          <div className="w-full lg:w-[37rem] text-xs md:text-sm 2xl:text-base">
            {aboutData.content ? (
              aboutData.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className={index < aboutData.content.split('\n\n').length - 1 ? "mb-4" : ""}>
                  {paragraph}
                </p>
              ))
            ) : (
              <>
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
                  telah terakreditasi "Baik Sekali" oleh Lembaga Akreditasi Mandiri
                  Informatika dan Komputer (LAM INFOKOM) yang dinyatakan dalam
                  Keputusan LAM INFOKOM No.026/SK/LAM-INFOKOM/Ak/S/IV/2023.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
      {/* End Sistem Informasi */}

      {/* Bidang Keahlian */}
      <div className="my-12 md:my-16 lg:my-20 px-4">
        <h1 className="text-2xl md:text-3xl lg:text-4xl 2xl:text-5xl font-bold text-center mb-3 md:mb-4" dangerouslySetInnerHTML={{ __html: bidangKeahlianData.title || "Bidang Keahlian <br /><span class='text-red-600'>Sistem Informasi UISI</span>" }}>
        </h1>
        <p className="mx-4 md:mx-12 lg:mx-[23rem] 2xl:mx-[40rem] text-xs md:text-sm 2xl:text-base text-center text-zinc-500">
          {bidangKeahlianData.subtitle || "Program Studi S1 Sistem Informasi Universitas Internasional Semen Indonesia memiliki 3 fokus utama bidang keahlian, diantaranya sebagai berikut"}
        </p>

        {/* Bidang Keahlian (data masing" bidang menggunaan const bidangKeahlian) */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-3 lg:gap-2 2xl:gap-4 mt-8 md:mt-10 lg:mt-12">
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

      {/* logo sisfor (Bidang Keahlian) - hidden on mobile/tablet */}
      <div className="hidden xl:block relative overflow-x-clip -z-20">
        <div className="flex justify-between">
          <div className="-mt-[42rem] -ml-8">
            <div className="flex gap-6">
              <Image
                src="/img/sisfor.svg"
                alt="Logo Sistem Informasi UISI Gresik"
                width={200}
                height={200}
                unoptimized
              />
              <Image
                src="/img/sisfor.svg"
                alt="sisfor"
                className="rotate-90 -z-20"
                width={200}
                height={200}
                unoptimized
              />
            </div>
            <Image src="/img/sisfor.svg" alt="sisfor" className="mt-6" width={200} height={200} unoptimized />
          </div>

          <div className="-mt-[46.5rem]">
            <Image src="/img/sisfor.svg" alt="sisfor" width={200} height={200} unoptimized />
            <Image
              src="/img/sisfor.svg"
              alt="sisfor"
              className="absolute mt-56 ml-20"
              width={200}
              height={200}
              unoptimized
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
      <div className="flex flex-col lg:flex-row lg:justify-between items-center px-4 lg:mx-12 2xl:mx-32 my-16 md:my-20 lg:my-24">
        {/* container kiri */}
        <div className="flex items-center gap-3 md:gap-4">
          <div className="px-4 md:px-6 lg:px-8 py-3 md:py-4 border border-zinc-200 rounded-full">
            <Image
              src={normalizeImagePath(socialMediaData.image || "/img/logo2.png")}
              alt="Sistem Informasi UISI Gresik"
              width={56}
              height={80}
              className="h-12 md:h-14 lg:h-20 w-10 md:w-12 lg:w-14"
              loading="lazy"
            />
          </div>
          <div>
            <h1 className="font-bold text-base md:text-xl lg:text-2xl xl:text-3xl">{socialMediaData.title || "@sisforuisi"}</h1>
            <p className="mt-1 md:mt-2 text-xs md:text-sm lg:text-base text-zinc-600">
              {socialMediaData.subtitle || "Official Account Departemen & HIMASISFOR"}
            </p>
            <p className="text-xs lg:text-base text-zinc-600">
              {socialMediaData.content || "Universitas Internasional Semen Indonesia"}{" "}
              {socialMediaData.data?.uisiInstagram && (
                <>
                  |{" "}
                  <a
                    href={socialMediaData.data?.instagramUrl || "https://www.instagram.com/sisforuisi/"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {socialMediaData.data?.uisiInstagram}
                  </a>
                </>
              )}
            </p>
          </div>
        </div>

        {/* container kanan */}
        <a
          target="blank"
          href={socialMediaData.data?.instagramUrl || "https://www.instagram.com/sisforuisi/"}
          className="mt-4 lg:mt-0 bg-gradient-to-r from-[#C10F11] to-[#E31515] hover:scale-95 text-xs md:text-sm lg:text-base px-5 md:px-6 py-2.5 md:py-3 rounded-xl font-medium text-white w-full sm:w-auto text-center"
        >
          {socialMediaData.data?.buttonText || "Follow On Instagram"}
        </a>
      </div>
      {/* end sosial media */}

      <Footer />
    </section>
  );
}
