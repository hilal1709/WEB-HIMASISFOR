"use client";
import { useCallback, useLayoutEffect as useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { deskOf } from "@/lib/kontak-content";
import { Container, PlaceholderTag, SectionHeader } from "@/components/home/shared";
import { cn } from "@/lib/utils";
import { useKontak } from "./kontak-provider";

const useIso = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Kurva kabel menggantung dari colokan (a) ke meja (b). `sag` = lendutan ke bawah. */
const cablePath = (a, b, sag) => {
  const dx = Math.max(60, (b.x - a.x) * 0.45);
  return `M${a.x} ${a.y}C${a.x + dx} ${a.y + sag},${b.x - dx} ${b.y + sag},${b.x} ${b.y}`;
};

/**
 * "Papan sambung" operator telepon: kiri colokan topik, kanan meja tujuan. Memilih colokan menarik kabel
 * (SVG, digambar GSAP lalu memantul elastis saat "tertancap"), lampu meja menyala, dan rincian meja tersingkap
 * dengan sapuan mask. Pilihan ikut mengisi "Kepada Yth." pada surat. Keyboard: panah atas/bawah (radiogroup).
 */
export function Switchboard() {
  const { topics, desks, topicKey, pick } = useKontak();
  const board = useRef(null);
  const cable = useRef(null);
  const plug = useRef(null);
  const detail = useRef(null);
  const jacks = useRef({});
  const sockets = useRef({});
  const [wide, setWide] = useState(false);

  const topic = topics.find((t) => t.key === topicKey) ?? null;
  const desk = topic ? deskOf(topic.desk, desks) : null;

  useEffect(() => {
    const mq = matchMedia("(min-width: 768px)");
    const on = () => setWide(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const ends = useCallback(() => {
    const host = board.current?.getBoundingClientRect();
    const j = jacks.current[topic?.key]?.getBoundingClientRect();
    const s = sockets.current[desk?.key]?.getBoundingClientRect();
    if (!host || !j || !s) return null;
    return {
      a: { x: j.left + j.width / 2 - host.left, y: j.top + j.height / 2 - host.top },
      b: { x: s.left + s.width / 2 - host.left, y: s.top + s.height / 2 - host.top },
    };
  }, [topic?.key, desk?.key]);

  // tarik kabel saat topik berganti
  useIso(() => {
    const path = cable.current;
    if (!path || !wide) return;
    const e = ends();
    if (!e) {
      gsap.set([path, plug.current], { opacity: 0 });
      return;
    }
    const finalSag = 46;
    const place = (sag) => {
      path.setAttribute("d", cablePath(e.a, e.b, sag));
      gsap.set(plug.current, { x: e.b.x, y: e.b.y });
    };
    if (prefersReducedMotion()) {
      place(finalSag);
      gsap.set([path, plug.current], { opacity: 1, strokeDashoffset: 0 });
      return;
    }
    const state = { sag: 150 };
    place(state.sag);
    const len = path.getTotalLength();
    const tl = gsap.timeline();
    tl.set(path, { opacity: 1, strokeDasharray: len + 400, strokeDashoffset: len + 400 })
      .set(plug.current, { opacity: 0, scale: 0.4 })
      .to(path, { strokeDashoffset: 0, duration: 0.55, ease: "power2.out" })
      .to(plug.current, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(3)" }, "-=0.12")
      .to(state, { sag: finalSag, duration: 1.1, ease: "elastic.out(1, 0.35)", onUpdate: () => place(state.sag) }, "<");
    return () => tl.kill();
  }, [topic?.key, wide, ends]);

  // posisi ulang saat ukuran berubah
  useEffect(() => {
    if (!wide || !board.current) return;
    const ro = new ResizeObserver(() => {
      const e = ends();
      if (e && cable.current) {
        cable.current.setAttribute("d", cablePath(e.a, e.b, 46));
        gsap.set(plug.current, { x: e.b.x, y: e.b.y });
      }
    });
    ro.observe(board.current);
    return () => ro.disconnect();
  }, [wide, ends]);

  // sapuan rincian meja
  useEffect(() => {
    if (!detail.current || !topic || prefersReducedMotion()) return;
    gsap.fromTo(detail.current, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.7, ease: "expo.inOut" });
  }, [topic?.key]);

  const onKey = (e, i) => {
    const step = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = topics[(i + step + topics.length) % topics.length];
    pick(next.key);
    jacks.current[`btn-${next.key}`]?.focus();
  };

  return (
    <section id="papan-sambung" className="scroll-mt-24 py-16 md:py-24">
      <Container>
        <SectionHeader title={["Sambungkan ke", "meja", "yang tepat"]} body="Setiap urusan punya penanggung jawab. Pilih topikmu, kabelnya kami sambungkan." />

        <div ref={board} data-aos="fade-up" className="relative mt-10 overflow-hidden rounded-[10px] bg-navy p-5 text-white md:mt-14 md:p-10">
          <div aria-hidden className="kt-holes pointer-events-none absolute inset-0 opacity-[0.07]" />

          <div className="relative grid gap-8 md:grid-cols-[1fr_minmax(80px,0.5fr)_1fr] md:gap-0">
            {/* colokan topik */}
            <div role="radiogroup" aria-label="Topik pesan" className="flex flex-col gap-2.5">
              <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-gold-soft/80">Topik</p>
              {topics.map((t, i) => {
                const on = t.key === topicKey;
                return (
                  <button
                    key={t.key}
                    ref={(el) => (jacks.current[`btn-${t.key}`] = el)}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    tabIndex={on || (!topicKey && i === 0) ? 0 : -1}
                    onClick={() => pick(t.key)}
                    onKeyDown={(e) => onKey(e, i)}
                    className={cn(
                      "group flex items-center justify-between gap-4 rounded-md border px-4 py-3 text-left text-[15px] transition-[background-color,border-color,color] duration-300 ease-cinematic focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
                      on ? "border-gold/70 bg-white/[0.08] text-white" : "border-white/10 text-white/70 hover:border-white/30 hover:text-white"
                    )}
                  >
                    <span>{t.label}</span>
                    <span
                      ref={(el) => (jacks.current[t.key] = el)}
                      aria-hidden
                      className={cn("relative grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors duration-300", on ? "border-gold" : "border-white/35 group-hover:border-white/60")}
                    >
                      <span className={cn("size-1.5 rounded-full transition-colors", on ? "bg-gold" : "bg-white/30")} />
                    </span>
                  </button>
                );
              })}
            </div>

            <div aria-hidden className="hidden md:block" />

            {/* meja tujuan */}
            <div className="flex flex-col gap-2.5">
              <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-gold-soft/80">Meja tujuan</p>
              {desks.map((d) => {
                const lit = desk?.key === d.key;
                return (
                  <div
                    key={d.key}
                    className={cn(
                      "flex items-center gap-4 rounded-md border px-4 py-3 transition-[background-color,border-color] duration-500 ease-cinematic",
                      lit ? "border-gold/60 bg-gold/[0.1]" : "border-white/10"
                    )}
                  >
                    <span ref={(el) => (sockets.current[d.key] = el)} aria-hidden className={cn("relative size-3 shrink-0 rounded-full transition-[background-color,box-shadow] duration-500", lit ? "bg-gold shadow-[0_0_0_6px_rgb(201_162_39/0.18)]" : "bg-white/20")} />
                    <span className={cn("text-[15px] transition-colors", lit ? "text-white" : "text-white/60")}>{d.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* kabel (desktop) */}
          <svg aria-hidden className="pointer-events-none absolute inset-0 hidden size-full overflow-visible md:block">
            <path ref={cable} d="M0 0" fill="none" stroke="var(--gold)" strokeWidth="3.5" strokeLinecap="round" opacity="0" />
            <g ref={plug} opacity="0">
              <circle r="9" fill="var(--maroon)" stroke="var(--gold)" strokeWidth="2.5" />
              <circle r="3" fill="var(--gold-soft)" />
            </g>
          </svg>

          {/* rincian sambungan */}
          <div aria-live="polite" className="relative mt-8 border-t border-white/10 pt-6 md:mt-10">
            {topic && desk ? (
              <div ref={detail} className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div>
                  {/* kabel vertikal pengganti di layar kecil */}
                  <span aria-hidden className="mb-4 block h-6 w-[3px] origin-top animate-[kt-drop_0.5s_cubic-bezier(0.34,1.56,0.64,1)_both] rounded bg-gold md:hidden" />
                  <p className="font-serif text-[clamp(1.35rem,2.2vw,1.75rem)] leading-snug">
                    Tersambung ke <em className="italic text-gold-soft">{desk.name}</em>
                  </p>
                  <p className="mt-2 max-w-xl text-[15px] text-white/65">Menangani: {desk.handles}.</p>
                  {desk.sample && <PlaceholderTag tone="dark" className="mt-3" />}
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  {topic.link && (
                    <a
                      href={topic.link.href}
                      {...(topic.link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="u-gold text-[14.5px] font-semibold text-gold-soft"
                    >
                      {topic.link.label}
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => pick(topic.key, { scroll: true })}
                    className="inline-flex h-11 items-center rounded-md bg-gold px-5 text-[14.5px] font-semibold text-navy transition-[background-color,transform] duration-300 hover:bg-gold-soft active:scale-[0.97]"
                  >
                    Tulis surat ke meja ini
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-[15px] text-white/55">Belum ada sambungan. Pilih satu topik untuk memulai.</p>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
