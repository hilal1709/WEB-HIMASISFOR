"use client";
import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { motion, useReducedMotion } from "motion/react";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { useToast } from "@/components/ui/toast";
import { Container, PlaceholderTag, SectionHeader } from "@/components/home/shared";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { cn } from "@/lib/utils";
import { useJalur } from "./jalur-provider";

const R = 74;
const C = 2 * Math.PI * R;

/**
 * "Cek kesiapanku" — pilih jalur (segmented, latar navy meluncur via motion `layoutId`), lalu centang
 * kesiapan. Centang = status "sudah" yang nyata, digambar ulang tiap kali dicentang. Cincin emas & angka
 * (anime.js) mengikuti persentase; tersimpan per jalur di localStorage. 100% → toast + buka ringkasan jalur;
 * "Mulai ulang" → toast dengan "Batalkan".
 */
export function ReadinessCheck() {
  const { paths, active, setActive, ready, setReadyFor, openPath } = useJalur();
  const toast = useToast();
  const reduce = useReducedMotion();
  const p = paths[active];
  const list = ready[active] ?? [];
  const done = list.filter(Boolean).length;
  const pct = list.length ? Math.round((done / list.length) * 100) : 0;
  const num = useRef(null);
  const ring = useRef(null);
  const shown = useRef(0);
  // salinan terbaru agar klik beruntun tidak membaca state lama
  const latest = useRef(ready);
  latest.current = ready;

  useEffect(() => {
    const el = num.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.textContent = String(pct);
      shown.current = pct;
      return;
    }
    const o = { v: shown.current };
    const a = animate(o, {
      v: pct,
      duration: 700,
      ease: "outExpo",
      onUpdate: () => {
        shown.current = Math.round(o.v);
        el.textContent = String(shown.current);
      },
    });
    return () => a.pause?.();
  }, [pct]);

  const toggle = (i) => {
    const cur = latest.current[active] ?? [];
    const next = cur.map((v, k) => (k === i ? !v : v));
    latest.current = latest.current.map((r, k) => (k === active ? next : r));
    setReadyFor(active, next);
    if (!prefersReducedMotion() && ring.current) gsap.fromTo(ring.current, { scale: 0.96 }, { scale: 1, duration: 0.6, ease: "elastic.out(1, 0.5)" });
    if (next.every(Boolean) && !cur.every(Boolean)) {
      toast.success(`Kamu siap menempuh jalur ${p.title}`, {
        description: "Bawa daftar ini saat menemui calon pembimbing.",
        action: { label: "Lihat tahapan", onClick: () => openPath(active) },
      });
    }
  };

  const reset = () => {
    const prev = list;
    setReadyFor(active, list.map(() => false));
    toast.info(`Daftar kesiapan ${p.title} dikosongkan`, { action: { label: "Batalkan", onClick: () => setReadyFor(active, prev) } });
  };

  const verdict = pct === 100 ? "Siap berangkat." : pct >= 60 ? "Hampir siap." : pct > 0 ? "Masih ada yang perlu disiapkan." : "Mulai dari butir yang sudah pasti.";

  return (
    <section id="kesiapan" className="relative scroll-mt-20 py-16 md:py-24">
      <Container>
        <SectionHeader title={["Cek", "kesiapanku"]} body="Centang yang sudah benar-benar kamu punya. Jawabanmu hanya tersimpan di perangkat ini." />

        <div className="mt-10 flex gap-1 overflow-x-auto rounded-lg border border-line bg-white p-1 sm:inline-flex" role="tablist" aria-label="Jalur yang dicek" onKeyDown={(e) => {
          if (e.key === "ArrowRight") setActive((active + 1) % paths.length);
          if (e.key === "ArrowLeft") setActive((active - 1 + paths.length) % paths.length);
        }}>
          {paths.map((x, i) => {
            const d = (ready[i] ?? []).filter(Boolean).length;
            return (
              <button
                key={x.key}
                type="button"
                role="tab"
                aria-selected={i === active}
                tabIndex={i === active ? 0 : -1}
                onClick={() => setActive(i)}
                className="relative flex-1 rounded-md px-4 py-2 text-[14.5px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-gold/60 sm:flex-none"
              >
                {i === active && <motion.span layoutId="jk-seg" className="absolute inset-0 rounded-md bg-navy" transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }} />}
                <span className={cn("relative z-10 inline-flex items-center gap-2 transition-colors duration-300", i === active ? "text-white" : "text-navy/70")}>
                  {x.title}
                  {d > 0 && <span className={cn("tabular text-[11.5px]", i === active ? "text-gold-soft" : "text-text/40")}>{d}/{x.ready.length}</span>}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[340px_1fr] lg:gap-12">
          {/* cincin */}
          <div className="flex flex-col items-center rounded-2xl border border-line bg-white p-7 text-center lg:sticky lg:top-24 lg:self-start">
            <div ref={ring} className="relative size-[180px]">
              <svg viewBox="0 0 180 180" className="size-full -rotate-90" aria-hidden>
                <circle cx="90" cy="90" r={R} fill="none" stroke="var(--cream-2)" strokeWidth="10" />
                <circle
                  cx="90"
                  cy="90"
                  r={R}
                  fill="none"
                  stroke="var(--gold)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={C * (1 - pct / 100)}
                  className="transition-[stroke-dashoffset] duration-700 ease-cinematic"
                />
              </svg>
              <div className="absolute inset-0 grid place-items-center">
                <p className="font-serif text-navy">
                  <span ref={num} className="tabular text-[3rem] leading-none">0</span>
                  <span className="text-[1.3rem] text-text/45">%</span>
                </p>
              </div>
            </div>
            <p className="mt-5 font-serif text-[1.25rem] text-navy" aria-live="polite">{verdict}</p>
            <p className="mt-1 text-[13.5px] text-text/50">
              {done} dari {list.length} butir untuk jalur {p.title}
            </p>
            <div className={cn("mt-5 w-28 transition-opacity duration-500", pct === 100 ? "opacity-100" : "opacity-40")}>
              <LottieIllustration src="/lottie/grad-cap.json" label="Ilustrasi toga" />
            </div>
            <button type="button" onClick={reset} disabled={done === 0} className="mt-4 text-[13.5px] font-semibold text-maroon disabled:pointer-events-none disabled:opacity-30">
              <span className="u-gold">Mulai ulang</span>
            </button>
          </div>

          {/* daftar */}
          <div>
            <ul key={p.key} className="space-y-2.5">
              {p.ready.map((item, i) => {
                const on = !!list[i];
                return (
                  <li key={item} className="animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-both duration-500" style={{ animationDelay: `${i * 60}ms` }}>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={on}
                      onClick={() => toggle(i)}
                      className={cn(
                        "group flex w-full items-center gap-4 rounded-xl border px-5 py-4 text-left transition-[background-color,border-color,transform] duration-300 ease-cinematic active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60",
                        on ? "border-navy bg-navy text-white" : "border-line bg-white text-navy hover:border-navy/30"
                      )}
                    >
                      <span className={cn("grid size-7 shrink-0 place-items-center rounded-md border-2 transition-colors duration-300", on ? "border-gold bg-gold" : "border-navy/25 group-hover:border-navy/50")}>
                        <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
                          <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="var(--navy)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" pathLength="1" className={cn("jk-tick", on && "jk-tick-on")} />
                        </svg>
                      </span>
                      <span className="flex-1 text-[15.5px] leading-snug">{item}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {p.sample && <PlaceholderTag className="mt-5" />}
          </div>
        </div>
      </Container>
    </section>
  );
}
