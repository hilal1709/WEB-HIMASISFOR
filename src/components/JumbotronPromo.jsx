"use client";
import { useState, useEffect, useMemo } from "react";
import Image from 'next/image';

export default function JumbotronPromo() {
  const [promoData, setPromoData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch jumbotron promo data from API
  useEffect(() => {
    async function fetchPromoData() {
      try {
        const response = await fetch('/api/content?section=jumbotron-promo', {
          // Add caching
          next: { revalidate: 3600 }
        });
        if (response.ok) {
          const data = await response.json();
          setPromoData(data);
        }
      } catch (error) {
        console.error('Error fetching promo data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPromoData();
  }, []);

  // Move useMemo hooks before early return to maintain hook order
  const buttonText = useMemo(() => promoData?.data?.buttonText || "Mari Bergabung", [promoData?.data?.buttonText]);
  const buttonUrl = useMemo(() => promoData?.data?.buttonUrl || "https://s.id/DaftarSisforUISI", [promoData?.data?.buttonUrl]);

  if (loading || !promoData) {
    return (
      <div className="flex justify-center items-center my-24">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  const { title, subtitle, content, image, data } = promoData;

  return (
    <>
      {/* jumbotron mari bergabung */}
      <div className="flex flex-col justify-center items-center my-16 md:my-24 lg:my-32 px-4 md:px-8 lg:px-24 2xl:px-48">
        {/* container */}
        <div className="relative flex flex-col justify-center items-center w-full max-w-7xl">
          <img
            src={image || "img/gabung.png"}
            alt=""
            className="rounded-xl md:rounded-2xl lg:rounded-3xl drop-shadow-lg w-full h-48 md:h-auto object-cover"
          />

          {/* content */}
          <div className="absolute flex flex-col justify-center items-center text-white px-4">
            <div className="px-3 md:px-4 py-1.5 md:py-2 border-[0.5px] border-white bg-white/20 rounded-lg text-center text-xs md:text-sm uppercase tracking-widest font-semibold">
              {subtitle || "sisfor uisi"}
            </div>
            <h1 className="my-3 md:my-4 font-bold text-lg md:text-2xl lg:text-3xl xl:text-4xl text-center">
              {title || "Mari Bergabung Bersama Kami"}
            </h1>
            <p className="text-center text-xs md:text-sm lg:text-base xl:text-lg max-w-2xl">
              {content ? content.split(/\n|<br\s*\/?>/).map((line, i, arr) => (
                <span key={i}>
                  {line}
                  {i < arr.length - 1 && <br />}
                </span>
              )) : "Bergabung bersama kami dan menjadi bagian dari keluarga Sistem Informasi Universitas Internasional Semen Indonesia"}
            </p>
            <a
              href={buttonUrl}
              className="mt-3 md:mt-4 px-4 md:px-6 py-2 md:py-3 font-semibold text-xs md:text-sm text-red-600 bg-white rounded-xl drop-shadow-lg hover:scale-95 transition-all w-full sm:w-auto text-center"
            >
              {buttonText}
            </a>
          </div>
        </div>
      </div>
      {/* dot pattern */}
      <div className="hidden md:block relative overflow-x-clip -z-20">
        <div className="flex justify-between">
          <div className="-mt-48 md:-mt-56 lg:-mt-72 -ml-12 md:-ml-16 lg:-ml-20">
            <img src="/img/dot.svg" alt="dot kiri" className="mt-6 h-16 md:h-20 lg:h-auto" />
          </div>
          <div className="-mt-60 md:-mt-80 lg:-mt-[32rem] mr-4 lg:mr-12 2xl:mr-80">
            <img src="/img/dot.svg" alt="dot kanan" className="mt-6 h-16 md:h-20 lg:h-auto" />
          </div>
        </div>
      </div>
      {/* end dot pattern */}
      {/* end jumbotron mari bergabung */}
    </>
  );
}
