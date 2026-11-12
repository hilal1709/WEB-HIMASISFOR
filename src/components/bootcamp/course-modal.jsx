"use client";
import { useEffect } from "react";
import { motion } from "motion/react";
import { LEVELS, TRACKS } from "@/lib/bootcamp-content";
import { Modal, ModalContent, ModalTitle, ModalDescription } from "@/components/ui/modal";
import { LordIcon } from "@/components/media/lord-icon";
import { PlaceholderTag } from "@/components/home/shared";
import { cn } from "@/lib/utils";
import { CoverArt } from "./cover-art";
import { useBootcamp } from "./bootcamp-provider";

/** Modal kursus: sampul, daftar pelajaran (pelajaran pertama gratis dicoba), Tambah ke rencana, ‹ › dalam hasil filter. */
export function CourseModal({ slug, onSlug, onClose }) {
  const { filtered, courses, bySlug, inPlan, togglePlan } = useBootcamp();
  const c = slug ? bySlug(slug) : null;
  const list = filtered.some((x) => x.slug === slug) ? filtered : courses;
  const idx = list.findIndex((x) => x.slug === slug);
  const on = c ? inPlan(c.slug) : false;

  useEffect(() => {
    if (c) history.replaceState(null, "", `#course-${c.slug}`);
  }, [c]);

  const step = (d) => list.length > 1 && onSlug(list[(idx + d + list.length) % list.length].slug);

  return (
    <Modal open={!!c} onOpenChange={(o) => !o && onClose()}>
      <ModalContent
        className="max-w-xl p-0"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
      >
        {c && (
          <>
            <div className="bg-cream-2/70 px-10 pb-2 pt-8">
              <motion.div key={c.slug} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35 }}>
                <CoverArt topic={c.topic} slug={c.slug} className="mx-auto h-auto w-full max-w-[210px] text-navy" />
              </motion.div>
            </div>
            <div className="px-7 pb-2 pt-6">
              <span className="kicker text-[10.5px] text-maroon">{TRACKS[c.topic]?.label} · {LEVELS.find((l) => l.key === c.level)?.label}</span>
              <ModalTitle className="mt-1.5 text-[1.6rem]">{c.title}</ModalTitle>
              <ModalDescription className="mt-1">
                {c.hours} jam total · saran ±{c.perWeek} jam per minggu · sertifikat digital setelah kuis akhir
              </ModalDescription>
              <ol className="mt-5 divide-y divide-line border-y border-line">
                {c.lessons.map((l, i) => (
                  <li key={i} className="flex items-center gap-4 py-3 text-[14.5px]">
                    <span className="tabular w-5 shrink-0 text-[12px] text-text/45">{String(i + 1).padStart(2, "0")}</span>
                    <span className="min-w-0 flex-1 text-navy">{l.t}</span>
                    {i === 0 && <span className="rounded bg-gold/20 px-2 py-0.5 text-[11px] font-semibold text-navy">gratis dicoba</span>}
                    <span className="tabular shrink-0 text-[12.5px] text-text/50">{l.min} mnt</span>
                  </li>
                ))}
              </ol>
              {c.sample && <PlaceholderTag className="mt-4" />}
            </div>
            <div className="flex items-center justify-between gap-3 px-7 py-5">
              <div className="flex gap-2">
                {[-1, 1].map((d) => (
                  <button key={d} type="button" onClick={() => step(d)} aria-label={d < 0 ? "Kursus sebelumnya" : "Kursus berikutnya"} className="grid size-9 place-items-center rounded-full border border-line text-navy transition-colors hover:border-navy">
                    <svg aria-hidden viewBox="0 0 16 16" className={cn("size-3.5", d < 0 && "rotate-180")}>
                      <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => togglePlan(c.slug)}
                aria-pressed={on}
                className={cn(
                  "group inline-flex h-11 items-center gap-2 rounded-md px-5 text-[14.5px] font-semibold transition-[background-color,color,transform] duration-300 active:scale-[0.98]",
                  on ? "bg-navy text-white" : "bg-maroon text-white hover:bg-maroon-deep"
                )}
              >
                <LordIcon key={on ? "on" : "off"} name={on ? "check" : "plus-circle"} size={20} trigger={on ? "once" : "hover"} target=".group" colors="primary:#ffffff,secondary:#c9a227" />
                {on ? "Sudah di rencana" : "Tambah ke rencana"}
              </button>
            </div>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
