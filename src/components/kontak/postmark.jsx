"use client";
import { useId } from "react";
import { cn } from "@/lib/utils";

/** Cap pos bulat dengan teks melingkar. `spin` = berputar pelan (dimatikan saat reduced motion). */
export function Postmark({ text = "SISTEM INFORMASI · UISI · GRESIK · ", center = "61122", className, spin = false, tone = "maroon" }) {
  const color = tone === "maroon" ? "var(--maroon)" : tone === "gold" ? "var(--gold-soft)" : "var(--navy)";
  const id = `kt-ring-${useId().replace(/:/g, "")}`;
  return (
    <svg viewBox="0 0 120 120" aria-hidden className={cn("pointer-events-none", className)}>
      <defs>
        <path id={id} d="M60 60m-42 0a42 42 0 1 1 84 0a42 42 0 1 1-84 0" />
      </defs>
      <g className={cn(spin && "kt-spin")} style={{ transformOrigin: "60px 60px" }}>
        <circle cx="60" cy="60" r="54" fill="none" stroke={color} strokeWidth="2" strokeDasharray="3 4" opacity="0.7" />
        <circle cx="60" cy="60" r="31" fill="none" stroke={color} strokeWidth="1.4" opacity="0.6" />
        <text fontSize="9.6" fontWeight="700" letterSpacing="2.2" fill={color} opacity="0.85">
          <textPath href={`#${id}`}>{text}</textPath>
        </text>
      </g>
      <path d="M38 52h44M38 68h44" stroke={color} strokeWidth="1.4" opacity="0.5" />
      <text x="60" y="64" textAnchor="middle" fontSize="12" fontWeight="700" letterSpacing="1.5" fill={color}>
        {center}
      </text>
    </svg>
  );
}

/** Gelombang cap (garis bergelombang di samping cap pos). */
export function PostWaves({ className, tone = "maroon" }) {
  const color = tone === "maroon" ? "var(--maroon)" : "var(--gold-soft)";
  return (
    <svg viewBox="0 0 120 40" aria-hidden className={cn("pointer-events-none", className)}>
      {[6, 16, 26, 36].map((y) => (
        <path key={y} d={`M0 ${y}q10-6 20 0t20 0t20 0t20 0t20 0t20 0`} fill="none" stroke={color} strokeWidth="1.6" opacity="0.55" />
      ))}
    </svg>
  );
}
