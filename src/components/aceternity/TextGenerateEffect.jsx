"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

/** Aceternity "Text Generate Effect" — kata muncul satu per satu (GSAP). */
export default function TextGenerateEffect({ words = "", as: Tag = "p", className, duration = 0.6, stagger = 0.08, delay = 0 }) {
  const ref = useRef(null);
  useGSAP(
    () => {
      gsap.fromTo(
        ref.current.querySelectorAll("span"),
        { opacity: 0, filter: "blur(8px)", y: 6 },
        { opacity: 1, filter: "blur(0px)", y: 0, duration, stagger, delay, ease: "power2.out" }
      );
    },
    { scope: ref, dependencies: [words] }
  );
  return (
    <Tag ref={ref} className={cn(className)} aria-label={words}>
      {words.split(" ").map((w, i) => (
        <span key={`${w}-${i}`} aria-hidden="true" className="inline-block opacity-0">
          {w}&nbsp;
        </span>
      ))}
    </Tag>
  );
}
