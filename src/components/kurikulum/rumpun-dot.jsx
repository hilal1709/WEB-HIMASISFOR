"use client";
import { RUMPUN_BY_KEY } from "@/lib/kurikulum-content";
import { cn } from "@/lib/utils";
import { useKurikulum } from "./kurikulum-provider";

/**
 * Penanda rumpun yang sama di semua tempat (peta, buku semester, legenda, Konversi SKS).
 * Warna & gaya (titik penuh / cincin) dari CMS; di luar halaman Kurikulum memakai rumpun bawaan.
 */
export function RumpunDot({ rumpun, className }) {
  const k = useKurikulum();
  const r = k?.rumpunByKey?.[rumpun] ?? RUMPUN_BY_KEY[rumpun] ?? k?.rumpun?.[0];
  const ring = r?.style === "ring";
  return (
    <span
      aria-hidden
      className={cn("inline-block size-2 shrink-0 rounded-full", ring && "border-2 bg-white", className)}
      style={ring ? { borderColor: r?.css } : { backgroundColor: r?.css ?? "var(--navy)" }}
    />
  );
}
