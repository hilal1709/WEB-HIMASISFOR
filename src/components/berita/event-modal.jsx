"use client";
import { useLayoutEffect as useEffect, useMemo, useRef } from "react";
import { gsap } from "@/lib/scroll";
import { MODES, dateParts, fmtTime } from "@/lib/berita-content";
import { prefersReducedMotion } from "@/lib/motion";
import { ModalDescription, ModalTitle } from "@/components/ui/modal";
import { ResponsiveDialog, useCompact } from "@/components/layanan/responsive-dialog";
import { PlaceholderTag } from "@/components/home/shared";
import { Cover } from "./cover";
import { EventActions, countdown } from "./event-actions";
import { useWarta } from "./warta-provider";

/**
 * Brosur lipat tiga untuk detail agenda. Saat terbuka, panel 2 lalu panel 3 membuka dari lipatan
 * (GSAP rotasi Y berporos di tepi kiri, bayangan lipatan solid memudar). Ponsel: panel terbuka ke bawah.
 * ‹ › + panah keyboard berpindah ke agenda sebelum/sesudahnya.
 */
export function EventModal() {
  const { events, eventSlug, openEvent, now } = useWarta();
  const compact = useCompact();
  const ref = useRef(null);
  const list = useMemo(() => [...events].sort((a, b) => new Date(a.startAt) - new Date(b.startAt)), [events]);
  const i = list.findIndex((e) => e.slug === eventSlug);
  const ev = list[i];

  useEffect(() => {
    if (!ev || prefersReducedMotion()) return;
    let ctx;
    const raf = requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { duration: 0.75, ease: "power3.out" } });
        if (compact) {
          tl.from("[data-fold]", { rotateX: -80, opacity: 0, transformOrigin: "50% 0%", stagger: 0.14 });
        } else {
          tl.from("[data-fold='2']", { rotateY: -110, transformOrigin: "0% 50%" })
            .from("[data-fold='2'] [data-crease]", { opacity: 0.5 }, "<")
            .from("[data-fold='3']", { rotateY: -110, transformOrigin: "0% 50%" }, "-=0.35")
            .from("[data-fold='3'] [data-crease]", { opacity: 0.5 }, "<");
        }
        tl.from("[data-fold-in]", { y: 10, opacity: 0, stagger: 0.05, duration: 0.5 }, "-=0.3");
      }, el);
    });
    return () => {
      cancelAnimationFrame(raf);
      ctx?.revert();
    };
  }, [ev?.slug, compact]); // eslint-disable-line react-hooks/exhaustive-deps

  const step = (d) => {
    const n = list[i + d];
    if (n) openEvent(n.slug);
  };

  if (!ev) return <ResponsiveDialog open={false} onOpenChange={() => {}} />;

  const p = dateParts(ev.startAt);
  const cd = countdown(ev, now);

  return (
    <ResponsiveDialog
      open={!!ev}
      onOpenChange={(v) => !v && openEvent(null)}
      className="max-w-4xl overflow-visible bg-transparent shadow-none"
      sheetClassName="max-h-[92dvh] overflow-y-auto bg-cream"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") step(1);
        if (e.key === "ArrowLeft") step(-1);
      }}
    >
      <div ref={ref} className="grid [perspective:1800px] sm:grid-cols-3 sm:rounded-lg sm:bg-cream">
        {/* panel 1: sampul */}
        <section data-fold="1" className="relative flex flex-col overflow-hidden bg-navy p-6 text-white sm:rounded-l-lg">
          {ev.cover && <Cover src={ev.cover} sizes="300px" className="absolute inset-0 opacity-25" />}
          <div className="relative flex h-full flex-col">
            <p data-fold-in className="kicker text-gold-soft">
              {ev.category}
            </p>
            <p data-fold-in className="mt-6 font-serif text-[5.5rem] leading-[0.85] tabular">
              {p.day}
            </p>
            <p data-fold-in className="font-serif text-2xl">
              {p.month} <span className="text-white/50">{p.year}</span>
            </p>
            <p data-fold-in className="mt-1 text-sm text-white/60">
              {p.weekday}
            </p>
            {cd && (
              <p data-fold-in className={`mt-auto pt-8 text-sm font-semibold ${cd.past ? "text-white/50" : "text-gold"}`}>
                {cd.label}
              </p>
            )}
          </div>
        </section>

        {/* panel 2: waktu & tempat */}
        <section data-fold="2" className="relative bg-white p-6 [backface-visibility:hidden] sm:border-l sm:border-dashed sm:border-navy/20">
          <span data-crease aria-hidden className="pointer-events-none absolute inset-0 bg-navy opacity-0" />
          <ModalTitle data-fold-in className="!text-[1.45rem] !leading-snug">
            {ev.title}
          </ModalTitle>
          <dl className="mt-5 space-y-4 text-sm">
            {[
              ["Waktu", `${fmtTime(ev.startAt)}${ev.endAt ? `–${fmtTime(ev.endAt)}` : ""} WIB`],
              ["Tempat", ev.place],
              ["Mode", MODES[ev.mode]],
            ].map(([k, v]) => (
              <div key={k} data-fold-in>
                <dt className="kicker text-text/45">{k}</dt>
                <dd className="mt-1 text-navy">{v}</dd>
              </div>
            ))}
            {ev.link && (
              <div data-fold-in>
                <dt className="kicker text-text/45">Tautan acara</dt>
                <dd className="mt-1">
                  <a href={ev.link} target="_blank" rel="noopener noreferrer" className="u-gold break-all font-semibold text-maroon">
                    Buka ruang daring
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </section>

        {/* panel 3: keterangan & aksi */}
        <section data-fold="3" className="relative flex flex-col bg-white p-6 [backface-visibility:hidden] sm:rounded-r-lg sm:border-l sm:border-dashed sm:border-navy/20">
          <span data-crease aria-hidden className="pointer-events-none absolute inset-0 bg-navy opacity-0" />
          <ModalDescription data-fold-in className="!text-[15px] text-text/70">
            {ev.summary || "Keterangan acara akan dilengkapi redaksi."}
          </ModalDescription>
          {ev.content && (
            <p data-fold-in className="mt-3 whitespace-pre-line text-sm leading-relaxed text-text/65">
              {ev.content}
            </p>
          )}
          {ev.sample && <PlaceholderTag className="mt-4 self-start" />}
          <div data-fold-in className="mt-auto pt-6">
            {!cd?.past && <EventActions ev={ev} size="sm" />}
            <div className="mt-5 flex items-center justify-between text-sm">
              <button type="button" disabled={i <= 0} onClick={() => step(-1)} className="font-semibold text-navy disabled:opacity-30">
                ‹ Sebelumnya
              </button>
              <span className="tabular text-text/40">
                {i + 1}/{list.length}
              </span>
              <button type="button" disabled={i >= list.length - 1} onClick={() => step(1)} className="font-semibold text-navy disabled:opacity-30">
                Berikutnya ›
              </button>
            </div>
          </div>
        </section>
      </div>
    </ResponsiveDialog>
  );
}
