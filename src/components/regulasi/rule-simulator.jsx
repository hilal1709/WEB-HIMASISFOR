"use client";
import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { GRADES, PREDIKAT, SKS_RULES, gradeFor, predikatFor, sksFor } from "@/lib/regulasi-content";
import { prefersReducedMotion } from "@/lib/motion";
import { Container, PlaceholderTag, SectionHeader } from "@/components/home/shared";
import { SpotlightCard } from "@/components/aceternity/spotlight-card";
import { cn } from "@/lib/utils";
import { useRegulasi } from "./regulasi-provider";

const dec = (v, d = 2) => Number(v).toLocaleString("id-ID", { minimumFractionDigits: d, maximumFractionDigits: d });

/** Slider tanpa gradien: track & isi digambar elemen terpisah, thumb emas (`.bk-range`). */
function Range({ value, min, max, step, onChange, label, format }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between text-[13px] text-white/60">
        <span>{label}</span>
        <output className="tabular font-serif text-[1.35rem] text-white">{format(value)}</output>
      </div>
      <div className="relative mt-2 h-7">
        <span aria-hidden className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-white/15" />
        <span aria-hidden className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gold" style={{ width: `${pct}%` }} />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={label}
          aria-valuetext={format(value)}
          className="bk-range absolute inset-0"
        />
      </div>
    </div>
  );
}

/** Angka yang "berputar" ke nilai baru (anime.js). */
function RollNumber({ value, className }) {
  const el = useRef(null);
  const shown = useRef(value);
  useEffect(() => {
    const node = el.current;
    if (!node) return;
    if (prefersReducedMotion()) {
      node.textContent = String(value);
      shown.current = value;
      return;
    }
    const o = { v: shown.current };
    const a = animate(o, {
      v: value,
      duration: 600,
      ease: "outExpo",
      onUpdate: () => {
        shown.current = Math.round(o.v);
        node.textContent = String(shown.current);
      },
    });
    return () => a.pause?.();
  }, [value]);
  return <span ref={el} className={className}>{value}</span>;
}

function Lever({ k, no, title, children, focus, onPasal }) {
  return (
    <div className={cn("flex h-full flex-col rounded-xl p-6 transition-[box-shadow,background-color] duration-700 sm:p-7", focus === k ? "bg-white/[0.06] shadow-[inset_0_0_0_2px_var(--gold)]" : "")}>
      <p className="kicker text-[11px] text-gold-soft">Pasal {no}</p>
      <h3 className="mt-2 font-serif text-[1.45rem] leading-snug text-white">{title}</h3>
      <div className="mt-6 flex flex-1 flex-col">{children}</div>
      <button type="button" onClick={() => onPasal(no)} className="group mt-6 inline-flex items-center gap-2 self-start text-[14px] font-semibold text-gold-soft">
        <span className="u-gold">Baca pasalnya</span>
        <svg aria-hidden viewBox="0 0 16 16" className="size-4 transition-transform duration-500 ease-cinematic group-hover:translate-x-1">
          <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

/**
 * Simulator aturan — tiga tuas di satu papan navy (SpotlightCard: lingkaran emas buram mengikuti kursor, tanpa gradien):
 * IPS → batas SKS (24 sel terisi berurutan, angka berputar), nilai angka → tangga huruf mutu, IPK + tepat waktu → predikat.
 * Ponsel: satu tuas per slide (Swiper). Tuas yang dituju dari pasal (`goSim`) diberi bingkai emas sebentar.
 */
export function RuleSimulator() {
  const { simFocus, goPasal, vars, chapters } = useRegulasi();
  const [ips, setIps] = useState(3.12);
  const [score, setScore] = useState(79);
  const [ipk, setIpk] = useState(3.62);
  const [onTime, setOnTime] = useState(true);
  const sks = sksFor(ips);
  const grade = gradeFor(score);
  const pred = predikatFor(ipk, onTime);
  const blockedHonor = ipk >= PREDIKAT[0].min && !onTime;
  const maxCells = SKS_RULES[0].sks;

  const levers = [
    <Lever key="sks" k="sks" no="1.3" title="Berapa SKS boleh kuambil semester depan?" focus={simFocus} onPasal={goPasal}>
      <Range label="IPS semester ini" value={ips} min={0} max={4} step={0.01} onChange={setIps} format={(v) => dec(v)} />
      <div className="mt-6 flex items-end gap-3">
        <RollNumber value={sks} className="tabular font-serif text-[4rem] leading-none text-gold" />
        <span className="pb-2 text-[15px] text-white/70">SKS paling banyak</span>
      </div>
      <div className="mt-5 grid grid-cols-12 gap-1" aria-hidden>
        {Array.from({ length: maxCells }, (_, i) => (
          <span key={i} className={cn("h-3 rounded-[3px] transition-colors duration-300", i < sks ? "bg-gold" : "bg-white/10")} style={{ transitionDelay: `${i * 12}ms` }} />
        ))}
      </div>
      <ul className="mt-5 space-y-1 text-[13px]">
        {SKS_RULES.map((r, i) => {
          const upper = i ? SKS_RULES[i - 1].min : null;
          const on = r.sks === sks;
          return (
            <li key={r.sks} className={cn("flex justify-between rounded px-2 py-1 transition-colors duration-300", on ? "bg-white/10 text-white" : "text-white/45")}>
              <span className="tabular">{upper == null ? `≥ ${dec(r.min)}` : r.min === 0 ? `< ${dec(upper)}` : `${dec(r.min)} – ${dec(upper - 0.01)}`}</span>
              <span className="tabular">{r.sks} SKS</span>
            </li>
          );
        })}
      </ul>
    </Lever>,

    <Lever key="nilai" k="nilai" no="2.1" title="Nilai angkaku jadi huruf apa?" focus={simFocus} onPasal={goPasal}>
      <Range label="Nilai akhir" value={score} min={0} max={100} step={1} onChange={setScore} format={(v) => String(v)} />
      <div className="mt-6 grid grid-cols-[auto_1fr] items-center gap-5">
        <div className="text-center">
          <span key={grade.letter} className="block font-serif text-[4rem] leading-none text-gold animate-in fade-in-0 zoom-in-90 duration-300">{grade.letter}</span>
          <span className="mt-1 block text-[13px] text-white/60">bobot {dec(grade.weight)}</span>
          <span className={cn("mt-2 inline-block rounded px-2 py-0.5 text-[12px] font-semibold", grade.weight >= 2 ? "bg-white/10 text-white" : "bg-gold-soft text-maroon-deep")}>
            {grade.weight >= 2 ? "Lulus" : "Belum lulus"}
          </span>
        </div>
        <ol className="space-y-1" aria-label="Tangga huruf mutu">
          {GRADES.map((g, i) => (
            <li
              key={g.letter}
              data-on={g.letter === grade.letter ? "" : undefined}
              className="rg-step flex items-center justify-between rounded-md px-3 py-1 text-[13px] text-white/60"
              style={{ marginRight: `${(GRADES.length - 1 - i) * 4}px` }}
            >
              <span className="font-semibold">{g.letter}</span>
              <span className="tabular">{i === 0 ? `≥ ${g.min}` : `${g.min}–${GRADES[i - 1].min - 1}`}</span>
            </li>
          ))}
        </ol>
      </div>
    </Lever>,

    <Lever key="predikat" k="predikat" no="5.4" title="Predikat apa yang kudapat saat lulus?" focus={simFocus} onPasal={goPasal}>
      <Range label="IPK akhir" value={ipk} min={2} max={4} step={0.01} onChange={setIpk} format={(v) => dec(v)} />
      <button
        type="button"
        role="switch"
        aria-checked={onTime}
        onClick={() => setOnTime((v) => !v)}
        className="mt-5 flex items-center gap-3 text-left text-[14px] text-white/80 focus-visible:outline-none"
      >
        <span className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300", onTime ? "bg-gold" : "bg-white/20")}>
          <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform duration-300 ease-[cubic-bezier(.34,1.56,.64,1)]", onTime ? "translate-x-[22px]" : "translate-x-0.5")} />
        </span>
        Lulus dalam {vars.semester} semester
      </button>
      <div className="mt-7 min-h-[96px]">
        <p className="text-[13px] text-white/55">Predikat</p>
        <p key={pred?.label} className="mt-1 font-serif text-[2.1rem] italic leading-tight text-gold-soft animate-in fade-in-0 slide-in-from-bottom-2 duration-500">{pred?.label}</p>
        {blockedHonor && (
          <p className="mt-2 text-[13.5px] leading-relaxed text-white/65 animate-in fade-in-0 duration-500">IPK-mu cukup untuk predikat tertinggi, tetapi masa studinya melebihi {vars.semester} semester.</p>
        )}
      </div>
    </Lever>,
  ];

  return (
    <section id="simulasi" className="relative scroll-mt-20 py-16 md:py-24">
      <Container>
        <SectionHeader title={["Coba dengan", "angkamu sendiri"]} body="Geser tuasnya. Hasilnya dihitung dari aturan yang sama dengan pasal di bawah." action={chapters[0].sample ? <PlaceholderTag /> : null} />

        <SpotlightCard className="mt-10 hidden rounded-2xl bg-navy p-2 text-white md:block">
          <span aria-hidden className="pointer-events-none absolute -z-10 size-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/15 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" style={{ left: "var(--mx, 50%)", top: "var(--my, 50%)" }} />
          <div className="grid divide-x divide-white/10 md:grid-cols-3">{levers}</div>
        </SpotlightCard>

        <div className="mt-8 min-w-0 md:hidden">
          <Swiper modules={[Pagination, A11y]} slidesPerView={1.06} spaceBetween={12} pagination={{ clickable: true }} className="!pb-10 [--swiper-pagination-color:var(--maroon)]">
            {levers.map((l) => (
              <SwiperSlide key={l.key} className="!h-auto">
                <div className="h-full rounded-2xl bg-navy p-1 text-white">{l}</div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </Container>
    </section>
  );
}
