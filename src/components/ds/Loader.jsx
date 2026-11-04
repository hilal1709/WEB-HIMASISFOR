"use client";
import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { cn } from "@/lib/utils";

/** Spinner kecil untuk tombol/inline. */
export function Spinner({ className, size = 16 }) {
  return (
    <span
      role="status"
      aria-label="Memuat"
      style={{ width: size, height: size }}
      className={cn("inline-block animate-spin rounded-full border-2 border-current border-r-transparent", className)}
    />
  );
}

/** Tiga titik brand beranimasi (anime.js). */
export function DotsLoader({ className }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const a = animate(ref.current.children, {
      translateY: [0, -10, 0],
      scale: [1, 1.15, 1],
      duration: 900,
      delay: stagger(140),
      loop: true,
      ease: "inOutSine",
    });
    return () => a.revert();
  }, []);
  return (
    <div ref={ref} className={cn("flex items-center gap-2", className)} role="status" aria-label="Memuat">
      <span className="size-3 rounded-full bg-brand-600" />
      <span className="size-3 rounded-full bg-zinc-900" />
      <span className="size-3 rounded-full bg-brand-400" />
    </div>
  );
}

/**
 * Loader halaman penuh: logo + titik anime.js + progress bar shimmer.
 * Dipakai di app/loading.jsx, admin/loading.jsx dan saat cek session.
 */
export function PageLoader({ label = "Memuat…", fullscreen = true, className }) {
  const logoRef = useRef(null);
  useEffect(() => {
    if (!logoRef.current) return;
    const a = animate(logoRef.current, {
      scale: [0.92, 1],
      opacity: [0.6, 1],
      duration: 1100,
      loop: true,
      alternate: true,
      ease: "inOutQuad",
    });
    return () => a.revert();
  }, []);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-6 bg-white",
        fullscreen ? "fixed inset-0 z-[60]" : "min-h-[50vh] w-full",
        className
      )}
    >
      <div className="relative flex items-center justify-center">
        <span className="absolute size-28 rounded-full bg-brand-100 animate-ping opacity-40" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={logoRef} src="/img/logo.png" alt="Sistem Informasi UISI" className="relative h-12 w-auto object-contain" />
      </div>
      <DotsLoader />
      <div className="h-1 w-40 overflow-hidden rounded-full bg-zinc-100">
        <div className="h-full w-full bg-[linear-gradient(90deg,transparent,var(--brand-600),transparent)] bg-[length:200%_100%] animate-shimmer" />
      </div>
      <p className="text-sm text-zinc-500">{label}</p>
    </div>
  );
}

export default PageLoader;
