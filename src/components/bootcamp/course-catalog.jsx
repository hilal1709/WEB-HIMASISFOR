"use client";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { FILTERS, LEVELS, TRACKS } from "@/lib/bootcamp-content";
import { Popover, PopoverContent, PopoverTrigger, PopoverClose } from "@/components/ui/popover";
import { DotsLoader, Skeleton } from "@/components/ui/loader";
import { LordIcon } from "@/components/media/lord-icon";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { cn } from "@/lib/utils";
import { CoverArt } from "./cover-art";
import { useBootcamp } from "./bootcamp-provider";

/** Satu isian kalimat: kata bergaris bawah emas → Popover pilihan (shadcn), pilihan aktif bertanda titik maroon. */
function Blank({ name, value, onChange, label }) {
  const options = FILTERS[name];
  const current = options.find((o) => o.key === value) ?? options[0];
  return (
    <Popover>
      <PopoverTrigger
        aria-label={`${label}: ${current.label}. Ubah`}
        className="group relative mx-1 inline-flex items-baseline gap-1 rounded-sm font-serif italic text-maroon outline-none focus-visible:ring-2 focus-visible:ring-maroon/40"
      >
        <motion.span key={current.key} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          {current.label}
        </motion.span>
        <svg aria-hidden viewBox="0 0 12 12" className="size-3 translate-y-[-0.1em] self-center text-gold transition-transform duration-300 group-data-[state=open]:rotate-180">
          <path d="M2.5 4.5L6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span aria-hidden className="absolute inset-x-0 -bottom-0.5 h-[3px] origin-left rounded-full bg-gold transition-transform duration-300 group-hover:scale-x-105" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64">
        <p className="kicker px-2 pb-1.5 pt-1 text-[10.5px] text-text/50">{label}</p>
        <ul role="listbox" aria-label={label}>
          {options.map((o) => (
            <li key={o.key}>
              <PopoverClose asChild>
                <button
                  type="button"
                  role="option"
                  aria-selected={o.key === value}
                  onClick={() => onChange(o.key)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-md px-2.5 py-2 text-left text-[14.5px] transition-colors hover:bg-cream focus-visible:bg-cream focus-visible:outline-none",
                    o.key === value ? "font-semibold text-navy" : "text-text/75"
                  )}
                >
                  {o.label}
                  {o.key === value && <span aria-hidden className="size-1.5 rounded-full bg-maroon" />}
                </button>
              </PopoverClose>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

/** Filter kalimat (mad-libs): "Aku mau belajar [topik] sekitar [jam] per minggu, mulai dari level [level]." */
export function SentenceFilter() {
  const { filter, setFilter, filtered, busy, resetFilter, courses } = useBootcamp();
  const dirty = filter.topic !== "all" || filter.pace !== "all" || filter.level !== "all";
  return (
    <div className="flex flex-col gap-6 border-b border-line pb-10 lg:flex-row lg:items-end lg:justify-between">
      <p className="max-w-4xl text-balance font-serif text-[clamp(1.6rem,3.2vw,2.6rem)] leading-[1.25] text-navy">
        Aku mau belajar <Blank name="topic" label="Topik" value={filter.topic} onChange={(v) => setFilter({ topic: v })} />
        sekitar <Blank name="pace" label="Waktu per minggu" value={filter.pace} onChange={(v) => setFilter({ pace: v })} />
        per minggu, mulai dari <Blank name="level" label="Level" value={filter.level} onChange={(v) => setFilter({ level: v })} />.
      </p>
      <div className="flex shrink-0 items-center gap-4 text-[14px] text-text/60" aria-live="polite">
        {busy ? (
          <DotsLoader className="text-maroon" />
        ) : (
          <span>
            <b className="tabular font-semibold text-navy">{filtered.length}</b> dari {courses.length} kursus
          </span>
        )}
        {dirty && (
          <button type="button" onClick={resetFilter} className="font-semibold text-maroon">
            <span className="u-gold">Atur ulang</span>
          </button>
        )}
      </div>
    </div>
  );
}

function CourseCard({ c }) {
  const { openCourse, inPlan, togglePlan } = useBootcamp();
  const on = inPlan(c.slug);
  const level = LEVELS.find((l) => l.key === c.level)?.label;
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white transition-[border-color,box-shadow,transform] duration-500 ease-cinematic hover:-translate-y-1 hover:border-navy/25 hover:shadow-[0_30px_60px_-38px_rgb(14_24_48/0.6)]">
      <button type="button" onClick={() => openCourse(c.slug)} className="relative block bg-cream-2/70 px-6 pb-4 pt-6 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-maroon/40" aria-label={`Lihat pelajaran ${c.title}`}>
        <span className="absolute left-4 top-4 rounded bg-white/90 px-2 py-0.5 text-[11px] font-medium text-navy">{TRACKS[c.topic]?.short}</span>
        <span className="absolute right-4 top-4 flex items-center gap-1 rounded bg-navy px-2 py-0.5 text-[11px] font-medium text-gold-soft">
          <span aria-hidden className="size-1.5 rounded-full bg-gold" />
          Bersertifikat
        </span>
        <span className="block transition-transform duration-700 ease-cinematic group-hover:scale-[1.04]">
          <CoverArt topic={c.topic} slug={c.slug} />
        </span>
      </button>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-serif text-[1.3rem] leading-snug text-navy">
          <button type="button" onClick={() => openCourse(c.slug)} className="text-left outline-none focus-visible:underline">
            {c.title}
          </button>
        </h3>
        <p className="mt-2 text-[13.5px] text-text/60">
          {c.lessons.length} pelajaran · {c.hours} jam · {level}
        </p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-6">
          <span className="text-[12.5px] text-text/50">±{c.perWeek} jam/minggu</span>
          <button
            type="button"
            onClick={() => togglePlan(c.slug)}
            aria-pressed={on}
            className={cn(
              "group/btn inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-semibold transition-[background-color,border-color,color,transform] duration-300 active:scale-[0.96]",
              on ? "border-navy bg-navy text-white" : "border-line text-navy hover:border-navy"
            )}
          >
            <LordIcon key={on ? "on" : "off"} name={on ? "check" : "plus-circle"} size={18} trigger={on ? "once" : "hover"} target=".group\/btn" colors={on ? "primary:#ffffff,secondary:#c9a227" : "primary:#14213d,secondary:#6e1423"} />
            {on ? "Di rencana" : "Rencana"}
          </button>
        </div>
      </div>
    </article>
  );
}

/** Grid kursus: susun ulang dengan `motion` layout + AnimatePresence; Skeleton saat filter berubah; kosong → Lottie. */
export function CourseGrid() {
  const { filtered, busy, resetFilter } = useBootcamp();
  const reduce = useReducedMotion();

  if (busy)
    return (
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
        {Array.from({ length: Math.max(3, Math.min(filtered.length, 6)) }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-line">
            <Skeleton className="h-44 rounded-none" />
            <div className="space-y-3 p-6">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );

  if (!filtered.length)
    return (
      <div className="mt-10 flex flex-col items-center rounded-xl border border-dashed border-line px-6 py-14 text-center">
        <LottieIllustration src="/lottie/empty-news.json" label="Belum ada kursus yang cocok" className="size-36" />
        <p className="mt-4 font-serif text-[1.35rem] text-navy">Belum ada kursus yang pas dengan kalimat itu</p>
        <p className="mt-2 max-w-sm text-[14.5px] text-text/60">Longgarkan salah satu isian — misalnya waktu per minggu — atau mulai dari awal.</p>
        <button type="button" onClick={resetFilter} className="mt-6 inline-flex h-11 items-center rounded-md bg-maroon px-5 text-[14.5px] font-semibold text-white transition-colors hover:bg-maroon-deep">
          Tampilkan semua kursus
        </button>
      </div>
    );

  return (
    <motion.ul layout={!reduce} className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence initial={false}>
        {filtered.map((c, i) => (
          <motion.li
            key={c.slug}
            layout={!reduce}
            initial={reduce ? false : { opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.4, delay: reduce ? 0 : Math.min(i, 6) * 0.04, ease: [0.22, 1, 0.36, 1] }}
          >
            <CourseCard c={c} />
          </motion.li>
        ))}
      </AnimatePresence>
    </motion.ul>
  );
}
