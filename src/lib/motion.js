"use client";
/**
 * Motion tokens + helper animasi.
 * - GSAP  : animasi timeline/scroll (hero, section reveal)
 * - anime : micro-interaction ringan (counter, stagger list)
 * - AOS   : reveal sederhana via atribut data-aos (lihat <AosProvider>)
 * - Swiper: carousel (lihat components/motion/swiper-carousel.jsx)
 */
import { animate, stagger } from "animejs";

export const motionTokens = {
  duration: { fast: 0.2, base: 0.5, slow: 0.9 },
  ease: { out: "power3.out", inOut: "power2.inOut", spring: "back.out(1.6)" },
  stagger: 0.08,
};

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** anime.js: hitung angka naik (statistik, prestasi). */
export function countUp(el, to, { duration = 1400, format = (v) => v.toLocaleString("id-ID") } = {}) {
  if (!el) return;
  if (prefersReducedMotion()) {
    el.textContent = format(Math.round(to));
    return;
  }
  const state = { v: 0 };
  return animate(state, {
    v: to,
    duration,
    ease: "outExpo",
    onUpdate: () => (el.textContent = format(Math.round(state.v))),
  });
}

/** anime.js: masuk berurutan untuk sekumpulan elemen. */
export function staggerIn(targets, { delay = 80 } = {}) {
  if (prefersReducedMotion()) return;
  return animate(targets, {
    opacity: [0, 1],
    translateY: [16, 0],
    duration: 600,
    delay: stagger(delay),
    ease: "outCubic",
  });
}

/**
 * Jeda animasi hero agar mulai setelah tirai pembuka (PageCurtain) terangkat. Tirai menulis `key` ke
 * sessionStorage saat selesai; kunjungan berikutnya di sesi yang sama tidak menampilkan tirai → jeda pendek.
 */
export function curtainDelay(key, short = 0.15) {
  if (typeof window === "undefined") return short;
  try {
    return sessionStorage.getItem(key) === "1" ? short : 1.9;
  } catch {
    return 1.9;
  }
}
