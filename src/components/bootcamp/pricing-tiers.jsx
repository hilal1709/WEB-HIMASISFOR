"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { animate } from "animejs";
import { AUDIENCES, fmtRp } from "@/lib/bootcamp-content";
import { prefersReducedMotion } from "@/lib/motion";
import { Container, PlaceholderTag, SectionHeader } from "@/components/home/shared";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { smoothTo, useBootcamp } from "./bootcamp-provider";

/** Harga yang berhitung ke nilai baru saat audiens berganti (anime.js). */
function Price({ value }) {
  const ref = useRef(null);
  const prev = useRef(value);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const from = prev.current;
    prev.current = value;
    if (value == null || value === 0 || from == null || from === value || prefersReducedMotion()) {
      el.textContent = fmtRp(value);
      return;
    }
    const o = { v: from };
    const a = animate(o, { v: value, duration: 700, ease: "outExpo", onUpdate: () => (el.textContent = fmtRp(Math.round(o.v / 1000) * 1000)) });
    return () => a.pause();
  }, [value]);
  return (
    <span ref={ref} className="tabular">
      {fmtRp(value)}
    </span>
  );
}

/**
 * Biaya `#biaya` (pola horizonx: sakelar audiens + tiga paket, tengah "Paling diminati").
 * Kartu tengah navy dengan garis atas emas; angka berhitung saat audiens berganti.
 */
export function PricingTiers() {
  const { tiers, setMode, openCohort, nextCohort } = useBootcamp();
  const toast = useToast();
  const reduce = useReducedMotion();
  const [aud, setAud] = useState("mahasiswa");
  const refs = useRef({});

  const choose = (t) => {
    if (t.key === "course") {
      setMode("course");
      smoothTo("katalog");
    } else if (t.key === "bootcamp") openCohort(nextCohort.slug);
    else toast.info("Kelas korporat lewat sekretariat", { description: "Ceritakan kebutuhan timmu; penawaran disusun per kelompok.", action: { label: "Ke kontak", onClick: () => smoothTo("kontak") } });
  };

  const onKey = (e) => {
    if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
    e.preventDefault();
    const i = AUDIENCES.findIndex((a) => a.key === aud);
    const next = AUDIENCES[(i + (e.key === "ArrowRight" ? 1 : -1) + AUDIENCES.length) % AUDIENCES.length].key;
    setAud(next);
    refs.current[next]?.focus();
  };

  return (
    <section id="biaya" className="relative scroll-mt-24 border-t border-line bg-white py-16 md:py-24">
      <Container>
        <SectionHeader
          align="center"
          title={["Biayanya", "tergantung siapa kamu"]}
          body="Mahasiswa aktif membayar paling sedikit; kursus mandiri gratis selama masih kuliah."
          action={
            <div role="radiogroup" aria-label="Audiens" onKeyDown={onKey} className="inline-flex rounded-full border border-line bg-cream p-1">
              {AUDIENCES.map((a) => {
                const on = aud === a.key;
                return (
                  <button
                    key={a.key}
                    ref={(el) => (refs.current[a.key] = el)}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    tabIndex={on ? 0 : -1}
                    onClick={() => setAud(a.key)}
                    className="relative rounded-full px-4 py-2 text-[14px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-maroon/40 sm:px-5"
                  >
                    {on && <motion.span layoutId="bc-aud" transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }} className="absolute inset-0 rounded-full bg-white shadow-sm" />}
                    <span className={cn("relative transition-colors", on ? "text-navy" : "text-text/55")}>{a.label}</span>
                  </button>
                );
              })}
            </div>
          }
        />

        <div className="mx-auto mt-14 grid max-w-5xl gap-5 md:grid-cols-3 md:items-stretch">
          {tiers.map((t, i) => {
            const pop = t.popular;
            return (
              <div
                key={t.key}
                data-aos="fade-up"
                data-aos-delay={i * 80}
                className={cn(
                  "relative flex flex-col rounded-xl border p-7 transition-transform duration-500 ease-cinematic hover:-translate-y-1",
                  pop ? "border-navy bg-navy text-white shadow-[0_40px_80px_-40px_rgb(14_24_48/0.85)] md:-my-4 md:py-11" : "border-line bg-white"
                )}
              >
                {pop && <span aria-hidden className="absolute inset-x-7 top-0 h-[3px] bg-gold" />}
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                  <h3 className={cn("font-serif text-[1.35rem]", pop ? "text-white" : "text-navy")}>{t.name}</h3>
                  {pop && <span className="rounded bg-gold px-2 py-0.5 text-[11px] font-semibold text-navy">Paling diminati</span>}
                </div>
                <p className={cn("mt-6 whitespace-nowrap font-serif leading-none", t.prices[aud] == null ? "text-[clamp(1.6rem,2.6vw,2rem)]" : "text-[clamp(1.8rem,3vw,2.4rem)]", pop ? "text-gold-soft" : "text-navy")}>
                  <Price value={t.prices[aud]} />
                </p>
                <p className={cn("mt-2 text-[13px]", pop ? "text-white/55" : "text-text/50")}>{t.prices[aud] == null ? "penawaran per kelompok" : t.note}</p>
                <ul className={cn("mt-7 space-y-3 border-t pt-6 text-[14px]", pop ? "border-white/12" : "border-line")}>
                  {t.items.map(([k, v]) => (
                    <li key={k} className="flex items-baseline justify-between gap-4">
                      <span className={pop ? "text-white/65" : "text-text/60"}>{k}</span>
                      <b className={cn("font-semibold", pop ? "text-white" : "text-navy")}>{v}</b>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => choose(t)}
                  className={cn(
                    "mt-8 inline-flex h-11 items-center justify-center rounded-md text-[14.5px] font-semibold transition-[background-color,color,transform] duration-300 active:scale-[0.98]",
                    pop ? "bg-gold text-navy hover:bg-gold-soft" : "border border-navy/20 text-navy hover:border-navy hover:bg-navy hover:text-white"
                  )}
                >
                  {t.key === "course" ? "Pilih kursus" : t.key === "bootcamp" ? "Daftar kohort" : "Ajukan untuk tim"}
                </button>
              </div>
            );
          })}
        </div>
        {tiers.some((t) => t.sample) && (
          <div className="mt-10 flex justify-center">
            <PlaceholderTag />
          </div>
        )}
      </Container>
    </section>
  );
}
