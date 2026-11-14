"use client";
import { Fragment, useLayoutEffect as useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion, curtainDelay } from "@/lib/motion";
import { CURTAIN_KEY, initials } from "@/lib/struktur-content";
import { Container, SceneTitle } from "@/components/home/shared";
import { ElvoPeek } from "@/components/home/elvo-peek";
import { Magnetic } from "@/components/motion/magnetic";
import { cn } from "@/lib/utils";
import { usePersonModal } from "./person-modal";

function smoothTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
}


/** Satu sel potret di dinding tim. */
function Tile({ p, big = false, badge, onOpen }) {
  return (
    <button
      type="button"
      data-tile
      onClick={() => onOpen(p.key)}
      aria-label={`${p.name}, ${p.role}`}
      className={cn("group relative overflow-hidden rounded-lg bg-cream-2 text-left", big && "col-span-2 row-span-2")}
    >
      {p.photo ? (
        <Image
          src={p.photo}
          alt=""
          fill
          sizes={big ? "(min-width:1024px) 600px, 100vw" : "(min-width:1024px) 300px, 50vw"}
          className="object-cover object-top transition-transform duration-700 ease-cinematic group-hover:scale-[1.04]"
        />
      ) : (
        <span className="grid size-full place-items-center bg-navy font-serif text-3xl text-gold-soft">{initials(p.name)}</span>
      )}
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink/70 to-transparent" />
      <span className="absolute inset-x-0 bottom-0 p-4 text-white transition-transform duration-500 ease-cinematic sm:translate-y-2 sm:group-hover:translate-y-0">
        <span className={cn("block font-serif leading-tight", big ? "text-[clamp(1.4rem,2.4vw,2rem)]" : "text-[15px] sm:text-[17px]")}>{p.name}</span>
        <span className="mt-1 block text-[12px] text-white/75 sm:opacity-0 sm:transition-opacity sm:duration-500 sm:group-hover:opacity-100">{p.role}</span>
      </span>
      {big && badge && <span className="absolute left-4 top-4 rounded bg-gold px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-navy">{badge}</span>}
    </button>
  );
}

/**
 * Hero Struktur Organisasi "dinding tim": mosaik bento dari orang-orang prodi. Sel judul maroon,
 * pimpinan di sel besar 2×2, dosen & staf di sel potret. Foto grayscale → berwarna saat hover,
 * nama & jabatan naik dari bawah; klik membuka modal orang. Sel masuk dengan clip-path bertahap.
 */
export function StrukturHero({ content: c, people, curtain = true }) {
  const ref = useRef(null);
  const open = usePersonModal();
  const lead = people.find((p) => !p.reportsTo && p.group !== "staff") ?? people[0];
  const rest = people.filter((p) => p.key !== lead.key);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const delay = curtain ? curtainDelay(CURTAIN_KEY) : 0;
    const ctx = gsap.context(() => {
      gsap.from("[data-hero-fade]", { y: 18, opacity: 0, duration: 0.8, stagger: 0.08, ease: "expo.out", delay });
      gsap.fromTo("[data-tile]", { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 1.1, stagger: 0.07, ease: "expo.out", delay: delay + 0.1 });
      gsap.from("[data-tile] img", { scale: 1.15, duration: 1.5, stagger: 0.07, ease: "expo.out", delay: delay + 0.1 });
    }, el);
    return () => ctx.revert();
  }, [curtain]);

  return (
    <section ref={ref} id="struktur-hero" className="relative overflow-hidden pb-10 pt-10 md:pb-14 md:pt-14">
      <Container>
        <nav aria-label="Breadcrumb" data-hero-fade className="text-sm text-text/55">
          <ol className="flex flex-wrap items-center gap-2">
            {c.breadcrumb.map((b) => (
              <Fragment key={b.href + b.label}>
                <li><a href={b.href} className="u-gold transition-colors hover:text-maroon">{b.label}</a></li>
                <li aria-hidden>/</li>
              </Fragment>
            ))}
            <li aria-current="page" className="text-navy">{c.current}</li>
          </ol>
        </nav>

        <div className="mt-8 grid auto-rows-[170px] grid-cols-2 gap-3 [grid-auto-flow:dense] sm:auto-rows-[200px] lg:mt-10 lg:auto-rows-[250px] lg:grid-cols-4 lg:gap-4">
          {/* sel judul */}
          <div className="relative col-span-2 row-span-2 flex flex-col justify-between gap-6 overflow-hidden rounded-lg bg-maroon p-6 text-white lg:row-span-1 md:p-7">
            <span aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full border border-white/10" />
            <div className="relative">
              <SceneTitle as="h1" trigger="mount" tone="dark" title={[c.titleTop, c.titleAccent]} className="!text-[clamp(2.1rem,3.6vw,3.1rem)] !leading-[1.02] lg:whitespace-nowrap" />
              <p data-hero-fade className="mt-3 max-w-md text-pretty text-[15px] leading-relaxed text-white/70">{c.body}</p>
            </div>
            <div data-hero-fade className="relative flex flex-wrap items-center gap-x-5 gap-y-3">
              <Magnetic strength={0.25}>
                <a
                  href="#bagan"
                  onClick={(e) => {
                    e.preventDefault();
                    smoothTo("bagan");
                  }}
                  className="group inline-flex h-11 items-center gap-2 rounded-md bg-gold px-5 text-[14.5px] font-semibold text-navy transition-[background-color,transform] duration-300 ease-cinematic hover:bg-gold-soft active:scale-[0.98]"
                >
                  {c.primaryLabel}
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
                className="u-gold text-[14.5px] font-semibold text-white"
              >
                {c.secondaryLabel}
              </a>
            </div>
          </div>

          <Tile p={lead} big badge={c.leadBadge} onOpen={open} />
          {rest.map((p) => (
            <Tile key={p.key} p={p} onOpen={open} />
          ))}
        </div>

        {c.mascot.show && c.mascot.say && (
          <div className="mt-5 flex items-center justify-end gap-4">
            <div className="relative hidden shrink-0 lg:block">
              <ElvoPeek pose={c.mascot.pose} size={72} side="left" say={c.mascot.say} delay={0.4} />
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
