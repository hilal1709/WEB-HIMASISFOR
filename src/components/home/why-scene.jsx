"use client";
import { useLayoutEffect as useEffect, useRef, useState } from "react";
import { animate, svg, stagger } from "animejs";
import { gsap, ScrollTrigger } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { WHY, PMB_URL } from "@/lib/home-content";
import { ILLUSTRATIONS } from "@/components/illustrations/line-illustrations";
import { cn } from "@/lib/utils";
import { Container, PillLink, SceneTitle } from "./shared";

/**
 * Keunggulan — pola "how it works" (horizonx.so): kolom kiri di-pin (GSAP, aman untuk ScrollSmoother),
 * panel kanan bergulir; langkah aktif menyala, garis progres merah terisi, ilustrasi digambar ulang (anime.js).
 */
export function WhyScene() {
  const root = useRef(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const pin = ScrollTrigger.create({
        trigger: el.querySelector("[data-steps]"),
        start: "top top+=120",
        endTrigger: el.querySelector("[data-panels]"),
        end: "bottom bottom-=80",
        pin: el.querySelector("[data-pin]"),
        pinSpacing: false,
      });
      const bar = gsap.fromTo(
        el.querySelector("[data-progress]"),
        { scaleY: 0 },
        { scaleY: 1, ease: "none", scrollTrigger: { trigger: el.querySelector("[data-panels]"), start: "top center", end: "bottom center", scrub: true } }
      );
      return () => {
        pin.kill();
        bar.scrollTrigger?.kill();
        bar.kill();
      };
    });
    const triggers = [...el.querySelectorAll("[data-panel]")].map((p, i) =>
      ScrollTrigger.create({ trigger: p, start: "top 60%", end: "bottom 60%", onToggle: (s) => s.isActive && setActive(i) })
    );
    return () => {
      triggers.forEach((t) => t.kill());
      mm.revert();
    };
  }, []);

  // gambar ulang garis ilustrasi panel aktif
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lines = root.current?.querySelectorAll(`[data-panel="${active}"] [data-line]`);
    if (!lines?.length) return;
    const a = animate(svg.createDrawable(lines), { draw: ["0 0", "0 1"], duration: 1100, delay: stagger(40), ease: "inOutQuad" });
    return () => a.revert?.();
  }, [active]);

  return (
    <section ref={root} id="keunggulan" className="py-12 md:py-20">
      <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div data-steps>
          <div data-pin>
            <SceneTitle title={WHY.title} size="md" />
            <p data-aos="fade-up" className="mt-5 max-w-md text-[17px] leading-relaxed text-night/60">
              {WHY.body}
            </p>
            <ol className="relative mt-10 hidden space-y-1 pl-6 lg:block">
              <span aria-hidden className="absolute bottom-2 left-0 top-2 w-px bg-hairline" />
              <span aria-hidden data-progress className="absolute bottom-2 left-0 top-2 w-px origin-top bg-primary" />
              {WHY.items.map((it, i) => (
                <li key={it.title} className={cn("flex items-baseline gap-4 py-2 transition-colors duration-500", i === active ? "text-night" : "text-night/35")}>
                  <span className="tabular text-xs font-medium">0{i + 1}</span>
                  <span className={cn("text-lg font-semibold tracking-[-0.01em] transition-transform duration-500 ease-cinematic", i === active && "translate-x-1")}>{it.title}</span>
                </li>
              ))}
            </ol>
            <div className="mt-10 hidden lg:block">
              <PillLink href={PMB_URL} variant="dark" target="_blank" rel="noopener noreferrer">
                Mulai perjalananmu
              </PillLink>
            </div>
          </div>
        </div>

        <div data-panels className="space-y-5">
          {WHY.items.map((it, i) => {
            const Illustration = ILLUSTRATIONS[it.illustration];
            return (
              <article
                key={it.title}
                data-panel={i}
                className={cn(
                  "tile flex min-h-[420px] flex-col justify-between p-7 transition-[opacity,transform] duration-700 ease-cinematic md:p-10 lg:min-h-[62vh]",
                  "lg:opacity-40",
                  i === active && "lg:opacity-100"
                )}
              >
                <span className="tabular text-sm font-medium text-night/40">0{i + 1} / 0{WHY.items.length}</span>
                <div className="mx-auto w-full max-w-md py-8">{Illustration && <Illustration />}</div>
                <div>
                  <h3 className="display-xl text-[clamp(1.75rem,3vw,2.5rem)] text-night">{it.title}</h3>
                  <p className="mt-3 max-w-md text-[17px] leading-relaxed text-night/60">{it.body}</p>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
