"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { animate, stagger, svg } from "animejs";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { CURTAIN_KEY } from "@/lib/struktur-content";
import { Container, SceneTitle } from "@/components/home/shared";
import { ElvoPeek } from "@/components/home/elvo-peek";
import { OrgTreeIllustration } from "@/components/illustrations/line-illustrations";
import { Magnetic } from "@/components/motion/magnetic";

function smoothTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
}

/**
 * Hero Struktur Organisasi (band maroon): judul + CTA di atas, bagan organisasi besar bergaris
 * putih yang tergambar garis demi garis (anime.js) dengan simpul emas berdenyut, baris avatar tim,
 * lalu strip statistik berhitung di dasar band. Elvo `confident` versi gelap.
 */
export function StrukturHero({ intro, people }) {
  const ref = useRef(null);
  const avatars = people.filter((p) => p.photo).slice(0, 6);
  const lecturers = people.filter((p) => p.group !== "staff");
  const stats = [
    { value: lecturers.length, label: "Dosen" },
    { value: lecturers.reduce((n, p) => n + (p.expertise?.length ?? 0), 0), label: "Topik keahlian" },
    { value: 1, label: "Minilab" },
  ];

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(CURTAIN_KEY) === "1";
    } catch {}
    const delay = seen ? 150 : 1900;

    const draw = animate(svg.createDrawable(el.querySelectorAll("[data-art] [data-line]")), {
      draw: ["0 0", "0 1"],
      duration: 1300,
      delay: stagger(30, { start: delay }),
      ease: "inOutCubic",
    });
    const fills = animate(el.querySelectorAll("[data-art] [fill]:not([fill='none'])"), { opacity: [0, 1], duration: 700, delay: delay + 800, ease: "outCubic" });
    const pulse = animate(el.querySelectorAll("[data-art] [data-node]"), {
      scale: [1, 2, 1],
      duration: 1300,
      delay: stagger(380, { start: delay + 1500 }),
      loop: true,
      loopDelay: 1100,
      ease: "inOutSine",
    });
    const counters = [...el.querySelectorAll("[data-count]")].map((n, i) => {
      const s = { v: 0 };
      n.textContent = "0";
      return animate(s, {
        v: Number(n.dataset.count),
        duration: 1400,
        delay: delay + 500 + i * 120,
        ease: "outExpo",
        onUpdate: () => (n.textContent = String(Math.round(s.v))),
      });
    });
    const ctx = gsap.context(() => {
      gsap.from("[data-hero-fade]", { y: 18, opacity: 0, duration: 0.8, stagger: 0.08, ease: "expo.out", delay: delay / 1000 });
      gsap.from("[data-avatar]", { x: -14, opacity: 0, duration: 0.6, stagger: 0.07, ease: "back.out(2)", delay: delay / 1000 + 0.5 });
      gsap.to("[data-parallax]", { yPercent: -8, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 0.8 } });
    }, el);
    return () => {
      draw.revert?.();
      fills.revert?.();
      pulse.revert?.();
      counters.forEach((c) => c.pause?.());
      ctx.revert();
    };
  }, []);

  return (
    <section ref={ref} className="relative overflow-hidden bg-maroon pb-0 pt-10 text-white md:pt-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_50%_40%,#000_30%,transparent_75%)]"
      />
      <Container className="relative">
        <nav aria-label="Breadcrumb" data-hero-fade className="text-sm text-white/55">
          <ol className="flex flex-wrap items-center gap-2">
            <li><a href="/" className="u-gold transition-colors hover:text-gold-soft">Beranda</a></li>
            <li aria-hidden>/</li>
            <li><a href="/profile" className="u-gold transition-colors hover:text-gold-soft">Profil</a></li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-white">Struktur Organisasi</li>
          </ol>
        </nav>

        <div className="mt-10 flex flex-col gap-8 lg:mt-14 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div className="max-w-3xl">
            <span aria-hidden data-hero-fade className="mb-6 block h-[3px] w-10 bg-gold" />
            <SceneTitle as="h1" trigger="mount" tone="dark" title={["Struktur", "Organisasi"]} className="!text-[clamp(2.75rem,6vw,5rem)]" />
            <p data-hero-fade className="mt-6 max-w-xl text-pretty text-[17px] leading-relaxed text-white/70">{intro.body}</p>
          </div>
          <div data-hero-fade className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-4 lg:pb-2">
            <Magnetic strength={0.25}>
              <a
                href="#bagan"
                onClick={(e) => {
                  e.preventDefault();
                  smoothTo("bagan");
                }}
                className="group inline-flex h-12 items-center gap-2 rounded-md bg-gold px-6 text-[15px] font-semibold text-navy transition-[background-color,transform] duration-300 ease-cinematic hover:bg-gold-soft active:scale-[0.98]"
              >
                Lihat bagan
                <svg aria-hidden viewBox="0 0 16 16" className="size-4 transition-transform duration-300 group-hover:translate-y-0.5">
                  <path d="M8 3v10M4 9l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </Magnetic>
            <a
              href="#minilab"
              onClick={(e) => {
                e.preventDefault();
                smoothTo("minilab");
              }}
              className="u-gold text-[15px] font-semibold text-white"
            >
              Fasilitas & keahlian
            </a>
          </div>
        </div>

        {/* bagan besar bergaris putih, simpul emas */}
        <div className="relative mx-auto mt-12 max-w-[880px] md:mt-14">
          <div
            data-art
            data-parallax
            className="art-on-dark text-white/80"
          >
            <OrgTreeIllustration className="h-auto w-full text-white/80" />
          </div>
          <div className="absolute -right-6 top-0 hidden lg:block xl:-right-20">
            <div className="relative"><ElvoPeek pose="confident" size={88} side="left" tone="dark" say="Mau tanya topik tertentu? Cek keahlian dosennya!" delay={0.4} /></div>
          </div>
        </div>

        {avatars.length > 0 && (
          <div className="mt-8 flex flex-col items-center gap-3 text-center">
            <div className="flex -space-x-2.5">
              {avatars.map((a) => (
                <span
                  key={a.key}
                  data-avatar
                  title={a.name}
                  className="relative size-11 overflow-hidden rounded-full bg-maroon-deep ring-[3px] ring-maroon transition-transform duration-300 ease-cinematic hover:z-10 hover:-translate-y-1"
                >
                  <Image src={a.photo} alt="" fill sizes="44px" className="object-cover" />
                </span>
              ))}
            </div>
            <p className="text-[13px] text-white/60">Dosen dan staf yang siap membantu Sisforians.</p>
          </div>
        )}
      </Container>

      {/* strip statistik di dasar band */}
      <div className="relative mt-12 border-t border-white/10 bg-maroon-deep/70 md:mt-14">
        <Container>
          <dl data-hero-fade className="grid grid-cols-3 divide-x divide-white/10">
            {stats.map((s) => (
              <div key={s.label} className="group px-3 py-6 text-center sm:px-6 md:py-8">
                <dd className="font-serif text-[clamp(1.8rem,4vw,2.75rem)] leading-none tabular-nums text-white">
                  <span data-count={s.value}>{s.value}</span>
                </dd>
                <dt className="mt-2 text-[13px] leading-snug text-white/55">{s.label}</dt>
                <span aria-hidden className="mx-auto mt-3 block h-[2px] w-6 bg-gold transition-[width] duration-500 ease-cinematic group-hover:w-12" />
              </div>
            ))}
          </dl>
        </Container>
      </div>
    </section>
  );
}
