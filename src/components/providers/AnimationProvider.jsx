"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import AOS from "aos";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
  gsap.defaults({ ease: "power3.out", duration: 0.8 });
}

/** Inisialisasi GSAP plugins & AOS sekali untuk seluruh aplikasi. */
export default function AnimationProvider({ children }) {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    AOS.init({ duration: 700, easing: "ease-out-cubic", once: true, offset: 60, disable: reduce });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { AOS.refreshHard(); ScrollTrigger.refresh(); }, 100);
    return () => clearTimeout(t);
  }, [pathname]);

  return children;
}
