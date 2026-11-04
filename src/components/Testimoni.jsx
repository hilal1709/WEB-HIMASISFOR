"use client";
import { useState, useEffect, useMemo } from "react";
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { Skeleton } from '@/components/ui/skeleton';

// Helper function to ensure image paths are valid
const normalizeImagePath = (path) => {
  if (!path) return '/img/logo.png'; // fallback image
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return path.startsWith('/') ? path : `/${path}`;
};

export default function Testimoni() {
  const [testimoniData, setTestimoniData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch testimoni data from API
  useEffect(() => {
    async function fetchTestimoniData() {
      try {
        const response = await fetch('/api/content?section=testimoni', {
          // Add caching
          next: { revalidate: 3600 }
        });
        if (response.ok) {
          const data = await response.json();
          setTestimoniData(data);
        }
      } catch (error) {
        console.error('Error fetching testimoni data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTestimoniData();
  }, []);

  const dataAlumni = useMemo(() => testimoniData?.data || [], [testimoniData]);

  if (loading || !testimoniData) {
    return (
      <div className="mx-auto my-24 grid max-w-6xl gap-4 px-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-56 w-full rounded-xl" />)}
      </div>
    );
  }

  const { title, subtitle } = testimoniData;

  return (
    <>
      <div className="relative flex justify-center items-center">
        <Image
          src="/img/awardingbg.svg"
          alt="awarding"
          width={1920}
          height={960}
          className="w-full h-[32rem] md:h-[42rem] lg:h-[60rem] object-cover"
          loading="lazy"
        />

        {/* content container */}
        <div className="absolute w-full h-full flex flex-col justify-center items-center text-white px-4">
          <div className="px-3 md:px-4 py-1.5 md:py-2 border-[0.5px] border-white bg-white/20 rounded-lg text-center text-xs md:text-sm uppercase tracking-widest font-semibold">
            {subtitle || "testimoni alumni"}
          </div>
          <h1 className="mt-4 md:mt-5 mb-8 md:mb-10 lg:mb-12 text-2xl md:text-3xl lg:text-4xl 2xl:text-5xl font-bold">
            {title || "Apa Kata Alumni?"}
          </h1>

          {/* content card — Swiper carousel */}
          <div className="w-full max-w-7xl" data-aos="fade-up">
            <Swiper
              modules={[Autoplay, Pagination, A11y]}
              spaceBetween={20}
              slidesPerView={1.1}
              centeredSlides={dataAlumni.length < 3}
              breakpoints={{ 640: { slidesPerView: 2.1 }, 1024: { slidesPerView: 3 } }}
              autoplay={{ delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true }}
              pagination={{ clickable: true }}
              loop={dataAlumni.length > 3}
              className="testimoni-swiper !px-4 !pb-12 lg:!px-0"
            >
              {dataAlumni.map((alumni, index) => (
                <SwiperSlide key={index} className="!h-auto">
                  <div className="flex h-full flex-col justify-between rounded-xl border-t-8 border-brand-600 bg-white px-6 py-6 text-black shadow-soft transition-transform duration-300 ease-brand hover:-translate-y-1 md:px-8 md:py-7">
                    <p className="text-xs text-zinc-600 md:text-sm lg:text-base">{alumni.description}</p>
                    <div className="mt-4 flex items-center gap-3 border-t border-zinc-200 pt-4 text-xs md:mt-5 md:gap-5 md:pt-5 md:text-sm lg:text-base">
                      <Image src={normalizeImagePath(alumni.image)} alt={alumni.name || 'Alumni'} width={48} height={48} className="h-10 w-auto md:h-12" loading="lazy" />
                      <div>
                        <h1 className="font-medium">{alumni.name}</h1>
                        <h2 className="text-zinc-600">{alumni.work}</h2>
                        {alumni.companyLogo && <Image src={normalizeImagePath(alumni.companyLogo)} alt={alumni.work || 'Company'} width={80} height={20} className="mt-1 h-4 w-auto md:h-5" loading="lazy" />}
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </>
  );
}
