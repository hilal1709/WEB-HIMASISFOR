"use client";
import { useEffect, useRef, useState } from "react";
import { animate, stagger, svg } from "animejs";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { CURTAIN_KEY } from "@/lib/jalur-kelulusan-content";
import { Container, SceneTitle } from "@/components/home/shared";
import { ElvoPeek } from "@/components/home/elvo-peek";
import { GraduationForkIllustration } from "@/components/illustrations/line-illustrations";
import { cn } from "@/lib/utils";
import { smoothTo, useJalur } from "./jalur-provider";

/**
 * Hero "Empat jalan, satu toga". Panel maroon berisi jalan yang bercabang empat (line-art tergambar anime.js).
 * Setelah tergambar, cabang menyala bergiliran sampai pengguna menyentuhnya; hover/fokus label cabang menyalakan
 * cabang itu (`.grad-fork [data-branch][data-on]`) dan membaca ringkasannya. Klik → jalur dipilih + gulir ke bab-nya.
 */
export function JalurHero() {
  const { intro, paths, thesis, setActive } = useJalur();
  const ref = useRef(null);
  const art = useRef(null);
  const [hover, setHover] = useState(null);
  const [auto, setAuto] = useState(null);
  const touched = useRef(false);
  const lit = hover ?? auto;
  const litPath = lit != null ? paths[lit] : null;

  // nyalakan cabang lewat atribut (SVG dipakai bersama halaman lain, jadi tidak diberi props)
  useEffect(() => {
    art.current?.querySelectorAll("[data-branch]").forEach((g) => {
      if (lit != null && g.getAttribute("data-branch") === paths[lit].key) g.setAttribute("data-on", "");
      else g.removeAttribute("data-on");
    });
  }, [lit, paths]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(CURTAIN_KEY) === "1";
    } catch {}
    const delay = seen ? 0.15 : 1.9;
    let timer;
    const cycle = (i) => {
      if (touched.current) return;
      setAuto(i % paths.length);
      timer = setTimeout(() => cycle(i + 1), 2600);
    };
    if (prefersReducedMotion()) {
      setAuto(0);
      return;
    }
    const ctx = gsap.context(() => {
      gsap.from("[data-hero-fade]", { y: 18, opacity: 0, duration: 0.8, stagger: 0.08, ease: "expo.out", delay });
      gsap.from("[data-branch-btn]", { y: 14, opacity: 0, duration: 0.7, stagger: 0.07, ease: "expo.out", delay: delay + 1.1 });
    }, el);
    const draw = animate(svg.createDrawable(art.current.querySelectorAll("[data-line]")), {
      draw: ["0 0", "0 1"],
      duration: 1300,
      delay: stagger(40, { start: delay * 1000 }),
      ease: "inOutCubic",
    });
    timer = setTimeout(() => cycle(0), delay * 1000 + 1700);
    return () => {
      clearTimeout(timer);
      ctx.revert();
      draw.revert?.();
    };
  }, [paths.length]);

  const touch = (i) => {
    touched.current = true;
    setAuto(null);
    setHover(i);
  };

  const choose = (i) => {
    touched.current = true;
    setActive(i);
    smoothTo(window.matchMedia("(min-width: 1024px)").matches ? `bab-${paths[i].key}` : "jalur");
  };

  return (
    <section ref={ref} className="relative overflow-hidden pb-12 pt-10 md:pb-16 md:pt-14">
      <Container>
        <nav aria-label="Breadcrumb" data-hero-fade className="text-sm text-text/55">
          <ol className="flex flex-wrap items-center gap-2">
            <li><a href="/" className="u-gold transition-colors hover:text-maroon">Beranda</a></li>
            <li aria-hidden>/</li>
            <li>Akademik</li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-navy">Jalur Kelulusan</li>
          </ol>
        </nav>

        <div className="mt-10 grid gap-12 lg:mt-14 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-14">
          <div>
            <p data-hero-fade className="kicker text-[11.5px] text-maroon">
              Tugas akhir · {thesis.sks} SKS · semester {thesis.semester}
            </p>
            <SceneTitle as="h1" trigger="mount" title={["Empat jalan,", "satu toga"]} className="mt-5 !text-[clamp(2.7rem,6vw,5rem)] !leading-[0.98]" />
            <p data-hero-fade className="mt-6 max-w-lg text-pretty text-[17px] leading-relaxed text-text/70">{intro.body}</p>
            <div data-hero-fade className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <button
                type="button"
                onClick={() => smoothTo("kesiapan")}
                className="group inline-flex h-12 items-center gap-2 rounded-md bg-maroon px-6 text-[15px] font-semibold text-white transition-[background-color,transform] duration-300 ease-cinematic hover:bg-maroon-deep active:scale-[0.98]"
              >
                Cek kesiapanku
                <svg aria-hidden viewBox="0 0 16 16" className="size-4 transition-transform duration-300 group-hover:translate-y-0.5">
                  <path d="M8 3v10M4 9l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button type="button" onClick={() => smoothTo("bandingkan")} className="text-[15px] font-semibold text-navy">
                <span className="u-gold">Bandingkan risikonya</span>
              </button>
            </div>
          </div>

          <div data-hero-fade className="relative">
            <div className="relative overflow-hidden rounded-2xl bg-maroon px-5 pb-6 pt-8 text-white shadow-[0_40px_80px_-50px_rgb(78_14_25/0.8)] sm:px-8 sm:pt-10" onPointerLeave={() => setHover(null)}>
              {/* label cabang sejajar puncak tiap cabang (x 84/200/320/436 dari 520) */}
              <div className="relative mx-auto max-w-[560px]">
                <div ref={art} className="grad-fork relative">
                  <GraduationForkIllustration className="h-auto w-full text-white" />
                </div>
                <div className="mt-2 grid grid-cols-4 gap-1.5 sm:gap-2">
                  {paths.map((p, i) => (
                    <button
                      key={p.key}
                      type="button"
                      data-branch-btn
                      onPointerEnter={() => touch(i)}
                      onFocus={() => touch(i)}
                      onBlur={() => setHover(null)}
                      onClick={() => choose(i)}
                      aria-describedby="jk-fork-read"
                      className={cn(
                        "rounded-md border px-1 py-2 text-center font-serif text-[14px] leading-tight transition-[background-color,color,border-color,transform] duration-300 ease-cinematic focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 active:scale-[0.97] sm:text-[17px]",
                        lit === i ? "border-gold bg-gold text-navy" : "border-white/20 text-white/85 hover:border-white/50"
                      )}
                    >
                      {p.title}
                    </button>
                  ))}
                </div>
              </div>
              <div id="jk-fork-read" aria-live="polite" className="mt-6 flex min-h-[68px] items-start border-t border-white/15 pt-5">
                {litPath ? (
                  <p key={litPath.key} className="animate-in fade-in-0 slide-in-from-bottom-1 duration-500">
                    <span className="block font-serif text-[1.2rem] italic leading-snug text-gold-soft sm:text-[1.35rem]">{litPath.oneLiner}</span>
                  </p>
                ) : (
                  <p className="text-[14.5px] text-white/60">Sentuh salah satu cabang untuk membaca ke mana arahnya.</p>
                )}
              </div>
            </div>
            <div className="pointer-events-none absolute -right-6 -top-16 hidden xl:block">
              <div className="relative"><ElvoPeek pose="think" size={96} side="left" say="Jalan mana pun, ujungnya tetap toga." delay={0.3} /></div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
