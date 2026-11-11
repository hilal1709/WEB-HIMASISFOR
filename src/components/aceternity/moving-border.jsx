"use client";
import { useRef } from "react";
import { motion, useAnimationFrame, useMotionTemplate, useMotionValue, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

function MovingBorderGlow({ children, duration = 3000, rx = "30%", ry = "30%" }) {
  const pathRef = useRef(null);
  const progress = useMotionValue(0);

  useAnimationFrame((time) => {
    const length = pathRef.current?.getTotalLength();
    if (length) progress.set((time * (length / duration)) % length);
  });

  const x = useTransform(progress, (v) => pathRef.current?.getPointAtLength(v).x);
  const y = useTransform(progress, (v) => pathRef.current?.getPointAtLength(v).y);
  const transform = useMotionTemplate`translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(-50%)`;

  return (
    <>
      <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="absolute h-full w-full" width="100%" height="100%">
        <rect fill="none" width="100%" height="100%" rx={rx} ry={ry} ref={pathRef} />
      </svg>
      <motion.div style={{ position: "absolute", top: 0, left: 0, display: "inline-block", transform }}>
        {children}
      </motion.div>
    </>
  );
}

/** Aceternity UI — tombol dengan border bercahaya yang berputar (aksen merah brand). */
export function MovingBorderButton({ children, className, duration = 3000, as: Tag = "button", ...props }) {
  return (
    <Tag className="relative inline-flex h-12 overflow-hidden rounded-xl bg-transparent p-px" {...props}>
      <div className="absolute inset-0">
        <MovingBorderGlow duration={duration} rx="12px" ry="12px">
          <div className="size-20 bg-[radial-gradient(var(--brand-to)_40%,transparent_60%)] opacity-90" />
        </MovingBorderGlow>
      </div>
      <span
        className={cn(
          "relative flex size-full items-center justify-center gap-2 rounded-[11px] bg-zinc-950 px-6 text-sm font-semibold text-white backdrop-blur-xl",
          className
        )}
      >
        {children}
      </span>
    </Tag>
  );
}
