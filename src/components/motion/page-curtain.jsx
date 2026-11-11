"use client";
import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Loading masuk halaman (sekali per sesi per `storageKey`): tirai maroon, judul serif
 * + garis emas memanjang (anime.js), lalu tirai terangkat lewat clip-path (GSAP).
 *   <PageCurtain storageKey="sisfor:curtain:visi" title="Visi" accent="& Misi" />
 */
export function PageCurtain({ storageKey, kicker = "Program Studi Sistem Informasi", title, accent, label = "Memuat halaman" }) {
  const ref = useRef(null);
  const [show, setShow] = useState(true);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(storageKey) === "1";
    } catch {}
    if (seen || prefersReducedMotion()) {
      setShow(false);
      return;
    }
    const el = ref.current;
    const root = document.documentElement;
    root.style.overflow = "hidden";
    const line = el.querySelector("[data-line]");
    const words = el.querySelectorAll("[data-word]");
    const a1 = animate(line, { scaleX: [0, 1], duration: 900, ease: "inOutQuart" });
    const a2 = animate(words, { opacity: [0, 1], translateY: [14, 0], duration: 600, delay: (_, i) => 150 + i * 120, ease: "outCubic" });
    const finish = () => {
      root.style.overflow = "";
      try {
        sessionStorage.setItem(storageKey, "1");
      } catch {}
      setShow(false);
    };
    const tl = gsap.timeline({ delay: 1.05, onComplete: finish });
    tl.to(el.querySelector("[data-inner]"), { opacity: 0, y: -16, duration: 0.35, ease: "power2.in" })
      .fromTo(el, { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.85, ease: "expo.inOut" }, "-=0.1");
    // pengaman: tab di latar / frame tersendat → jangan pernah mengunci pengunjung di balik tirai
    const safety = setTimeout(finish, 3500);
    return () => {
      a1.revert?.();
      a2.revert?.();
      tl.kill();
      clearTimeout(safety);
      root.style.overflow = "";
    };
  }, [storageKey]);

  if (!show) return null;
  return (
    <>
      {/* pengunjung yang sudah melihat tirai: sembunyikan sebelum paint (tirai ikut ter-render di SSR) */}
      <script
        dangerouslySetInnerHTML={{
          __html: `try{if(sessionStorage.getItem(${JSON.stringify(storageKey)})==="1"||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.setAttribute("data-curtain-seen","")}catch(e){}`,
        }}
      />
      <style>{"html[data-curtain-seen] [data-curtain]{display:none}"}</style>
      <div
        data-curtain
        ref={ref}
        role="status"
        aria-label={label}
        className="fixed inset-0 z-[120] grid place-items-center bg-maroon text-white"
        style={{ clipPath: "inset(0% 0% 0% 0%)" }}
      >
        <div data-inner className="flex flex-col items-center text-center">
          <p data-word className="kicker text-gold-soft">{kicker}</p>
          <p data-word className="mt-4 font-serif text-[clamp(2rem,5vw,3.25rem)] leading-none">
            {title} {accent && <em className="italic text-gold-soft">{accent}</em>}
          </p>
          <span data-line className="mt-6 block h-[2px] w-40 origin-left scale-x-0 bg-gold" />
        </div>
      </div>
    </>
  );
}
