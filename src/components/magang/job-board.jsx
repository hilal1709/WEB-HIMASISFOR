"use client";
import { useLayoutEffect as useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { gsap, Flip } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { FIELDS, MODES, programLabel } from "@/lib/magang-content";
import { Container, PlaceholderTag, SectionHeader } from "@/components/home/shared";
import { MagangBanner } from "./magang-banner";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { LordIcon } from "@/components/media/lord-icon";
import { DotsLoader } from "@/components/ui/loader";
import { cn } from "@/lib/utils";
import { useMagang } from "./magang-provider";

const useIso = typeof window !== "undefined" ? useLayoutEffect : useEffect;
const PROGRAMS = ["kp", "mandiri", "dikti"].map((key) => ({ key, label: programLabel(key) }));
const fieldLabel = (k) => FIELDS.find((f) => f.key === k)?.label ?? k;
const modeLabel = (k) => MODES.find((m) => m.key === k)?.label ?? k;
const STEP = 8;

export function Highlight({ text, q }) {
  if (!q) return text;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark className="dosen-mark">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

/** Label tenggat: < 7 hari = mendesak (emas), lewat = ditutup (redup). `days` null saat SSR. */
export function DeadlineChip({ days, className }) {
  if (days == null) return <span className={cn("inline-block h-6 w-20 rounded bg-cream-2", className)} aria-hidden />;
  const closed = days < 0;
  const urgent = !closed && days < 7;
  return (
    <span
      className={cn(
        "tabular inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded px-2 text-[11.5px] font-semibold",
        closed ? "bg-cream-2 text-text/45" : urgent ? "bg-gold/20 text-maroon" : "bg-navy/5 text-navy/70",
        className
      )}
    >
      {urgent && <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-maroon" />}
      {closed ? "Ditutup" : days === 0 ? "Tutup hari ini" : `Tutup ${days} hari lagi`}
    </span>
  );
}

export const matches = (j, f, q) =>
  (f.field === "all" || j.field === f.field) &&
  (f.mode === "all" || j.mode === f.mode) &&
  (f.program === "all" || j.program === f.program) &&
  (!q || `${j.title} ${j.company} ${j.tasks.join(" ")} ${j.needs.join(" ")}`.toLowerCase().includes(q.toLowerCase()));

function ChipGroup({ label, name, options, value, counts, onChange }) {
  const all = `Semua ${label.toLowerCase()}`;
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap items-center gap-1.5">
      {[{ key: "all", label: all }, ...options].map((o) => {
        const on = value === o.key;
        const n = counts[o.key] ?? 0;
        const disabled = !on && n === 0;
        return (
          <button
            key={o.key}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={disabled}
            onClick={() => onChange({ [name]: o.key })}
            className={cn(
              "group inline-flex h-9 items-center gap-2 rounded-md border pl-3 pr-1.5 text-[13px] font-medium transition-[background-color,border-color,color,opacity,transform] duration-300 ease-cinematic active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60",
              on ? "border-navy bg-navy text-white" : "border-line bg-white text-navy hover:border-navy/40",
              disabled && "cursor-not-allowed opacity-40"
            )}
          >
            {o.label}
            <span
              key={n}
              className={cn(
                "tabular grid h-6 min-w-6 place-items-center rounded px-1.5 text-[11px] font-bold animate-in fade-in-0 slide-in-from-bottom-1 duration-300",
                on ? "bg-gold text-navy" : "bg-cream text-text/60 group-hover:bg-cream-2"
              )}
            >
              {n}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Papan lowongan (`#lowongan`). Pola 21st.dev "Joblisting" (baris ringkas yang tumbuh menjadi modal lewat shared
 * layout `layoutId` pada logo & judul) + "Role Filter Chips" (chip ber-badge jumlah, dihitung per faset).
 * Cari ber-debounce dengan teks cocok disorot; filter beranimasi GSAP Flip; tenggat < 7 hari disorot.
 */
export function JobBoard() {
  const { jobs, jobsSample, filter, setFilter, resetFilter, track, toggleSave, openJob } = useMagang();
  const [qInput, setQInput] = useState(filter.q);
  const [pending, setPending] = useState(false);
  const [limit, setLimit] = useState(STEP);
  const list = useRef(null);
  const flipState = useRef(null);
  const flipTween = useRef(null);

  useEffect(() => {
    if (qInput === filter.q) return;
    setPending(true);
    const t = setTimeout(() => {
      capture();
      setFilter({ q: qInput.trim() });
      setPending(false);
    }, 260);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qInput]);

  useEffect(() => setQInput(filter.q), [filter.q]);

  const capture = () => {
    if (list.current && !prefersReducedMotion()) flipState.current = Flip.getState(list.current.querySelectorAll("[data-job]"));
  };
  const change = (patch) => {
    capture();
    setLimit(STEP);
    setFilter(patch);
  };

  const shown = useMemo(() => jobs.filter((j) => matches(j, filter, filter.q)), [jobs, filter]);
  const visible = shown.slice(0, limit);

  // jumlah per faset: hitung dengan filter lain tetap berlaku
  const counts = useMemo(() => {
    const facet = (name, opts) =>
      Object.fromEntries(["all", ...opts.map((o) => o.key)].map((k) => [k, jobs.filter((j) => matches(j, { ...filter, [name]: k }, filter.q)).length]));
    return { field: facet("field", FIELDS), mode: facet("mode", MODES), program: facet("program", PROGRAMS) };
  }, [jobs, filter]);

  useIso(() => {
    const el = list.current;
    if (!el || prefersReducedMotion() || !flipState.current) return;
    const rows = el.querySelectorAll("[data-job]");
    flipTween.current?.progress(1).kill();
    flipTween.current = Flip.from(flipState.current, {
      targets: rows,
      duration: 0.65,
      ease: "expo.out",
      prune: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, ease: "expo.out", stagger: 0.04, clearProps: "opacity,transform" }),
      onComplete: () => gsap.set(rows, { clearProps: "transform,opacity" }),
    });
    flipState.current = null;
  }, [visible]);

  const active = filter.field !== "all" || filter.mode !== "all" || filter.program !== "all" || filter.q;

  return (
    <section id="lowongan" className="scroll-mt-20 py-20 md:py-20">
      <Container>
        <SectionHeader
          title={["Posisi yang", "sedang dibuka"]}
          body="Klik posisi untuk membaca tugas dan kebutuhannya. Simpan yang menarik, lalu pantau lamaranmu di bagian berikutnya."
          action={jobsSample ? <PlaceholderTag /> : null}
        />
        <MagangBanner className="mt-8" />

        <div className="sticky top-16 z-30 -mx-5 mt-10 space-y-3 border-y border-line bg-cream/95 px-5 py-3 backdrop-blur-md md:top-20 md:mx-0 md:mt-12 md:rounded-lg md:border md:px-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="relative flex h-10 min-w-0 flex-1 items-center rounded-md border border-line bg-white pl-3 pr-2 transition-[border-color,box-shadow] focus-within:border-navy focus-within:shadow-[0_0_0_3px_rgb(201_162_39/0.25)] sm:max-w-sm">
              <span className="sr-only">Cari posisi, perusahaan, atau keahlian</span>
              <svg aria-hidden viewBox="0 0 16 16" className="size-4 shrink-0 text-text/40">
                <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
                placeholder="Cari posisi, perusahaan, atau keahlian"
                className="h-full min-w-0 flex-1 bg-transparent px-2 text-[14px] text-navy outline-none placeholder:text-text/40"
              />
              {pending && <DotsLoader className="text-maroon" />}
            </label>
            <p className="tabular text-[13px] text-text/55" aria-live="polite">
              <span className="font-semibold text-navy">{shown.length}</span> posisi
            </p>
            {active && (
              <button type="button" onClick={() => (capture(), setQInput(""), resetFilter())} className="text-[13px] font-semibold text-maroon">
                <span className="u-gold">Hapus filter</span>
              </button>
            )}
          </div>
          <div className="-mx-5 flex gap-4 overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
            <ChipGroup label="Bidang" name="field" options={FIELDS} value={filter.field} counts={counts.field} onChange={change} />
            <span aria-hidden className="hidden w-px self-stretch bg-line md:block" />
            <ChipGroup label="Pintu" name="program" options={PROGRAMS} value={filter.program} counts={counts.program} onChange={change} />
            <span aria-hidden className="hidden w-px self-stretch bg-line md:block" />
            <ChipGroup label="Lokasi kerja" name="mode" options={MODES} value={filter.mode} counts={counts.mode} onChange={change} />
          </div>
        </div>

        {visible.length ? (
          <ul ref={list} className="mt-6 space-y-2.5">
            {visible.map((j) => {
              const saved = !!track[j.slug];
              const closed = j.days != null && j.days < 0;
              return (
                <li key={j.slug} data-job data-flip-id={j.slug}>
                  <div
                    className={cn(
                      "group relative flex items-center gap-4 overflow-hidden rounded-xl border border-line bg-white p-3 pr-3 transition-[border-color,box-shadow,transform] duration-500 ease-cinematic hover:-translate-y-0.5 hover:border-navy/25 hover:shadow-[0_24px_40px_-30px_rgb(20_33_61/0.55)] sm:gap-5 sm:p-4",
                      closed && "opacity-60"
                    )}
                  >
                    <span aria-hidden className="absolute inset-y-0 left-0 w-1 origin-bottom scale-y-0 bg-gold transition-transform duration-500 ease-cinematic group-hover:scale-y-100" />
                    <button
                      type="button"
                      onClick={() => openJob(j.slug)}
                      className="flex min-w-0 flex-1 items-center gap-4 text-left outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-gold/70 sm:gap-5"
                    >
                      <motion.span
                        layoutId={`job-logo-${j.slug}`}
                        className="tabular grid size-12 shrink-0 place-items-center rounded-lg bg-navy font-serif text-[1.05rem] text-gold-soft sm:size-14 sm:text-[1.2rem]"
                      >
                        {j.logo}
                      </motion.span>
                      <span className="min-w-0 flex-1">
                        <motion.span layoutId={`job-title-${j.slug}`} className="block truncate font-serif text-[1.15rem] leading-tight text-navy sm:text-[1.3rem]">
                          <Highlight text={j.title} q={filter.q} />
                        </motion.span>
                        <span className="mt-1 block truncate text-[13px] text-text/60">
                          <Highlight text={j.company} q={filter.q} /> · {modeLabel(j.mode)} · {j.duration}
                        </span>
                        <span className="mt-2 flex flex-wrap items-center gap-1.5 md:hidden">
                          <DeadlineChip days={j.days} />
                        </span>
                      </span>
                      <span className="hidden shrink-0 flex-col items-end gap-1.5 md:flex">
                        <DeadlineChip days={j.days} />
                        <span className="text-[12px] text-text/50">
                          {programLabel(j.program)} · {fieldLabel(j.field)}
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSave(j.slug)}
                      aria-pressed={saved}
                      aria-label={saved ? `Hapus ${j.title} dari jejak lamaran` : `Simpan ${j.title} ke jejak lamaran`}
                      className={cn(
                        "relative z-10 grid size-10 shrink-0 place-items-center rounded-md border transition-[background-color,border-color,transform] duration-300 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60",
                        saved ? "border-maroon bg-maroon" : "border-line bg-white hover:border-maroon"
                      )}
                    >
                      <LordIcon
                        key={saved ? "on" : "off"}
                        name={saved ? "check" : "plus-circle"}
                        size={22}
                        trigger={saved ? "once" : "hover"}
                        colors={saved ? "primary:#ffffff,secondary:#e6d3a1" : "primary:#14213d,secondary:#6e1423"}
                      />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-8 flex flex-col items-center rounded-xl border border-dashed border-line bg-white px-6 py-12 text-center">
            <span className="size-36">
              <LottieIllustration src="/lottie/empty-news.json" label="Tidak ada lowongan yang cocok" />
            </span>
            <p className="mt-4 font-serif text-[1.35rem] text-navy">Belum ada posisi yang cocok</p>
            <p className="mt-1 max-w-sm text-[14.5px] text-text/60">Longgarkan filternya, atau cari dengan kata lain.</p>
            <button type="button" onClick={() => (setQInput(""), resetFilter())} className="mt-5 h-10 rounded-md bg-maroon px-5 text-sm font-semibold text-white transition-colors hover:bg-maroon-deep">
              Tampilkan semua posisi
            </button>
          </div>
        )}

        {shown.length > limit && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => (capture(), setLimit((l) => l + STEP))}
              className="h-11 rounded-md border border-navy/25 bg-white px-6 text-[14px] font-semibold text-navy transition-colors hover:border-navy"
            >
              Tampilkan {Math.min(STEP, shown.length - limit)} posisi lagi
            </button>
          </div>
        )}
      </Container>
    </section>
  );
}
