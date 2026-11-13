"use client";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Tanda tangan sambutan. Mode "draw": goresan SVG (bisa dianimasikan dengan stroke-dashoffset);
 * mode "svg": berkas unggahan. Dipakai halaman publik dan Meja Sambutan agar tampilannya identik.
 */
export const Signature = forwardRef(function Signature({ signature: sg, className }, ref) {
  if (sg.mode === "svg" && sg.svgUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={sg.svgUrl} alt="" aria-hidden className={cn("h-20 w-auto", className)} />;
  }
  if (!sg.paths?.length) return null;
  const last = sg.paths.length - 1;
  return (
    <svg ref={ref} viewBox={sg.viewBox} aria-hidden className={cn("h-20 w-auto text-navy", className)}>
      {sg.paths.map((d, i) => {
        const accent = sg.accentLast && i === last && last > 0;
        return (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={accent ? "var(--gold)" : "currentColor"}
            strokeWidth={accent ? 1.4 : 2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      })}
    </svg>
  );
});

/** Sembunyikan goresan lewat stroke-dash (siap digambar). */
export function hideSignature(svg) {
  const paths = [...(svg?.querySelectorAll?.("path") ?? [])];
  paths.forEach((p) => {
    const len = p.getTotalLength();
    p.style.strokeDasharray = `${len}`;
    p.style.strokeDashoffset = `${len}`;
  });
  return paths;
}

/** Gambar goresan berurutan dengan anime.js. Mengembalikan animasinya. */
export function drawSignature(animate, svg, { duration = 1400, gap = 380 } = {}) {
  const paths = hideSignature(svg);
  if (!paths.length) return null;
  return animate(paths, { strokeDashoffset: 0, duration, delay: (_, i) => i * gap, ease: "inOutQuad" });
}
