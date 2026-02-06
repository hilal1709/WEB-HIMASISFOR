"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import Image from 'next/image';
import { Play } from "../icons/Play";
import SplitType from "split-type";
import { animate, stagger } from "motion";
import { motion } from "motion/react";

// Helper function to ensure image paths are valid
const normalizeImagePath = (path) => {
  if (!path) return '/img/heroPict.png'; // fallback image
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return path.startsWith('/') ? path : `/${path}`;
};

export default function Hero() {
  const containerRef = useRef(null);
  const [heroData, setHeroData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch hero data from API
  useEffect(() => {
    async function fetchHeroData() {
      try {
        const response = await fetch('/api/content?section=hero', {
          // Add caching for better performance
          next: { revalidate: 3600 }
        });
        if (response.ok) {
          const data = await response.json();
          setHeroData(data);
        }
      } catch (error) {
        console.error('Error fetching hero data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchHeroData();
  }, []);

  useEffect(() => {
    document.fonts.ready.then(() => {
      if (!containerRef.current) return;

      containerRef.current.style.visibility = "visible";

      const h1 = containerRef.current.querySelector("h1");
      const h3 = containerRef.current.querySelector("h3");

      const h1Split = new SplitType(h1, { types: "words" });
      const h3Split = new SplitType(h3, { types: "words" });

      animate(
        h1Split.words,
        { opacity: [0, 1], y: [10, 0] },
        {
          type: "spring",
          stiffness: 200,
          damping: 30,
          delay: stagger(0.05),
        }
      );

      animate(
        h3Split.words,
        { opacity: [0, 1], y: [10, 0] },
        {
          type: "spring",
          stiffness: 200,
          damping: 30,
          delay: stagger(0.05),
        }
      );
    });
  }, [heroData]);

  // Move useMemo before early return to maintain hook order
  const parsedData = useMemo(() => heroData?.data || {}, [heroData?.data]);

  if (loading || !heroData) {
    return (
      <section className="-mt-18 lg:-mt-16 flex justify-center items-center h-screen">
        <div className="animate-pulse">Loading...</div>
      </section>
    );
  }

  const { title, subtitle, content, image, data } = heroData;

  return (
    <section className="-mt-18 lg:-mt-16">
      {/* top circle */}
      <img src="/img/heroCircle.svg" alt="HeroCircle" className="h-24 md:h-32 lg:h-40 -z-10" />

      {/* content */}
      <main className="flex flex-col lg:flex-row justify-center items-center gap-6 md:gap-8 lg:gap-12 lg:-mt-10 px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 1.5,
            scale: { type: "spring", visualDuration: 0.7, bounce: 0.1 },
          }}
        >
          <Image
            src={normalizeImagePath(image)}
            alt="heroPict"
            width={400}
            height={400}
            className="h-64 md:h-80 lg:h-100 w-auto"
            priority
          />
        </motion.div>

        {/* introduce */}
        <div className="w-full lg:w-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 1.5,
              scale: { type: "spring", visualDuration: 0.9, bounce: 0.1 },
            }}
            className="w-fit px-3 md:px-4 py-1 rounded-lg border border-red-400 bg-red-50 font-semibold text-red-600 text-xs md:text-sm tracking-wide"
          >
            {parsedData.badge || subtitle || "SISFOR UISI"}
          </motion.div>
          <div ref={containerRef} className="invisible">
            <h1 className="w-full lg:w-120 font-bold text-2xl md:text-3xl lg:text-4xl xl:text-5xl mt-4 md:mt-6" dangerouslySetInnerHTML={{ __html: title || "Program Studi <span class='text-red-600'>Sistem Informasi UISI</span>" }}>
            </h1>
            <h3 className="text-sm md:text-base lg:w-[38rem] mt-4 md:mt-6 text-zinc-600">
              {content || "Keberhasilan Semen Indonesia Group dalam penerapan Good Corporate Governance salah satunya melalui implementasi Enterprise Resource Planning (ERP), mampu menjadi dukungan best practice dalam sistem pembelajaran di Program Studi Sistem Informasi Universitas Internasional Semen Indonesia."}
            </h3>
            <style>{`.split-word { will-change: transform, opacity; }`}</style>
          </div>

          {/* button hubungi dan profil */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.5,
              scale: { type: "spring", visualDuration: 1, bounce: 0.1 },
            }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 lg:gap-8 mt-6 md:mt-8 lg:mt-10"
          >
            {parsedData.buttons && parsedData.buttons.length > 0 && (
              <>
                {parsedData.buttons[0] && (
                  <a
                    target="blank"
                    href={parsedData.buttons[0].url}
                    className="bg-gradient-to-r from-[#C10F11] to-[#E31515] hover:scale-95 transition-all duration-200 px-4 md:px-6 py-2 md:py-3 rounded-xl font-medium text-xs md:text-sm 2xl:text-base text-white text-center w-full sm:w-auto"
                  >
                    {parsedData.buttons[0].text}
                  </a>
                )}
                {parsedData.buttons[1] && (
                  <a
                    target="blank"
                    href={parsedData.buttons[1].url}
                    className="flex items-center justify-center gap-3 md:gap-4 font-medium text-xs md:text-sm 2xl:text-base text-red-600 px-4 md:px-6 py-2 md:py-3 rounded-lg hover:scale-95 hover:border hover:border-red-400 transition-all duration-200 w-full sm:w-auto"
                  >
                    <Play className="h-3 md:h-4 text-red-600" />
                    <span>{parsedData.buttons[1].text}</span>
                  </a>
                )}
              </>
            )}
          </motion.div>

          {/* akreditasi */}
          {parsedData.akreditasi && (
            <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.5,
              scale: { type: "spring", visualDuration: 1.2, bounce: 0.1 },
            }}
            className="flex items-center gap-3 md:gap-4 mt-6 md:mt-8"
            >
              <Image src={normalizeImagePath(parsedData.akreditasi.image)} alt="akreditasi" width={40} height={40} className="h-8 md:h-10" />
              <div>
                <h2 className="text-sm md:text-base 2xl:text-lg" dangerouslySetInnerHTML={{ __html: parsedData.akreditasi.title }} />
                <p className="text-xs md:text-sm text-zinc-500">
                  {parsedData.akreditasi.description}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* bottom circle */}
      <div className="flex justify-end items-end">
        <img
          src="/img/heroCircle.svg"
          alt="HeroCircle"
          className="rotate-180 h-24 md:h-32 lg:h-40"
        />
      </div>
    </section>
  );
}
