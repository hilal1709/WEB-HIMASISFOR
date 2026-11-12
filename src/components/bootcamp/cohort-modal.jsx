"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { TRACKS, fmtRp } from "@/lib/bootcamp-content";
import { Modal, ModalClose, ModalContent, ModalTitle, ModalDescription } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { PlaceholderTag } from "@/components/home/shared";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { useBootcamp } from "./bootcamp-provider";

const TABS = [
  { key: "ringkas", label: "Ringkas" },
  { key: "jadwal", label: "Jadwal" },
  { key: "syarat", label: "Syarat" },
];
const fmt = (d) => new Date(`${d}T00:00:00+07:00`).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

/** Modal kohort: kepala maroon + Lottie, tab Ringkas · Jadwal · Syarat, Daftar, ‹ › + panah keyboard. */
export function CohortModal({ slug, onSlug, onClose }) {
  const { bootcamps, tiers } = useBootcamp();
  const toast = useToast();
  const [tab, setTab] = useState("ringkas");
  const [loading, setLoading] = useState(false);
  const idx = bootcamps.findIndex((b) => b.slug === slug);
  const b = bootcamps[idx];
  const price = tiers.find((t) => t.key === "bootcamp")?.prices;

  useEffect(() => setTab("ringkas"), [slug]);
  useEffect(() => {
    if (b) history.replaceState(null, "", `#bootcamp-${b.slug}`);
  }, [b]);

  const step = (d) => onSlug(bootcamps[(idx + d + bootcamps.length) % bootcamps.length].slug);

  const register = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (b.href) {
        window.open(b.href, "_blank", "noopener");
        toast.success("Formulir pendaftaran dibuka", { description: `${b.title} · tab baru` });
      } else {
        toast.info("Formulir menyusul", { description: "Tautan pendaftaran diumumkan lewat banner di halaman ini." });
      }
    }, 600);
  };

  return (
    <Modal open={!!b} onOpenChange={(o) => !o && onClose()}>
      <ModalContent
        hideClose
        className="max-w-2xl p-0"
        onKeyDown={(e) => {
          if (e.target.closest?.("[role=tablist]")) return;
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
      >
        {b && (
          <>
            <div className="relative overflow-hidden bg-maroon px-7 pb-7 pt-9 text-white">
              <LottieIllustration src={TRACKS[b.track]?.lottie} className="pointer-events-none absolute right-10 top-2 size-28 opacity-90" />
              <ModalClose aria-label="Tutup" className="absolute right-4 top-4 grid size-8 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
                <svg aria-hidden viewBox="0 0 16 16" className="size-4">
                  <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </ModalClose>
              <span className="kicker text-[10.5px] text-gold-soft">{TRACKS[b.track]?.label}</span>
              <ModalTitle className="mt-2 max-w-[18ch] text-[1.9rem] leading-tight text-white">{b.title}</ModalTitle>
              <ModalDescription className="mt-2 max-w-md text-white/70">{b.lead}</ModalDescription>
              <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-[13px] text-white/65">
                <span><b className="font-semibold text-white">{fmt(b.start)}</b> mulai</span>
                <span><b className="font-semibold text-white">{b.weeks} × {b.hours} jam</b></span>
                <span><b className="font-semibold text-gold-soft">{b.seatsLeft}</b> kursi tersisa</span>
              </div>
            </div>

            <div role="tablist" aria-label="Detail kohort" className="flex gap-6 border-b border-line px-7">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  role="tab"
                  type="button"
                  aria-selected={tab === t.key}
                  onClick={() => setTab(t.key)}
                  className={cn("relative py-3.5 text-[14px] font-semibold transition-colors", tab === t.key ? "text-navy" : "text-text/50 hover:text-navy")}
                >
                  {t.label}
                  {tab === t.key && <motion.span layoutId="bc-modal-tab" className="absolute inset-x-0 -bottom-px h-[3px] bg-gold" />}
                </button>
              ))}
            </div>

            <div className="max-h-[46vh] overflow-y-auto px-7 py-6">
              <AnimatePresence mode="wait">
                <motion.div key={`${b.slug}-${tab}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }}>
                  {tab === "ringkas" && (
                    <dl className="divide-y divide-line">
                      {[
                        ["Proyek akhir", b.project],
                        ["Format", b.format],
                        ["Perkiraan konversi", `±${b.sks} SKS`],
                        ["Biaya mahasiswa UISI", fmtRp(price?.mahasiswa)],
                      ].map(([k, v]) => (
                        <div key={k} className="flex items-baseline justify-between gap-6 py-3 text-[14.5px]">
                          <dt className="text-text/60">{k}</dt>
                          <dd className="text-right font-semibold text-navy">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  {tab === "jadwal" && (
                    <ol className="space-y-3">
                      {b.plan.map((p, i) => (
                        <li key={i} className="grid grid-cols-[3rem_1fr] gap-3 text-[14.5px]">
                          <span className="tabular font-serif text-[1.05rem] text-gold">M{i + 1}</span>
                          <span className="text-navy">{p.t}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                  {tab === "syarat" && (
                    <ul className="space-y-3">
                      {b.needs.map((n) => (
                        <li key={n} className="flex gap-3 text-[14.5px] text-text/75">
                          <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-maroon" />
                          {n}
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              </AnimatePresence>
              {b.sample && <PlaceholderTag className="mt-5" />}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-line px-7 py-4">
              <div className="flex gap-2">
                {[-1, 1].map((d) => (
                  <button key={d} type="button" onClick={() => step(d)} aria-label={d < 0 ? "Kohort sebelumnya" : "Kohort berikutnya"} className="grid size-9 place-items-center rounded-full border border-line text-navy transition-colors hover:border-navy">
                    <svg aria-hidden viewBox="0 0 16 16" className={cn("size-3.5", d < 0 && "rotate-180")}>
                      <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                ))}
              </div>
              <Button variant="brand" loading={loading} onClick={register}>
                Daftar kohort
              </Button>
            </div>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
