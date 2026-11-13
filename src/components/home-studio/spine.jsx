"use client";
import { useLayoutEffect, useRef, useState } from "react";
import { Flip } from "@/lib/scroll";
import { sectionOf } from "@/lib/home-cms/schema";
import { cn } from "@/lib/utils";
import { Spotlight } from "./fx";

/**
 * Tulang punggung Studio: rel bernomor yang mencerminkan urutan beranda.
 * Kepala & kaki situs terpaku; section di antaranya bisa diseret (Flip) dan disembunyikan.
 */
export function Spine({ sections, active, onSelect, onLayout }) {
  const listRef = useRef(null);
  const flip = useRef(null);
  const [dragKey, setDragKey] = useState(null);
  const layout = sections.layout.value.sections;

  useLayoutEffect(() => {
    if (!flip.current) return;
    Flip.from(flip.current, { duration: 0.45, ease: "expo.out" });
    flip.current = null;
  });

  const commit = (next) => {
    if (listRef.current) flip.current = Flip.getState(listRef.current.querySelectorAll("[data-node]"));
    onLayout({ sections: next });
  };
  const moveTo = (key, target) => {
    if (key === target) return;
    const from = layout.findIndex((s) => s.key === key);
    const to = layout.findIndex((s) => s.key === target);
    const next = [...layout];
    const [it] = next.splice(from, 1);
    next.splice(to, 0, it);
    commit(next);
  };
  const toggle = (key) => commit(layout.map((s) => (s.key === key ? { ...s, visible: !s.visible } : s)));
  const nudge = (key, d) => {
    const i = layout.findIndex((s) => s.key === key);
    if (i + d < 0 || i + d >= layout.length) return;
    moveTo(key, layout[i + d].key);
  };

  // dipanggil sebagai fungsi (bukan komponen) agar elemen tidak di-remount tiap render → Flip & drag stabil
  const node = ({ k, index, item, pinned }) => {
    const meta = sectionOf(k);
    const s = sections[k];
    const hidden = item && !item.visible;
    const on = active === k;
    return (
      <li
        key={k}
        data-node
        data-flip-id={k}
        draggable={!pinned}
        onDragStart={(e) => {
          setDragKey(k);
          e.dataTransfer.effectAllowed = "move";
        }}
        onDragEnd={() => setDragKey(null)}
        onDragOver={(e) => {
          if (pinned || !dragKey) return;
          e.preventDefault();
          if (dragKey !== k) moveTo(dragKey, k);
        }}
        className={cn("relative", dragKey === k && "opacity-50")}
      >
        <Spotlight
          className={cn(
            "flex items-center gap-3 rounded-xl border py-2 pl-2 pr-1.5 transition-[background-color,border-color] duration-300",
            on ? "border-gold/40 bg-white/[0.07]" : "border-transparent hover:bg-white/[0.035]",
            !pinned && "cursor-grab active:cursor-grabbing"
          )}
        >
          <button type="button" onClick={() => onSelect(k)} aria-current={on ? "true" : undefined} className="flex min-w-0 flex-1 items-center gap-3 text-left outline-none">
            <span
              className={cn(
                "relative z-10 grid size-7 shrink-0 place-items-center rounded-full border font-serif text-[12px] tabular-nums transition-colors duration-300",
                on ? "border-gold bg-gold text-ink" : hidden ? "border-white/10 bg-ink text-white/25" : "border-white/20 bg-ink text-white/70"
              )}
            >
              {pinned ? "◆" : String(index + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0">
              <span className={cn("block truncate text-[13.5px] font-medium", hidden ? "text-white/35 line-through decoration-white/20" : "text-white/90")}>{meta?.label}</span>
              <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-white/40">
                <span className={cn("size-1.5 rounded-full", s?.dirty ? "bg-gold shadow-[0_0_8px_var(--gold)]" : "bg-emerald-400/70")} />
                {s?.dirty ? "Draf" : "Live"}
                {meta?.global && <span className="rounded bg-white/[0.06] px-1 text-[10px]">Global</span>}
              </span>
            </span>
          </button>
          {!pinned && (
            <span className="flex shrink-0 items-center">
              <button type="button" onClick={() => nudge(k, -1)} aria-label={`Naikkan ${meta?.label}`} className="grid size-7 place-items-center rounded-lg text-xs text-white/35 hover:bg-white/10 hover:text-white sm:hidden">↑</button>
              <button
                type="button"
                onClick={() => toggle(k)}
                aria-pressed={!hidden}
                aria-label={hidden ? `Tampilkan ${meta?.label}` : `Sembunyikan ${meta?.label}`}
                title={hidden ? "Tampilkan" : "Sembunyikan"}
                className="grid size-7 place-items-center rounded-lg text-white/40 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Eye off={hidden} />
              </button>
            </span>
          )}
        </Spotlight>
      </li>
    );
  };

  return (
    <nav aria-label="Section beranda" className="relative">
      <span aria-hidden className="absolute bottom-6 left-[21.5px] top-6 w-px bg-gradient-to-b from-white/5 via-white/15 to-white/5" />
      <ol ref={listRef} className="relative space-y-1">
        {node({ k: "header", pinned: true })}
        {node({ k: "intro", pinned: true })}
        {layout.map((item, i) => node({ k: item.key, index: i, item }))}
        {node({ k: "footer", pinned: true })}
      </ol>
      <p className="mt-4 px-2 text-[11px] leading-relaxed text-white/35">Seret untuk mengurutkan. Mata untuk menyembunyikan.</p>
    </nav>
  );
}

function Eye({ off }) {
  return (
    <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
      <path d="M1.8 10S5 4.5 10 4.5 18.2 10 18.2 10 15 15.5 10 15.5 1.8 10 1.8 10Z" />
      <circle cx="10" cy="10" r="2.6" />
      <path d="M3 17 17 3" className={cn("origin-center transition-[stroke-dashoffset] duration-300")} strokeDasharray="20" strokeDashoffset={off ? 0 : 20} />
    </svg>
  );
}
