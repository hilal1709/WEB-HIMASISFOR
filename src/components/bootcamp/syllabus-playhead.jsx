"use client";
import { useLayoutEffect as useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { animate } from "animejs";
import { prefersReducedMotion } from "@/lib/motion";
import { Container, SectionHeader } from "@/components/home/shared";
import { cn } from "@/lib/utils";
import { useBootcamp } from "./bootcamp-provider";

const spring = { type: "spring", stiffness: 380, damping: 30 };

/** Satu bagian artefak proyek. Belum terbuka → kotak putus-putus "menyusul minggu N". */
function Part({ on, w, label, className, children }) {
  const reduce = useReducedMotion();
  return (
    <div className={cn("relative min-h-0", className)}>
      <AnimatePresence initial={false} mode="popLayout">
        {on ? (
          <motion.div
            key="on"
            initial={reduce ? false : { opacity: 0, scale: 0.92, filter: "blur(6px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={reduce ? undefined : { opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="h-full"
          >
            {children}
          </motion.div>
        ) : (
          <motion.div key="off" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid h-full place-items-center rounded-md border border-dashed border-navy/20 p-2 text-center text-[11px] text-text/40">
            {label} · minggu {w}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Bagian artefak yang dipetakan ke `cohort.build` (komponen tingkat atas agar tidak dipasang ulang tiap render). */
function P({ cohort, week, part, className, children }) {
  const b = cohort.build.find((x) => x.part === part);
  if (!b) return null;
  return (
    <Part on={b.w <= week} w={b.w} label={b.label} className={className}>
      {children}
    </Part>
  );
}

/** Mock artefak proyek yang terbangun bertahap sesuai minggu yang ditunjuk playhead. */
function ProjectArtifact({ cohort, week }) {
  const get = (part) => cohort.build.find((b) => b.part === part);
  const stamp = get("stamp");
  return (
    <div className="relative overflow-hidden rounded-xl border border-line bg-white shadow-[0_40px_80px_-50px_rgb(14_24_48/0.7)]">
      <div className="flex items-center gap-2 border-b border-line bg-cream px-4 py-2.5">
        <span className="size-2 rounded-full bg-maroon" />
        <span className="size-2 rounded-full bg-gold" />
        <span className="size-2 rounded-full bg-navy/30" />
        <span className="ml-3 truncate text-[12px] text-text/55">{cohort.project}</span>
      </div>
      <div className="grid h-[340px] grid-cols-[88px_1fr] grid-rows-[64px_1fr_1fr] gap-3 p-4">
        <P cohort={cohort} week={week} part="nav" className="row-span-3">
          <div className="flex h-full flex-col gap-2 rounded-md bg-navy p-3">
            <span className="h-2 w-10 rounded bg-gold" />
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className={cn("h-2 rounded bg-white/25", i === 1 && "bg-white/70")} style={{ width: `${70 - i * 8}%` }} />
            ))}
            <span className="mt-auto text-[10px] leading-tight text-white/60">{get("nav")?.label}</span>
          </div>
        </P>
        {!get("nav") && <div className="row-span-3 rounded-md bg-cream-2/60" />}
        <P cohort={cohort} week={week} part="kpi">
          <div className="grid h-full grid-cols-3 gap-2">
            {[62, 18, 94].map((v, i) => (
              <div key={i} className="flex flex-col justify-between rounded-md border border-line p-2">
                <span className="text-[9.5px] text-text/50">{["Indikator", "Temuan", "Selesai"][i]}</span>
                <span className={cn("tabular font-serif text-[1.25rem] leading-none", i === 1 ? "text-maroon" : "text-navy")}>{v}{i !== 1 && "%"}</span>
              </div>
            ))}
          </div>
        </P>
        {!get("kpi") && <div className="rounded-md bg-cream-2/60" />}
        <div className="grid min-h-0 grid-cols-2 gap-3">
          <P cohort={cohort} week={week} part="chart" className="col-span-2">
            <div className="h-full rounded-md border border-line p-3">
              <svg viewBox="0 0 200 80" className="h-full w-full" preserveAspectRatio="none" aria-hidden>
                <path d="M0 70 30 52 60 58 90 34 120 40 150 18 200 10" fill="none" stroke="var(--navy)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                <path d="M0 76 30 66 60 70 90 60 120 62 150 50 200 46" fill="none" stroke="var(--gold)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
          </P>
          <P cohort={cohort} week={week} part="flow" className="col-span-2">
            <div className="flex h-full items-center justify-between gap-2 rounded-md border border-line px-3">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className="flex flex-1 items-center gap-2">
                  <span className={cn("grid h-9 flex-1 place-items-center rounded text-[9.5px]", i === 2 ? "bg-gold/25 text-navy" : "bg-cream text-text/60")}>{["Pesan", "Proses", "Kirim", "Tagih"][i]}</span>
                  {i < 3 && <span aria-hidden className="h-px w-3 bg-navy/40" />}
                </span>
              ))}
            </div>
          </P>
          {!get("chart") && !get("flow") && <div className="col-span-2 rounded-md bg-cream-2/60" />}
        </div>
        <P cohort={cohort} week={week} part="table">
          <div className="flex h-full flex-col gap-1.5 rounded-md border border-line p-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className="grid grid-cols-[1fr_2fr_1fr] gap-2">
                <span className={cn("h-2 rounded", i === 0 ? "bg-navy/60" : "bg-navy/15")} />
                <span className={cn("h-2 rounded", i === 0 ? "bg-navy/60" : "bg-navy/10")} />
                <span className={cn("h-2 rounded", i === 2 ? "bg-maroon/60" : i === 0 ? "bg-navy/60" : "bg-gold/40")} />
              </span>
            ))}
            <span className="mt-auto text-[10px] text-text/50">{get("table")?.label}</span>
          </div>
        </P>
      </div>
      {stamp && (
        <AnimatePresence>
          {week >= stamp.w && (
            <motion.div
              initial={{ opacity: 0, scale: 1.8, rotate: -24 }}
              animate={{ opacity: 1, scale: 1, rotate: -12 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 16 }}
              className="pointer-events-none absolute bottom-6 right-6 grid size-28 place-items-center rounded-full border-[3px] border-maroon text-center text-maroon"
            >
              <span className="px-3 font-serif text-[15px] leading-tight">{stamp.label}</span>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

/** Pita minggu + playhead emas yang diseret (pointer) atau digeser (←/→, Home/End). */
function WeekRibbon({ weeks, week, onWeek }) {
  const track = useRef(null);
  const handle = useRef(null);
  const dragging = useRef(false);
  const hinted = useRef(false);
  const reduce = useReducedMotion();

  const fromX = (clientX) => {
    const r = track.current.getBoundingClientRect();
    const t = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    return Math.min(weeks, Math.floor(t * weeks) + 1);
  };

  // isyarat seret sekali saat terlihat
  useEffect(() => {
    const el = handle.current;
    if (!el || prefersReducedMotion()) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || hinted.current) return;
      hinted.current = true;
      io.disconnect();
      animate(el, { translateX: [0, 14, -6, 0], duration: 1100, delay: 500, ease: "inOutSine" });
    }, { threshold: 0.8 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onKey = (e) => {
    const map = { ArrowRight: week + 1, ArrowUp: week + 1, ArrowLeft: week - 1, ArrowDown: week - 1, Home: 1, End: weeks };
    if (!(e.key in map)) return;
    e.preventDefault();
    onWeek(Math.min(weeks, Math.max(1, map[e.key])));
  };

  const pct = ((week - 0.5) / weeks) * 100;
  return (
    <div
      ref={track}
      className="relative select-none touch-none pb-2 pt-10"
      onPointerDown={(e) => {
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        onWeek(fromX(e.clientX));
      }}
      onPointerMove={(e) => dragging.current && onWeek(fromX(e.clientX))}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
    >
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))` }}>
        {Array.from({ length: weeks }, (_, i) => (
          <div key={i} className="flex cursor-pointer flex-col items-center gap-2">
            <span className={cn("h-10 w-full rounded-md transition-colors duration-300", i < week ? "bg-navy" : "bg-cream-2")} />
            <span className={cn("tabular text-[11px] transition-colors", i + 1 === week ? "font-semibold text-maroon" : "text-text/45")}>M{i + 1}</span>
          </div>
        ))}
      </div>
      <motion.div
        ref={handle}
        role="slider"
        tabIndex={0}
        aria-label="Minggu ke"
        aria-valuemin={1}
        aria-valuemax={weeks}
        aria-valuenow={week}
        aria-valuetext={`Minggu ${week} dari ${weeks}`}
        onKeyDown={onKey}
        animate={{ left: `${pct}%` }}
        transition={reduce ? { duration: 0 } : spring}
        className="absolute top-0 z-10 -ml-[22px] flex w-11 cursor-grab flex-col items-center outline-none active:cursor-grabbing [&:focus-visible>span:first-child]:ring-2 [&:focus-visible>span:first-child]:ring-maroon/50"
      >
        <span className="grid h-7 w-11 place-items-center rounded-md bg-gold text-[12px] font-bold text-navy shadow-[0_8px_18px_-8px_rgb(201_162_39/0.9)]">{week}</span>
        <span className="h-12 w-[3px] rounded-full bg-gold" />
      </motion.div>
    </div>
  );
}

/** Ponsel/reduced-motion: stepper vertikal (pola 21st Onboarding Timeline) — selesai · berjalan · akan datang. */
function WeekStepper({ cohort, week, onWeek }) {
  return (
    <ol className="relative mt-8 space-y-1 border-l-2 border-line pl-6 md:hidden">
      {cohort.plan.map((p, i) => {
        const n = i + 1;
        const state = n < week ? "done" : n === week ? "now" : "next";
        return (
          <li key={n} className="relative">
            <span
              aria-hidden
              className={cn(
                "absolute -left-[33px] top-3 grid size-4 place-items-center rounded-full border-2",
                state === "done" ? "border-navy bg-navy" : state === "now" ? "border-gold bg-gold" : "border-line bg-white"
              )}
            />
            <button type="button" onClick={() => onWeek(n)} aria-current={state === "now" ? "step" : undefined} className="w-full rounded-md py-2 text-left">
              <span className="kicker text-[10px] text-text/45">Minggu {n} · {state === "done" ? "selesai" : state === "now" ? "sedang dibahas" : "akan datang"}</span>
              <span className={cn("block font-serif text-[1.1rem] leading-snug", state === "next" ? "text-text/55" : "text-navy")}>{p.t}</span>
              {state === "now" && <span className="mt-1 block text-[14px] leading-relaxed text-text/65">Kamu sudah bisa {p.can}.</span>}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Silabus `#silabus` untuk kohort aktif: seret playhead emas di pita minggu; kanan artefak proyek terbangun bertahap
 * dan kalimat "Di minggu N kamu sudah bisa …" berganti. Hanya tampil di mode Bootcamp.
 */
export function SyllabusPlayhead() {
  const { mode, active, bootcamps, setCohort } = useBootcamp();
  const [week, setWeek] = useState(1);
  useEffect(() => setWeek(Math.min(3, active.weeks)), [active.slug, active.weeks]);
  if (mode !== "bootcamp") return null;
  const cur = active.plan[week - 1];

  return (
    <section id="silabus" className="relative scroll-mt-24 border-t border-line bg-cream py-16 md:py-24">
      <Container>
        <SectionHeader
          title={["Seret minggunya,", "lihat proyekmu tumbuh"]}
          body={`Pilih kohort, lalu geser penanda emas. Artefak di kanan adalah proyek akhir ${active.title} di minggu itu.`}
          action={
            <div role="tablist" aria-label="Kohort" className="flex flex-wrap gap-x-5 gap-y-2">
              {bootcamps.map((b) => (
                <button key={b.slug} type="button" role="tab" aria-selected={b.slug === active.slug} onClick={() => setCohort(b.slug)} className={cn("text-[14.5px] font-semibold transition-colors", b.slug === active.slug ? "text-maroon" : "text-text/50 hover:text-navy")}>
                  <span className={b.slug === active.slug ? "u-gold" : undefined}>{b.title}</span>
                </button>
              ))}
            </div>
          }
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-14">
          <div>
            <div className="hidden md:block">
              <WeekRibbon weeks={active.weeks} week={week} onWeek={setWeek} />
            </div>
            <div className="mt-8 hidden min-h-[11rem] md:block" aria-live="polite">
              <AnimatePresence mode="wait">
                <motion.div key={`${active.slug}-${week}`} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.3 }}>
                  <span className="kicker text-[11px] text-maroon">Minggu {week} dari {active.weeks}</span>
                  <h3 className="mt-2 font-serif text-[clamp(1.6rem,2.6vw,2.2rem)] leading-tight text-navy">{cur?.t}</h3>
                  <p className="mt-3 max-w-lg text-pretty text-[16.5px] leading-relaxed text-text/70">
                    Di akhir minggu ini kamu sudah bisa <em className="font-serif not-italic text-maroon">{cur?.can}</em>.
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
            <WeekStepper cohort={active} week={week} onWeek={setWeek} />
          </div>
          <ProjectArtifact cohort={active} week={week} />
        </div>
      </Container>
    </section>
  );
}
