"use client";
import { useLayoutEffect as useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "@/lib/scroll";
import { MODES, dateParts, fmtShort, fmtTime, monthKey } from "@/lib/berita-content";
import { prefersReducedMotion } from "@/lib/motion";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { cn } from "@/lib/utils";
import { EmptyEdition } from "./empty-edition";
import { EventActions, countdown } from "./event-actions";
import { Highlight, useWarta } from "./warta-provider";

const MONTH_NAMES = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const endOf = (e) => new Date(e.endAt ?? new Date(e.startAt).getTime() + 2 * 3600e3);

/** Lembar kalender (dipakai untuk halaman aktif & halaman yang sedang disobek). */
function Sheet({ ev, now, onDetail, query }) {
  const p = dateParts(ev.startAt);
  const cd = countdown(ev, now);
  return (
    <div className="relative bg-white px-6 pb-7 pt-8 md:px-9">
      {/* perforasi sobekan */}
      <svg aria-hidden viewBox="0 0 200 8" preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-2 w-full text-cream-2">
        <path d={`M0 0${Array.from({ length: 25 }, (_, i) => `L${i * 8 + 4} 7L${i * 8 + 8} 0`).join("")}V0Z`} fill="currentColor" />
      </svg>
      <div className="flex items-baseline justify-between gap-3">
        <p className="kicker text-maroon">{p.weekday}</p>
        {cd && <p className={cn("text-xs font-semibold", cd.live ? "text-maroon" : cd.soon ? "text-gold" : "text-text/50")}>{cd.label}</p>}
      </div>
      <p className="mt-1 font-serif text-[clamp(6rem,16vw,10rem)] leading-[0.85] text-maroon tabular">{p.day}</p>
      <p className="font-serif text-2xl text-navy">
        {p.month} <span className="text-text/40">{p.year}</span>
      </p>
      <span aria-hidden className="mt-5 block h-px bg-line" />
      <p className="kicker mt-5 text-text/50">
        {ev.category} · {MODES[ev.mode]}
      </p>
      <h3 className="mt-2 font-serif text-[1.55rem] leading-snug text-navy">
        <Highlight text={ev.title} query={query} />
      </h3>
      <p className="mt-2 text-[15px] text-text/65">
        {fmtTime(ev.startAt)}
        {ev.endAt && `–${fmtTime(ev.endAt)}`} WIB · {ev.place}
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
        <EventActions ev={ev} size="sm" />
        <button type="button" onClick={onDetail} className="u-gold text-sm font-semibold text-maroon">
          Lihat brosur
        </button>
      </div>
    </div>
  );
}

/**
 * Rubrik Agenda — kalender sobek: lembar acara terdekat (tanggal serif raksasa, hitung mundur `now` klien)
 * yang disobek (GSAP: berputar dari sudut perforasi lalu jatuh) saat maju; mundur = lembar turun kembali.
 * Kanan: pita hari dalam bulan (titik emas = ada acara) + daftar acara bulan itu. Bawah: arsip terlipat.
 */
export function TearoffCalendar() {
  const { results, category, query, now, openEvent } = useWarta();
  const events = useMemo(() => results.agenda.filter((e) => !category || e.category === category), [results.agenda, category]);
  const ref = useRef(null);
  const [i, setI] = useState(0);
  const [leaving, setLeaving] = useState(null);
  const [dir, setDir] = useState(1);
  const [archive, setArchive] = useState(false);

  const t = now ?? new Date(0);
  const upcoming = useMemo(() => events.filter((e) => endOf(e) >= t).sort((a, b) => new Date(a.startAt) - new Date(b.startAt)), [events, Math.floor(t.getTime() / 60000)]); // eslint-disable-line react-hooks/exhaustive-deps
  const past = useMemo(() => events.filter((e) => endOf(e) < t).sort((a, b) => new Date(b.startAt) - new Date(a.startAt)), [events, Math.floor(t.getTime() / 60000)]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => setI(0), [category, query]);
  const idx = Math.min(i, Math.max(upcoming.length - 1, 0));
  const active = upcoming[idx];

  const go = (next) => {
    if (next === idx || next < 0 || next >= upcoming.length) return;
    setDir(next > idx ? 1 : -1);
    if (next > idx && !prefersReducedMotion()) setLeaving(active);
    setI(next);
  };

  // animasi sobek / kembali
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      if (leaving) {
        gsap.fromTo(
          "[data-leaving]",
          { rotate: 0, y: 0, x: 0, opacity: 1 },
          { rotate: 16, x: 60, y: 260, opacity: 0, duration: 0.85, ease: "power2.in", transformOrigin: "6% 0%", onComplete: () => setLeaving(null) }
        );
      } else if (dir < 0) {
        gsap.fromTo("[data-page]", { y: -40, rotate: -3, opacity: 0 }, { y: 0, rotate: 0, opacity: 1, duration: 0.6, ease: "back.out(1.6)", transformOrigin: "6% 0%" });
      }
    }, el);
    return () => ctx.revert();
  }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps

  const onKey = (e) => {
    if (e.key === "ArrowRight") go(idx + 1);
    if (e.key === "ArrowLeft") go(idx - 1);
  };

  if (!events.length) return <EmptyEdition what="agenda" />;

  // bulan aktif & pita hari
  const mk = active ? monthKey(active.startAt) : null;
  const months = [...new Set(upcoming.map((e) => monthKey(e.startAt)))];
  const mi = months.indexOf(mk);
  const [yy, mm] = (mk ?? "2026-01").split("-").map(Number);
  const days = new Date(yy, mm, 0).getDate();
  const inMonth = upcoming.map((e, k) => ({ e, k })).filter(({ e }) => monthKey(e.startAt) === mk);
  const dayOf = (e) => Number(dateParts(e.startAt).day);
  const activeDay = active ? dayOf(active) : null;

  return (
    <div>
      {active ? (
        <div className="grid gap-10 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-14">
          {/* kalender sobek */}
          <div ref={ref} tabIndex={0} onKeyDown={onKey} aria-label="Kalender agenda. Gunakan panah kiri dan kanan untuk berpindah." className="relative outline-none focus-visible:ring-2 focus-visible:ring-gold/60">
            <div className="relative z-20 flex h-12 items-center justify-between rounded-t-md bg-navy px-5">
              <span className="kicker text-gold-soft">Agenda prodi</span>
              <span className="flex gap-10" aria-hidden>
                {[0, 1].map((k) => (
                  <span key={k} className="relative block size-3.5 rounded-full bg-cream ring-2 ring-navy-deep">
                    <span className="absolute -top-4 left-1/2 h-5 w-1 -translate-x-1/2 rounded-full bg-gold" />
                  </span>
                ))}
              </span>
              <span className="tabular text-xs text-white/60">
                {idx + 1}/{upcoming.length}
              </span>
            </div>
            <div className="relative">
              {/* tumpukan lembar di bawah */}
              <span aria-hidden className="absolute inset-x-1.5 -bottom-1.5 top-0 rounded-b-md border border-line bg-white" />
              <span aria-hidden className="absolute inset-x-3 -bottom-3 top-0 rounded-b-md border border-line bg-cream-2" />
              <div data-page key={active.slug} className="relative z-10 overflow-hidden rounded-b-md border border-t-0 border-line shadow-[0_18px_40px_-28px_rgb(14_24_48/0.5)]">
                <Sheet ev={active} now={now} query={query} onDetail={() => openEvent(active.slug)} />
              </div>
              {leaving && (
                <div data-leaving aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-20 overflow-hidden rounded-b-md border border-t-0 border-line shadow-xl">
                  <Sheet ev={leaving} now={now} />
                </div>
              )}
            </div>
            <div className="mt-6 flex items-center justify-between">
              <button type="button" onClick={() => go(idx - 1)} disabled={idx === 0} className="group inline-flex items-center gap-2 text-sm font-semibold text-navy disabled:opacity-30">
                <svg aria-hidden viewBox="0 0 16 16" className="size-4 transition-transform group-hover:-translate-x-0.5">
                  <path d="M13 8H3M7 4 3 8l4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Kembalikan lembar
              </button>
              <button type="button" onClick={() => go(idx + 1)} disabled={idx >= upcoming.length - 1} className="group inline-flex items-center gap-2 text-sm font-semibold text-maroon disabled:opacity-30">
                Sobek, acara berikutnya
                <svg aria-hidden viewBox="0 0 16 16" className="size-4 transition-transform group-hover:translate-x-0.5">
                  <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* bulan & daftar */}
          <div className="min-w-0">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-serif text-3xl text-navy">
                {MONTH_NAMES[mm - 1]} <em className="italic text-maroon">{yy}</em>
              </h3>
              <div className="flex gap-1">
                {[-1, 1].map((d) => (
                  <button
                    key={d}
                    type="button"
                    disabled={!months[mi + d]}
                    onClick={() => go(upcoming.findIndex((e) => monthKey(e.startAt) === months[mi + d]))}
                    aria-label={d < 0 ? "Bulan sebelumnya" : "Bulan berikutnya"}
                    className="grid size-9 place-items-center rounded-md border border-navy/15 bg-white text-navy transition-colors hover:border-navy disabled:opacity-30"
                  >
                    <svg aria-hidden viewBox="0 0 16 16" className={cn("size-4", d < 0 && "rotate-180")}>
                      <path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* pita hari */}
            <div className="-mx-1 mt-5 overflow-x-auto px-1 pb-2">
              <div className="flex min-w-max gap-1">
                {Array.from({ length: days }, (_, d) => d + 1).map((d) => {
                  const hit = inMonth.find(({ e }) => dayOf(e) === d);
                  const on = d === activeDay;
                  return (
                    <button
                      key={d}
                      type="button"
                      disabled={!hit}
                      onClick={() => hit && go(hit.k)}
                      aria-label={hit ? `${d} ${MONTH_NAMES[mm - 1]}: ${hit.e.title}` : undefined}
                      className={cn(
                        "relative grid h-12 w-9 place-items-center rounded tabular text-sm transition-colors",
                        on ? "bg-maroon text-white" : hit ? "bg-white text-navy ring-1 ring-navy/15 hover:ring-navy/50" : "text-text/30"
                      )}
                    >
                      {d}
                      {hit && <span className={cn("absolute bottom-1.5 size-1.5 rounded-full", on ? "bg-gold-soft" : "bg-gold")} />}
                    </button>
                  );
                })}
              </div>
            </div>

            <ol className="mt-6 border-t border-navy/15">
              {inMonth.map(({ e, k }) => (
                <li key={e.slug} className="border-b border-line">
                  <button type="button" onClick={() => (k === idx ? openEvent(e.slug) : go(k))} className={cn("group grid w-full grid-cols-[3.25rem_1fr_auto] items-center gap-4 py-4 text-left transition-colors", k === idx ? "text-navy" : "text-text/70 hover:text-navy")}>
                    <span className={cn("font-serif text-3xl leading-none tabular", k === idx ? "text-maroon" : "text-text/35 group-hover:text-navy")}>{dayOf(e)}</span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium">
                        <Highlight text={e.title} query={query} />
                      </span>
                      <span className="mt-0.5 block truncate text-[13px] text-text/50">
                        {fmtTime(e.startAt)} WIB · {e.place}
                      </span>
                    </span>
                    <span className={cn("rounded px-2 py-0.5 text-[11px] font-semibold", e.mode === "daring" ? "bg-navy/10 text-navy" : e.mode === "hibrid" ? "bg-gold/20 text-navy" : "bg-maroon/10 text-maroon")}>{MODES[e.mode]}</span>
                  </button>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-xs text-text/45">Klik acara untuk membalik kalender ke tanggalnya; klik sekali lagi untuk membuka brosurnya.</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center py-10 text-center">
          <LottieIllustration src="/lottie/calendar.json" label="Kalender kosong" className="w-32" />
          <p className="mt-3 font-serif text-xl text-navy">Belum ada agenda terdekat</p>
          <p className="mt-1 text-sm text-text/55">Agenda baru akan muncul di sini begitu dijadwalkan redaksi.</p>
        </div>
      )}

      {past.length > 0 && (
        <div className="mt-14">
          <button type="button" aria-expanded={archive} onClick={() => setArchive((v) => !v)} className="group flex w-full items-center gap-4 text-left">
            <span className="font-serif text-xl text-navy">Arsip agenda</span>
            <span className="tabular text-sm text-text/45">{past.length} acara</span>
            <span aria-hidden className="h-px flex-1 bg-line" />
            <span className="u-gold text-sm font-semibold text-maroon">{archive ? "Lipat" : "Buka lipatan"}</span>
          </button>
          <div className={cn("grid transition-[grid-template-rows] duration-500 ease-cinematic", archive ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
            <ul className="overflow-hidden">
              {past.map((e) => (
                <li key={e.slug} className="flex items-baseline gap-4 border-b border-line py-3 text-sm text-text/50">
                  <span className="w-16 shrink-0 tabular">{fmtShort(e.startAt)}</span>
                  <span className="min-w-0 flex-1 truncate">{e.title}</span>
                  <span className="hidden shrink-0 sm:inline">{e.place}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
