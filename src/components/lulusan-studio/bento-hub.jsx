"use client";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { SCENES, fillCount } from "@/lib/profil-lulusan-cms/schema";
import { Spotlight } from "@/components/home-studio/fx";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { ILLUSTRATIONS } from "@/components/illustrations/line-illustrations";
import { WordRotate } from "@/components/motion/word-rotate";
import { cn } from "@/lib/utils";
import { Ring } from "./chrome";

const initials = (n) => String(n).split(/[ ,.]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("");

/**
 * Hub bento Galeri Wisuda: tiap tile = miniatur hidup section publik. Hover menyorot (spotlight),
 * klik memekarkan tile ke mode fokus (editor dibuka dengan clip-path dari posisi tile).
 */
export function BentoHub({ value, changed, completeness, flagsBy, onOpen }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    if (!ref.current || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-tile]", { y: 36, opacity: 0, scale: 0.97, duration: 0.9, ease: "expo.out", stagger: { each: 0.06, from: "start" }, clearProps: "transform,opacity" });
    }, ref.current);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="grid auto-rows-[minmax(150px,auto)] grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
      {SCENES.map((s, i) => (
        <div key={s.key} data-tile data-tile-key={s.key} className={cn("min-w-0 rounded-3xl", s.span)}>
          <Spotlight
            as="button"
            type="button"
            onClick={(e) => onOpen(s.key, e.currentTarget.getBoundingClientRect())}
            className="flex h-full w-full flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.035] p-5 text-left transition-[border-color,transform,background-color] duration-500 ease-cinematic hover:-translate-y-0.5 hover:border-gold/40 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
          >
            <span className="flex items-start gap-3">
              <span className="font-serif text-[13px] tabular-nums text-gold/80">{String(i + 1).padStart(2, "0")}</span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="font-serif text-[1.15rem] leading-tight text-white">{s.label}</span>
                  {changed.includes(s.key) && <span title="Berubah sejak terbit" className="size-2 rounded-full bg-gold shadow-[0_0_0_4px_rgb(201_162_39/0.2)]" />}
                  {flagsBy[s.key] > 0 && <span className="rounded-full bg-orange-400/15 px-1.5 text-[10.5px] font-semibold text-orange-300">{flagsBy[s.key]} kembar</span>}
                </span>
                <span className="mt-0.5 block text-[12px] text-white/45">{s.hint}</span>
              </span>
              <Ring value={completeness[s.key] ?? 1} />
            </span>
            <span className="mt-4 flex min-h-0 flex-1 flex-col">
              <Mini scene={s.key} v={value} />
            </span>
          </Spotlight>
        </div>
      ))}
    </div>
  );
}

/** Miniatur isi tiap section. */
function Mini({ scene, v }) {
  switch (scene) {
    case "hero": {
      const h = v.hero;
      const faces = v.alumni.items.filter((a) => a.photo).slice(0, h.collage ?? 6);
      return (
        <span className="flex flex-1 flex-col justify-between gap-5">
          <span>
            <span className="block font-serif text-[clamp(2rem,4vw,3.4rem)] leading-[0.95] text-white">
              {h.titleTop} <em className="text-gold-soft">{h.titleAccent}</em>
            </span>
            <span className="mt-3 line-clamp-2 block max-w-lg text-[13px] text-white/55">{h.body}</span>
          </span>
          <span className="block border-y border-white/10 py-3">
            <span className="block text-[12px] text-white/45">{h.rolesLead}</span>
            <span className="block font-serif text-[1.5rem] italic text-gold-soft">{h.roles.length ? <WordRotate key={h.roles.join("|")} words={h.roles} interval={2200} /> : "—"}</span>
          </span>
          <span className="flex -space-x-2">
            {faces.map((a, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={`${a.name}-${i}`} src={a.photo} alt="" className="size-9 rounded-full border-2 border-[#08111f] object-cover grayscale-[0.3]" style={{ rotate: `${(i % 2 ? 1 : -1) * 4}deg` }} />
            ))}
            {h.video?.show && <span className="ml-4 grid size-9 place-items-center rounded-full border border-white/20 text-[11px] text-white/70">▶</span>}
          </span>
        </span>
      );
    }
    case "curtain": {
      const c = v.curtain;
      return (
        <span className={cn("grid flex-1 place-items-center rounded-2xl py-4 transition-colors", c.enabled ? "bg-maroon" : "bg-white/[0.04]")}>
          <span className={cn("font-serif text-[1.4rem]", c.enabled ? "text-white" : "text-white/30 line-through")}>
            {c.title} <em className="text-gold-soft">{c.accent}</em>
          </span>
        </span>
      );
    }
    case "seo":
      return (
        <span className="block rounded-2xl bg-white px-3 py-2.5">
          <span className="block truncate text-[12.5px] text-[#1a0dab]">{v.seo.title}</span>
          <span className="block text-[10.5px] text-emerald-700">sisfor.uisi.ac.id › profil-lulusan</span>
          <span className="mt-0.5 line-clamp-2 block text-[11px] text-[#4d5156]">{v.seo.description}</span>
        </span>
      );
    case "profiles": {
      const items = v.profiles.items;
      return (
        <span className="flex flex-1 flex-col">
          <span className="block font-serif text-[1.1rem] text-white/80">
            {fillCount(v.profiles.titleTop, items.length)} <em className="text-gold-soft">{v.profiles.titleAccent}</em>
          </span>
          {/* dek kartu: mengipas saat tile di-hover */}
          <span className="relative mt-4 block h-40 flex-1">
            {items.map((p, i) => {
              const mid = (items.length - 1) / 2;
              return (
                <span
                  key={p.key}
                  className="absolute bottom-0 left-1/2 flex h-36 w-28 flex-col justify-between rounded-xl border border-white/10 bg-navy p-2.5 shadow-[0_20px_30px_-20px_rgb(0_0_0/0.9)] transition-transform duration-700 ease-cinematic [transform:translateX(calc(-50%_+_var(--rx)))_rotate(var(--rr))] group-hover/spot:[transform:translateX(calc(-50%_+_var(--fx)))_rotate(var(--fr))]"
                  style={{ "--rx": `${(i - mid) * 12}px`, "--rr": `${(i - mid) * 3}deg`, "--fx": `${(i - mid) * 46}px`, "--fr": `${(i - mid) * 7}deg`, transformOrigin: "50% 120%", zIndex: i }}
                >
                  <span className="font-serif text-[1.4rem] leading-none text-gold/90">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-[11px] leading-tight text-white">{p.short || p.title}</span>
                </span>
              );
            })}
          </span>
        </span>
      );
    }
    case "cpl":
      return (
        <span className="grid flex-1 grid-cols-2 gap-2">
          {v.cpl.items.slice(0, 4).map((c) => {
            const Illu = ILLUSTRATIONS[c.illustration];
            return (
              <span key={c.key} className={cn("flex items-center gap-2 rounded-xl border border-white/[0.07] bg-black/20 p-2.5", c.wide && "col-span-2")}>
                <span className="w-9 shrink-0 text-gold-soft/80">{Illu && <Illu />}</span>
                <span className="min-w-0">
                  <span className="block truncate text-[12px] text-white">{c.title}</span>
                  <span className="text-[10.5px] text-white/40">{c.items.length} butir</span>
                </span>
              </span>
            );
          })}
        </span>
      );
    case "stats":
      return (
        <span className="grid flex-1 grid-cols-2 items-end gap-3 sm:grid-cols-4">
          {v.stats.items.slice(0, 4).map((s, i) => (
            <span key={i} className="block">
              <span className="block h-[2px] w-6 bg-gold" />
              <span className="mt-2 block font-serif text-[1.6rem] leading-none tabular-nums text-white">
                {s.value.toLocaleString("id-ID")}
                <span className="text-gold-soft">{s.suffix}</span>
              </span>
              <span className="mt-1 line-clamp-2 block text-[10.5px] text-white/45">{s.label}</span>
            </span>
          ))}
        </span>
      );
    case "alumni":
      return (
        <span className="flex flex-1 flex-wrap content-start gap-2">
          {v.alumni.items.slice(0, 12).map((a, i) => (
            <span key={`${a.name}-${i}`} className="relative grid size-12 place-items-center overflow-hidden rounded-lg bg-white/[0.06] font-serif text-[13px] text-gold-soft">
              {a.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.photo} alt="" className="absolute inset-0 size-full object-cover grayscale transition-[filter] duration-500 group-hover/spot:grayscale-0" />
              ) : (
                initials(a.name)
              )}
              {a.quote && <span className="absolute bottom-0.5 right-0.5 size-1.5 rounded-full bg-gold" title="punya kutipan" />}
            </span>
          ))}
          {v.alumni.items.length === 0 && <span className="text-[12px] text-white/40">Belum ada alumni.</span>}
          {v.alumni.lottie && <LottieIllustration src={v.alumni.lottie} className="ml-auto hidden w-14 sm:block" />}
        </span>
      );
    case "closing":
      return (
        <span className="flex flex-1 flex-col justify-between gap-3 rounded-2xl bg-maroon p-4">
          <span className="font-serif text-[1.3rem] leading-tight text-white">
            {v.closing.titleTop} <em className="text-gold-soft">{v.closing.titleAccent}</em>
          </span>
          <span className="flex items-center justify-between text-[11px] text-white/70">
            <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-maroon">{v.closing.cta?.label || "—"}</span>
            {v.closing.links.length} tautan
          </span>
        </span>
      );
    default:
      return null;
  }
}
