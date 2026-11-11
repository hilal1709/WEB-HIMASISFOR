"use client";
/**
 * Cinematic scroll — GSAP ScrollTrigger + ScrollSmoother + SplitText.
 * Semua plugin didaftarkan sekali di sini. Import `gsap`, `ScrollTrigger`, dll dari file ini
 * supaya tidak ada pendaftaran ganda.
 *
 * Mode "cinematic" hanya aktif di layar >= 768px dan tanpa prefers-reduced-motion.
 * Di luar itu halaman jatuh ke layout biasa (tanpa pin / smoother).
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);
}

export const CINEMATIC_QUERY = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";

export const sceneTokens = {
  /** kehalusan ScrollSmoother (detik untuk "menyusul" posisi scroll) */
  smooth: 1.15,
  /** scrub untuk transisi scene — angka = detik lag, terasa "berat" & premium */
  scrub: 0.8,
  /** skala & redup scene yang sedang ditumpuk scene berikutnya */
  stackScale: 0.9,
  stackDim: 0.35,
  ease: "power3.out",
};

export { gsap, ScrollTrigger, ScrollSmoother, SplitText };
