"use client";
import { useLayoutEffect as useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { animate, stagger } from "animejs";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { LIMITS } from "@/lib/konversi-content";
import { RUMPUN_BY_KEY } from "@/lib/kurikulum-content";
import { Container, PlaceholderTag, SectionHeader } from "@/components/home/shared";
import { RumpunDot } from "@/components/kurikulum/rumpun-dot";
import { Banner } from "@/components/ui/banner";
import { DotsLoader } from "@/components/ui/loader";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { RollingNumber } from "./rolling-number";
import { ScrubField } from "./scrub-field";
import { Receipt } from "./receipt";
import { useKonversi } from "./konversi-provider";

const SEG = { fondasi: "bg-navy", enterprise: "bg-maroon", "tata-kelola": "bg-gold", data: "bg-navy/55" };
const SHOW = 8;

/** Kiri: pilihan kegiatan (sorotan `layoutId`) + scrub field. */
function Inputs() {
  const { programs, program, programKey, choose, weeks, hours, sks, setWeeks, setHours, setSks } = useKonversi();
  const reduce = useReducedMotion();
  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <p className="kicker text-[11px] text-maroon">1 · Kegiatan</p>
        <div role="radiogroup" aria-label="Bentuk kegiatan" className="mt-3 flex flex-wrap gap-1.5">
          {programs.map((p) => {
            const on = p.key === programKey;
            return (
              <button
                key={p.key}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => !on && choose(p.key)}
                className={cn(
                  "relative h-9 rounded-md border px-3 text-[13px] font-medium outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-gold",
                  on ? "border-maroon text-white" : "border-line bg-white text-navy hover:border-navy/35"
                )}
              >
                {on && <motion.span layoutId="konversi-chip" className="absolute inset-0 rounded-[5px] bg-maroon" transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }} />}
                <span className="relative">{p.label}</span>
              </button>
            );
          })}
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={program.key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: reduce ? 0 : 0.22 }}
            className="mt-3 min-h-[2.6em] text-[14px] leading-snug text-text/65"
          >
            {program.lead}
          </motion.p>
        </AnimatePresence>
      </div>
      <div>
        <p className="kicker text-[11px] text-maroon">2 · {program.mode === "jam" ? "Durasi" : "SKS yang kamu ambil"}</p>
        {program.mode === "jam" ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <ScrubField label="Lama kegiatan" unit="minggu" value={weeks} min={LIMITS.weeks[0]} max={LIMITS.weeks[1]} onChange={setWeeks} />
            <ScrubField label="Jam per minggu" unit="jam" value={hours} min={LIMITS.hours[0]} max={LIMITS.hours[1]} onChange={setHours} />
          </div>
        ) : (
          <ScrubField className="mt-3" label="SKS di kampus tujuan" unit="SKS" hint="diakui 1 : 1" value={sks} min={LIMITS.sks[0]} max={LIMITS.sks[1]} onChange={setSks} />
        )}
      </div>
    </div>
  );
}

/** Tengah: jendela kurs. Panah tukar berputar pegas setiap angka berubah. */
function RateWindow() {
  const { program, rate, weeks, hours, sks } = useKonversi();
  const arrows = useRef(null);
  const turn = useRef(0);
  useEffect(() => {
    if (!arrows.current || prefersReducedMotion()) return;
    turn.current += 180;
    gsap.to(arrows.current, { rotate: turn.current, duration: 0.9, ease: "back.out(2.2)" });
  }, [weeks, hours, sks, program.key]);

  return (
    <div className="flex items-center justify-center gap-4 rounded-lg border border-gold/60 bg-white px-4 py-4 outline outline-1 outline-offset-4 outline-gold/30 lg:h-full lg:flex-col lg:gap-5 lg:px-3 lg:py-6">
      <p className="kicker text-[10.5px] text-text/50 lg:[writing-mode:vertical-rl] lg:rotate-180">Kurs</p>
      <div className="text-center">
        <p className="font-serif text-[1.6rem] leading-none text-navy">1</p>
        <p className="mt-1 text-[11px] text-text/50">SKS</p>
      </div>
      <span ref={arrows} aria-hidden className="grid size-10 place-items-center rounded-full bg-cream text-maroon">
        <svg viewBox="0 0 20 20" className="size-5 lg:rotate-90">
          <path d="M3 7h13M12 3l4 4-4 4M17 13H4M8 9l-4 4 4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <div className="text-center">
        <p className="tabular font-serif text-[1.6rem] leading-none text-navy">{program.mode === "jam" ? rate : 1}</p>
        <p className="mt-1 text-[11px] text-text/50">{program.mode === "jam" ? "jam" : "SKS asal"}</p>
      </div>
    </div>
  );
}

/** Kanan: SKS diakui (angka bergulir) + meter sel batas semester. */
function Result() {
  const { program, weeks, hours, raw, credits, cap, over, busy, rulesSample } = useKonversi();
  const cells = useRef(null);
  const prev = useRef(credits);
  useEffect(() => {
    const host = cells.current;
    if (!host || prefersReducedMotion()) return;
    const from = prev.current;
    prev.current = credits;
    if (credits <= from) return;
    const lit = [...host.children].slice(from, credits);
    animate(lit, { scale: [0.4, 1], opacity: [0.3, 1], duration: 420, delay: stagger(28), ease: "outBack(2)" });
  }, [credits]);

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-lg bg-navy p-5 text-white sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="kicker text-[11px] text-gold-soft">3 · SKS diakui</p>
        <span className="flex h-4 items-center">{busy && <DotsLoader className="text-gold [&>span]:size-1.5" />}</span>
      </div>
      <div className="mt-3 flex items-end gap-3">
        <RollingNumber value={credits} className="font-serif text-[clamp(4.5rem,9vw,6.5rem)] text-white" label={`${credits} SKS`} />
        <span className="mb-3 text-[15px] text-white/60">SKS</span>
      </div>
      <p className="tabular text-[13px] text-white/55">
        {program.mode === "jam" ? `dari ${(weeks * hours).toLocaleString("id-ID")} jam kegiatan` : "setara jumlah SKS di kampus tujuan"}
      </p>

      <div className="mt-5">
        <div className="flex items-center justify-between text-[11px] text-white/45">
          <span>Batas per semester</span>
          <span className="tabular">{credits}/{cap}</span>
        </div>
        <div ref={cells} aria-hidden className="mt-2 grid gap-1" style={{ gridTemplateColumns: `repeat(${Math.min(cap, 10)}, minmax(0, 1fr))` }}>
          {Array.from({ length: cap }, (_, i) => (
            <span
              key={i}
              className={cn(
                "h-3 rounded-[2px] transition-colors duration-300",
                i < credits ? (over ? "bg-gold motion-safe:animate-pulse" : "bg-gold") : "bg-white/10"
              )}
            />
          ))}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {over && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <Banner variant="warning" title={`${raw - cap} SKS di atas batas`} className="mt-4">
              Kelebihan jam tidak menambah SKS semester ini.{" "}
              <a href="/regulasi-akademik#pasal-1-3" className="font-semibold text-navy underline decoration-gold underline-offset-4">Lihat aturannya</a>
            </Banner>
          </motion.div>
        )}
      </AnimatePresence>
      {rulesSample && <PlaceholderTag tone="dark" className="mt-4 self-start" />}
    </div>
  );
}

/** Kantong mata kuliah: bilah bertumpuk + daftar kandidat dari kurikulum. */
function Pocket() {
  const { program, ranked, picked, pickedCourses, credits, used, left, toggleCourse, autofill, openCourse } = useKonversi();
  const reduce = useReducedMotion();
  const [all, setAll] = useState(false);
  useEffect(() => setAll(false), [program.key]);
  const list = all ? ranked : ranked.slice(0, SHOW);

  return (
    <div className="rounded-lg border border-line bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker text-[11px] text-maroon">4 · Mata kuliah pengganti</p>
          <p className="mt-1.5 text-[14px] text-text/65">
            Terpakai <span className="tabular font-semibold text-navy">{used}</span> dari <span className="tabular font-semibold text-navy">{credits}</span> SKS
          </p>
        </div>
        <button
          type="button"
          onClick={autofill}
          disabled={!credits}
          className="h-9 rounded-md border border-navy/20 px-3.5 text-[13px] font-semibold text-navy transition-[background-color,border-color,transform] duration-300 hover:border-navy/40 hover:bg-cream active:scale-[0.97] disabled:opacity-40"
        >
          Isi otomatis
        </button>
      </div>

      {/* bilah bertumpuk */}
      <div className="mt-4 flex h-4 overflow-hidden rounded-[3px] bg-cream-2" role="img" aria-label={`${used} dari ${credits} SKS terpakai`}>
        <AnimatePresence initial={false}>
          {credits > 0 &&
            pickedCourses.map((c) => (
              <motion.span
                key={c.slug}
                layout
                initial={{ width: 0 }}
                animate={{ width: `${(c.sks / credits) * 100}%` }}
                exit={{ width: 0 }}
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 30 }}
                className={cn("h-full border-r-2 border-white", SEG[c.rumpun] ?? SEG.fondasi)}
                title={`${c.nama} · ${c.sks} SKS`}
              />
            ))}
        </AnimatePresence>
        {left > 0 && (
          <svg aria-hidden className="h-full flex-1 text-navy/15">
            <defs>
              <pattern id="konversi-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <path d="M0 0v6" stroke="currentColor" strokeWidth="1.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#konversi-hatch)" />
          </svg>
        )}
      </div>

      <ul className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-x-6 md:grid-cols-2">
        {list.map((c) => {
          const on = picked.includes(c.slug);
          const fits = on || c.sks <= left;
          return (
            <li key={c.slug} className="flex min-w-0 items-center gap-3 border-t border-line py-3">
              <RumpunDot rumpun={c.rumpun} />
              <button type="button" onClick={() => openCourse(c.slug)} className="min-w-0 flex-1 text-left">
                <span className={cn("block truncate text-[14px] font-medium transition-colors hover:text-maroon", fits ? "text-navy" : "text-text/40")}>{c.nama}</span>
                <span className="block text-[12px] text-text/50">
                  {c.semester ? `Smt ${c.semester}` : "Pilihan"} · {RUMPUN_BY_KEY[c.rumpun]?.short}
                </span>
              </button>
              <span className="tabular text-[13px] text-text/55">{c.sks} SKS</span>
              <button
                type="button"
                onClick={() => toggleCourse(c.slug)}
                aria-pressed={on}
                aria-label={on ? `Keluarkan ${c.nama} dari kantong` : `Masukkan ${c.nama} ke kantong`}
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-md border transition-[background-color,border-color,color,transform] duration-300 active:scale-90",
                  on ? "border-maroon bg-maroon text-white" : fits ? "border-line text-navy hover:border-maroon hover:text-maroon" : "border-line text-text/30"
                )}
              >
                <svg aria-hidden viewBox="0 0 16 16" className={cn("size-3.5 transition-transform duration-300", on && "rotate-[360deg]")}>
                  {on ? <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /> : <path d="M3 8h10M8 3v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />}
                </svg>
              </button>
            </li>
          );
        })}
      </ul>
      {ranked.length > SHOW && (
        <button type="button" onClick={() => setAll((v) => !v)} className="mt-3 text-[13px] font-semibold text-maroon">
          <span className="u-gold">{all ? "Tampilkan lebih sedikit" : `Tampilkan semua (${ranked.length})`}</span>
        </button>
      )}
    </div>
  );
}

/** Ponsel: bilah ringkas di bawah layar selama meja terlihat → membuka struk sebagai lembar bawah. */
function MobileDock({ visible }) {
  const { credits, pickedCourses } = useKonversi();
  const [open, setOpen] = useState(false);
  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed inset-x-3 bottom-3 z-40 lg:hidden"
          >
            <button type="button" onClick={() => setOpen(true)} className="flex w-full items-center justify-between gap-3 rounded-lg bg-navy px-4 py-3 text-left text-white shadow-[0_18px_40px_-16px_rgb(14_24_48/0.8)]">
              <span className="flex items-baseline gap-2">
                <RollingNumber value={credits} className="font-serif text-[1.6rem] text-gold-soft" />
                <span className="text-[13px] text-white/70">SKS · {pickedCourses.length} mata kuliah</span>
              </span>
              <span className="rounded-md bg-gold px-3 py-1.5 text-[13px] font-semibold text-navy">Lihat struk</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="bg-cream-2 px-4 pb-6 pt-12">
          <SheetTitle className="sr-only">Struk simulasi konversi</SheetTitle>
          <SheetDescription>Ringkasan SKS yang diakui dan mata kuliah pengganti.</SheetDescription>
          <Receipt tilt={false} />
        </SheetContent>
      </Sheet>
    </>
  );
}

/**
 * Meja konversi `#kalkulator` — tata letak meja penukaran valuta:
 * kegiatan & durasi (kiri) → jendela kurs (tengah) → SKS diakui + meter batas (kanan),
 * lalu kantong mata kuliah pengganti dan struk simulasi yang menempel (≥ lg) / lembar bawah (ponsel).
 */
export function ExchangeDesk() {
  const { program } = useKonversi();
  const section = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "-30% 0px -30% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={section} id="kalkulator" className="scroll-mt-24 border-t border-line bg-cream-2 py-16 md:py-20">
      <Container>
        <SectionHeader title={["Tukar jam kegiatan", "jadi SKS"]} body={`Atur ${program.mode === "jam" ? "durasinya" : "jumlah SKS-nya"}, lalu pilih mata kuliah yang digantikan. Angkanya langsung terhitung.`} />

        <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1.15fr)_96px_minmax(0,1fr)] lg:gap-5" data-aos="fade-up">
          <Inputs />
          <RateWindow />
          <Result />
        </div>

        <div className="mt-5 grid grid-cols-[minmax(0,1fr)] items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <Pocket />
          <div className="hidden lg:sticky lg:top-24 lg:block">
            <Receipt />
          </div>
        </div>
      </Container>
      <MobileDock visible={inView} />
    </section>
  );
}
