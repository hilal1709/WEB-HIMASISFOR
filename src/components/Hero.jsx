"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import Image from 'next/image';
import { Play } from "../icons/Play";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { Skeleton } from "@/components/ui/skeleton";
import { BackgroundGrid, Spotlight } from "@/components/aceternity";

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

  const sectionRef = useRef(null);

  // Animasi masuk hero (GSAP + SplitText): gambar, badge, judul per kata, lalu CTA.
  useGSAP(
    () => {
      if (!heroData || !containerRef.current) return;
      let split;
      document.fonts.ready.then(() => {
        if (!containerRef.current) return;
        containerRef.current.style.visibility = "visible";
        split = new SplitText(containerRef.current.querySelectorAll("h1, h3"), { type: "words" });
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.fromTo("[data-hero='image']", { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 1, ease: "back.out(1.4)" })
          .fromTo("[data-hero='badge']", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.7")
          .fromTo(split.words, { opacity: 0, y: 14, filter: "blur(6px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, stagger: 0.03 }, "-=0.3")
          .fromTo("[data-hero='cta'] > *, [data-hero='akreditasi']", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }, "-=0.4");
        gsap.to("[data-hero='image']", { y: -10, duration: 3, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1.2 });
      });
      return () => split?.revert();
    },
    { scope: sectionRef, dependencies: [heroData] }
  );

  // Move useMemo before early return to maintain hook order
  const parsedData = useMemo(() => heroData?.data || {}, [heroData?.data]);

  if (loading || !heroData) {
    return (
      <section className="-mt-18 lg:-mt-16 flex min-h-screen items-center justify-center px-4">
        <div className="flex w-full max-w-5xl flex-col items-center gap-8 lg:flex-row">
          <Skeleton className="size-64 shrink-0 rounded-full md:size-80" />
          <div className="w-full space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-12 w-full max-w-lg" />
            <Skeleton className="h-20 w-full" />
            <div className="flex gap-3"><Skeleton className="h-11 w-40" /><Skeleton className="h-11 w-32" /></div>
          </div>
        </div>
      </section>
    );
  }

  const { title, subtitle, content, image, data } = heroData;

  return (
    <section ref={sectionRef} className="relative -mt-18 overflow-hidden lg:-mt-16">
      <BackgroundGrid variant="dot" className="-z-20" />
      <Spotlight className="-top-40 left-0 md:-top-20 md:left-40" />
      {/* top circle */}
      <img src="/img/heroCircle.svg" alt="HeroCircle" className="h-24 md:h-32 lg:h-40 -z-10" />

      {/* content */}
      <main className="flex flex-col lg:flex-row justify-center items-center gap-6 md:gap-8 lg:gap-12 lg:-mt-10 px-4 md:px-6">
        <div data-hero="image" className="opacity-0">
          <Image
            src={normalizeImagePath(image)}
            alt="heroPict"
            width={400}
            height={400}
            className="h-64 md:h-80 lg:h-100 w-auto"
            priority
          />
        </div>

        {/* introduce */}
        <div className="w-full lg:w-auto">
          <div
            data-hero="badge"
            className="opacity-0 w-fit px-3 md:px-4 py-1 rounded-lg border border-brand-300 bg-brand-50 font-semibold text-brand-600 text-xs md:text-sm tracking-wide"
          >
            {parsedData.badge || subtitle || "SISFOR UISI"}
          </div>
          <div ref={containerRef} className="invisible">
            <h1 className="w-full lg:w-120 font-bold text-2xl md:text-3xl lg:text-4xl xl:text-5xl mt-4 md:mt-6" dangerouslySetInnerHTML={{ __html: title || "Program Studi <span class='text-brand-600'>Sistem Informasi UISI</span>" }}>
            </h1>
            <h3 className="text-sm md:text-base lg:w-[38rem] mt-4 md:mt-6 text-zinc-600">
              {content || "Keberhasilan Semen Indonesia Group dalam penerapan Good Corporate Governance salah satunya melalui implementasi Enterprise Resource Planning (ERP), mampu menjadi dukungan best practice dalam sistem pembelajaran di Program Studi Sistem Informasi Universitas Internasional Semen Indonesia."}
            </h3>
          </div>

          {/* button hubungi dan profil */}
          <div
            data-hero="cta"
            className="[&>*]:opacity-0 flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 lg:gap-8 mt-6 md:mt-8 lg:mt-10"
          >
            {parsedData.buttons && parsedData.buttons.length > 0 && (
              <>
                {parsedData.buttons[0] && (
                  <a
                    target="blank"
                    href={parsedData.buttons[0].url}
                    className="bg-gradient-to-r from-brand-700 to-brand-600 shadow-lift hover:-translate-y-0.5 hover:shadow-xl transition-[transform,box-shadow] duration-300 ease-brand px-4 md:px-6 py-2 md:py-3 rounded-xl font-medium text-xs md:text-sm 2xl:text-base text-white text-center w-full sm:w-auto"
                  >
                    {parsedData.buttons[0].text}
                  </a>
                )}
                {parsedData.buttons[1] && (
                  <a
                    target="blank"
                    href={parsedData.buttons[1].url}
                    className="flex items-center justify-center gap-3 md:gap-4 font-medium text-xs md:text-sm 2xl:text-base text-brand-600 px-4 md:px-6 py-2 md:py-3 rounded-xl border border-transparent hover:bg-brand-50 hover:border-brand-200 transition-colors duration-200 w-full sm:w-auto"
                  >
                    <Play className="h-3 md:h-4 text-brand-600" />
                    <span>{parsedData.buttons[1].text}</span>
                  </a>
                )}
              </>
            )}
          </div>

          {/* akreditasi */}
          {parsedData.akreditasi && (
            <div
            data-hero="akreditasi"
            className="opacity-0 flex items-center gap-3 md:gap-4 mt-6 md:mt-8"
            >
              <Image src={normalizeImagePath(parsedData.akreditasi.image)} alt="akreditasi" width={40} height={40} className="h-8 md:h-10" />
              <div>
                <h2 className="text-sm md:text-base 2xl:text-lg" dangerouslySetInnerHTML={{ __html: parsedData.akreditasi.title }} />
                <p className="text-xs md:text-sm text-zinc-500">
                  {parsedData.akreditasi.description}
                </p>
              </div>
            </div>
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
