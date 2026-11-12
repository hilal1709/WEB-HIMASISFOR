import { cn } from "@/lib/utils";

/**
 * Penanda rumpun yang sama di semua tempat (peta, buku semester, legenda):
 * Fondasi = titik navy, Enterprise = titik maroon, Tata Kelola = titik emas,
 * Data & PL = cincin navy berlubang (sesuai titik stasiunnya di peta studi).
 */
const STYLE = {
  fondasi: "bg-navy",
  enterprise: "bg-maroon",
  "tata-kelola": "bg-gold",
  data: "border-2 border-navy bg-white",
};

export function RumpunDot({ rumpun, className }) {
  return <span aria-hidden className={cn("inline-block size-2 shrink-0 rounded-full", STYLE[rumpun] ?? STYLE.fondasi, className)} />;
}
