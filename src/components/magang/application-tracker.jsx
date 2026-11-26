"use client";
import { useRef, useState } from "react";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { Container, SectionHeader } from "@/components/home/shared";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { cn } from "@/lib/utils";
import { interpolate, titleLines } from "@/lib/magang-cms/copy";
import { DeadlineChip } from "./job-board";
import { smoothTo, useMagang } from "./magang-provider";

const SPRING = { type: "spring", stiffness: 420, damping: 34 };

function Arrow({ dir, ...props }) {
  return (
    <button
      type="button"
      className="grid size-7 place-items-center rounded border border-line text-navy transition-[background-color,border-color,color,opacity] hover:border-maroon hover:bg-maroon hover:text-white disabled:pointer-events-none disabled:opacity-25"
      {...props}
    >
      <svg aria-hidden viewBox="0 0 16 16" className="size-3.5">
        <path d={dir < 0 ? "M10 3L5 8l5 5" : "M6 3l5 5-5 5"} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function TrackCard({ job, stageIndex, onMove, onOpen, onRemove, draggable, onDragOver, onDrop, shared = false }) {
  const { stages, copy: { tracker: labels } } = useMagang();
  const reduce = useReducedMotion();
  const moved = useRef(false);
  return (
    <motion.li
      layout={!reduce}
      layoutId={shared ? `track-${job.slug}` : undefined}
      transition={SPRING}
      drag={draggable && !reduce}
      dragSnapToOrigin
      dragElastic={0.6}
      whileDrag={{ scale: 1.04, rotate: -2, zIndex: 40, boxShadow: "0 30px 50px -24px rgb(20 33 61 / 0.55)" }}
      onDragStart={() => (moved.current = true)}
      onDrag={(e) => onDragOver?.(e)}
      onDragEnd={(e) => {
        onDrop?.(e, job.slug);
        setTimeout(() => (moved.current = false), 0);
      }}
      className={cn("relative list-none rounded-lg border border-line bg-white p-3.5 shadow-[0_1px_0_rgb(31_36_48/0.04)]", draggable && "cursor-grab active:cursor-grabbing")}
    >
      <button type="button" onClick={() => !moved.current && onOpen(job.slug)} className="flex w-full items-start gap-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-gold/60">
        <span className="tabular grid size-9 shrink-0 place-items-center rounded-md bg-navy font-serif text-[0.85rem] text-gold-soft">{job.logo}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-semibold leading-snug text-navy">{job.title}</span>
          <span className="mt-0.5 block truncate text-[12.5px] text-text/55">{job.company}</span>
        </span>
      </button>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        {stageIndex < stages.length - 1 ? <DeadlineChip days={job.days} deadline={job.deadline} /> : <span className="kicker text-[10.5px] text-maroon">{labels.welcome}</span>}
        <div className="flex items-center gap-1">
          <Arrow dir={-1} disabled={stageIndex === 0} onClick={() => onMove(job.slug, stages[stageIndex - 1].key)} aria-label={interpolate(labels.back, { title: job.title, stage: stages[stageIndex - 1]?.label })} />
          <Arrow dir={1} disabled={stageIndex === stages.length - 1} onClick={() => onMove(job.slug, stages[stageIndex + 1].key)} aria-label={interpolate(labels.forward, { title: job.title, stage: stages[stageIndex + 1]?.label })} />
          <button
            type="button"
            onClick={() => onRemove(job.slug)}
            aria-label={interpolate(labels.remove, job)}
            className="ml-0.5 grid size-7 place-items-center rounded text-text/35 transition-colors hover:bg-cream hover:text-maroon"
          >
            <svg aria-hidden viewBox="0 0 16 16" className="size-3.5">
              <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </motion.li>
  );
}

const colAt = (e) => {
  const x = e.clientX ?? e.changedTouches?.[0]?.clientX;
  const y = e.clientY ?? e.changedTouches?.[0]?.clientY;
  if (x == null) return null;
  return document.elementsFromPoint(x, y).find((el) => el.dataset?.col)?.dataset.col ?? null;
};

/**
 * Jejak lamaran (`#jejak`) — pelacak pribadi (pola 21st.dev "Tracker Card" / kanban). Kartu masuk dari tombol Simpan
 * di papan lowongan; ≥ lg: empat kolom, kartu bisa diseret antarkolom (motion drag, kolom tujuan menyala) atau
 * dipindah dengan ‹ ›; perpindahan memakai pegas `layout`. Ponsel: segmented tahap + daftar.
 * Data hanya di perangkat ini (localStorage).
 */
export function ApplicationTracker() {
  const { jobs, track, moveTo, toggleSave, openJob, stages, visible, copy: { tracker: labels } } = useMagang();
  const [over, setOver] = useState(null);
  const [tab, setTab] = useState("simpan");
  const items = jobs.filter((j) => track[j.slug]);
  const byStage = Object.fromEntries(stages.map((s) => [s.key, items.filter((j) => track[j.slug] === s.key)]));
  const total = items.length;

  const drop = (e, slug) => {
    const col = colAt(e);
    setOver(null);
    if (col && col !== track[slug]) moveTo(slug, col);
  };

  return (
    <section id="jejak" className="scroll-mt-20 bg-white py-20 md:py-20">
      <Container>
        <SectionHeader
          title={titleLines(labels.title)}
          body={labels.body}
          action={
            total > 0 ? (
              <p className="tabular text-[14px] text-text/60">
                {interpolate(labels.watched, { count: total })}
                {byStage.diterima.length > 0 && <span className="ml-2 rounded bg-gold/25 px-2 py-0.5 text-[12px] font-semibold text-maroon">{interpolate(labels.accepted, { count: byStage.diterima.length })}</span>}
              </p>
            ) : null
          }
        />

        {total === 0 ? (
          <div className="mt-12 grid items-center gap-8 rounded-2xl border border-dashed border-navy/20 bg-cream/60 p-8 sm:grid-cols-[180px_1fr] sm:p-10" data-aos="fade-up">
            {labels.illustration && <span className="mx-auto size-40 sm:size-44">
              <LottieIllustration src={labels.illustration} label={labels.illustrationAlt} />
            </span>}
            <div>
              <p className="font-serif text-[1.6rem] leading-tight text-navy">{labels.empty}</p>
              <p className="mt-2 max-w-md text-[15px] leading-relaxed text-text/65">
                {interpolate(labels.emptyBody, { saved: stages[0].label, accepted: stages.at(-1).label })}
              </p>
              {visible("jobs") && labels.emptyLink && <button
                type="button"
                onClick={() => smoothTo("lowongan")}
                className="group mt-5 inline-flex h-11 items-center gap-2 rounded-md bg-maroon px-5 text-[14.5px] font-semibold text-white transition-colors hover:bg-maroon-deep"
              >
                {labels.emptyLink}
                <svg aria-hidden viewBox="0 0 16 16" className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5">
                  <path d="M8 13V3M4 7l4-4 4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>}
            </div>
          </div>
        ) : (
          <LayoutGroup id="jejak">
            {/* ≥ lg: kanban */}
            <div className="mt-12 hidden grid-cols-4 gap-4 lg:grid">
              {stages.map((s, si) => {
                const list = byStage[s.key];
                const last = si === stages.length - 1;
                return (
                  <div
                    key={s.key}
                    data-col={s.key}
                    className={cn(
                      "flex min-h-[320px] flex-col rounded-xl border p-3 transition-[background-color,border-color,box-shadow] duration-300",
                      over === s.key ? "border-gold bg-gold/10 shadow-[inset_0_0_0_1px_var(--gold)]" : last ? "border-gold/40 bg-cream" : "border-line bg-cream/60"
                    )}
                  >
                    <div data-col={s.key} className="flex items-center justify-between px-1 pb-3">
                      <p data-col={s.key} className="flex items-center gap-2 text-[13px] font-semibold text-navy">
                        <span aria-hidden className={cn("size-2 rounded-full", last ? "bg-gold" : si === 0 ? "bg-navy/30" : "bg-maroon")} />
                        {s.label}
                      </p>
                      <span key={list.length} className="tabular rounded bg-white px-1.5 text-[12px] font-bold text-text/60 animate-in zoom-in-75 duration-300">{list.length}</span>
                    </div>
                    <ul data-col={s.key} className="flex flex-1 flex-col gap-2.5">
                      {list.map((j) => (
                        <TrackCard
                          key={j.slug}
                          job={j}
                          stageIndex={si}
                          draggable
                          shared
                          onMove={moveTo}
                          onOpen={openJob}
                          onRemove={toggleSave}
                          onDragOver={(e) => setOver(colAt(e))}
                          onDrop={drop}
                        />
                      ))}
                      {list.length === 0 && (
                        <li data-col={s.key} className="grid flex-1 place-items-center rounded-lg border border-dashed border-navy/15 px-4 text-center text-[12.5px] text-text/40">
                          {labels.drop}
                        </li>
                      )}
                    </ul>
                  </div>
                );
              })}
            </div>

            {/* ponsel: segmented + daftar */}
            <div className="mt-10 lg:hidden">
              <div role="tablist" aria-label={labels.stageLabel} className="relative grid grid-cols-4 gap-1 rounded-lg border border-line bg-cream p-1">
                {stages.map((s) => {
                  const on = tab === s.key;
                  return (
                    <button
                      key={s.key}
                      type="button"
                      role="tab"
                      aria-selected={on}
                      onClick={() => setTab(s.key)}
                      className={cn("relative h-10 rounded-md text-[12.5px] font-semibold transition-colors", on ? "text-white" : "text-navy")}
                    >
                      {on && <motion.span layoutId="jejak-seg" transition={SPRING} className="absolute inset-0 rounded-md bg-navy" />}
                      <span className="relative">
                        {s.label} <span className={cn("tabular", on ? "text-gold-soft" : "text-text/45")}>{byStage[s.key].length}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
              <ul className="mt-4 flex flex-col gap-2.5" role="tabpanel">
                {byStage[tab].map((j) => (
                  <TrackCard key={j.slug} job={j} stageIndex={stages.findIndex((s) => s.key === tab)} onMove={moveTo} onOpen={openJob} onRemove={toggleSave} />
                ))}
                {byStage[tab].length === 0 && (
                  <li className="rounded-lg border border-dashed border-navy/15 px-4 py-8 text-center text-[13.5px] text-text/45">{labels.emptyStage}</li>
                )}
              </ul>
            </div>
          </LayoutGroup>
        )}
      </Container>
    </section>
  );
}
