"use client";
import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { serviceByKey, statusOf, fmtStamp } from "@/lib/layanan-content";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { Skeleton } from "@/components/ui/loader";
import { cn } from "@/lib/utils";

/** Warna status memakai token status (success / warning / info / danger) — tanpa gradien. */
const TONE = {
  diterima: "bg-info-soft text-info",
  diverifikasi: "bg-info-soft text-info",
  diproses: "bg-warning-soft text-warning",
  siap: "bg-success-soft text-success",
  selesai: "bg-success-soft text-success",
  "perlu-perbaikan": "bg-warning-soft text-warning",
  ditolak: "bg-danger-soft text-danger",
};

export function InboxTimeline({ rows, loading, onSelect }) {
  const rail = useRef(null);
  const list = useRef(null);

  // garis emas tumbuh saat daftar masuk layar (sekali)
  useLayoutEffect(() => {
    if (!rail.current || !list.current || loading || !rows?.length || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        rail.current,
        { scaleY: 0 },
        { scaleY: 1, ease: "power2.out", duration: 1.1, scrollTrigger: { trigger: list.current, start: "top 85%", once: true } }
      );
    }, list);
    return () => ctx.revert();
  }, [rows, loading]);

  if (loading) {
    return (
      <div className="space-y-5 pl-8">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-5 w-3/5" />
          </div>
        ))}
      </div>
    );
  }

  if (!rows?.length) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <LottieIllustration src="/lottie/empty-news.json" className="size-40" label="Belum ada pengajuan" />
        <p className="text-sm text-text/60">Belum ada pengajuan masuk dari halaman layanan akademik.</p>
      </div>
    );
  }

  return (
    <div ref={list} className="relative">
      <span aria-hidden className="absolute bottom-3 left-[7px] top-3 w-px bg-line" />
      <span ref={rail} aria-hidden className="absolute bottom-3 left-[7px] top-3 w-px origin-top bg-gold" />
      <ol className="space-y-1">
        {rows.map((r) => {
          const service = serviceByKey(r.serviceKey)?.title ?? r.serviceKey;
          const status = statusOf(r.status);
          return (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => onSelect(r)}
                className="group relative grid w-full grid-cols-[1fr_auto] items-center gap-3 rounded-lg py-3 pl-8 pr-3 text-left transition-colors duration-300 hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon/40"
              >
                <span className="absolute left-0 top-1/2 size-4 -translate-y-1/2 rounded-full border-2 border-white bg-maroon shadow-[0_0_0_1px_var(--line)] transition-transform duration-300 group-hover:scale-125" />
                <span className="min-w-0">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-text/50">
                    {fmtStamp(r.createdAt)} · {r.code}
                  </span>
                  <span className="mt-1 block truncate font-semibold text-navy">{r.name}</span>
                  <span className="block truncate text-sm text-text/65">{service}</span>
                </span>
                <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", TONE[r.status] ?? "bg-cream text-navy")}>
                  {status.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <div className="mt-4 pl-8">
        <Link href="/admin/layanan" className="text-sm font-semibold text-maroon underline decoration-gold decoration-2 underline-offset-4 hover:text-maroon-deep">
          Buka kotak masuk lengkap
        </Link>
      </div>
    </div>
  );
}
