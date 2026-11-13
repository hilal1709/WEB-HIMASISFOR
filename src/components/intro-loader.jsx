"use client";
import { useLayoutEffect as useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { LogoDraw } from "@/components/ui/loader";

const KEY = "sisfor:intro";
const EVENT = "sisfor:intro-done";
const DURATION = 2000;

function markDone() {
  if (typeof window === "undefined") return;
  window.__sisforIntroDone = true;
  window.dispatchEvent(new Event(EVENT));
}

/** Hook: true setelah intro loader selesai (atau langsung jika intro tidak tampil). */
export function useIntroReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (window.__sisforIntroDone) {
      setReady(true);
      return;
    }
    const on = () => setReady(true);
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);
  return ready;
}

/**
 * Intro loader beranda — sekali per sesi.
 * Logo digambar garis demi garis + penghitung 0–100 (anime.js), lalu tirai terbelah atas/bawah (GSAP).
 */
export function IntroLoader() {
  const ref = useRef(null);
  const count = useRef(null);
  const [show, setShow] = useState(true);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(KEY) === "1";
    } catch {}
    if (seen || prefersReducedMotion()) {
      setShow(false);
      markDone();
      return;
    }
    const el = ref.current;
    document.documentElement.style.overflow = "hidden";
    const n = { v: 0 };
    const counter = animate(n, {
      v: 100,
      duration: DURATION,
      ease: "inOutQuart",
      onUpdate: () => count.current && (count.current.textContent = String(Math.round(n.v)).padStart(3, "0")),
    });
    const tl = gsap.timeline({ delay: DURATION / 1000 + 0.1 });
    tl.to(el.querySelectorAll("[data-intro-inner]"), { opacity: 0, y: -14, duration: 0.35, ease: "power2.in" })
      .to(el.querySelector("[data-curtain-top]"), { yPercent: -100, duration: 1, ease: "expo.inOut" }, "-=0.05")
      .to(el.querySelector("[data-curtain-bottom]"), { yPercent: 100, duration: 1, ease: "expo.inOut" }, "<")
      .add(() => {
        document.documentElement.style.overflow = "";
        try {
          sessionStorage.setItem(KEY, "1");
        } catch {}
        markDone();
      }, "-=0.55")
      .add(() => setShow(false));
    return () => {
      tl.kill();
      counter.pause?.();
      document.documentElement.style.overflow = "";
    };
  }, []);

  if (!show) return null;
  return (
    <>
      {/* sebelum hidrasi: sembunyikan intro jika sudah pernah dilihat sesi ini (cegah kedip) */}
      <script
        dangerouslySetInnerHTML={{
          __html: `try{if(sessionStorage.getItem("${KEY}")==="1"||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.setAttribute("data-intro-seen","")}catch(e){}`,
        }}
      />
      <div ref={ref} aria-hidden className="intro-loader fixed inset-0 z-[200]">
        <div data-curtain-top className="absolute inset-x-0 top-0 h-1/2 bg-cream" />
        <div data-curtain-bottom className="absolute inset-x-0 bottom-0 h-1/2 bg-cream" />
        <div data-intro-inner className="absolute inset-0 grid place-items-center">
          <LogoDraw />
        </div>
        <div data-intro-inner className="absolute bottom-6 left-6 right-6 flex items-end justify-between md:bottom-10 md:left-10 md:right-10">
          <span ref={count} className="font-serif tabular text-[clamp(3rem,9vw,7rem)] leading-none text-navy">
            000
          </span>
          <span className="pb-3 text-xs font-medium uppercase tracking-[0.18em] text-navy/50">Sistem Informasi · UISI</span>
        </div>
      </div>
    </>
  );
}
