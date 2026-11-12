"use client";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/** Tinggi satu baris digit (em). Lebih tinggi dari 1em karena glyph serif display melewati kotak 1em —
 *  kalau baris terlalu rapat, ujung digit tetangga ikut terlihat di atas/bawah angka. */
const ROW = 1.3;

/**
 * Angka bergulir per digit (pola 21st.dev "Rolling Counter"): tiap digit adalah gulungan 0–9 yang
 * berputar ke posisinya dengan pegas. Lebar digit tetap (tabular) sehingga layout tidak bergeser.
 */
export function RollingNumber({ value, minDigits = 2, className, label }) {
  const reduce = useReducedMotion();
  const digits = String(Math.max(0, Math.round(value))).padStart(minDigits, "0").split("");
  return (
    <span className={cn("inline-flex leading-none tabular", className)} role="img" aria-label={label ?? String(value)}>
      {digits.map((d, i) => (
        <span
          key={digits.length - i}
          aria-hidden
          className="relative inline-block w-[0.62em] overflow-hidden"
          style={{ height: `${ROW}em`, margin: `-${(ROW - 1) / 2}em 0` }}
        >
          <motion.span
            className="absolute inset-x-0 top-0 flex flex-col items-center"
            initial={false}
            animate={{ y: `${-Number(d) * ROW}em` }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 210, damping: 22, mass: 0.7, delay: (digits.length - 1 - i) * 0.04 }}
          >
            {Array.from({ length: 10 }, (_, n) => (
              <span key={n} className="block text-center" style={{ height: `${ROW}em`, lineHeight: `${ROW}em` }}>
                {n}
              </span>
            ))}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
