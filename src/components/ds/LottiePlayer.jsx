"use client";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

// lottie-web mengakses `document`, jadi player hanya dimuat di browser.
// LottieSvg = build renderer SVG saja (lebih ringan dari build penuh).
const LottieSvg = dynamic(() => import("lottie-react").then((m) => m.LottieSvg), { ssr: false });

/**
 * Ilustrasi Lottie. `name` = file di public/lottie/<name>.json
 * Ilustrasi bawaan: loader, success, empty, not-found, secure.
 * Bisa juga `src` = URL atau objek JSON Lottie lain.
 */
export default function LottiePlayer({ name, src, loop = true, autoplay = true, className, ariaLabel }) {
  return (
    <div className={cn("aspect-square", className)} role="img" aria-label={ariaLabel || name}>
      <LottieSvg src={src || `/lottie/${name}.json`} loop={loop} autoplay={autoplay} className="h-full w-full" />
    </div>
  );
}
