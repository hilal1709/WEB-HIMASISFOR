"use client";
import { useRef, useState } from "react";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { Container, SectionHeader } from "@/components/home/shared";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { cn } from "@/lib/utils";
import { useJalur } from "./jalur-provider";

const FACE = [
  { card: "bg-maroon text-white", sub: "text-white/60", kick: "text-gold-soft", line: "border-white/15", disc: "bg-maroon-deep" },
  { card: "bg-navy text-white", sub: "text-white/60", kick: "text-gold-soft", line: "border-white/15", disc: "bg-maroon" },
  { card: "bg-maroon-deep text-white", sub: "text-white/60", kick: "text-gold-soft", line: "border-white/15", disc: "bg-maroon" },
  { card: "bg-navy-deep text-white", sub: "text-white/60", kick: "text-gold-soft", line: "border-white/15", disc: "bg-maroon" },
];

/**
 * "Kalau aku pilih…" — empat kartu yang bisa dibalik (bukan tabel; tabel perbandingan sudah dipakai
 * Program Kelas). Depan: luaran & durasi. Belakang: untuk siapa & risikonya. Kartu miring mengikuti
 * kursor ala kartu 3D Aceternity (tanpa glare gradien), dibalik GSAP saat diklik/Enter.
 */
export function TradeoffCards() {
  const { paths } = useJalur();
  return (
    <section id="bandingkan" className="relative scroll-mt-20 bg-cream-2/60 py-16 md:py-24">
      <Container>
        <SectionHeader title={["Kalau aku pilih", "jalur ini,", "apa taruhannya?"]} body="Balik kartunya untuk melihat siapa yang paling cocok dan apa yang perlu kamu pertimbangkan." />
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {paths.map((p, i) => (
            <li key={p.key} data-aos="fade-up" data-aos-delay={i * 80}>
              <FlipCard p={p} i={i} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

function FlipCard({ p, i }) {
  const { openPath } = useJalur();
  const [back, setBack] = useState(false);
  const tilt = useRef(null);
  const inner = useRef(null);
  const f = FACE[i % FACE.length];

  const flip = () => {
    const to = !back;
    setBack(to);
    if (prefersReducedMotion()) gsap.set(inner.current, { rotationY: to ? 180 : 0 });
    else gsap.to(inner.current, { rotationY: to ? 180 : 0, duration: 0.9, ease: "power3.inOut" });
  };

  const onMove = (e) => {
    if (prefersReducedMotion() || e.pointerType !== "mouse") return;
    const r = tilt.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(tilt.current, { rotationX: -py * 8, rotationY: px * 8, duration: 0.5, ease: "power2.out", transformPerspective: 900 });
  };
  const onLeave = () => gsap.to(tilt.current, { rotationX: 0, rotationY: 0, duration: 0.7, ease: "power3.out" });

  return (
    <div ref={tilt} onPointerMove={onMove} onPointerLeave={onLeave} className="jk-flip h-[420px]">
      <div ref={inner} className="jk-flip-inner relative size-full">
        {/* depan */}
        <div className={cn("jk-face absolute inset-0 flex flex-col rounded-2xl p-6 shadow-[0_30px_60px_-40px_rgb(20_33_61/0.7)]", f.card)} aria-hidden={back} data-lottie-hover>
          <div className="flex items-start justify-between">
            <span className={cn("kicker text-[11px]", f.kick)}>Jalur 0{i + 1}</span>
            <span className={cn("grid size-20 place-items-center rounded-full p-2.5", f.disc)}>
              <LottieIllustration src={p.lottie} replayOnHover />
            </span>
          </div>
          <h3 className="mt-4 font-serif text-[2.2rem] leading-none">{p.title}</h3>
          <dl className="mt-auto space-y-4">
            <div className={cn("border-t pt-3", f.line)}>
              <dt className={cn("text-[11.5px] font-semibold uppercase tracking-[0.14em]", f.sub)}>Luaran</dt>
              <dd className="mt-1 font-serif text-[1.1rem] italic leading-snug">{p.output}</dd>
            </div>
            <div className={cn("border-t pt-3", f.line)}>
              <dt className={cn("text-[11.5px] font-semibold uppercase tracking-[0.14em]", f.sub)}>Durasi</dt>
              <dd className="mt-1 text-[15px]">{p.duration}</dd>
            </div>
          </dl>
          <button
            type="button"
            onClick={flip}
            tabIndex={back ? -1 : 0}
            className="group mt-5 inline-flex items-center gap-2 self-start text-[14px] font-semibold text-gold-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
          >
            <span className="u-gold">Balik kartu</span>
            <svg aria-hidden viewBox="0 0 16 16" className="size-4 transition-transform duration-500 ease-cinematic group-hover:rotate-180">
              <path d="M13 6a5 5 0 0 0-9-1.5M3 2.5v2.5h2.5M3 10a5 5 0 0 0 9 1.5M13 13.5V11h-2.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* belakang */}
        <div className="jk-face jk-face-back absolute inset-0 flex flex-col rounded-2xl border border-line bg-white p-6 text-navy shadow-[0_30px_60px_-40px_rgb(20_33_61/0.5)]" aria-hidden={!back}>
          <span className="kicker text-[11px] text-maroon">{p.title}</span>
          <p className="mt-4 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-text/45">Cocok untuk</p>
          <p className="mt-1.5 text-[15px] leading-relaxed">{p.forWho}</p>
          <p className="mt-5 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-maroon/70">Pertimbangkan</p>
          <p className="mt-1.5 font-serif text-[1.05rem] italic leading-snug text-maroon">{p.risk}</p>
          <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-4">
            <button type="button" onClick={flip} tabIndex={back ? 0 : -1} className="text-[14px] font-semibold text-navy/70 hover:text-navy">
              Kembali
            </button>
            <button
              type="button"
              onClick={() => openPath(i)}
              tabIndex={back ? 0 : -1}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-maroon px-4 text-[14px] font-semibold text-white transition-[background-color,transform] duration-300 hover:bg-maroon-deep active:scale-[0.97]"
            >
              Ringkasan jalur
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
