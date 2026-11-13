"use client";
import { useRef } from "react";
import { motion, useAnimationFrame, useMotionTemplate, useMotionValue, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

/** Kartu dengan sorotan yang mengikuti kursor (pola "card spotlight" Aceternity). */
export function Spotlight({ as: Tag = "div", className, children, color = "rgb(201 162 39 / 0.16)", ...props }) {
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const bg = useMotionTemplate`radial-gradient(220px circle at ${x}px ${y}px, ${color}, transparent 70%)`;
  const MotionTag = motion[Tag] ?? motion.div;
  return (
    <MotionTag
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - r.left);
        y.set(e.clientY - r.top);
      }}
      onPointerLeave={() => {
        x.set(-200);
        y.set(-200);
      }}
      className={cn("group/spot relative isolate", className)}
      {...props}
    >
      <motion.span aria-hidden className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/spot:opacity-100" style={{ background: bg }} />
      {children}
    </MotionTag>
  );
}

/** Tombol dengan kilau yang mengelilingi tepinya (pola "moving border" Aceternity). */
export function MovingBorder({ children, className, inner, duration = 3200, disabled, ...props }) {
  const rect = useRef(null);
  const progress = useMotionValue(0);
  useAnimationFrame((t) => {
    const el = rect.current;
    if (!el || disabled) return;
    const len = el.getTotalLength();
    progress.set(((t / duration) * len) % len);
  });
  const px = useTransform(progress, (v) => rect.current?.getPointAtLength(v).x ?? 0);
  const py = useTransform(progress, (v) => rect.current?.getPointAtLength(v).y ?? 0);
  const transform = useMotionTemplate`translateX(${px}px) translateY(${py}px) translateX(-50%) translateY(-50%)`;
  return (
    <button type="button" disabled={disabled} className={cn("relative overflow-hidden rounded-full p-px disabled:cursor-not-allowed", className)} {...props}>
      <span className="absolute inset-0">
        <svg preserveAspectRatio="none" className="absolute h-full w-full" width="100%" height="100%">
          <rect ref={rect} fill="none" width="100%" height="100%" rx="22" ry="22" />
        </svg>
        {!disabled && (
          <motion.span style={{ transform }} className="absolute left-0 top-0 block size-16 bg-[radial-gradient(var(--gold)_40%,transparent_60%)] opacity-90" />
        )}
      </span>
      <span className={cn("relative flex h-full w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-maroon px-5 text-sm font-semibold text-white backdrop-blur-xl", inner)}>{children}</span>
    </button>
  );
}

/** Kisi tipis bermasker radial di latar kanvas Studio. */
export function GridBackdrop({ className }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        backgroundImage: "linear-gradient(rgb(255 255 255 / 0.045) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.045) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
        maskImage: "radial-gradient(ellipse at 30% 20%, black 20%, transparent 75%)",
        WebkitMaskImage: "radial-gradient(ellipse at 30% 20%, black 20%, transparent 75%)",
      }}
    />
  );
}
