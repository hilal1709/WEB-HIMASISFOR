"use client";
import { useState, useEffect, useMemo } from "react";
import Image from 'next/image';

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
      <div className="flex justify-center items-center my-24">
        <div className="animate-pulse">Loading...</div>
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

          {/* content card */}
          <div className="w-full overflow-x-auto no-scrollbar flex lg:justify-center">
            <div className="flex justify-center w-max gap-4 md:gap-5 lg:gap-4 2xl:gap-12 text-black mx-4 lg:mx-0 pb-2">
              {dataAlumni.map((alumni, index) => (
                <div
                  key={index}
                  className="w-72 md:w-80 lg:w-96 h-fit px-6 md:px-8 py-6 md:py-7 rounded-lg bg-white border-t-8 border-yellow-500 drop-shadow-lg"
                >
                  <p className="text-xs md:text-sm lg:text-base text-zinc-600">{alumni.description}</p>
                  <div className="mt-4 md:mt-5 pt-4 md:pt-5 flex items-center gap-3 md:gap-5 text-xs md:text-sm lg:text-base border-t border-zinc-200">
                    <Image src={normalizeImagePath(alumni.image)} alt={alumni.name || 'Alumni'} width={48} height={48} className="h-10 md:h-12" loading="lazy" />
                    <div>
                      <h1 className="font-medium">{alumni.name}</h1>
                      <h2 className="text-zinc-600">{alumni.work}</h2>
                      {alumni.companyLogo && <Image src={normalizeImagePath(alumni.companyLogo)} alt={alumni.work || 'Company'} width={80} height={20} className="mt-1 h-4 md:h-5" loading="lazy" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
