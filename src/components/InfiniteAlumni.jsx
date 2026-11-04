"use client";
import { useState, useEffect, useMemo } from "react";
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';

// Helper function to ensure image paths are valid
const normalizeImagePath = (path) => {
  if (!path) return '/img/alumni/default.png'; // fallback image
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return path.startsWith('/') ? path : `/${path}`;
};

export default function InfiniteAlumni() {
  const defaultAlumni = useMemo(() => [
    {
      name: "Rizqi A. W. Y., S.Kom",
      img: "/img/alumni/rizqi.png",
      job: "Surveyor SPBE PT. Tatacipta Teknologi Indonesia",
    },
    {
      name: "Edwin R. Putra, S.Kom",
      img: "/img/alumni/edwin.png",
      job: "Management Information System PT. Wilmar Nabati Indonesia",
    },
    {
      name: "Felix Atmaja, S.Kom",
      img: "/img/alumni/felix.png",
      job: "Officer Program Retailership Semen Indonesia Group",
    },
    {
      name: "Juliana Kristi, S.Kom",
      img: "/img/alumni/juliana.png",
      job: "IT Planning & Control di PT. Petrokimia Gresik",
    },
  ], []);

  const [alumni, setAlumni] = useState(defaultAlumni);

  // Fetch alumni data from CMS
  useEffect(() => {
    async function fetchAlumni() {
      try {
        const response = await fetch("/api/content?section=infinite-alumni", {
          // Add caching
          next: { revalidate: 3600 }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.alumni) {
            setAlumni(data.data.alumni);
          }
        }
      } catch (error) {
        console.error("Error fetching alumni data:", error);
      }
    }
    fetchAlumni();
  }, []);

  // Swiper loop butuh cukup slide agar mulus
  const rowA = useMemo(() => (alumni.length < 6 ? [...alumni, ...alumni, ...alumni] : alumni), [alumni]);
  const rowB = useMemo(() => rowA.slice(3).concat(rowA.slice(0, 3)), [rowA]);
  const mask = "[mask-image:_linear-gradient(to_right,_transparent_0,_white_64px,white_calc(100%-64px),_transparent_100%)] md:[mask-image:_linear-gradient(to_right,_transparent_0,_white_128px,white_calc(100%-128px),_transparent_100%)]";

  const Row = ({ items, reverse, className }) => (
    <div className={`w-full md:w-96 lg:w-96 2xl:w-[60rem] overflow-hidden ${mask} ${className || ""}`}>
      <Swiper
        modules={[Autoplay, FreeMode]}
        slidesPerView="auto"
        spaceBetween={24}
        loop
        freeMode={{ enabled: true, momentum: false }}
        speed={5000}
        autoplay={{ delay: 0, disableOnInteraction: false, pauseOnMouseEnter: true, reverseDirection: reverse }}
        className="alumni-marquee"
      >
        {items.map((al, index) => (
          <SwiperSlide key={index} className="!w-auto">
            <div className="flex w-max items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 transition-colors hover:border-brand-200 md:gap-4 md:p-4">
              <Image src={normalizeImagePath(al.img)} alt={al.name || 'Alumni'} width={80} height={80} className="h-14 w-auto max-w-none md:h-16 lg:h-20" loading="lazy" />
              <div>
                <h2 className="text-sm font-bold md:text-base lg:text-lg">{al.name}</h2>
                <p className="text-xs md:text-sm">{al.job}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );

  return (
    <div className="overflow-x-hidden -mr-4 md:-mr-8 lg:-mr-18">
      <Row items={rowA} />
      <Row items={rowB} reverse className="mt-3 md:mt-4 ml-6 md:ml-8 lg:ml-12" />
    </div>
  );
}
