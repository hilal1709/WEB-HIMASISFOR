"use client";
import { useLayoutEffect as useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { gsap, ScrollTrigger, sceneTokens } from "@/lib/scroll";
import { useSmooth } from "./smooth-scroll";

/**
 * Scene = satu "babak" cinematic scroll.
 *
 * Mode cinematic (desktop, tanpa reduced-motion):
 *  1. MASUK  — scene naik menutupi scene sebelumnya; konten melakukan transisi `enter`.
 *  2. (opsional) HORIZONTAL — bila ada elemen `[data-h-track]`, scene di-pin dan track
 *     digeser ke kiri sepanjang scroll vertikal. `[data-h-parallax]` di dalam track
 *     bergerak lebih lambat (parallax).
 *  3. TUMPUK — scene tetap di-pin, mengecil & meredup saat scene berikutnya naik.
 *  Hasilnya tidak terasa "scroll ke bawah" — terasa berpindah babak.
 *
 * Mode biasa: tidak ada pin; track horizontal jadi scroll-snap native.
 *
 * Props: id (anchor + chapter), prev (id scene sebelumnya, untuk maskot/rail),
 * index (z-index tumpukan), enter: "rise" | "clip" | "zoom" | false, stack (false untuk scene terakhir).
 */
export function Scene({ id, prev = null, index = 0, enter = "rise", stack = true, className, frameClassName, children, label }) {
  const el = useRef(null);
  const frame = useRef(null);
  const content = useRef(null);
  const { cinematic, setActive, registerScene } = useSmooth();

  // pelacak scene aktif (berlaku di semua mode)
  useEffect(() => {
    const node = el.current;
    if (!node) return;
    let pinST = null;
    const st = ScrollTrigger.create({
      trigger: node,
      start: "top 55%",
      onEnter: () => setActive(id),
      onLeaveBack: () => setActive(prev),
    });
    const unregister = registerScene(id, () => {
      pinST = ScrollTrigger.getById(`pin-${id}`);
      return pinST ? pinST.start : node.getBoundingClientRect().top + window.scrollY;
    });
    return () => {
      st.kill();
      unregister();
    };
  }, [id, prev, setActive, registerScene, cinematic]);

  // koreografi cinematic
  useEffect(() => {
    if (!cinematic) return;
    const node = el.current;
    const ctx = gsap.context(() => {
      const track = node.querySelector("[data-h-track]");
      const vh = () => window.innerHeight;
      const travel = () => (track ? Math.max(0, track.scrollWidth - track.parentElement.clientWidth) : 0);
      const tall = () => !track && node.offsetHeight > vh() + 4;
      const pinAt = () => (tall() ? "bottom bottom" : "top top");

      // jarak horizontal dipesan lewat margin-bottom supaya scene berikutnya datang setelah track selesai
      const reserve = () => gsap.set(node, { marginBottom: travel() });
      if (track) {
        reserve();
        ScrollTrigger.addEventListener("refreshInit", reserve);
      }

      // 1. masuk
      const enterST = { trigger: node, start: "top bottom", end: "top top", scrub: sceneTokens.scrub };
      if (enter === "rise") {
        gsap.fromTo(content.current, { yPercent: 14, opacity: 0.15 }, { yPercent: 0, opacity: 1, ease: "none", scrollTrigger: enterST });
      } else if (enter === "zoom") {
        gsap.fromTo(content.current, { scale: 1.12, opacity: 0 }, { scale: 1, opacity: 1, ease: "none", scrollTrigger: enterST });
      } else if (enter === "clip") {
        gsap.fromTo(
          frame.current,
          { clipPath: "inset(10% 7% 0% 7% round 48px)" },
          { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none", scrollTrigger: enterST }
        );
      }

      // 2. horizontal
      let hTween = null;
      if (track) {
        hTween = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: node,
            start: "top top",
            end: () => `+=${travel()}`,
            scrub: sceneTokens.scrub,
            invalidateOnRefresh: true,
          },
        });
        hTween.to(track, { x: () => -travel() }, 0);
        const progress = node.querySelector("[data-h-progress]");
        if (progress) hTween.fromTo(progress, { scaleX: 0 }, { scaleX: 1 }, 0);
        track.querySelectorAll("[data-h-parallax]").forEach((p) => {
          gsap.fromTo(
            p,
            { xPercent: -10 },
            {
              xPercent: 10,
              ease: "none",
              scrollTrigger: { containerAnimation: hTween, trigger: p.parentElement, start: "left right", end: "right left", scrub: true },
            }
          );
        });
      }

      // 3. pin + tumpuk
      if (stack) {
        ScrollTrigger.create({
          id: `pin-${id}`,
          trigger: node,
          start: pinAt,
          end: () => `+=${travel() + vh()}`,
          pin: true,
          pinSpacing: false,
          invalidateOnRefresh: true,
        });
        gsap.to(frame.current, {
          scale: sceneTokens.stackScale,
          borderRadius: 40,
          ease: "none",
          scrollTrigger: {
            trigger: node,
            start: () => `${pinAt()}-=${travel()}`,
            end: () => `+=${vh()}`,
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
        gsap.to(node.querySelector("[data-scene-dim]"), {
          opacity: sceneTokens.stackDim,
          ease: "none",
          scrollTrigger: {
            trigger: node,
            start: () => `${pinAt()}-=${travel()}`,
            end: () => `+=${vh()}`,
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
      }

      return () => ScrollTrigger.removeEventListener("refreshInit", reserve);
    }, node);

    ScrollTrigger.refresh();
    return () => {
      ctx.revert();
      gsap.set(node, { clearProps: "marginBottom" });
    };
  }, [cinematic, enter, stack, id]);

  return (
    <section
      id={id}
      ref={el}
      aria-label={label}
      className="scene relative"
      style={{ zIndex: index + 1 }}
    >
      <div
        ref={frame}
        className={cn("scene-frame relative min-h-svh origin-top overflow-hidden will-change-transform", frameClassName)}
      >
        <div ref={content} className={cn("relative h-full", className)}>
          {children}
        </div>
        <div data-scene-dim aria-hidden className="pointer-events-none absolute inset-0 bg-ink opacity-0" />
      </div>
    </section>
  );
}

/**
 * Track horizontal di dalam Scene. Mode biasa = scroll-snap horizontal native.
 * Taruh panel sebagai children; tambahkan `data-h-parallax` pada layer yang ingin parallax.
 */
export function HorizontalTrack({ className, children }) {
  return (
    <div className="h-viewport no-scrollbar relative w-full overflow-x-auto snap-x snap-mandatory">
      <div data-h-track className={cn("flex w-max gap-6 will-change-transform", className)}>
        {children}
      </div>
    </div>
  );
}
