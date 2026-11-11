"use client";
import { useState } from "react";
import { LordIcon as LordIconElement } from "@lordicon/react";
import { cn } from "@/lib/utils";

const TRIGGERS = { hover: "hover", loop: "loop", once: "in" };

/**
 * Ikon animasi Lordicon (@lordicon/react v2 → elemen <lord-icon>).
 * Satu-satunya sistem ikon untuk UI publik. JSON disimpan lokal di /public/lordicon/<nama>.json.
 *
 * - `name`     : nama file di /public/lordicon (mis. "home") — atau `src` untuk path lengkap.
 * - `trigger`  : "hover" | "loop" | "once" (sekali saat terlihat) | trigger Lordicon lain.
 * - `target`   : selector elemen induk yang memicu animasi (mis. "a", ".group"), supaya
 *                hover pada seluruh tombol menganimasikan ikon, bukan hanya ikonnya.
 * - `colors`   : warna ikon, mis. "primary:#0b1b45,secondary:#a80a0b".
 * Ruang ikon selalu dipesan (width/height tetap) sehingga layout tidak loncat saat JSON dimuat.
 */
export function LordIcon({ name, src, size = 24, trigger = "hover", target, colors, stroke, fallback = null, className, label, ...props }) {
  const [failed, setFailed] = useState(false);
  if (failed) return fallback;
  return (
    <span
      className={cn("inline-flex shrink-0", className)}
      style={{ width: size, height: size }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...props}
    >
      <LordIconElement
        src={src ?? `/lordicon/${name}.json`}
        trigger={TRIGGERS[trigger] ?? trigger}
        target={target}
        colors={colors}
        stroke={stroke}
        onError={() => setFailed(true)}
        style={{ width: size, height: size }}
      />
    </span>
  );
}
