"use client";
import { useLayoutEffect as useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { fill } from "@/lib/kurikulum-content";
import { CloseGlyph } from "@/components/home/glyphs";
import { LordIcon } from "@/components/media/lord-icon";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/loader";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const TAB = "rounded-none border-b-2 border-transparent px-0 pb-3 pt-0 h-auto text-[14px] text-text/55 data-[state=active]:border-gold data-[state=active]:text-navy";
const isExam = (m, i) => Boolean(m?.ujian) || /^ujian$/i.test(m?.penilaian ?? "") || (!m && (i === 7 || i === 15));

function Label({ children }) {
  return <p className="kicker mb-3 text-[11px] text-maroon">{children}</p>;
}

function Coded({ items, bar }) {
  return (
    <ul className="space-y-2.5">
      {items.map((x, k) => (
        <li key={k} className="rounded-lg border border-line p-4">
          <div className="flex items-center justify-between gap-3">
            {x.kode ? <span className="rounded bg-cream px-2 py-0.5 text-[12px] font-semibold tabular-nums text-navy">{x.kode}</span> : <span />}
            {bar && x.bobot != null && <span className="font-serif text-[15px] tabular-nums text-navy">{x.bobot}%</span>}
          </div>
          <p className="mt-2 text-[14.5px] leading-relaxed text-text/80">{x.teks}</p>
          {bar && x.bobot != null && (
            <span aria-hidden className="mt-3 block h-1.5 overflow-hidden rounded-full bg-cream">
              <span data-grow className="block h-full rounded-full bg-gold" style={{ width: `${x.bobot}%` }} />
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

/** Ringkasan: deskripsi, CPL, CPMK (bobot), Sub-CPMK (buka-tutup), bahan kajian. */
function Summary({ r, t }) {
  const ref = useRef(null);
  const [subOpen, setSubOpen] = useState(false);
  useEffect(() => {
    if (prefersReducedMotion() || !ref.current) return;
    const t = gsap.fromTo(ref.current.querySelectorAll("[data-grow]"), { scaleX: 0 }, { scaleX: 1, duration: 0.9, stagger: 0.1, ease: "expo.out", transformOrigin: "left center" });
    return () => t.revert();
  }, []);
  return (
    <div ref={ref} className="space-y-8">
      {r.deskripsi && (
        <div>
          <Label>{t.deskripsi}</Label>
          <p className="text-[15px] leading-relaxed text-text/80">{r.deskripsi}</p>
        </div>
      )}
      {r.cpl.length > 0 && (
        <div>
          <Label>{t.cpl}</Label>
          <Coded items={r.cpl} />
        </div>
      )}
      {r.cpmk.length > 0 && (
        <div>
          <Label>{t.cpmk}</Label>
          <Coded items={r.cpmk} bar />
        </div>
      )}
      {r.subcpmk.length > 0 && (
        <div>
          <button type="button" aria-expanded={subOpen} onClick={() => setSubOpen((v) => !v)} className="flex w-full items-center justify-between text-left">
            <span className="kicker text-[11px] text-maroon">{fill(t.subcpmk, { n: r.subcpmk.length })}</span>
            <span aria-hidden className={cn("grid size-7 place-items-center rounded-full border border-line text-navy transition-transform duration-300", subOpen && "rotate-45 border-gold")}>+</span>
          </button>
          <div className={cn("grid transition-[grid-template-rows] duration-500 ease-cinematic", subOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
            <ol className="overflow-hidden">
              {r.subcpmk.map((x, k) => (
                <li key={k} className="flex gap-3 border-b border-line py-3 text-[14px] leading-relaxed text-text/75 last:border-0">
                  <span className="w-24 shrink-0 text-[12px] font-semibold tabular-nums text-navy">{x.kode}</span>
                  <span>{x.teks}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
      {r.bahanKajian.length > 0 && (
        <div>
          <Label>{t.kajian}</Label>
          <ol className="space-y-2">
            {r.bahanKajian.map((t, k) => (
              <li key={k} className="flex gap-3 text-[14.5px] leading-relaxed text-text/80">
                <span className="w-5 shrink-0 font-serif tabular-nums text-maroon">{k + 1}</span>
                {t}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

/** 16 minggu: kotak per minggu + panel detail (judul, materi, metode, Sub-CPMK, penilaian). */
function Weeks({ minggu, t }) {
  const [pick, setPick] = useState(0);
  const m = minggu[pick] ?? {};
  const panel = useRef(null);
  useEffect(() => {
    if (prefersReducedMotion() || !panel.current) return;
    const t = gsap.fromTo(panel.current.children, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: 0.04, ease: "expo.out" });
    return () => t.revert();
  }, [pick]);
  return (
    <div>
      <ol className="grid grid-cols-8 gap-1.5" aria-label={t.weeksAria}>
        {Array.from({ length: 16 }, (_, i) => {
          const exam = isExam(minggu[i], i);
          const on = pick === i;
          return (
            <li key={i}>
              <button
                type="button"
                onMouseEnter={() => setPick(i)}
                onFocus={() => setPick(i)}
                onClick={() => setPick(i)}
                aria-pressed={on}
                aria-label={`${fill(t.week, { n: i + 1 })}: ${minggu[i]?.judul || t.weekPending}`}
                className={cn(
                  "grid h-11 w-full place-items-center rounded-md border text-[13px] font-semibold tabular-nums transition-[background-color,border-color,color,transform] duration-200 hover:-translate-y-0.5",
                  exam ? "border-gold bg-gold/15 text-navy" : "border-line bg-white text-text/60",
                  on && (exam ? "bg-gold text-navy" : "border-navy bg-navy text-white")
                )}
              >
                {i + 1}
              </button>
            </li>
          );
        })}
      </ol>
      <div ref={panel} className="mt-4 rounded-lg bg-cream p-5" aria-live="polite">
        <p className="kicker text-maroon">
          {fill(t.week, { n: pick + 1 })}
          {m.subcpmk ? <span className="ml-2 text-text/45">· {m.subcpmk}</span> : null}
        </p>
        <p className="mt-1.5 font-serif text-[1.3rem] leading-snug text-navy">{m.judul || t.weekPending}</p>
        {m.materi && <p className="mt-2 text-[14.5px] leading-relaxed text-text/75">{m.materi}</p>}
        {(m.metode || m.penilaian) && (
          <dl className="mt-4 grid gap-3 border-t border-navy/10 pt-3 text-[13px] sm:grid-cols-2">
            {m.metode && (
              <div>
                <dt className="text-text/45">{t.metode}</dt>
                <dd className="mt-0.5 text-navy">{m.metode}</dd>
              </div>
            )}
            {m.penilaian && (
              <div>
                <dt className="text-text/45">{t.penilaian}</dt>
                <dd className="mt-0.5 text-navy">{m.penilaian}</dd>
              </div>
            )}
          </dl>
        )}
      </div>
      {t.weekHint && <p className="mt-2 text-[12px] text-text/45">{t.weekHint}</p>}
    </div>
  );
}

function Grading({ penilaian, t }) {
  const bar = useRef(null);
  useEffect(() => {
    if (prefersReducedMotion() || !bar.current) return;
    const t = gsap.fromTo(bar.current.children, { scaleX: 0 }, { scaleX: 1, duration: 0.9, stagger: 0.08, ease: "expo.out", transformOrigin: "left center" });
    return () => t.revert();
  }, []);
  const total = penilaian.reduce((t, p) => t + (Number(p.bobot) || 0), 0) || 100;
  const fills = ["bg-navy", "bg-maroon", "bg-gold", "bg-navy/45", "bg-maroon/50", "bg-gold/50"];
  return (
    <div>
      <div ref={bar} className="flex h-4 gap-1 overflow-hidden rounded-full">
        {penilaian.map((p, i) => (
          <span key={i} className={cn("h-full", fills[i % fills.length])} style={{ width: `${((Number(p.bobot) || 0) / total) * 100}%` }} />
        ))}
      </div>
      <ul className="mt-5 divide-y divide-line">
        {penilaian.map((p, i) => (
          <li key={i} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 py-3.5">
            <span className="flex items-center gap-2.5 text-[14.5px] font-semibold text-navy">
              <span aria-hidden className={cn("size-2.5 shrink-0 rounded-sm", fills[i % fills.length])} />
              {p.label}
            </span>
            <span className="row-span-2 self-center font-serif text-xl tabular-nums text-navy">{p.bobot}%</span>
            {(p.rencana || p.cpmk) && (
              <span className="pl-5 text-[13px] leading-relaxed text-text/60">
                {p.rencana}
                {p.cpmk && <span className="ml-1 whitespace-nowrap text-text/45">· {p.cpmk}</span>}
              </span>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-2 flex justify-between border-t border-navy/15 pt-3 text-[13px] text-text/55">
        <span>{t.total}</span>
        <span className="font-semibold tabular-nums text-navy">{total}%</span>
      </p>
    </div>
  );
}

function Library({ pustaka, t }) {
  return (
    <div className="space-y-7">
      {[[t.pustakaUtama, pustaka.utama], [t.pustakaPendukung, pustaka.pendukung]].map(([lb, list]) =>
        list.length ? (
          <div key={lb}>
            <Label>{lb}</Label>
            <ol className="space-y-3">
              {list.map((x, k) => (
                <li key={k} className="flex gap-3 border-l-2 border-gold/60 pl-4 text-[14.5px] leading-relaxed text-text/80">
                  {x}
                </li>
              ))}
            </ol>
          </div>
        ) : null
      )}
    </div>
  );
}

/**
 * Laci RPS (panel kanan, Radix Dialog ala shadcn Sheet) mengikuti format RPS resmi prodi:
 * kepala navy (identitas, koordinator, tanggal, prasyarat), tab Ringkasan · 16 Minggu · Penilaian · Pustaka,
 * unduh PDF (toast), ‹ › + panah keyboard. RPS kosong → ilustrasi kosong, tanpa isi karangan.
 */
export function RpsDrawer({ course, siblings, onOpen, onClose, copy: t, rumpunByKey }) {
  const toast = useToast();
  const [tab, setTab] = useState("ringkasan");
  const [ready, setReady] = useState(false);
  const [last, setLast] = useState(course);
  if (course && course !== last) setLast(course);
  const c = course ?? last;

  // ganti mata kuliah → skeleton singkat agar perpindahan terasa, tab kembali ke Ringkasan
  useEffect(() => {
    if (!course) return;
    setTab("ringkasan");
    setReady(false);
    const t = setTimeout(() => setReady(true), prefersReducedMotion() ? 0 : 260);
    return () => clearTimeout(t);
  }, [course]);

  const i = c ? siblings.findIndex((x) => x.slug === c.slug) : -1;
  const step = (d) => {
    const n = siblings[i + d];
    if (n) onOpen(n.slug);
  };

  const download = () => {
    if (c.rps?.pdf) {
      window.open(c.rps.pdf, "_blank", "noopener");
      toast.success(t.toastOpen, { description: c.nama });
    } else toast.info(t.toastMissing, { description: t.toastMissingBody });
  };

  const r = c?.rps;
  const rumpun = c ? rumpunByKey[c.rumpun] : null;
  const smt = c?.semester ?? c?.smt;
  const hasSummary = r && (r.deskripsi || r.cpl.length || r.cpmk.length || r.subcpmk.length || r.bahanKajian.length);
  const hasLib = r && (r.pustaka.utama.length || r.pustaka.pendukung.length);
  const meta = r
    ? [
        ["koordinator", r.koordinator],
        ["pengampu", r.dosen && r.dosen !== r.koordinator ? r.dosen : ""],
        ["disusun", r.tanggal],
        ["prasyarat", r.prasyarat],
      ].filter(([, v]) => v)
    : [];

  return (
    <Dialog.Root open={!!course} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-navy-deep/45 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <Dialog.Content
          onKeyDown={(e) => {
            if (e.target.closest?.("[role=tablist], [aria-label='Rencana 16 minggu']")) return;
            if (e.key === "ArrowRight") step(1);
            if (e.key === "ArrowLeft") step(-1);
          }}
          className="fixed inset-y-0 right-0 z-[80] flex w-full max-w-[600px] flex-col bg-white shadow-[-30px_0_80px_-40px_rgb(14_24_48/0.6)] outline-none duration-500 data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right"
        >
          {c && (
            <>
              <header className="relative bg-navy px-6 pb-6 pt-7 text-white sm:px-8">
                <div className="absolute inset-x-0 top-0 flex h-1">
                  <span className="w-2/3 bg-maroon" />
                  <span className="flex-1 bg-gold" />
                </div>
                <p className="kicker text-gold-soft">
                  {c.track ? t.pilihan : t.wajib}
                  {smt ? ` · ${fill(t.semester, { n: smt })}` : ""}
                  {rumpun?.name ? ` · ${rumpun.name}` : ""}
                </p>
                <Dialog.Title className="mt-2 pr-10 font-serif text-[clamp(1.5rem,3vw,2rem)] leading-tight">{c.nama}</Dialog.Title>
                <Dialog.Description className="sr-only">{fill(t.srDescription, { nama: c.nama })}</Dialog.Description>
                <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-white/10 pt-4 text-[13px] sm:grid-cols-4">
                  <div><dt className="text-white/50">{t.kode}</dt><dd className="mt-0.5 font-semibold tabular-nums">{c.kode || t.pending}</dd></div>
                  <div><dt className="text-white/50">{t.sks}</dt><dd className="mt-0.5 font-semibold">{c.sks ?? "–"}</dd></div>
                  {meta.map(([k, v]) => (
                    <div key={k} className={k === "koordinator" || k === "pengampu" ? "col-span-2" : undefined}>
                      <dt className="text-white/50">{t[k]}</dt>
                      <dd className="mt-0.5 font-semibold">{v}</dd>
                    </div>
                  ))}
                  {!r && <div className="col-span-2"><dt className="text-white/50">{t.pengampu}</dt><dd className="mt-0.5 font-semibold">{t.pending}</dd></div>}
                </dl>
                <Dialog.Close aria-label={t.close} className="absolute right-5 top-6 grid size-9 place-items-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white">
                  <CloseGlyph className="size-4" />
                </Dialog.Close>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">
                {!ready ? (
                  <div className="space-y-3" aria-hidden>
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-4/5" />
                  </div>
                ) : r ? (
                  <Tabs value={tab} onValueChange={setTab}>
                    <TabsList className="flex w-full justify-start gap-6 overflow-x-auto rounded-none border-b border-line bg-transparent p-0">
                      <TabsTrigger value="ringkasan" className={TAB} disabled={!hasSummary}>{t.tabs.ringkasan}</TabsTrigger>
                      <TabsTrigger value="minggu" className={TAB} disabled={!r.minggu.length}>{t.tabs.minggu}</TabsTrigger>
                      <TabsTrigger value="nilai" className={TAB} disabled={!r.penilaian.length}>{t.tabs.nilai}</TabsTrigger>
                      <TabsTrigger value="pustaka" className={TAB} disabled={!hasLib}>{t.tabs.pustaka}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="ringkasan" className="pt-6">{hasSummary ? <Summary r={r} t={t} /> : null}</TabsContent>
                    <TabsContent value="minggu" className="pt-6">{r.minggu.length ? <Weeks minggu={r.minggu} t={t} /> : null}</TabsContent>
                    <TabsContent value="nilai" className="pt-6">{r.penilaian.length ? <Grading penilaian={r.penilaian} t={t} /> : null}</TabsContent>
                    <TabsContent value="pustaka" className="pt-6">{hasLib ? <Library pustaka={r.pustaka} t={t} /> : null}</TabsContent>
                  </Tabs>
                ) : (
                  <div className="flex flex-col items-center py-6 text-center">
                    {t.emptyLottie && <div className="w-36"><LottieIllustration src={t.emptyLottie} label={t.emptyAria} /></div>}
                    <p className="mt-4 font-serif text-[1.35rem] text-navy">{t.emptyTitle}</p>
                    <p className="mt-2 max-w-sm text-[14.5px] leading-relaxed text-text/60">{t.emptyBody}</p>
                  </div>
                )}
              </div>

              <footer className="flex items-center justify-between gap-3 border-t border-line px-6 py-4 sm:px-8">
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => step(-1)} disabled={i <= 0} aria-label={t.prevAria} className="grid size-10 place-items-center rounded-md border border-line text-navy transition hover:border-navy disabled:opacity-30">‹</button>
                  <button type="button" onClick={() => step(1)} disabled={i < 0 || i >= siblings.length - 1} aria-label={t.nextAria} className="grid size-10 place-items-center rounded-md border border-line text-navy transition hover:border-navy disabled:opacity-30">›</button>
                  <span className="ml-2 hidden text-[12.5px] tabular-nums text-text/45 sm:inline">{i + 1} / {siblings.length}</span>
                </div>
                <button
                  type="button"
                  onClick={download}
                  className="rps-dl inline-flex h-10 items-center gap-2 rounded-md bg-maroon px-4 text-[14px] font-semibold text-white transition-[background-color,transform] hover:bg-maroon-deep active:scale-[0.98]"
                >
                  <LordIcon name="document" size={20} target=".rps-dl" colors="primary:#ffffff,secondary:#e6d3a1" />
                  {r?.pdf ? t.downloadPdf : t.download}
                </button>
              </footer>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
