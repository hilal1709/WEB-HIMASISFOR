"use client";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Flip, gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { CATEGORIES, LEVELS } from "@/lib/prestasi-content";
import { Container, SectionHeader } from "@/components/home/shared";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { Highlight, LevelBadge, PAGE, usePrestasi } from "./prestasi-provider";

const useIso = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Arsip prestasi (pola horizonx "editorial list"): toolbar sticky (kategori bersegmen dengan latar navy
 * meluncur + ←/→, chip tingkat, pilih tahun, cari ber-debounce), isi dikelompokkan per tahun dengan rail
 * tahun sticky + garis progres emas (ScrollTrigger). Baris serif; baris lain meredup saat hover; foto
 * pratinjau mengikuti kursor (gsap.quickTo). Filter beranimasi GSAP Flip. "Tampilkan lebih banyak" bertahap.
 */
export function Archive() {
  const { category, setCategory, level, setLevel, year, setYear, years, query, setQuery, filtered, items, visible, setVisible, reset } = usePrestasi();
  const toast = useToast();
  const list = useRef(null);
  const flipState = useRef(null);
  const flipTween = useRef(null);
  const [draft, setDraft] = useState(query);
  const [more, setMore] = useState(false);

  const shown = filtered.slice(0, visible);
  const groups = useMemo(() => {
    const out = [];
    for (const it of shown) {
      const g = out.find((x) => x.key === it.group);
      g ? g.items.push(it) : out.push({ key: it.group, items: [it] });
    }
    return out;
  }, [shown]);

  const withFlip = (fn) => {
    if (list.current && !prefersReducedMotion()) flipState.current = Flip.getState(list.current.querySelectorAll("[data-card]"));
    fn();
  };

  useIso(() => {
    const el = list.current;
    if (!el || prefersReducedMotion()) return;
    const cards = el.querySelectorAll("[data-card]");
    if (flipState.current) {
      flipTween.current?.progress(1).kill();
      flipTween.current = Flip.from(flipState.current, {
        targets: cards,
        duration: 0.7,
        ease: "expo.out",
        prune: true,
        onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.55, ease: "expo.out", stagger: 0.035, clearProps: "opacity,transform" }),
        onComplete: () => gsap.set(cards, { clearProps: "transform,opacity" }),
      });
      flipState.current = null;
    }
  }, [filtered, visible]);

  // garis progres emas di rail tiap tahun
  useEffect(() => {
    const el = list.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      el.querySelectorAll("[data-group]").forEach((g) => {
        const bar = g.querySelector("[data-progress]");
        if (!bar) return;
        gsap.fromTo(bar, { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: g, start: "top 70%", end: "bottom 60%", scrub: 0.6 } });
      });
    }, el);
    return () => ctx.revert();
  }, [groups.length, filtered]);

  // debounce pencarian
  useEffect(() => setDraft(query), [query]);
  useEffect(() => {
    if (draft === query) return;
    const id = setTimeout(() => withFlip(() => setQuery(draft)), 220);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  const loadMore = () => {
    setMore(true);
    // beri jeda satu frame agar spinner terlihat, lalu tambahkan baris
    requestAnimationFrame(() =>
      setTimeout(() => {
        const next = visible + PAGE;
        withFlip(() => setVisible(next));
        setMore(false);
        if (next >= filtered.length) toast.info("Semua prestasi sudah ditampilkan", { description: `${filtered.length} prestasi sesuai filter Anda.` });
      }, 280)
    );
  };

  const active = [category !== "all", level !== "all", year !== "all", !!query].filter(Boolean).length;

  return (
    <section id="arsip" className="scroll-mt-20 py-16 md:py-24">
      <Container>
        <div className="flex items-end justify-between gap-6">
          <SectionHeader
            title={["Arsip", "prestasi"]}
            body="Saring menurut peraih, tingkat, atau tahun. Klik baris mana pun untuk melihat semua capaian orang tersebut."
          />
          <LottieIllustration src="/lottie/medal.json" className="hidden w-24 shrink-0 md:block" replayOnHover label="Ilustrasi medali" />
        </div>

        {/* toolbar */}
        <div className="sticky top-16 z-30 -mx-5 mt-10 border-y border-line bg-cream/95 px-5 py-3 backdrop-blur-md md:top-20 md:mx-0 md:mt-12 md:rounded-lg md:border md:px-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Segmented tabs={CATEGORIES} value={category} onChange={(k) => withFlip(() => setCategory(k))} />
              <div role="group" aria-label="Tingkat" className="flex gap-1.5">
                {LEVELS.filter((l) => items.some((i) => i.level === l.key)).map((l) => {
                  const on = level === l.key;
                  return (
                    <button
                      key={l.key}
                      type="button"
                      aria-pressed={on}
                      onClick={() => withFlip(() => setLevel(on ? "all" : l.key))}
                      className={cn(
                        "inline-flex h-10 items-center gap-1.5 rounded-md border px-3 text-[13px] font-semibold transition-[background-color,border-color,color] duration-300",
                        on ? "border-gold bg-gold/15 text-navy" : "border-line bg-white text-navy/65 hover:border-navy/30 hover:text-navy"
                      )}
                    >
                      <span className={cn("size-1.5 rounded-full transition-transform duration-300", on ? "scale-150 bg-maroon" : "bg-navy/30")} />
                      {l.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="relative">
                <span className="sr-only">Tahun</span>
                <select
                  value={year}
                  onChange={(e) => withFlip(() => setYear(e.target.value))}
                  className="h-10 appearance-none rounded-md border border-line bg-white pl-3 pr-8 text-[13.5px] font-semibold text-navy transition-[border-color,box-shadow] duration-300 focus:border-navy/40 focus:shadow-[0_0_0_3px_rgb(201_162_39/0.25)] focus:outline-none"
                >
                  <option value="all">Semua tahun</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <svg aria-hidden viewBox="0 0 16 16" className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-navy/50">
                  <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </label>
              <label className="relative flex-1 xl:w-72 xl:flex-none">
                <span className="sr-only">Cari prestasi</span>
                <svg aria-hidden viewBox="0 0 20 20" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text/40">
                  <circle cx="9" cy="9" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                <input
                  type="search"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Cari nama atau kompetisi…"
                  className="h-10 w-full rounded-md border border-line bg-white pl-9 pr-3 text-[14px] text-navy transition-[border-color,box-shadow] duration-300 placeholder:text-text/40 focus:border-navy/40 focus:shadow-[0_0_0_3px_rgb(201_162_39/0.25)] focus:outline-none"
                />
              </label>
            </div>
          </div>
        </div>

        <div aria-live="polite" className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13.5px] text-text/55">
          <span>
            Menampilkan <span className="tabular font-semibold text-navy">{shown.length}</span> dari {filtered.length} prestasi
          </span>
          {active > 0 && (
            <button type="button" onClick={() => withFlip(reset)} className="font-semibold text-maroon">
              <span className="u-gold">Hapus {active} filter</span>
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <Empty onReset={() => withFlip(reset)} />
        ) : (
          <div ref={list} className="mt-6">
            <Rows groups={groups} query={query} />
            {visible < filtered.length && (
              <div className="mt-10 flex justify-center">
                <Button variant="outline-navy" size="lg" loading={more} onClick={loadMore} className="min-w-56">
                  Tampilkan {Math.min(PAGE, filtered.length - visible)} lagi
                </Button>
              </div>
            )}
          </div>
        )}
      </Container>
    </section>
  );
}

function Rows({ groups, query }) {
  const { openProfile } = usePrestasi();
  const box = useRef(null);
  const preview = useRef(null);
  const [hover, setHover] = useState(null);
  const qx = useRef(null);
  const qy = useRef(null);
  const all = groups.flatMap((g) => g.items);

  useEffect(() => {
    if (!preview.current) return;
    qx.current = gsap.quickTo(preview.current, "x", { duration: 0.55, ease: "power3.out" });
    qy.current = gsap.quickTo(preview.current, "y", { duration: 0.55, ease: "power3.out" });
  }, []);

  const onMove = (e) => {
    const r = box.current.getBoundingClientRect();
    qx.current?.(e.clientX - r.left + 28);
    qy.current?.(e.clientY - r.top - 100);
  };
  const current = all.find((i) => i.id === hover);
  const photos = [...new Map(all.filter((i) => i.photo).map((i) => [i.photo, i])).values()];

  return (
    <div ref={box} className="relative" onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
      {groups.map((g) => (
        <div key={g.key} data-group className="grid gap-x-10 border-t border-line lg:grid-cols-[180px_1fr]">
          {/* rail tahun */}
          <div className="relative pt-6 lg:pt-7">
            <div className="lg:sticky lg:top-44">
              <p className={cn("tabular font-serif leading-none text-navy", /^\d+$/.test(g.key) ? "text-[clamp(2rem,4vw,3.25rem)]" : "text-[clamp(1.6rem,2.6vw,2.25rem)] italic text-maroon")}>{g.key}</p>
              <p className="mt-1 text-[12.5px] text-text/50">{g.items.length} prestasi</p>
            </div>
            <span aria-hidden className="absolute bottom-0 right-0 top-7 hidden w-px bg-line lg:block">
              <span data-progress className="absolute inset-0 origin-top bg-gold" />
            </span>
          </div>

          <ul className="prestasi-rows">
            {g.items.map((it) => (
              <li key={it.id} data-card data-flip-id={it.id} className="prestasi-row">
                <button
                  type="button"
                  onClick={() => openProfile(it.slug)}
                  onPointerEnter={() => setHover(it.id)}
                  onFocus={() => setHover(null)}
                  className="group grid w-full grid-cols-[48px_1fr_auto] items-start gap-4 border-b border-line py-5 text-left last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon/40 md:grid-cols-[56px_1fr_auto] md:items-center md:gap-6 md:py-6"
                >
                  <span className="relative size-12 overflow-hidden rounded-full bg-cream-2 md:size-14">
                    {it.photo ? (
                      <Image src={it.photo} alt="" fill sizes="56px" className="object-cover object-top" />
                    ) : (
                      <span className="grid size-full place-items-center bg-navy text-[13px] font-semibold text-gold-soft">{it.short.split(" ").slice(-2).map((w) => w[0]).join("")}</span>
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <LevelBadge level={it.level} label={it.levelLabel} />
                      <span className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-maroon">{it.role}</span>
                      <span className="tabular text-[12.5px] text-text/45">{it.yearLabel}</span>
                    </span>
                    <span className="mt-2 block font-serif text-[clamp(1.1rem,1.9vw,1.55rem)] leading-snug text-navy transition-[color,transform] duration-500 ease-cinematic group-hover:translate-x-1.5 group-hover:text-maroon">
                      <Highlight text={it.title} query={query} />
                    </span>
                    <span className="mt-1.5 block text-[13.5px] text-text/60">
                      <Highlight text={it.short} query={query} />
                      <span className="text-text/35"> · {it.category === "dosen" ? "Dosen" : "Mahasiswa"}</span>
                    </span>
                  </span>
                  <span className="mt-1 grid size-10 place-items-center rounded-full border border-line text-navy transition-[background-color,border-color,color,transform] duration-500 ease-cinematic group-hover:rotate-45 group-hover:border-maroon group-hover:bg-maroon group-hover:text-white md:mt-0">
                    <svg aria-hidden viewBox="0 0 16 16" className="size-4">
                      <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* foto pratinjau mengikuti kursor (≥ lg) */}
      <div
        ref={preview}
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-0 top-0 z-20 hidden h-52 w-40 overflow-hidden rounded-lg bg-cream-2 shadow-[0_30px_60px_-25px_rgb(20_33_61/0.6)] transition-[opacity,scale] duration-300 ease-cinematic lg:block",
          current?.photo ? "scale-100 opacity-100" : "scale-90 opacity-0"
        )}
      >
        {photos.map((p) => (
          <Image
            key={p.photo}
            src={p.photo}
            alt=""
            fill
            sizes="160px"
            className={cn("object-cover object-top transition-[opacity,transform] duration-500 ease-cinematic", p.photo === current?.photo ? "scale-100 opacity-100" : "scale-110 opacity-0")}
          />
        ))}
        <span className="absolute inset-x-0 bottom-0 h-1 bg-gold" />
      </div>
    </div>
  );
}

function Segmented({ tabs, value, onChange }) {
  const refs = useRef([]);
  const [pill, setPill] = useState({ x: 0, w: 0 });
  const active = Math.max(0, tabs.findIndex((t) => t.key === value));

  useIso(() => {
    const measure = () => {
      const t = refs.current[active];
      if (t) setPill({ x: t.offsetLeft, w: t.offsetWidth });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [active]);

  const onKey = (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (active + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    onChange(tabs[next].key);
    refs.current[next]?.focus();
  };

  return (
    <div role="tablist" aria-label="Peraih" onKeyDown={onKey} className="relative inline-flex rounded-md border border-line bg-white p-1">
      <span aria-hidden className="absolute bottom-1 top-1 left-0 rounded bg-navy transition-[transform,width] duration-500 ease-cinematic" style={{ width: pill.w, transform: `translateX(${pill.x}px)` }} />
      {tabs.map((t, i) => (
        <button
          key={t.key}
          ref={(el) => (refs.current[i] = el)}
          role="tab"
          aria-selected={i === active}
          tabIndex={i === active ? 0 : -1}
          onClick={() => onChange(t.key)}
          className={cn("relative z-10 whitespace-nowrap rounded px-3.5 py-1.5 text-[13.5px] font-semibold transition-colors duration-300", i === active ? "text-white" : "text-navy/65 hover:text-navy")}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function Empty({ onReset }) {
  return (
    <div className="mt-8 flex flex-col items-center rounded-lg border border-dashed border-line bg-white px-6 py-12 text-center">
      <div className="w-36">
        <LottieIllustration src="/lottie/empty-news.json" label="Tidak ada hasil" />
      </div>
      <p className="mt-4 font-serif text-[1.4rem] text-navy">Belum ada prestasi yang cocok</p>
      <p className="mt-1 text-[14px] text-text/60">Coba kata kunci lain, atau tampilkan semua tingkat dan tahun.</p>
      <button
        type="button"
        onClick={onReset}
        className="mt-6 inline-flex h-10 items-center rounded-md bg-navy px-5 text-[14px] font-semibold text-white transition-[background-color,transform] duration-300 hover:bg-navy-deep active:scale-[0.98]"
      >
        Tampilkan semua prestasi
      </button>
    </div>
  );
}
