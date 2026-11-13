"use client";
import { useLayoutEffect as useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { BANNER_KEY } from "@/lib/bootcamp-content";
import { prefersReducedMotion } from "@/lib/motion";
import { Banner } from "@/components/ui/banner";
import { PlaceholderTag } from "@/components/home/shared";
import { refreshScroll, useBootcamp } from "./bootcamp-provider";

/**
 * Pengumuman pendaftaran kohort (brand) + bar kursi terisi yang tumbuh saat terlihat (anime.js).
 * Ditutup → tidak muncul lagi selama sesi.
 */
export function BootcampBanner() {
  const { notice, nextCohort, openCohort } = useBootcamp();
  const [show, setShow] = useState(false);
  const bar = useRef(null);
  const taken = nextCohort.seats - nextCohort.seatsLeft;
  const pct = Math.round((taken / nextCohort.seats) * 100);

  useEffect(() => {
    let hidden = false;
    try {
      hidden = sessionStorage.getItem(BANNER_KEY) === "1";
    } catch {}
    setShow(!hidden);
    if (!hidden) refreshScroll();
  }, []);

  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.style.width = `${pct}%`;
      return;
    }
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      animate(el, { width: ["0%", `${pct}%`], duration: 1400, ease: "outExpo", delay: 200 });
    });
    io.observe(el);
    return () => io.disconnect();
  }, [pct, show]);

  if (!show) return null;

  return (
    <div
      data-aos="fade-up"
      onClickCapture={(e) => {
        if (e.target.closest?.('[aria-label="Tutup banner"]')) {
          try {
            sessionStorage.setItem(BANNER_KEY, "1");
          } catch {}
          refreshScroll();
        }
      }}
    >
      <Banner
        variant="brand"
        dismissible
        title={notice.title}
        action={
          <button
            type="button"
            onClick={() => openCohort(nextCohort.slug)}
            className="hidden h-10 items-center rounded-md bg-gold px-4 text-sm font-semibold text-navy transition-[background-color,transform] duration-300 hover:bg-gold-soft active:scale-[0.97] sm:inline-flex"
          >
            Amankan kursi
          </button>
        }
      >
        <span>{notice.body}</span>
        <span className="mt-3 flex max-w-md items-center gap-3">
          <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/15" role="meter" aria-valuemin={0} aria-valuemax={nextCohort.seats} aria-valuenow={taken} aria-label="Kursi terisi">
            <span ref={bar} className="absolute inset-y-0 left-0 w-0 rounded-full bg-gold" />
          </span>
          <span className="tabular shrink-0 text-[12.5px] text-white/75">
            sisa <b className="font-semibold text-gold-soft">{nextCohort.seatsLeft}</b> dari {nextCohort.seats} kursi
          </span>
        </span>
        <button type="button" onClick={() => openCohort(nextCohort.slug)} className="mt-2 block text-[13px] font-semibold text-gold-soft underline decoration-gold/50 underline-offset-4 sm:hidden">
          Amankan kursi
        </button>
        {(notice.sample || nextCohort.sample) && <PlaceholderTag tone="dark" className="mt-2" />}
      </Banner>
    </div>
  );
}
