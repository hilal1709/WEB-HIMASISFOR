"use client";
import { useState, useEffect, useMemo } from "react";
import Image from 'next/image';

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

  const duplicatedAlumni = useMemo(() => alumni.concat(alumni), [alumni]);

  return (
    <>
      {/* infinite scroll */}
      <div className="overflow-x-hidden -mr-4 md:-mr-8 lg:-mr-18">
        <div className="w-full md:w-96 lg:w-96 2xl:w-[60rem] flex gap-6 md:gap-8 lg:gap-12 overflow-hidden [mask-image:_linear-gradient(to_right,_transparent_0,_white_64px,white_calc(100%-64px),_transparent_100%)] md:[mask-image:_linear-gradient(to_right,_transparent_0,_white_128px,white_calc(100%-128px),_transparent_100%)]">
          <div className="flex gap-4 md:gap-6 lg:gap-8 animate-marquee">
            {duplicatedAlumni.map((alumni, index) => (
              <div
                key={index}
                className="flex items-center gap-3 md:gap-4 p-3 md:p-4 border border-zinc-200 rounded-lg w-max"
              >
                <Image src={normalizeImagePath(alumni.img)} alt={alumni.name || 'Alumni'} width={80} height={80} className="h-14 md:h-16 lg:h-20 max-w-none" loading="lazy" />
                <div>
                  <h2 className="font-bold text-sm md:text-base lg:text-lg">{alumni.name}</h2>
                  <p className="text-xs md:text-sm">{alumni.job}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="w-full md:w-96 lg:w-96 2xl:w-[60rem] mt-3 md:mt-4 ml-6 md:ml-8 lg:ml-12 flex gap-6 md:gap-8 lg:gap-12 overflow-hidden [mask-image:_linear-gradient(to_right,_transparent_0,_white_64px,white_calc(100%-64px),_transparent_100%)] md:[mask-image:_linear-gradient(to_right,_transparent_0,_white_128px,white_calc(100%-128px),_transparent_100%)]">
          <div className="flex gap-4 md:gap-6 lg:gap-12 animate-marquee-reverse">
            {alumni
              .slice(3)
              .concat(alumni.slice(0, 3))
              .concat(alumni.slice(3))
              .map((al, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 md:gap-4 p-3 md:p-4 border border-zinc-200 rounded-lg w-max"
                >
                  <Image src={normalizeImagePath(al.img)} alt={al.name || 'Alumni'} width={80} height={80} className="h-14 md:h-16 lg:h-20 max-w-none" loading="lazy" />
                  <div>
                    <h2 className="font-bold text-sm md:text-base lg:text-lg">{al.name}</h2>
                    <p className="text-xs md:text-sm">{al.job}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}
