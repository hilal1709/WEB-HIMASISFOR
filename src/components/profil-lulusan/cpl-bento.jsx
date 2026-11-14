"use client";
import { useRef, useState } from "react";
import { animate, svg } from "animejs";
import { prefersReducedMotion } from "@/lib/motion";
import { Container, PlaceholderTag, SectionHeader } from "@/components/home/shared";
import { SpotlightCard } from "@/components/aceternity/spotlight-card";
import { ILLUSTRATIONS } from "@/components/illustrations/line-illustrations";
import { cn } from "@/lib/utils";

/** Lebar tile biasa di lg (6 kolom): baris diisi rata menurut jumlah tile biasa. */
const SPAN = { 1: "lg:col-span-6", 2: "lg:col-span-3", 3: "lg:col-span-2" };
const fill = (t, n) => String(t ?? "").replace(/\{jumlah\}/gi, String(n));

/**
 * Capaian Pembelajaran Lulusan — bento 4 tile (Aceternity Spotlight: cahaya mengikuti kursor).
 * Ilustrasi line-art di tiap tile digambar ulang saat hover (anime.js); butir CPL lebih dari dua
 * bisa dibuka/tutup dengan transisi tinggi (grid-rows 0fr → 1fr).
 */
export function CplBento({ content: c, note }) {
  const cpl = c.items;
  const narrow = cpl.filter((x) => !x.wide).length;
  const span = SPAN[Math.min(3, narrow)] ?? SPAN[3];
  return (
    <section id="cpl" className="scroll-mt-24 bg-white py-16 md:py-20">
      <Container>
        <SectionHeader
          title={[c.titleTop, c.titleAccent]}
          body={c.body}
          action={c.sample ? <PlaceholderTag>{note}</PlaceholderTag> : null}
        />
        <div className="mt-10 grid gap-4 md:mt-12 md:grid-cols-2 lg:grid-cols-6">
          {cpl.map((x, i) => (
            <div key={x.key} data-aos="fade-up" data-aos-delay={i * 80} className={cn("min-w-0", x.wide ? "lg:col-span-6" : span)}>
              <CplTile item={x} n={i + 1} wide={x.wide} labels={c} />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function CplTile({ item, n, wide, labels }) {
  const VISIBLE = labels.visible ?? 2;
  const art = useRef(null);
  const [open, setOpen] = useState(false);
  const Illustration = ILLUSTRATIONS[item.illustration];
  const first = item.items.slice(0, VISIBLE);
  const rest = item.items.slice(VISIBLE);
  const panelId = `cpl-more-${item.key}`;

  const redraw = () => {
    if (prefersReducedMotion() || !art.current) return;
    animate(svg.createDrawable(art.current.querySelectorAll("[data-line]")), { draw: ["0 0", "0 1"], duration: 900, delay: (_, i) => i * 35, ease: "inOutCubic" });
  };

  const list = (items, start) =>
    items.map((t, i) => (
      <li key={t} className="flex gap-3 text-[14.5px] leading-relaxed text-text/75">
        <span className="mt-0.5 w-6 shrink-0 text-[12px] font-semibold tabular-nums text-gold">{String(start + i + 1).padStart(2, "0")}</span>
        <span>{t}</span>
      </li>
    ));

  return (
    <SpotlightCard
      onPointerEnter={redraw}
      className="h-full rounded-lg border border-line bg-cream/50 p-6 transition-[border-color,box-shadow,background-color] duration-500 ease-cinematic hover:!border-navy/20 hover:bg-white hover:shadow-[0_24px_50px_-36px_rgb(20_33_61/0.55)] sm:p-7"
    >
      {/* cahaya sorot: lingkaran emas solid yang diburamkan (tanpa gradien) */}
      <span
        aria-hidden
        className="pointer-events-none absolute -z-10 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/15 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ left: "var(--mx, 50%)", top: "var(--my, 50%)" }}
      />
      <div className={cn("grid gap-6", wide && "md:grid-cols-[1fr_220px] md:items-center lg:grid-cols-[1fr_300px]")}>
        <div className={cn(wide && "md:order-1")}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="kicker text-maroon">{[labels.kicker, String(n).padStart(2, "0")].filter(Boolean).join(" ")}</p>
              <h3 className="mt-2 font-serif text-[1.55rem] leading-tight text-navy">{item.title}</h3>
            </div>
            {!wide && (
              <div ref={art} aria-hidden className="w-24 shrink-0 opacity-80 transition-opacity duration-500 group-hover:opacity-100">
                {Illustration && <Illustration />}
              </div>
            )}
          </div>
          <ul className={cn("mt-5 grid gap-3", wide && "md:grid-cols-2 md:gap-x-8")}>{list(wide ? item.items : first, 0)}</ul>
          {!wide && rest.length > 0 && (
            <>
              <div id={panelId} className={cn("grid transition-[grid-template-rows,opacity] duration-500 ease-cinematic", open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
                <ul className="mt-3 grid gap-3 overflow-hidden" inert={!open || undefined}>{list(rest, VISIBLE)}</ul>
              </div>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpen((v) => !v)}
                className="group/more mt-4 inline-flex items-center gap-1.5 rounded text-[13px] font-semibold text-maroon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon/40"
              >
                <span className="u-gold">{open ? labels.lessLabel : fill(labels.moreLabel, rest.length)}</span>
                <svg aria-hidden viewBox="0 0 16 16" className={cn("size-3.5 transition-transform duration-500 ease-cinematic", open && "rotate-180")}>
                  <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}
        </div>
        {wide && (
          <div ref={art} aria-hidden className="hidden rounded-md border border-line bg-white p-5 md:order-2 md:block">
            {Illustration && <Illustration />}
          </div>
        )}
      </div>
    </SpotlightCard>
  );
}
