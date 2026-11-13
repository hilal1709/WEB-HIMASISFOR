"use client";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { cn } from "@/lib/utils";

const STATUS = {
  idle: { text: "Menunggu identitas", tone: "text-white/60" },
  typing: { text: "Mengisi data", tone: "text-gold-soft" },
  checking: { text: "Memeriksa akses", tone: "text-gold-soft" },
  ok: { text: "Akses diberikan", tone: "text-emerald-300" },
  fail: { text: "Akses ditolak", tone: "text-red-300" },
};

/**
 * Kartu "Pas Akses": miring mengikuti kursor (GSAP quickTo, tanpa glare gradien).
 * Status & 4 segmen kekuatan sandi mengikuti form; saat `ok` dicap Lottie stempel.
 */
export function AccessPass({ status = "idle", strength = 0, email = "" }) {
  const card = useRef(null);
  const s = STATUS[status];

  useLayoutEffect(() => {
    const el = card.current;
    if (!el || prefersReducedMotion() || !window.matchMedia("(pointer: fine)").matches) return;
    const rx = gsap.quickTo(el, "rotationX", { duration: 0.6, ease: "power3.out" });
    const ry = gsap.quickTo(el, "rotationY", { duration: 0.6, ease: "power3.out" });
    gsap.set(el, { transformPerspective: 900, transformOrigin: "50% 50%" });
    const parent = el.parentElement;
    const move = (e) => {
      const r = parent.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - 0.5) * 14);
      rx((0.5 - (e.clientY - r.top) / r.height) * 12);
    };
    const leave = () => {
      rx(0);
      ry(0);
    };
    parent.addEventListener("pointermove", move);
    parent.addEventListener("pointerleave", leave);
    return () => {
      parent.removeEventListener("pointermove", move);
      parent.removeEventListener("pointerleave", leave);
    };
  }, []);

  // goyang halus saat ditolak
  useLayoutEffect(() => {
    if (status !== "fail" || prefersReducedMotion()) return;
    gsap.fromTo(card.current, { x: -10 }, { x: 0, duration: 0.7, ease: "elastic.out(1, 0.35)" });
  }, [status]);

  return (
    <div className="mx-auto w-full max-w-[340px]">
      <div
        ref={card}
        className={cn(
          "relative overflow-hidden rounded-lg border bg-navy text-white shadow-[0_40px_80px_-30px_rgb(14_24_48/0.8)] transition-colors duration-500 will-change-transform",
          status === "ok" ? "border-emerald-300/50" : status === "fail" ? "border-red-300/50" : "border-white/10"
        )}
      >
        <span className="absolute inset-x-0 top-0 h-1 bg-gold" />

        <div className="flex items-center gap-4 px-6 pb-5 pt-7">
          <LottieIllustration src="/lottie/shield-audit-dark.json" className="size-16 shrink-0" speed={0.8} />
          <div className="min-w-0">
            <p className="kicker text-gold">Pas akses</p>
            <p className="mt-1 truncate font-serif text-xl leading-tight">{email.trim() ? email.split("@")[0] : "Pengelola"}</p>
          </div>
        </div>

        {/* perforasi */}
        <div className="relative px-6">
          <span className="absolute -left-3 top-1/2 size-6 -translate-y-1/2 rounded-full bg-maroon" />
          <span className="absolute -right-3 top-1/2 size-6 -translate-y-1/2 rounded-full bg-maroon" />
          <div className="border-t border-dashed border-white/20" />
        </div>

        <div className="px-6 pb-6 pt-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Status</p>
              <p aria-live="polite" className={cn("mt-1 text-sm font-semibold transition-colors", s.tone)}>
                {s.text}
              </p>
            </div>
            <div className="flex gap-1.5" aria-hidden>
              {[1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className={cn("h-1.5 w-7 rounded-full transition-all duration-500", strength >= i ? "bg-gold" : "bg-white/15")}
                  style={{ transitionDelay: `${i * 40}ms` }}
                />
              ))}
            </div>
          </div>
        </div>

        {status === "ok" && (
          <div className="pointer-events-none absolute -right-2 bottom-2 size-28 rotate-[-10deg]">
            <LottieIllustration src="/lottie/stamp-dark.json" loop={false} className="size-full" />
          </div>
        )}
      </div>
    </div>
  );
}
