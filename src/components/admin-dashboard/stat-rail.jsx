"use client";
import { useEffect, useRef } from "react";
import { countUp } from "@/lib/motion";
import { SpotlightCard } from "@/components/aceternity/spotlight-card";
import { Skeleton } from "@/components/ui/loader";
import { cn } from "@/lib/utils";

/** Empat angka utama. Tiap kartu membuka modal ringkasan lewat `onOpen(key)`. */
export const STAT_DEFS = [
  { key: "requests", label: "Pengajuan menunggu", note: "tersebar di seluruh layanan akademik", value: (c) => c.requestsPending },
  { key: "posts", label: "Warta terbit", note: (c) => `${c.postsDraft} lainnya masih berupa draf`, value: (c) => c.postsPublished },
  { key: "achievements", label: "Prestasi tercatat", note: "dosen dan mahasiswa", value: (c) => c.achievements },
  { key: "gallery", label: "Foto galeri aktif", note: "tampil di halaman prestasi", value: (c) => c.gallery },
];

function AnimatedNumber({ value }) {
  const ref = useRef(null);
  useEffect(() => {
    const anim = countUp(ref.current, value ?? 0);
    return () => anim?.pause?.();
  }, [value]);
  return (
    <span ref={ref} className="tabular font-serif text-5xl leading-none tracking-tight text-navy sm:text-[3.25rem]">
      0
    </span>
  );
}

export function StatRail({ counts, loading, onOpen }) {
  return (
    <section data-aos="fade-up" data-aos-delay="80" aria-label="Ringkasan angka" className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      {STAT_DEFS.map((s) => {
        const value = counts ? s.value(counts) : 0;
        const note = typeof s.note === "function" ? (counts ? s.note(counts) : "") : s.note;
        return (
          <SpotlightCard
            key={s.key}
            as="button"
            type="button"
            onClick={() => onOpen(s.key)}
            className={cn(
              "flex min-h-[10rem] flex-col justify-between rounded-xl border border-line bg-white p-5 text-left transition-transform duration-500 hover:-translate-y-1",
              "shadow-[0_1px_0_rgb(255_255_255/.9)_inset,0_24px_50px_-34px_rgb(78_14_25/.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon/40"
            )}
          >
            {/* cahaya buram emas yang mengikuti kursor (tanpa gradien) */}
            <span
              aria-hidden
              className="pointer-events-none absolute size-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/30 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
              style={{ left: "var(--mx, 50%)", top: "var(--my, 50%)" }}
            />
            <span className="kicker relative text-maroon/80">{s.label}</span>
            <span className="relative mt-5 flex items-end justify-between gap-3">
              {loading ? <Skeleton className="h-12 w-20" /> : <AnimatedNumber value={value} />}
              <span className="mb-1 h-px w-8 origin-left bg-gold transition-transform duration-500 group-hover:scale-x-[2.4]" />
            </span>
            <span className="relative mt-3 block text-xs leading-snug text-text/60">{loading ? "" : note}</span>
          </SpotlightCard>
        );
      })}
    </section>
  );
}
