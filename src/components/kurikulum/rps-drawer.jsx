"use client";
import { useLayoutEffect as useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { RUMPUN_BY_KEY } from "@/lib/kurikulum-content";
import { PlaceholderTag } from "@/components/home/shared";
import { CloseGlyph } from "@/components/home/glyphs";
import { LordIcon } from "@/components/media/lord-icon";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/loader";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const TAB = "rounded-none border-b-2 border-transparent px-0 pb-3 pt-0 h-auto text-[14px] text-text/55 data-[state=active]:border-gold data-[state=active]:text-navy";

function Weeks({ minggu }) {
  const [hover, setHover] = useState(null);
  const shown = hover ?? 0;
  return (
    <div>
      <ol className="grid grid-cols-8 gap-1.5" aria-label="Rencana 16 minggu">
        {minggu.map((t, i) => {
          const exam = i === 7 || i === 15;
          return (
            <li key={i}>
              <button
                type="button"
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                aria-label={`Minggu ${i + 1}: ${t || "topik menyusul"}`}
                className={cn(
                  "grid h-11 w-full place-items-center rounded-md border text-[13px] font-semibold tabular-nums transition-[background-color,border-color,color,transform] duration-200 hover:-translate-y-0.5",
                  exam ? "border-gold bg-gold/15 text-navy" : "border-line bg-white text-text/60",
                  shown === i && (exam ? "bg-gold text-navy" : "border-navy bg-navy text-white")
                )}
              >
                {i + 1}
              </button>
            </li>
          );
        })}
      </ol>
      <div className="mt-4 min-h-[76px] rounded-lg bg-cream p-4" aria-live="polite">
        <p className="kicker text-maroon">Minggu {shown + 1}</p>
        <p className="mt-1 font-serif text-[1.2rem] leading-snug text-navy">{minggu[shown] || "Topik menyusul"}</p>
      </div>
      <p className="mt-2 text-[12px] text-text/45">Arahkan atau fokus ke kotak untuk melihat topik. Kotak emas = ujian.</p>
    </div>
  );
}

function Grading({ penilaian }) {
  const bar = useRef(null);
  useEffect(() => {
    if (prefersReducedMotion() || !bar.current) return;
    const t = gsap.fromTo(bar.current.children, { scaleX: 0 }, { scaleX: 1, duration: 0.9, stagger: 0.08, ease: "expo.out", transformOrigin: "left center" });
    return () => t.revert();
  }, []);
  const total = penilaian.reduce((t, p) => t + (Number(p.bobot) || 0), 0) || 100;
  const fills = ["bg-navy", "bg-maroon", "bg-gold", "bg-navy/45", "bg-maroon/50"];
  return (
    <div>
      <div ref={bar} className="flex h-4 gap-1 overflow-hidden rounded-full">
        {penilaian.map((p, i) => (
          <span key={p.label} className={cn("h-full", fills[i % fills.length])} style={{ width: `${((Number(p.bobot) || 0) / total) * 100}%` }} />
        ))}
      </div>
      <ul className="mt-5 divide-y divide-line">
        {penilaian.map((p, i) => (
          <li key={p.label} className="flex items-center justify-between py-3 text-[14.5px]">
            <span className="flex items-center gap-2.5 text-navy">
              <span aria-hidden className={cn("size-2.5 rounded-sm", fills[i % fills.length])} />
              {p.label}
            </span>
            <span className="font-serif text-lg tabular-nums text-navy">{p.bobot}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Laci RPS (panel kanan, Radix Dialog ala shadcn Sheet): kepala navy dengan identitas mata kuliah,
 * tab CPMK · 16 Minggu · Penilaian, aksi unduh PDF (toast), ‹ › + panah keyboard.
 * RPS kosong → ilustrasi kosong + keterangan, tanpa isi karangan.
 */
export function RpsDrawer({ course, siblings, onOpen, onClose }) {
  const toast = useToast();
  const [tab, setTab] = useState("cpmk");
  const [ready, setReady] = useState(false);
  const [last, setLast] = useState(course);
  if (course && course !== last) setLast(course);
  const c = course ?? last;

  // ganti mata kuliah → skeleton singkat agar perpindahan terasa, tab kembali ke CPMK
  useEffect(() => {
    if (!course) return;
    setTab("cpmk");
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
      toast.success("Membuka dokumen RPS", { description: c.nama });
    } else toast.info("PDF RPS menyusul", { description: "Dokumen resmi akan diunggah prodi lewat CMS." });
  };

  const r = c?.rps;
  const rumpun = c ? RUMPUN_BY_KEY[c.rumpun] : null;

  return (
    <Dialog.Root open={!!course} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-navy-deep/45 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <Dialog.Content
          onKeyDown={(e) => {
            if (e.target.closest?.("[role=tablist]")) return;
            if (e.key === "ArrowRight") step(1);
            if (e.key === "ArrowLeft") step(-1);
          }}
          className="fixed inset-y-0 right-0 z-[80] flex w-full max-w-[560px] flex-col bg-white shadow-[-30px_0_80px_-40px_rgb(14_24_48/0.6)] outline-none duration-500 data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right"
        >
          {c && (
            <>
              <header className="relative bg-navy px-6 pb-6 pt-7 text-white sm:px-8">
                <div className="absolute inset-x-0 top-0 flex h-1">
                  <span className="w-2/3 bg-maroon" />
                  <span className="flex-1 bg-gold" />
                </div>
                <p className="kicker text-gold-soft">{c.semester ? `Semester ${c.semester}` : "Mata kuliah pilihan"} · {rumpun?.name}</p>
                <Dialog.Title className="mt-2 pr-10 font-serif text-[clamp(1.5rem,3vw,2rem)] leading-tight">{c.nama}</Dialog.Title>
                <Dialog.Description className="sr-only">Rencana Pembelajaran Semester {c.nama}</Dialog.Description>
                <dl className="mt-5 grid grid-cols-3 gap-4 border-t border-white/10 pt-4 text-[13px]">
                  <div><dt className="text-white/50">SKS</dt><dd className="mt-0.5 font-semibold">{c.sks ?? "–"}</dd></div>
                  <div><dt className="text-white/50">Kode</dt><dd className="mt-0.5 font-semibold">{c.kode || "menyusul"}</dd></div>
                  <div><dt className="text-white/50">Pengampu</dt><dd className="mt-0.5 font-semibold">{r?.dosen || "menyusul"}</dd></div>
                </dl>
                <Dialog.Close aria-label="Tutup RPS" className="absolute right-5 top-6 grid size-9 place-items-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white">
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
                  <>
                    {c.rpsSample && <PlaceholderTag className="mb-4" />}
                    <Tabs value={tab} onValueChange={setTab}>
                      <TabsList className="gap-6 rounded-none border-b border-line bg-transparent p-0">
                        <TabsTrigger value="cpmk" className={TAB}>Capaian (CPMK)</TabsTrigger>
                        <TabsTrigger value="minggu" className={TAB} disabled={!r.minggu?.length}>16 Minggu</TabsTrigger>
                        <TabsTrigger value="nilai" className={TAB} disabled={!r.penilaian?.length}>Penilaian</TabsTrigger>
                      </TabsList>
                      <TabsContent value="cpmk" className="pt-6">
                        {r.cpmk?.length ? (
                          <ol className="space-y-3">
                            {r.cpmk.map((t, k) => (
                              <li key={k} className="flex gap-4 rounded-lg border border-line p-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${k * 60}ms`, animationFillMode: "both" }}>
                                <span className="font-serif text-lg tabular-nums text-maroon">{k + 1}</span>
                                <span className="text-[15px] leading-relaxed text-text/80">{t}</span>
                              </li>
                            ))}
                          </ol>
                        ) : (
                          <p className="text-[14.5px] text-text/55">Capaian pembelajaran menyusul.</p>
                        )}
                      </TabsContent>
                      <TabsContent value="minggu" className="pt-6">{r.minggu?.length ? <Weeks minggu={r.minggu} /> : null}</TabsContent>
                      <TabsContent value="nilai" className="pt-6">{r.penilaian?.length ? <Grading penilaian={r.penilaian} /> : null}</TabsContent>
                    </Tabs>
                  </>
                ) : (
                  <div className="flex flex-col items-center py-6 text-center">
                    <div className="w-36"><LottieIllustration src="/lottie/empty-news.json" label="Ilustrasi dokumen belum tersedia" /></div>
                    <p className="mt-4 font-serif text-[1.35rem] text-navy">RPS sedang disiapkan</p>
                    <p className="mt-2 max-w-sm text-[14.5px] leading-relaxed text-text/60">
                      Ringkasan dan dokumen RPS mata kuliah ini belum diunggah. Sementara itu, tanyakan ke dosen pengampu saat perkuliahan pertama.
                    </p>
                  </div>
                )}
              </div>

              <footer className="flex items-center justify-between gap-3 border-t border-line px-6 py-4 sm:px-8">
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => step(-1)} disabled={i <= 0} aria-label="Mata kuliah sebelumnya" className="grid size-10 place-items-center rounded-md border border-line text-navy transition hover:border-navy disabled:opacity-30">‹</button>
                  <button type="button" onClick={() => step(1)} disabled={i < 0 || i >= siblings.length - 1} aria-label="Mata kuliah berikutnya" className="grid size-10 place-items-center rounded-md border border-line text-navy transition hover:border-navy disabled:opacity-30">›</button>
                  <span className="ml-2 hidden text-[12.5px] tabular-nums text-text/45 sm:inline">{i + 1} / {siblings.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={download}
                    className="rps-dl inline-flex h-10 items-center gap-2 rounded-md bg-maroon px-4 text-[14px] font-semibold text-white transition-[background-color,transform] hover:bg-maroon-deep active:scale-[0.98]"
                  >
                    <LordIcon name="document" size={20} target=".rps-dl" colors="primary:#ffffff,secondary:#e6d3a1" />
                    Unduh RPS
                  </button>
                </div>
              </footer>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
