"use client";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap, Flip } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { KINDS, rupiahLess } from "@/lib/beasiswa-content";
import { Container, SectionHeader, PlaceholderTag } from "@/components/home/shared";
import { cn } from "@/lib/utils";
import { useBeasiswa } from "./beasiswa-provider";

const STEP = 5;
const clamp = (v) => Math.max(0, Math.min(100, v));

/**
 * Spektrum cakupan `#spektrum` — penggaris 0 → 100% UKT dengan zona "+ biaya hidup" di ujung kanan.
 * Tiap beasiswa = pin di posisi cakupannya (ditumpuk ke atas bila sama). Pegangan emas = ambang "minimal ditanggung";
 * bisa diseret, diklik di penggaris, atau ←/→ (5%), PageUp/PageDown (25%), Home/End.
 * Pin di bawah ambang turun & meredup; daftar di bawahnya diurut ulang GSAP Flip.
 * Ponsel (< md): penggaris tegak di kiri, daftar di kanan.
 */
export function CoverageRuler() {
  const { items, threshold, setThreshold, open, focus, setFocus } = useBeasiswa();
  const track = useRef(null);
  const listRef = useRef(null);
  const flipState = useRef(null);
  const [drag, setDrag] = useState(false);
  const [hover, setHover] = useState(null);

  /** pin bertumpuk: indeks tumpukan per nilai cakupan */
  const pins = useMemo(() => {
    const seen = {};
    return items.map((s) => {
      const k = s.coverage;
      seen[k] = (seen[k] ?? -1) + 1;
      return { ...s, stack: seen[k] };
    });
  }, [items]);

  const passing = useMemo(
    () => [...items].filter((s) => s.coverage >= threshold).sort((a, b) => b.coverage - a.coverage || Number(b.living) - Number(a.living)),
    [items, threshold]
  );

  const valueFrom = useCallback((e) => {
    const r = track.current.getBoundingClientRect();
    const vertical = r.height > r.width;
    const t = vertical ? 1 - (e.clientY - r.top) / r.height : (e.clientX - r.left) / r.width;
    return clamp(Math.round((t * 100) / STEP) * STEP);
  }, []);

  const commit = useCallback(
    (v) => {
      const next = clamp(v);
      if (next === threshold) return;
      if (listRef.current && !prefersReducedMotion()) flipState.current = Flip.getState(listRef.current.querySelectorAll("[data-flip]"));
      setThreshold(next);
    },
    [threshold, setThreshold]
  );

  useLayoutEffect(() => {
    const st = flipState.current;
    if (!st) return;
    flipState.current = null;
    Flip.from(st, {
      duration: 0.6,
      ease: "power3.inOut",
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45 }),
      onLeave: (els) => gsap.to(els, { opacity: 0, y: -8, duration: 0.3 }),
    });
  }, [threshold]);

  const dragging = useRef(false);
  const onDown = (e) => {
    if (e.target.closest("[data-pin]")) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    dragging.current = true;
    setDrag(true);
    commit(valueFrom(e));
  };
  const onMove = (e) => dragging.current && commit(valueFrom(e));
  const onUp = () => {
    dragging.current = false;
    setDrag(false);
  };

  const onKey = (e) => {
    const map = { ArrowRight: STEP, ArrowUp: STEP, ArrowLeft: -STEP, ArrowDown: -STEP, PageUp: 25, PageDown: -25 };
    if (e.key in map) {
      e.preventDefault();
      commit(threshold + map[e.key]);
    } else if (e.key === "Home") {
      e.preventDefault();
      commit(0);
    } else if (e.key === "End") {
      e.preventDefault();
      commit(100);
    }
  };

  const tip = pins.find((p) => p.slug === hover);

  return (
    <section id="spektrum" className="relative scroll-mt-24 border-t border-line bg-white py-16 md:py-20">
      <Container>
        <SectionHeader
          title={["Berapa yang", "ditanggung", "tiap beasiswa?"]}
          body="Geser pegangan emas ke batas yang kamu butuhkan. Beasiswa yang menanggung kurang dari itu turun dari penggaris."
        />

        <div className="mt-10 grid grid-cols-[104px_1fr] gap-5 md:mt-10 md:block">
          {/* penggaris */}
          <div className="relative md:px-2">
            <div
              ref={track}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              className="bs-ruler relative h-[440px] w-full touch-none select-none md:h-[200px]"
            >
              {/* skala */}
              <svg aria-hidden className="bs-ticks-h text-navy">
                {Array.from({ length: 21 }, (_, i) => (
                  <line key={i} x1={`${i * 5}%`} x2={`${i * 5}%`} y1="0" y2={i % 5 === 0 ? 12 : 6} stroke="currentColor" strokeOpacity={i % 5 === 0 ? 0.6 : 0.3} />
                ))}
              </svg>
              <svg aria-hidden className="bs-ticks-v text-navy">
                {Array.from({ length: 21 }, (_, i) => (
                  <line key={i} y1={`${100 - i * 5}%`} y2={`${100 - i * 5}%`} x1="100%" x2={i % 5 === 0 ? "60%" : "80%"} stroke="currentColor" strokeOpacity={i % 5 === 0 ? 0.6 : 0.3} />
                ))}
              </svg>
              {[0, 25, 50, 75, 100].map((v) => (
                <span key={v} aria-hidden className="bs-scale-label tabular" style={{ "--v": v }}>
                  {v}%
                </span>
              ))}
              {/* garis dasar + isian ambang */}
              <span aria-hidden className="bs-base" />
              <span aria-hidden className="bs-base-fill" style={{ "--v": threshold }} />

              {/* pin */}
              {pins.map((p) => {
                const out = p.coverage < threshold;
                return (
                  <button
                    key={p.slug}
                    type="button"
                    data-pin
                    onClick={() => open(p.slug)}
                    onPointerEnter={() => (setHover(p.slug), setFocus(p.slug))}
                    onPointerLeave={() => setHover(null)}
                    onFocus={() => (setHover(p.slug), setFocus(p.slug))}
                    onBlur={() => setHover(null)}
                    aria-label={`${p.name}, ${rupiahLess(p)}${out ? ", di bawah ambang" : ""}. Buka rincian`}
                    className={cn("bs-pin", out && "bs-pin-out", focus === p.slug && "bs-pin-on", p.living && "bs-pin-living")}
                    style={{ "--v": p.coverage, "--stack": p.stack }}
                  >
                    <span className="bs-pin-head">{p.monogram}</span>
                    <span aria-hidden className="bs-pin-stem" />
                  </button>
                );
              })}

              {/* pegangan ambang */}
              <div
                role="slider"
                tabIndex={0}
                aria-label="Cakupan minimal yang kubutuhkan"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={threshold}
                aria-valuetext={`Minimal ${threshold}% UKT`}
                onKeyDown={onKey}
                className={cn("bs-handle", drag && "bs-handle-drag")}
                style={{ "--v": threshold }}
              >
                <span className="bs-handle-flag tabular">≥ {threshold}%</span>
                <span aria-hidden className="bs-handle-knob" />
              </div>

              {/* tooltip pin (layar lebar) */}
              {tip && (
                <div aria-hidden className="bs-tip" style={{ "--v": tip.coverage, "--stack": tip.stack, "--tx": tip.coverage > 85 ? "-88%" : tip.coverage < 12 ? "-12%" : "-50%" }}>
                  <span className="kicker block text-[10px] text-gold-soft">{KINDS[tip.kind]}</span>
                  <span className="mt-1 block font-serif text-[15px] leading-snug">{tip.name}</span>
                  <span className="mt-1 block text-[12px] text-white/70">{tip.covers[0]}</span>
                </div>
              )}
            </div>
            <p className="mt-4 hidden text-right text-[12.5px] text-text/50 md:block">
              <span aria-hidden className="mr-2 inline-block size-2 rounded-full bg-gold align-middle" />
              Pin bercincin emas = ada biaya hidup
            </p>
          </div>

          {/* daftar yang lolos */}
          <div className="min-w-0 md:mt-12">
            <p aria-live="polite" className="text-[14px] text-text/60">
              <strong className="font-serif text-[1.4rem] font-normal text-navy">{passing.length}</strong> dari {items.length} beasiswa menanggung minimal{" "}
              <strong className="font-semibold text-maroon">{threshold}%</strong> UKT
            </p>
            <ul ref={listRef} className="mt-5 grid grid-cols-1 gap-x-8 md:grid-cols-2 lg:grid-cols-3">
              {passing.map((s) => (
                <li key={s.slug} data-flip data-flip-id={s.slug} className="border-t border-line">
                  <button type="button" onClick={() => open(s.slug)} className="group flex w-full items-center gap-4 py-4 text-left">
                    <span className="bs-meter" style={{ "--v": s.coverage }} aria-hidden>
                      <span />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-serif text-[1.15rem] leading-tight text-navy transition-transform duration-500 ease-cinematic group-hover:translate-x-1">{s.name}</span>
                      <span className="mt-0.5 block text-[12.5px] text-text/55">{s.org}</span>
                    </span>
                    <span className="tabular shrink-0 text-right text-[13px] font-semibold text-maroon">
                      {s.coverage}%
                      {s.living && <span className="block text-[11px] font-medium text-text/50">+ hidup</span>}
                    </span>
                  </button>
                </li>
              ))}
              {!passing.length && (
                <li className="col-span-full border-t border-line py-8 text-[15px] text-text/60">
                  Belum ada yang menanggung sebanyak itu.{" "}
                  <button type="button" onClick={() => commit(50)} className="font-semibold text-maroon">
                    <span className="u-gold">Turunkan ke 50%</span>
                  </button>
                </li>
              )}
            </ul>
            {items.some((s) => s.sample) && <PlaceholderTag className="mt-6" />}
          </div>
        </div>
      </Container>
    </section>
  );
}
