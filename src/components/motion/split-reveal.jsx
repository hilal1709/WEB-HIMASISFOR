"use client";
import { useLayoutEffect as useEffect, useRef } from "react";
import { gsap, SplitText } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Teks muncul per kata (mask + naik + blur → tajam). Pola "text reveal" 21st.dev.
 * `as` = tag heading, `trigger="mount"` untuk hero, `"scroll"` untuk section.
 */
export function SplitReveal({ as: Tag = "h2", children, className, trigger = "scroll", delay = 0, stagger = 0.04 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let split;
    const ctx = gsap.context(() => {
      split = SplitText.create(el, { type: "words", mask: "words", wordsClass: "split-word" });
      gsap.from(split.words, {
        yPercent: 100,
        opacity: 0,
        duration: 0.9,
        ease: "expo.out",
        stagger,
        delay,
        scrollTrigger: trigger === "scroll" ? { trigger: el, start: "top 88%", once: true } : undefined,
      });
    }, el);
    return () => {
      ctx.revert();
      split?.revert();
    };
  }, [trigger, delay, stagger]);
  return (
    <Tag ref={ref} className={cn(className)}>
      {children}
    </Tag>
  );
}

