"use client";
import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, EffectCards } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-cards";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { DRAWERS } from "@/lib/dosen-cms/schema";
import { cn } from "@/lib/utils";

const PAGE_DRAWERS = DRAWERS.filter((d) => d.key !== "lecturers");

/**
 * Dinding loker (pigeonhole) Ruang Dosen. Atas: satu loker per dosen — papan nama kuningan, foto sebagai
 * "amplop" yang menyembul, titik status (ditimpa / tersembunyi / berubah). Seret untuk mengurutkan.
 * Bawah: loker halaman (Tirai … Meta). Loker terpilih menarik amplopnya keluar (GSAP).
 */
export function Pigeonhole({ lecturers, selected, onSelect, onReorder, onAdd, changedKeys, changedDrawers }) {
  const wall = useRef(null);
  const [drag, setDrag] = useState(null);
  const [over, setOver] = useState(null);

  useLayoutEffect(() => {
    const el = wall.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.to("[data-envelope]", { y: 0, duration: 0.4, ease: "power3.out" });
      gsap.to(`[data-cubby="${selected.kind}:${selected.key}"] [data-envelope]`, { y: -7, duration: 0.5, ease: "back.out(2.2)" });
    }, el);
    return () => ctx.kill();
  }, [selected]);

  useLayoutEffect(() => {
    const el = wall.current;
    if (!el || prefersReducedMotion()) return;
    gsap.from(el.querySelectorAll("[data-cubby]"), { opacity: 0, y: 14, duration: 0.5, ease: "expo.out", stagger: 0.035, clearProps: "opacity,transform" });
  }, []);

  const drop = (target) => {
    if (!drag || drag === target) return;
    const keys = lecturers.map((l) => l.key);
    const from = keys.indexOf(drag);
    const to = keys.indexOf(target);
    keys.splice(to, 0, keys.splice(from, 1)[0]);
    onReorder(keys);
  };

  const moveBy = (key, d) => {
    const keys = lecturers.map((l) => l.key);
    const i = keys.indexOf(key);
    const j = i + d;
    if (j < 0 || j >= keys.length) return;
    [keys[i], keys[j]] = [keys[j], keys[i]];
    onReorder(keys);
  };

  return (
    <div ref={wall} className="space-y-6">
      <div>
        <div className="mb-2 flex items-baseline justify-between px-1">
          <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.22em] text-navy/50">Rak A · Dosen</p>
          <p className="text-[11px] text-text/45">seret untuk urutkan</p>
        </div>
        <ul className="grid grid-cols-3 gap-1.5 rounded-lg bg-navy p-1.5 shadow-[0_24px_50px_-30px_rgb(20_33_61/0.9)]">
          {lecturers.map((l, i) => {
            const on = selected.kind === "lecturer" && selected.key === l.key;
            const overridden = Object.values(l.inherited).some((x) => !x) && !l.custom;
            return (
              <li
                key={l.key}
                data-cubby={`lecturer:${l.key}`}
                draggable
                onDragStart={(e) => {
                  setDrag(l.key);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragEnd={() => {
                  setDrag(null);
                  setOver(null);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOver(l.key);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  drop(l.key);
                  setOver(null);
                }}
                className={cn("relative transition-opacity", drag === l.key && "opacity-40", over === l.key && drag !== l.key && "ring-2 ring-gold ring-offset-1 ring-offset-navy rounded-[4px]")}
              >
                <button
                  type="button"
                  onClick={() => onSelect({ kind: "lecturer", key: l.key })}
                  onKeyDown={(e) => {
                    if (e.altKey && (e.key === "ArrowLeft" || e.key === "ArrowUp")) {
                      e.preventDefault();
                      moveBy(l.key, -1);
                    }
                    if (e.altKey && (e.key === "ArrowRight" || e.key === "ArrowDown")) {
                      e.preventDefault();
                      moveBy(l.key, 1);
                    }
                  }}
                  aria-pressed={on}
                  aria-label={`${l.name}${l.hidden ? " (tersembunyi)" : ""}. Alt + panah untuk menggeser urutan.`}
                  className={cn(
                    "group/c relative flex h-[92px] w-full flex-col justify-end overflow-hidden rounded-[4px] bg-navy-deep text-left shadow-[inset_0_6px_10px_rgb(0_0_0/0.45)] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-gold",
                    on && "bg-[#0d1830]"
                  )}
                >
                  {/* amplop / foto */}
                  <span
                    data-envelope
                    className={cn(
                      "absolute inset-x-2 bottom-6 top-3 overflow-hidden rounded-[3px] bg-cream-2 shadow-[0_8px_14px_-8px_rgb(0_0_0/0.7)] transition-[filter] duration-300",
                      l.hidden && "grayscale opacity-50"
                    )}
                  >
                    {l.photo ? (
                      <Image src={l.photo} alt="" fill sizes="96px" className="object-cover object-top" />
                    ) : (
                      <span className="grid size-full place-items-center font-serif text-lg text-maroon">{l.initials}</span>
                    )}
                  </span>
                  {/* papan nama kuningan */}
                  <span className={cn("relative z-10 mx-1 mb-1 truncate rounded-[2px] px-1.5 py-[3px] text-center text-[10.5px] font-semibold", on ? "bg-gold text-navy" : "bg-[#b8973a]/80 text-navy-deep")}>
                    <span className="tabular mr-1 opacity-60">{String(i + 1).padStart(2, "0")}</span>
                    {l.name.replace(/^Dr\.?\s*/, "").split(" ")[0]}
                  </span>
                  <span className="absolute right-1.5 top-1.5 z-10 flex gap-1">
                    {changedKeys.includes(l.key) && <Dot className="bg-gold" title="Berubah dari versi live" />}
                    {overridden && <Dot className="bg-white" title="Identitas ditimpa" />}
                    {l.custom && <Dot className="bg-sky-300" title="Dosen tambahan (bukan dari Bagan)" />}
                    {l.hidden && <Dot className="bg-maroon ring-1 ring-white/60" title="Disembunyikan" />}
                  </span>
                </button>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={onAdd}
              className="grid h-[92px] w-full place-items-center rounded-[4px] border border-dashed border-white/20 text-[12px] font-medium text-white/60 transition-colors hover:border-gold hover:text-gold"
            >
              <span className="text-center">
                <span className="block text-xl leading-none">+</span>
                Dosen tamu
              </span>
            </button>
          </li>
        </ul>
      </div>

      <div>
        <p className="mb-2 px-1 font-mono text-[10.5px] font-bold uppercase tracking-[0.22em] text-navy/50">Rak B · Halaman</p>
        <ul className="grid grid-cols-2 gap-1.5 rounded-lg bg-cream-2 p-1.5 ring-1 ring-navy/10">
          {PAGE_DRAWERS.map((d) => {
            const on = selected.kind === "section" && selected.key === d.key;
            return (
              <li key={d.key} data-cubby={`section:${d.key}`}>
                <button
                  type="button"
                  onClick={() => onSelect({ kind: "section", key: d.key })}
                  aria-pressed={on}
                  className={cn(
                    "group/s relative flex h-[58px] w-full items-end overflow-hidden rounded-[4px] px-2.5 pb-2 text-left shadow-[inset_0_4px_8px_rgb(20_33_61/0.12)] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-maroon/40",
                    on ? "bg-white" : "bg-cream hover:bg-white/70"
                  )}
                >
                  <span data-envelope className={cn("absolute inset-x-2 top-2 h-4 rounded-[2px]", on ? "bg-maroon" : "bg-navy/10 group-hover/s:bg-navy/20")} />
                  <span className="relative">
                    <span className="font-mono text-[10px] text-maroon/70">{d.code}</span>
                    <span className="ml-1.5 text-[13px] font-semibold text-navy">{d.label}</span>
                  </span>
                  {changedDrawers.includes(d.key) && <Dot className="absolute right-2 top-2 z-10 bg-gold" title="Berubah dari versi live" />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function Dot({ className, title }) {
  return <span title={title} aria-label={title} className={cn("size-2 rounded-full shadow", className)} />;
}

/** Ponsel: tumpukan kartu dosen (Swiper EffectCards) — geser untuk berganti dosen. */
export function LecturerDeck({ lecturers, selectedKey, onSelect }) {
  const start = Math.max(0, lecturers.findIndex((l) => l.key === selectedKey));
  return (
    <div className="mx-auto w-[220px] py-2">
      <Swiper
        modules={[EffectCards, A11y]}
        effect="cards"
        grabCursor
        initialSlide={start}
        onSlideChange={(s) => lecturers[s.activeIndex] && onSelect({ kind: "lecturer", key: lecturers[s.activeIndex].key })}
      >
        {lecturers.map((l) => (
          <SwiperSlide key={l.key} className="overflow-hidden rounded-xl bg-navy">
            <div className="relative aspect-[4/5]">
              {l.photo ? <Image src={l.photo} alt="" fill sizes="220px" className={cn("object-cover object-top", l.hidden && "grayscale")} /> : <span className="grid size-full place-items-center font-serif text-4xl text-gold-soft">{l.initials}</span>}
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-deep/95 to-transparent p-3 pt-10 text-white">
                <span className="block truncate font-serif text-[15px]">{l.name}</span>
                <span className="block truncate text-[11.5px] text-white/60">{l.hidden ? "Disembunyikan" : l.role}</span>
              </span>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
