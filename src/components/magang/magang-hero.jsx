"use client";
import { useLayoutEffect as useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion, curtainDelay } from "@/lib/motion";
import { CURTAIN_KEY, programLabel } from "@/lib/magang-content";
import { Container, SceneTitle } from "@/components/home/shared";
import { cn } from "@/lib/utils";
import { smoothTo, useMagang } from "./magang-provider";

const pad = (n) => String(n).padStart(2, "0");

/**
 * Hero "Dari ruang kelas, ke lantai industri". Kanan: kartu ID peserta magang yang tergantung di tali lanyard
 * dari sebuah rel (satu-satunya visual hero, tanpa ilustrasi line-art).
 * Kartu berayun mengikuti kursor (GSAP quickTo, rotasi di titik gantung) dan memantul pegas saat dilepas.
 * Ketuk kartu → membalik (rotasi Y) ke tiga pintu; tiap pintu menggulir ke section `#pintu`.
 */
export function MagangHero() {
  const { intro, kp, routes, jobs, setRoute } = useMagang();
  const ref = useRef(null);
  const art = useRef(null);
  const swing = useRef(null);
  const card = useRef(null);
  const [flipped, setFlipped] = useState(false);
  const open = jobs.filter((j) => j.days == null || j.days >= 0).length;

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const delay = curtainDelay(CURTAIN_KEY);
    const ctx = gsap.context(() => {
      gsap.from("[data-hero-fade]", { y: 18, opacity: 0, duration: 0.8, stagger: 0.08, ease: "expo.out", delay });
      gsap.from(swing.current, { yPercent: -60, rotate: -16, opacity: 0, duration: 1.6, ease: "elastic.out(1, 0.45)", delay: delay + 0.4 });
    }, el);
    return () => ctx.revert();
  }, []);

  // ayunan kartu mengikuti kursor
  useEffect(() => {
    const host = art.current;
    const s = swing.current;
    if (!host || !s || prefersReducedMotion()) return;
    const rot = gsap.quickTo(s, "rotate", { duration: 0.9, ease: "power3.out" });
    const idle = gsap.to(s, { rotate: 2.2, duration: 2.4, ease: "sine.inOut", yoyo: true, repeat: -1, paused: true, delay: 3 });
    idle.play();
    const move = (e) => {
      idle.pause();
      const r = host.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      rot(gsap.utils.clamp(-1, 1, x) * 9);
    };
    const leave = () => {
      gsap.to(s, { rotate: 0, duration: 1.8, ease: "elastic.out(1, 0.3)", overwrite: true, onComplete: () => idle.restart(true) });
    };
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", leave);
    return () => {
      idle.kill();
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
    };
  }, []);

  const flip = (to) => {
    const next = to ?? !flipped;
    setFlipped(next);
    if (prefersReducedMotion()) {
      gsap.set(card.current, { rotateY: next ? 180 : 0 });
      return;
    }
    gsap.to(card.current, { rotateY: next ? 180 : 0, duration: 0.9, ease: "back.out(1.4)" });
    gsap.fromTo(swing.current, { rotate: next ? -6 : 6 }, { rotate: 0, duration: 1.4, ease: "elastic.out(1, 0.35)" });
  };

  const goRoute = (i) => {
    setRoute(i);
    smoothTo("pintu");
  };

  return (
    <section ref={ref} className="relative overflow-hidden pb-10 pt-10 md:pb-14 md:pt-14">
      <Container>
        <nav aria-label="Breadcrumb" data-hero-fade className="text-sm text-text/55">
          <ol className="flex flex-wrap items-center gap-2">
            <li><a href="/" className="u-gold transition-colors hover:text-maroon">Beranda</a></li>
            <li aria-hidden>/</li>
            <li>Belajar Luar Prodi</li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-navy">Magang</li>
          </ol>
        </nav>

        <div className="mt-10 grid gap-10 lg:mt-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-6">
          <div className="relative z-10">
            <SceneTitle as="h1" trigger="mount" title={["Dari ruang kelas,", "ke lantai industri"]} className="!text-[clamp(2.7rem,6.2vw,5.4rem)] !leading-[0.98]" />
            <p data-hero-fade className="mt-7 max-w-xl text-pretty text-[17px] leading-relaxed text-text/70">{intro.body}</p>
            <div data-hero-fade className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
              <button
                type="button"
                onClick={() => smoothTo("lowongan")}
                className="group inline-flex h-12 items-center gap-3 rounded-md bg-maroon pl-6 pr-2 text-[15px] font-semibold text-white transition-[background-color,transform] duration-300 ease-cinematic hover:bg-maroon-deep active:scale-[0.98]"
              >
                Lihat lowongan
                <span className="tabular grid h-8 min-w-8 place-items-center rounded bg-gold px-2 text-[13px] font-bold text-navy transition-transform duration-500 ease-cinematic group-hover:-rotate-6">{open}</span>
              </button>
              <button type="button" onClick={() => flip(true)} className="text-[15px] font-semibold text-navy">
                <span className="u-gold">Bedakan tiga pintunya</span>
              </button>
            </div>
          </div>

          <div ref={art} className="relative mx-auto w-full max-w-[560px] touch-pan-y select-none" data-hero-fade>
            {/* rel gantungan + kartu ID tergantung — titik gantung di tepi atas area */}
            <span aria-hidden className="absolute inset-x-6 top-0 h-[6px] rounded-full bg-navy" />
            <div className="relative z-10 mx-auto h-[400px] w-[248px] sm:h-[440px]" style={{ perspective: 1200 }}>
              <div ref={swing} className="absolute inset-x-0 top-0 origin-top" style={{ transformOrigin: "50% 0%" }}>
                <svg aria-hidden viewBox="0 0 248 92" className="mx-auto block h-[92px] w-[248px] text-maroon">
                  <path d="M84 0L118 78M164 0L130 78" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
                  <path d="M84 0L118 78M164 0L130 78" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeDasharray="2 6" />
                  <rect x="110" y="72" width="28" height="18" rx="4" fill="var(--navy)" />
                  <rect x="118" y="78" width="12" height="6" rx="2" fill="var(--gold)" />
                </svg>
                <div ref={card} className="relative -mt-1 h-[300px] w-[248px] sm:h-[330px]" style={{ transformStyle: "preserve-3d" }}>
                  {/* depan */}
                  <button
                    type="button"
                    onClick={() => flip(true)}
                    aria-label="Kartu peserta magang. Ketuk untuk melihat tiga pintu magang."
                    aria-hidden={flipped}
                    tabIndex={flipped ? -1 : 0}
                    className="absolute inset-0 flex flex-col overflow-hidden rounded-xl bg-navy text-left text-white shadow-[0_40px_70px_-35px_rgb(14_24_48/0.85)] outline-none focus-visible:ring-2 focus-visible:ring-gold"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <span className="flex items-center justify-between bg-maroon px-4 py-3">
                      <span className="kicker text-[10.5px] text-gold-soft">SISFOR UISI</span>
                      <span aria-hidden className="h-2 w-10 rounded-full bg-maroon-deep" />
                    </span>
                    <span className="flex flex-1 flex-col px-5 pb-4 pt-5">
                      <span className="flex items-center gap-4">
                        <span className="relative size-[68px] shrink-0 overflow-hidden rounded-lg bg-cream">
                          <Image src="/mascot/elvo-wave.webp" alt="" width={605} height={720} className="absolute -bottom-1 left-1/2 h-[118%] w-auto max-w-none -translate-x-1/2" />
                        </span>
                        <span className="min-w-0">
                          <span className="kicker block text-[10px] text-gold-soft">Peserta magang</span>
                          <span className="mt-1 block font-serif text-[1.5rem] leading-none">Kamu</span>
                          <span className="mt-1 block text-[12.5px] text-white/60">Sisforian, semester {kp.semester}</span>
                        </span>
                      </span>
                      <span className="mt-5 grid grid-cols-3 divide-x divide-white/10 rounded-md border border-white/10">
                        {[
                          [kp.nama, "Mata kuliah"],
                          [`${kp.sks} SKS`, "Beban"],
                          [`Smt ${kp.semester}`, "Diambil"],
                        ].map(([v, k]) => (
                          <span key={k} className="px-2 py-2.5 text-center">
                            <span className="block text-[12.5px] font-semibold leading-tight text-white">{v}</span>
                            <span className="mt-0.5 block text-[10px] text-white/45">{k}</span>
                          </span>
                        ))}
                      </span>
                      <span aria-hidden className="mt-auto flex h-8 items-end gap-[3px] pt-4">
                        {Array.from({ length: 34 }, (_, i) => (
                          <span key={i} className="bg-white/70" style={{ width: i % 3 === 0 ? 3 : 1.5, height: `${55 + ((i * 37) % 45)}%` }} />
                        ))}
                      </span>
                      <span className="mt-3 flex items-center justify-between text-[11.5px] text-white/50">
                        Ketuk untuk membalik
                        <svg aria-hidden viewBox="0 0 16 16" className="size-4 text-gold">
                          <path d="M3 6a5 5 0 0 1 9-2M13 10a5 5 0 0 1-9 2M12 1v3H9M4 15v-3h3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </span>
                  </button>

                  {/* belakang: tiga pintu */}
                  <div
                    aria-hidden={!flipped}
                    className="absolute inset-0 flex flex-col overflow-hidden rounded-xl bg-maroon p-5 text-white shadow-[0_40px_70px_-35px_rgb(78_14_25/0.9)]"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                  >
                    <p className="kicker text-[10.5px] text-gold-soft">Tiga pintu magang</p>
                    <ol className="mt-3 flex-1 divide-y divide-white/10">
                      {routes.map((r, i) => (
                        <li key={r.key}>
                          <button
                            type="button"
                            tabIndex={flipped ? 0 : -1}
                            onClick={() => goRoute(i)}
                            className="group flex w-full items-center gap-3 py-3 text-left outline-none focus-visible:text-gold-soft"
                          >
                            <span className="tabular font-serif text-[15px] text-gold">{pad(i + 1)}</span>
                            <span className="min-w-0 flex-1">
                              <span className="block font-serif text-[1.15rem] leading-tight transition-colors group-hover:text-gold-soft">{r.title}</span>
                              <span className="block text-[11.5px] text-white/55">{r.tag}</span>
                            </span>
                            <svg aria-hidden viewBox="0 0 16 16" className="size-3.5 opacity-40 transition-[opacity,transform] duration-300 group-hover:translate-y-0.5 group-hover:opacity-100">
                              <path d="M8 3v10M4 9l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ol>
                    <button
                      type="button"
                      tabIndex={flipped ? 0 : -1}
                      onClick={() => flip(false)}
                      className="mt-2 self-start text-[12px] font-semibold text-white/70 transition-colors hover:text-white"
                    >
                      ← Balik ke kartu
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <p className="sr-only" aria-live="polite">{flipped ? `Menampilkan tiga pintu: ${routes.map((r) => programLabel(r.key)).join(", ")}` : ""}</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
