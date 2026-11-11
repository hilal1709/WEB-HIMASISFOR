"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

// lottie-react v3: ekspor bernama `Lottie`; render hanya di client.
const Lottie = dynamic(() => import("lottie-react").then((m) => m.Lottie), { ssr: false });

/**
 * Ilustrasi Lottie. `src` = path JSON (mis. "/lottie/data-chart.json"; dibuat oleh scripts/lottie/build.py).
 * - Diputar hanya saat terlihat (IntersectionObserver); reduced-motion → berhenti di frame jadi.
 * - `label`  : teks alternatif (role="img"); tanpa label → dekoratif (aria-hidden).
 * - `speed`  : kecepatan putar (1 = normal).
 * - `replayOnHover`: putar ulang dari awal saat elemen induk terdekat (a, button, [data-lottie-hover]) di-hover.
 */
export function LottieIllustration({ src, loop = true, className, label, speed = 1, replayOnHover = false, fallback = null, ...props }) {
  const box = useRef(null);
  const anim = useRef(null);
  const [failed, setFailed] = useState(false);

  // file JSON tidak ada / rusak → tampilkan fallback (mis. ilustrasi SVG statis)
  useEffect(() => {
    if (!fallback) return;
    let live = true;
    fetch(src, { method: "HEAD" })
      .then((r) => live && !r.ok && setFailed(true))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [src, fallback]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let visible = false;
    const apply = () => {
      const a = anim.current;
      if (!a) return false;
      if (reduce) a.seek({ percent: 85 });
      else if (visible) a.play();
      else a.pause();
      return true;
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      apply();
    });
    io.observe(el);
    // handle siap setelah modul dimuat — coba ulang sebentar
    let tries = 0;
    const id = setInterval(() => (apply() || ++tries > 40) && clearInterval(id), 150);

    const host = replayOnHover && !reduce ? el.closest("a, button, [data-lottie-hover]") : null;
    const replay = () => {
      const a = anim.current;
      if (!a) return;
      a.stop();
      a.play();
    };
    host?.addEventListener("pointerenter", replay);
    return () => {
      io.disconnect();
      clearInterval(id);
      host?.removeEventListener("pointerenter", replay);
    };
  }, [src, replayOnHover]);

  if (failed) return fallback;
  return (
    <div ref={box} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} className={cn("aspect-square", className)}>
      <Lottie src={src} lottieRef={anim} loop={loop} speed={speed} autoplay={false} className="h-full w-full" {...props} />
    </div>
  );
}
