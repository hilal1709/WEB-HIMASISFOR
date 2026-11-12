"use client";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

const READY = "sisfor:hydrated";

/**
 * Inisialisasi AOS sekali. Pakai: <div data-aos="fade-up" data-aos-delay="100">
 * AOS menambah class ke DOM, jadi harus berjalan SETELAH hidrasi halaman:
 * - halaman yang memasang <AosReady/> (beranda) → tunggu sinyalnya;
 * - halaman lain → setelah `load` + idle.
 */
export function AosProvider({ children }) {
  useEffect(() => {
    let idle;
    let done = false;
    const run = () => {
      if (done) return;
      // Halaman dengan loading.js di-stream dalam Suspense boundary terpisah: saat provider ini
      // terpasang, isinya (dan [data-aos-wait]) bisa belum ada. Cek ulang tepat sebelum init,
      // dan tunda sampai <AosReady/> memberi sinyal agar AOS tidak mengubah DOM pra-hidrasi.
      if (!window.__sisforHydrated && document.querySelector("[data-aos-wait]")) return;
      done = true;
      AOS.init({
        duration: 700,
        easing: "ease-out-cubic",
        once: true,
        offset: 60,
        disable: () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      });
    };
    const later = () => (idle = window.requestIdleCallback ? window.requestIdleCallback(run, { timeout: 1500 }) : setTimeout(run, 300));
    // sinyal hidrasi selalu didengarkan; jalur `load` hanya untuk halaman tanpa <AosReady/>
    window.addEventListener(READY, later, { once: true });
    if (window.__sisforHydrated || document.readyState === "complete") later();
    else window.addEventListener("load", later, { once: true });
    return () => {
      window.removeEventListener(READY, later);
      window.removeEventListener("load", later);
      if (window.cancelIdleCallback && idle) window.cancelIdleCallback(idle);
      else clearTimeout(idle);
    };
  }, []);
  return children;
}

/** Pasang di akhir halaman: efeknya berjalan setelah halaman itu terhidrasi → mulai AOS. */
export function AosReady() {
  useEffect(() => {
    window.__sisforHydrated = true;
    window.dispatchEvent(new Event(READY));
  }, []);
  return null;
}
