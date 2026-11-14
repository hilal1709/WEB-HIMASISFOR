"use client";
import { useLayoutEffect as useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y } from "swiper/modules";
import "swiper/css";
import { Flip, gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { Container, SectionHeader } from "@/components/home/shared";
import { SpotlightCard } from "@/components/aceternity/spotlight-card";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { Skeleton } from "@/components/ui/loader";
import { cn } from "@/lib/utils";
import { Highlight, useDosen } from "./dosen-provider";

const pad = (n) => String(n).padStart(2, "0");
const useIso = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Direktori dosen (pola 21st.dev "team grid" + horizonx "editorial list").
 * Pencarian & filter rumpun ada di hero; bilah sticky di sini hanya ringkasan hasil, chip filter aktif
 * (klik untuk menghapus), tautan kembali ke kolom cari, dan toggle Grid/Daftar (≥ lg). Grid: kartu sorot emas, foto berwarna yang membesar halus, chip masuk berurutan;
 * filter beranimasi FLIP (GSAP Flip). Daftar: baris serif besar, foto pratinjau mengikuti kursor.
 * Ponsel: Swiper. Hasil kosong: Lottie + tombol reset.
 */
export function Directory() {
  const { fields, field, setField, query, setQuery, view, setView, filtered, lecturers, reset, directory } = useDosen();
  const fieldName = fields.find((f) => f.key === field)?.name;
  const grid = useRef(null);
  const flipState = useRef(null);
  const flipTween = useRef(null);

  // FLIP: tangkap posisi kartu sebelum state berubah
  const withFlip = (fn) => {
    if (grid.current && !prefersReducedMotion()) flipState.current = Flip.getState(grid.current.querySelectorAll("[data-card]"));
    fn();
  };

  useIso(() => {
    const el = grid.current;
    if (!el || prefersReducedMotion()) return;
    const cards = el.querySelectorAll("[data-card]");
    if (flipState.current) {
      flipTween.current?.progress(1).kill();
      flipTween.current = Flip.from(flipState.current, {
        targets: cards,
        duration: 0.7,
        ease: "expo.out",
        prune: true,
        onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.6, ease: "expo.out", stagger: 0.04, clearProps: "opacity,scale,transform" }),
        onComplete: () => gsap.set(cards, { clearProps: "transform,opacity" }),
      });
      flipState.current = null;
    } else {
      gsap.fromTo(cards, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.6, ease: "expo.out", stagger: 0.05, clearProps: "transform" });
    }
  }, [filtered, view]);


  return (
    <section id="direktori" className="scroll-mt-20 py-16 md:py-20">
      <Container>
        <SectionHeader
          title={[directory.titleTop, directory.titleAccent]}
          body={directory.body}
        />

        {/* bilah hasil (sticky): pencarian & filter ada di hero, di sini ringkasan + reset + tampilan */}
        <div className="sticky top-16 z-30 -mx-5 mt-10 flex flex-wrap items-center justify-between gap-3 border-y border-line bg-cream/95 px-5 py-3 backdrop-blur-md md:top-20 md:mx-0 md:mt-12 md:rounded-lg md:border md:px-4">
          <div aria-live="polite" className="flex flex-wrap items-center gap-2 text-[13.5px] text-text/60">
            <span>
              Menampilkan <span className="tabular font-semibold text-navy">{filtered.length}</span> dari {lecturers.length} dosen
            </span>
            {field !== "all" && (
              <button type="button" onClick={() => withFlip(() => setField("all"))} className="inline-flex items-center gap-1.5 rounded-full border border-maroon/30 bg-white px-3 py-1 text-[12.5px] text-maroon hover:border-maroon">
                {fieldName}
                <span aria-label="Hapus filter rumpun">×</span>
              </button>
            )}
            {query && (
              <button type="button" onClick={() => withFlip(() => setQuery(""))} className="inline-flex items-center gap-1.5 rounded-full border border-maroon/30 bg-white px-3 py-1 text-[12.5px] text-maroon hover:border-maroon">
                “{query}”
                <span aria-label="Hapus pencarian">×</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("hero-dosen-q");
                el?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center" });
                setTimeout(() => el?.focus({ preventScroll: true }), 400);
              }}
              className="text-[13.5px] font-semibold text-navy"
            >
              <span className="u-gold">Ubah pencarian ↑</span>
            </button>
            <ViewToggle value={view} onChange={setView} />
          </div>
        </div>

        {filtered.length === 0 ? (
          <Empty copy={directory.empty} onReset={() => withFlip(reset)} />
        ) : (
          <>
            {/* ≥ md: grid / daftar */}
            <div ref={grid} className="mt-6 hidden md:block">
              {view === "grid" ? (
                <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((l) => (
                    <li key={l.slug} data-card data-flip-id={l.slug}>
                      <LecturerCard item={l} n={lecturers.indexOf(l) + 1} query={query} />
                    </li>
                  ))}
                </ul>
              ) : (
                <Rows items={filtered} all={lecturers} query={query} />
              )}
            </div>

            {/* ponsel */}
            <div className="mt-6 min-w-0 md:hidden">
              <Swiper modules={[A11y]} spaceBetween={14} slidesPerView={1.15} key={filtered.map((l) => l.slug).join()}>
                {filtered.map((l) => (
                  <SwiperSlide key={l.slug} className="!h-auto">
                    <LecturerCard item={l} n={lecturers.indexOf(l) + 1} query={query} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </>
        )}
      </Container>
    </section>
  );
}

function ViewToggle({ value, onChange }) {
  const opts = [
    { v: "grid", label: "Tampilan kartu", d: "M3 3h6v6H3zM11 3h6v6h-6zM3 11h6v6H3zM11 11h6v6h-6z" },
    { v: "list", label: "Tampilan daftar", d: "M3 5h14M3 10h14M3 15h14" },
  ];
  return (
    <div role="radiogroup" aria-label="Mode tampilan" className="hidden rounded-md border border-line bg-white p-1 lg:flex">
      {opts.map((o) => (
        <button
          key={o.v}
          type="button"
          role="radio"
          aria-checked={value === o.v}
          aria-label={o.label}
          title={o.label}
          onClick={() => onChange(o.v)}
          className={cn("grid size-8 place-items-center rounded transition-[background-color,color] duration-300", value === o.v ? "bg-navy text-white" : "text-navy/55 hover:text-navy")}
        >
          <svg aria-hidden viewBox="0 0 20 20" className="size-4">
            <path d={o.d} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function LecturerCard({ item, n, query }) {
  const { openProfile, fields, directory } = useDosen();
  const [loaded, setLoaded] = useState(!item.photo);
  return (
    <SpotlightCard
      as="button"
      type="button"
      onClick={() => openProfile(item.slug)}
      aria-label={`Profil ${item.name}`}
      className="flex h-full w-full flex-col rounded-lg border border-line bg-white text-left transition-[border-color,box-shadow,transform] duration-500 ease-cinematic hover:-translate-y-1 hover:!border-navy/20 hover:shadow-[0_30px_60px_-40px_rgb(20_33_61/0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon/40"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -z-10 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/20 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ left: "var(--mx, 50%)", top: "var(--my, 50%)" }}
      />
      <span className="relative block aspect-[4/3.6] overflow-hidden rounded-t-lg bg-cream-2">
        {!loaded && <Skeleton className="absolute inset-0 rounded-none bg-cream-2" />}
        {item.photo ? (
          <Image
            src={item.photo}
            alt=""
            fill
            sizes="(min-width:1024px) 380px, (min-width:768px) 50vw, 85vw"
            onLoad={() => setLoaded(true)}
            className={cn(
              "object-cover object-[50%_20%] transition-[transform,opacity] duration-700 ease-cinematic group-hover:scale-[1.05]",
              loaded ? "opacity-100" : "opacity-0"
            )}
          />
        ) : (
          <span className="grid size-full place-items-center font-serif text-5xl text-maroon">{item.initials}</span>
        )}
        <span className="tabular absolute left-3 top-3 rounded bg-navy/85 px-2 py-1 font-serif text-[15px] leading-none text-gold-soft">{pad(n)}</span>
        {item.key === "kaprodi" && directory.leadBadge && <span className="kicker absolute right-3 top-3 rounded bg-gold px-2 py-1 text-[10px] text-navy">{directory.leadBadge}</span>}
        {/* chip rumpun naik saat hover */}
        <span className="absolute inset-x-3 bottom-3 flex flex-wrap gap-1.5">
          {item.fields.map((f, i) => (
            <span
              key={f}
              className="translate-y-2 rounded bg-navy/90 px-2 py-0.5 text-[11.5px] font-medium text-white opacity-0 transition-[transform,opacity] duration-500 ease-cinematic group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              {fields.find((x) => x.key === f)?.short}
            </span>
          ))}
        </span>
      </span>
      <span className="flex flex-1 flex-col p-5">
        <span className="font-serif text-[1.3rem] leading-snug text-navy transition-colors duration-300 group-hover:text-maroon">
          <Highlight text={item.name} query={query} />
        </span>
        <span aria-hidden className="mt-2 block h-[2px] w-8 origin-left bg-gold transition-transform duration-500 ease-cinematic group-hover:scale-x-[2.5]" />
        <span className="mt-2 text-[12.5px] leading-relaxed text-text/50">{item.credentials}</span>
        <span className="mt-4 flex flex-wrap gap-1.5">
          {item.expertise.map((x) => (
            <span key={x} className="rounded bg-cream px-2 py-0.5 text-[12.5px] text-navy/80">
              <Highlight text={x} query={query} />
            </span>
          ))}
        </span>
        <span className="mt-auto flex items-center justify-between pt-5 text-[13px] font-semibold text-maroon">
          <span className="u-gold">{directory.cardCta}</span>
          <svg aria-hidden viewBox="0 0 16 16" className="size-4 transition-transform duration-500 ease-cinematic group-hover:rotate-45">
            <path d="M5 11l6-6M6 5h5v5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </span>
    </SpotlightCard>
  );
}

/** Mode daftar editorial: foto pratinjau mengikuti kursor (GSAP quickTo). */
function Rows({ items, all, query }) {
  const { openProfile, fields } = useDosen();
  const box = useRef(null);
  const preview = useRef(null);
  const [hover, setHover] = useState(null);
  const qx = useRef(null);
  const qy = useRef(null);

  useEffect(() => {
    if (!preview.current) return;
    qx.current = gsap.quickTo(preview.current, "x", { duration: 0.55, ease: "power3.out" });
    qy.current = gsap.quickTo(preview.current, "y", { duration: 0.55, ease: "power3.out" });
  }, []);

  const onMove = (e) => {
    const r = box.current.getBoundingClientRect();
    qx.current?.(e.clientX - r.left + 28);
    qy.current?.(e.clientY - r.top - 110);
  };

  const current = items.find((l) => l.slug === hover);

  return (
    <div ref={box} className="relative" onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
      <ul className="dosen-rows border-t border-line">
        {items.map((l) => (
          <li key={l.slug} data-card data-flip-id={l.slug}>
            <button
              type="button"
              onClick={() => openProfile(l.slug)}
              onPointerEnter={() => setHover(l.slug)}
              onFocus={() => setHover(null)}
              className="dosen-row group grid w-full grid-cols-[64px_1fr_auto] items-center gap-6 border-b border-line py-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon/40"
            >
              <span className="tabular font-serif text-[1.1rem] text-text/40 transition-colors group-hover:text-gold">{pad(all.indexOf(l) + 1)}</span>
              <span>
                <span className="block font-serif text-[clamp(1.6rem,3vw,2.6rem)] leading-tight text-navy transition-[color,transform] duration-500 ease-cinematic group-hover:translate-x-2 group-hover:text-maroon">
                  <Highlight text={l.name} query={query} />
                </span>
                <span className="mt-1 block text-[13.5px] text-text/55">
                  <Highlight text={l.expertise.join(" · ")} query={query} />
                </span>
              </span>
              <span className="flex items-center gap-4">
                <span className="hidden text-right text-[13px] text-text/55 xl:block">{l.fields.map((f) => fields.find((x) => x.key === f)?.short).join(" / ")}</span>
                <span className="grid size-10 place-items-center rounded-full border border-line text-navy transition-[background-color,border-color,color,transform] duration-500 ease-cinematic group-hover:rotate-45 group-hover:border-maroon group-hover:bg-maroon group-hover:text-white">
                  <svg aria-hidden viewBox="0 0 16 16" className="size-4">
                    <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <div
        ref={preview}
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-0 top-0 z-20 h-56 w-44 overflow-hidden rounded-lg bg-cream-2 shadow-[0_30px_60px_-25px_rgb(20_33_61/0.6)] transition-[opacity,scale] duration-300 ease-cinematic",
          current?.photo ? "scale-100 opacity-100" : "scale-90 opacity-0"
        )}
      >
        {items.map((l) =>
          l.photo ? (
            <Image
              key={l.slug}
              src={l.photo}
              alt=""
              fill
              sizes="176px"
              className={cn("object-cover object-top transition-[opacity,transform] duration-500 ease-cinematic", l.slug === hover ? "scale-100 opacity-100" : "scale-110 opacity-0")}
            />
          ) : null
        )}
        <span className="absolute inset-x-0 bottom-0 h-1 bg-gold" />
      </div>
    </div>
  );
}

function Empty({ copy, onReset }) {
  return (
    <div className="mt-8 flex flex-col items-center rounded-lg border border-dashed border-line bg-white px-6 py-12 text-center" data-aos="fade-up">
      <div className="w-36">
        <LottieIllustration src="/lottie/empty-news.json" label={copy.title} />
      </div>
      <p className="mt-4 font-serif text-[1.4rem] text-navy">{copy.title}</p>
      <p className="mt-1 text-[14px] text-text/60">{copy.body}</p>
      <button
        type="button"
        onClick={onReset}
        className="mt-6 inline-flex h-10 items-center rounded-md bg-navy px-5 text-[14px] font-semibold text-white transition-[background-color,transform] duration-300 hover:bg-navy-deep active:scale-[0.98]"
      >
        {copy.resetLabel}
      </button>
    </div>
  );
}
