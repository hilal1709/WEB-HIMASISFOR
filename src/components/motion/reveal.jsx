"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import { motionTokens, prefersReducedMotion } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

/**
 * GSAP scroll reveal. `stagger` = animasikan anak langsung secara berurutan.
 * <Reveal stagger><Card/><Card/></Reveal>
 */
export function Reveal({ children, className, y = 32, stagger = false, delay = 0 }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const targets = stagger ? el.children : el;
    const ctx = gsap.context(() => {
      gsap.from(targets, {
        opacity: 0,
        y,
        delay,
        duration: motionTokens.duration.slow,
        ease: motionTokens.ease.out,
        stagger: stagger ? motionTokens.stagger : 0,
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      });
    }, el);
    return () => ctx.revert();
  }, [y, stagger, delay]);

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
