"use client";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { TRACKS, WEEKLY_LIMIT } from "@/lib/bootcamp-content";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Banner } from "@/components/ui/banner";
import { CoverArt } from "./cover-art";
import { useBootcamp } from "./bootcamp-provider";

/** Satu ikon dok: membesar sesuai jarak ke kursor (pola Aceternity Floating Dock). */
function DockItem({ c, mouseX, onOpen }) {
  const ref = useRef(null);
  const dist = useTransform(mouseX, (v) => {
    const r = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return v - r.x - r.width / 2;
  });
  const size = useSpring(useTransform(dist, [-140, 0, 140], [44, 72, 44]), { mass: 0.1, stiffness: 160, damping: 13 });
  const [tip, setTip] = useState(false);
  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={() => onOpen(c.slug)}
      onPointerEnter={() => setTip(true)}
      onPointerLeave={() => setTip(false)}
      onFocus={() => setTip(true)}
      onBlur={() => setTip(false)}
      aria-label={`${c.title}, ${c.hours} jam`}
      style={{ width: size, height: size }}
      className="relative grid shrink-0 place-items-center rounded-full border border-line bg-cream-2 outline-none focus-visible:ring-2 focus-visible:ring-gold"
    >
      <AnimatePresence>
        {tip && (
          <motion.span
            initial={{ opacity: 0, y: 8, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 4, x: "-50%" }}
            className="pointer-events-none absolute -top-9 left-1/2 whitespace-nowrap rounded-md bg-navy px-2.5 py-1 text-[12px] text-white"
          >
            {c.title}
          </motion.span>
        )}
      </AnimatePresence>
      <span className="block w-[78%] overflow-hidden rounded-full">
        <CoverArt topic={c.topic} slug={c.slug} className="h-auto w-[140%] -translate-x-[14%] text-navy" />
      </span>
    </motion.button>
  );
}

/**
 * Dok melayang "Rencana belajarmu": muncul setelah ada kursus di rencana. ≥ md: ikon sampul membesar saat didekati
 * kursor; ponsel: bilah ringkas. Klik ringkasan → lembar bawah berisi daftar rencana (hapus → toast + Batalkan).
 */
export function PlanDock() {
  const { planCourses, planHours, planWeekly, planWeeks, overload, togglePlan, clearPlan, openCourse } = useBootcamp();
  const reduce = useReducedMotion();
  const mouseX = useMotionValue(Infinity);
  const [open, setOpen] = useState(false);
  const show = planCourses.length > 0;

  const summary = (
    <span className="flex flex-col text-left leading-tight">
      <span className="text-[13px] font-semibold text-white">{planCourses.length} kursus · {planHours} jam</span>
      <span className="text-[11.5px] text-white/60">±{planWeekly} jam/minggu · {planWeeks} minggu</span>
    </span>
  );

  return (
    <>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={reduce ? false : { y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? undefined : { y: 120, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="fixed inset-x-3 bottom-3 z-40 flex justify-center md:bottom-6"
            role="region"
            aria-label="Rencana belajarmu"
          >
            {/* ≥ md: dok */}
            <div
              onPointerMove={(e) => !reduce && mouseX.set(e.clientX)}
              onPointerLeave={() => mouseX.set(Infinity)}
              className="hidden h-[84px] items-end gap-3 rounded-2xl border border-white/10 bg-navy px-4 pb-3 shadow-[0_30px_60px_-24px_rgb(14_24_48/0.8)] md:flex"
            >
              {planCourses.slice(0, 7).map((c) => (
                <DockItem key={c.slug} c={c} mouseX={mouseX} onOpen={openCourse} />
              ))}
              {planCourses.length > 7 && <span className="mb-3 text-[12px] text-white/60">+{planCourses.length - 7}</span>}
              <span aria-hidden className="mx-1 mb-2 h-10 w-px bg-white/15" />
              <button type="button" onClick={() => setOpen(true)} className="mb-1.5 flex items-center gap-3 rounded-xl px-2 py-1.5 outline-none transition-colors hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-gold">
                {summary}
                <span className={overload ? "size-2 rounded-full bg-gold" : "size-2 rounded-full bg-white/30"} aria-hidden />
              </button>
            </div>
            {/* ponsel: bilah */}
            <button type="button" onClick={() => setOpen(true)} className="flex w-full items-center justify-between gap-3 rounded-xl bg-navy px-4 py-3 shadow-[0_20px_40px_-20px_rgb(14_24_48/0.8)] md:hidden">
              {summary}
              <span className="text-[13px] font-semibold text-gold-soft">Lihat rencana</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Sheet open={open && show} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="mx-auto w-full max-w-2xl px-6 pb-8 pt-7 sm:px-8">
          <span aria-hidden className="mx-auto mb-5 block h-1 w-10 rounded-full bg-line" />
          <SheetTitle className="font-serif text-2xl text-navy">Rencana belajarmu</SheetTitle>
          <SheetDescription className="mt-1 text-[14px] text-text/60">
            {planHours} jam total · ±{planWeekly} jam per minggu · selesai dalam sekitar {planWeeks} minggu. Tersimpan di peramban ini.
          </SheetDescription>
          {overload && (
            <Banner variant="warning" title={`Lebih dari ${WEEKLY_LIMIT} jam per minggu`} className="mt-5">
              Jalankan bergantian, bukan bersamaan — atau keluarkan satu kursus dulu.
            </Banner>
          )}
          <ul className="mt-6 divide-y divide-line border-y border-line">
            <AnimatePresence initial={false}>
              {planCourses.map((c, i) => (
                <motion.li key={c.slug} layout initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-4 py-4">
                  <span className="tabular w-6 shrink-0 font-serif text-[1.1rem] text-gold">{String(i + 1).padStart(2, "0")}</span>
                  <button type="button" onClick={() => (setOpen(false), openCourse(c.slug))} className="min-w-0 flex-1 text-left">
                    <span className="block truncate font-serif text-[1.1rem] text-navy">{c.title}</span>
                    <span className="block text-[12.5px] text-text/55">{TRACKS[c.topic]?.label} · {c.hours} jam · ±{c.perWeek} jam/minggu</span>
                  </button>
                  <button type="button" onClick={() => togglePlan(c.slug)} className="shrink-0 text-[13px] font-semibold text-maroon">
                    <span className="u-gold">Keluarkan</span>
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          <div className="mt-6 flex justify-end">
            <button type="button" onClick={() => (clearPlan(), setOpen(false))} className="text-[13.5px] font-semibold text-text/55 hover:text-maroon">
              Kosongkan rencana
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
