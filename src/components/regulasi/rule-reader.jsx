"use client";
import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { TERMS } from "@/lib/regulasi-content";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Container, PlaceholderTag, SectionHeader } from "@/components/home/shared";
import { LordIcon } from "@/components/media/lord-icon";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { cn } from "@/lib/utils";
import { useRegulasi } from "./regulasi-provider";

const TERM_KEYS = Object.keys(TERMS).sort((a, b) => b.length - a.length);
const TERM_RE = new RegExp(`\\b(${TERM_KEYS.map((k) => k.replace(/\s/g, "\\s")).join("|")})\\b`, "g");

/** Istilah bergaris bawah emas; definisi muncul saat hover/fokus. */
function Term({ word, def }) {
  return (
    <span className="group/term relative inline">
      <button type="button" className="rg-term font-inherit text-inherit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60" aria-label={`${word}: ${def}`}>
        {word}
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-64 -translate-x-1/2 translate-y-1 rounded-lg bg-navy p-3 text-left font-sans text-[13px] not-italic leading-relaxed text-white/85 opacity-0 shadow-[0_20px_40px_-20px_rgb(14_24_48/0.7)] transition-[opacity,transform] duration-300 group-hover/term:translate-y-0 group-hover/term:opacity-100 group-focus-within/term:translate-y-0 group-focus-within/term:opacity-100"
      >
        <span className="block font-semibold text-gold-soft">{word}</span>
        {def}
      </span>
    </span>
  );
}

/** Bungkus kemunculan pertama tiap istilah kunci. */
function withTerms(text) {
  const used = new Set();
  const out = [];
  let last = 0;
  for (const m of text.matchAll(TERM_RE)) {
    if (used.has(m[1])) continue;
    used.add(m[1]);
    out.push(<Fragment key={`t${last}`}>{text.slice(last, m.index)}</Fragment>, <Term key={m.index} word={m[1]} def={TERMS[m[1]]} />);
    last = m.index + m[1].length;
  }
  out.push(<Fragment key="end">{text.slice(last)}</Fragment>);
  return out;
}

function Pasal({ p, mode, flash, marked, onMark, onSim }) {
  const text = mode === "plain" ? p.plain : p.formal;
  return (
    <article id={`pasal-${p.id}`} data-pasal-id={p.id} data-flash={flash ? "" : undefined} className="rg-pasal -mx-4 scroll-mt-48 rounded-lg px-4 py-7 sm:-mx-6 sm:px-6">
      <div className="grid grid-cols-[1fr_auto] gap-4 sm:gap-8">
        <div className="min-w-0">
          <p className="kicker text-[11px] text-maroon">Pasal {p.no}</p>
          <h4 className="mt-1.5 font-serif text-[1.4rem] leading-snug text-navy">{p.title}</h4>
          <div data-pasal-text className="overflow-hidden">
            <p key={mode} className={cn("mt-3 max-w-[62ch] text-pretty leading-relaxed animate-in fade-in-0 slide-in-from-bottom-1 duration-500", mode === "plain" ? "text-[17px] text-text/80" : "font-serif text-[16.5px] text-text/75")}>
              {withTerms(text)}
            </p>
          </div>
          {(p.sim || p.link) && (
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[14px] font-semibold">
              {p.sim && (
                <button type="button" onClick={() => onSim(p.sim)} className="text-navy">
                  <span className="u-gold">Coba di simulator</span>
                </button>
              )}
              {p.link && (
                <a href={p.link.href} className="text-maroon">
                  <span className="u-gold">{p.link.label}</span>
                </a>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => onMark(p.id)}
            aria-pressed={marked}
            aria-label={marked ? `Lepas tanda pasal ${p.no}` : `Tandai pasal ${p.no}`}
            title={marked ? "Lepas tanda" : "Tandai"}
            className={cn(
              "grid size-10 place-items-center rounded-md border transition-[background-color,border-color,transform] duration-300 active:scale-90",
              marked ? "border-gold bg-gold" : "border-line bg-white hover:border-navy/30"
            )}
          >
            <LordIcon key={marked ? "on" : "off"} name={marked ? "check" : "plus-circle"} size={22} trigger={marked ? "once" : "hover"} target="button" colors={marked ? "primary:#14213d,secondary:#14213d" : "primary:#14213d,secondary:#6e1423"} />
          </button>
        </div>
      </div>
    </article>
  );
}

/**
 * Minimap "proximity" (inspirasi 21st.dev): satu garis per pasal; garis memanjang dan judulnya muncul saat
 * kursor mendekat, pasal yang sedang dibaca = garis emas penuh. Bar progres baca emas di sisi kiri.
 */
function Minimap({ chapters, active, progress, onGo }) {
  const nav = useRef(null);
  const apply = useCallback(
    (y) => {
      nav.current?.querySelectorAll("[data-row]").forEach((row) => {
        const on = row.getAttribute("data-row") === active;
        let w = on ? 40 : 14;
        let o = on ? 1 : 0;
        if (y != null && !prefersReducedMotion()) {
          const r = row.getBoundingClientRect();
          const d = Math.abs(r.top + r.height / 2 - y);
          w = Math.max(w, 14 + 26 * Math.max(0, 1 - d / 90));
          o = Math.max(o, Math.max(0, 1 - d / 60));
        }
        row.style.setProperty("--w", `${w}px`);
        row.style.setProperty("--o", o.toFixed(2));
      });
    },
    [active]
  );
  useEffect(() => apply(null), [apply]);

  return (
    <nav ref={nav} aria-label="Daftar pasal" onPointerMove={(e) => apply(e.clientY)} onPointerLeave={() => apply(null)} className="relative pl-5">
      <span aria-hidden className="absolute bottom-0 left-0 top-0 w-[2px] rounded bg-line" />
      <span aria-hidden className="absolute left-0 top-0 w-[2px] rounded bg-gold transition-[height] duration-200" style={{ height: `${progress * 100}%` }} />
      {chapters.map((c) => (
        <div key={c.key} className="mb-5 last:mb-0">
          <button type="button" onClick={() => onGo(c.pasal[0].no)} className="flex items-baseline gap-2 text-left">
            <span className="w-6 font-serif text-[13px] italic text-maroon">{c.roman}</span>
            <span className={cn("text-[13px] font-semibold transition-colors", c.pasal.some((p) => p.id === active) ? "text-navy" : "text-text/45 hover:text-navy")}>{c.title}</span>
          </button>
          <ul className="mt-1.5 space-y-0.5 pl-8">
            {c.pasal.map((p) => (
              <li key={p.id}>
                <button type="button" data-row={p.id} onClick={() => onGo(p.no)} aria-current={p.id === active ? "location" : undefined} className="flex h-5 w-full items-center gap-2 text-left focus-visible:outline-none focus-visible:[--o:1]">
                  <span className="rg-dash shrink-0" data-on={p.id === active ? "" : undefined} />
                  <span className="rg-dash-label truncate text-[12px] text-navy">{p.no} {p.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/**
 * Pembaca pedoman — tata letak dokumen: minimap sticky (≥ lg), isi bab, gutter aksi per pasal.
 * Sakelar global "Bahasa pedoman ↔ Bahasa sehari-hari" (teks crossfade, tinggi blok ber-tween GSAP);
 * filter "Hanya yang kutandai"; ponsel: daftar pasal di Sheet.
 */
export function RuleReader() {
  const { chapters, mode, setMode, flash, marks, toggleMark, goPasal, goSim, setChapter } = useRegulasi();
  const reduce = useReducedMotion();
  const sectionRef = useRef(null);
  const heights = useRef(null);
  const [active, setActive] = useState(chapters[0].pasal[0].id);
  const [progress, setProgress] = useState(0);
  const [onlyMarked, setOnlyMarked] = useState(false);
  const [sheet, setSheet] = useState(false);

  const shown = useMemo(
    () => (onlyMarked ? chapters.map((c) => ({ ...c, pasal: c.pasal.filter((p) => marks.includes(p.id)) })).filter((c) => c.pasal.length) : chapters),
    [chapters, marks, onlyMarked]
  );

  const changeMode = (m) => {
    if (m === mode) return;
    const els = [...(sectionRef.current?.querySelectorAll("[data-pasal-text]") ?? [])];
    const articles = [...(sectionRef.current?.querySelectorAll("[data-pasal-id]") ?? [])];
    const anchor = articles.find((a) => a.getBoundingClientRect().bottom > 160) ?? null;
    heights.current = { map: new Map(els.map((el) => [el, el.offsetHeight])), anchor, anchorTop: anchor?.getBoundingClientRect().top ?? 0 };
    setMode(m);
  };

  useLayoutEffect(() => {
    const snap = heights.current;
    heights.current = null;
    if (!snap) return;
    const { map, anchor, anchorTop } = snap;
    // blok di layar (mulai dari pasal yang sedang dibaca) tingginya ber-tween; yang di atasnya langsung berubah
    if (!prefersReducedMotion()) {
      const vh = window.innerHeight;
      map.forEach((h, el) => {
        const r = el.getBoundingClientRect();
        if (r.top < anchorTop || r.top > vh) return;
        gsap.fromTo(el, { height: h }, { height: "auto", duration: 0.5, ease: "expo.out", clearProps: "height" });
      });
    }
    // jaga pasal yang sedang dibaca tetap di posisi yang sama
    if (anchor) {
      const d = anchor.getBoundingClientRect().top - anchorTop;
      if (Math.abs(d) > 1) window.scrollBy({ top: d, behavior: "instant" });
    }
  }, [mode]);

  // scroll-spy + progres baca
  useEffect(() => {
    const els = [...(sectionRef.current?.querySelectorAll("[data-pasal-id]") ?? [])];
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting);
        if (!hit) return;
        const id = hit.target.getAttribute("data-pasal-id");
        setActive(id);
        const ci = chapters.findIndex((c) => c.pasal.some((p) => p.id === id));
        if (ci >= 0) setChapter(ci);
      },
      { rootMargin: "-38% 0px -58% 0px" }
    );
    els.forEach((el) => io.observe(el));
    const onScroll = () => {
      const el = sectionRef.current?.querySelector("[data-reader-body]");
      if (!el) return;
      const r = el.getBoundingClientRect();
      const p = (window.innerHeight * 0.4 - r.top) / r.height;
      setProgress(Math.min(1, Math.max(0, p)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [shown, chapters, setChapter]);


  const sample = chapters.some((c) => c.sample);

  return (
    <section ref={sectionRef} id="pasal" className="relative scroll-mt-20 border-y border-line bg-cream-2/60 py-16 md:py-24">
      <Container>
        <SectionHeader title={["Pedomannya,", "pasal demi pasal"]} body="Pilih bahasanya: kalimat resmi dari pedoman, atau penjelasan singkat versi sehari-hari." action={sample ? <PlaceholderTag /> : null} />

        {/* toolbar */}
        <div className="sticky top-16 z-20 -mx-5 mt-10 flex items-center gap-2 border-b border-line bg-cream-2/90 px-5 py-3 sm:gap-3 backdrop-blur-md md:-mx-8 md:px-8">
          <div role="radiogroup" aria-label="Bahasa pasal" className="flex gap-1 rounded-lg border border-line bg-white p-1">
            {[
              ["plain", "Sehari-hari"],
              ["formal", "Pedoman"],
            ].map(([k, label]) => (
              <button key={k} type="button" role="radio" aria-checked={mode === k} onClick={() => changeMode(k)} className="relative whitespace-nowrap rounded-md px-2.5 py-1.5 text-[13.5px] font-medium outline-none sm:px-3.5 sm:text-[14px] focus-visible:ring-2 focus-visible:ring-gold/60">
                {mode === k && <motion.span layoutId="rg-mode" className="absolute inset-0 rounded-md bg-navy" transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }} />}
                <span className={cn("relative z-10 transition-colors duration-300", mode === k ? "text-white" : "text-navy/70")}>
                  <span className="hidden sm:inline">Bahasa {label.toLowerCase()}</span>
                  <span className="sm:hidden">{label}</span>
                </span>
              </button>
            ))}
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={onlyMarked}
            onClick={() => setOnlyMarked((v) => !v)}
            className={cn("inline-flex h-10 items-center gap-2 rounded-lg border px-2.5 text-[13.5px] font-medium transition-colors duration-300 sm:px-3.5 sm:text-[14px]", onlyMarked ? "border-gold bg-gold text-navy" : "border-line bg-white text-navy/75 hover:border-navy/30")}
          >
            <span className="hidden sm:inline">Hanya yang kutandai</span>
            <span className="sm:hidden">Ditandai</span>
            <span className={cn("tabular rounded px-1.5 text-[12px]", onlyMarked ? "bg-navy/10" : "bg-cream")}>{marks.length}</span>
          </button>
          <button type="button" onClick={() => setSheet(true)} aria-label="Daftar pasal" className="ml-auto inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-2.5 text-[14px] font-medium text-navy sm:px-3.5 lg:hidden">
            <LordIcon name="book" size={20} trigger="hover" target="button" colors="primary:#14213d,secondary:#6e1423" />
            <span className="hidden sm:inline">Daftar pasal</span>
          </button>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[250px_1fr] lg:gap-14">
          <aside className="hidden lg:block">
            <div className="sticky top-44">
              <Minimap chapters={shown} active={active} progress={progress} onGo={goPasal} />
            </div>
          </aside>

          <div data-reader-body className="min-w-0">
            {shown.length === 0 ? (
              <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-white px-6 py-14 text-center">
                <LottieIllustration src="/lottie/empty-news.json" className="w-28" />
                <p className="mt-4 font-serif text-[1.3rem] text-navy">Belum ada pasal yang kamu tandai</p>
                <p className="mt-1 max-w-sm text-[14.5px] text-text/60">Tekan tombol tambah di samping pasal mana pun untuk menyimpannya di sini.</p>
                <button type="button" onClick={() => setOnlyMarked(false)} className="mt-5 text-[14px] font-semibold text-maroon">
                  <span className="u-gold">Tampilkan semua pasal</span>
                </button>
              </div>
            ) : (
              shown.map((c) => (
                <div key={c.key} className="mb-12 last:mb-0" data-aos="fade-up">
                  <header className="flex items-end gap-5 border-b-2 border-navy pb-4">
                    <span className="font-serif text-[clamp(3.2rem,6vw,4.6rem)] italic leading-[0.8] text-maroon">{c.roman}</span>
                    <div className="pb-1">
                      <p className="kicker text-[11px] text-text/45">Bab {c.roman}</p>
                      <h3 className="font-serif text-[clamp(1.5rem,2.4vw,2rem)] leading-tight text-navy">{c.title}</h3>
                    </div>
                  </header>
                  <div className="divide-y divide-line">
                    {c.pasal.map((p) => (
                      <Pasal key={p.id} p={p} mode={mode} flash={flash === p.id} marked={marks.includes(p.id)} onMark={toggleMark} onSim={goSim} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Container>

      <Sheet open={sheet} onOpenChange={setSheet}>
        <SheetContent className="overflow-y-auto bg-cream p-6 pt-14">
          <SheetTitle className="font-serif text-[1.4rem] font-normal text-navy">Daftar pasal</SheetTitle>
          <SheetDescription>Pilih pasal untuk langsung menuju ke sana</SheetDescription>
          <div className="mt-6 space-y-6">
            {chapters.map((c) => (
              <div key={c.key}>
                <p className="flex gap-2 text-[13px] font-semibold text-navy">
                  <span className="font-serif italic text-maroon">{c.roman}</span>
                  {c.title}
                </p>
                <ul className="mt-2 border-l-2 border-line">
                  {c.pasal.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSheet(false);
                          setTimeout(() => goPasal(p.no), 250);
                        }}
                        className={cn("-ml-[2px] flex w-full gap-3 border-l-2 py-2 pl-4 text-left text-[14.5px] transition-colors", p.id === active ? "border-gold text-navy" : "border-transparent text-text/65")}
                      >
                        <span className="tabular w-8 shrink-0 text-text/40">{p.no}</span>
                        {p.title}
                        {marks.includes(p.id) && <span className="ml-auto size-2 shrink-0 self-center rounded-full bg-gold" aria-label="ditandai" />}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
}
