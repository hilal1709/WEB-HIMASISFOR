"use client";
import { useLayoutEffect as useEffect, useRef } from "react";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion, curtainDelay } from "@/lib/motion";
import { CURTAIN_KEY, DAYS, fmtTime } from "@/lib/layanan-content";
import { Container, SceneTitle } from "@/components/home/shared";
import { ElvoPeek } from "@/components/home/elvo-peek";
import { cn } from "@/lib/utils";
import { smoothTo, useLayanan } from "./layanan-provider";

/** Kalimat status loket. `null` saat SSR (pil tampil sebagai kerangka). */
export function loketLabel(loket) {
  if (!loket) return null;
  if (loket.open) return { tone: "open", head: "Loket buka", tail: `sampai ${fmtTime(loket.until)}` };
  if (loket.resting) return { tone: "rest", head: "Istirahat", tail: `buka lagi ${fmtTime(loket.until)}` };
  if (!loket.next) return { tone: "closed", head: "Loket tutup", tail: "" };
  const when = loket.next.today ? "hari ini" : loket.next.tomorrow ? "besok" : DAYS[loket.next.day];
  return { tone: "closed", head: "Loket tutup", tail: `buka ${when} ${fmtTime(loket.next.time)}` };
}

/**
 * Hero dua kolom di latar krem: kiri judul + intro, kanan mesin nomor antrean berpanel maroon — layar status loket langsung, tiket yang menyembul dari celah,
 * tombol bundar "Ambil nomor" → wizard, dan jalan pintas lacak. Tanpa ilustrasi garis.
 */
export function LayananHero() {
  const { intro, loket, now, hours, openWizard, services } = useLayanan();
  const ref = useRef(null);
  const status = loketLabel(loket);
  const today = now ? hours.find((h) => h.day === now.getDay()) : null;

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const delay = curtainDelay(CURTAIN_KEY);
    const ctx = gsap.context(() => {
      gsap.from("[data-hero-fade]", { y: 18, opacity: 0, duration: 0.8, stagger: 0.08, ease: "expo.out", delay });
      gsap.fromTo("[data-machine]", { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 1.1, ease: "expo.out", delay: delay + 0.2, clearProps: "transform,opacity" });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="relative overflow-hidden pb-12 pt-10 md:pb-16 md:pt-14">
      <span aria-hidden className="pointer-events-none absolute -left-40 bottom-[-12rem] size-[34rem] rounded-full border border-maroon/10" />
      <Container className="relative">
        <nav aria-label="Breadcrumb" data-hero-fade className="text-sm text-text/55">
          <ol className="flex flex-wrap items-center gap-2">
            <li><a href="/" className="u-gold transition-colors hover:text-maroon">Beranda</a></li>
            <li aria-hidden>/</li>
            <li>Layanan</li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-navy">Layanan Akademik</li>
          </ol>
        </nav>

        <div className="mt-10 grid gap-12 lg:mt-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16">
          <div>
            <SceneTitle as="h1" trigger="mount" title={["Urusan akademik,", "satu meja", "untuk semua"]} className="!text-[clamp(2.6rem,5.4vw,4.75rem)] !leading-[1]" />
            <p data-hero-fade className="mt-6 max-w-xl text-pretty text-[17px] leading-relaxed text-text/70">{intro.body}</p>
            {status && status.tone !== "open" && (
              <p data-hero-fade className="mt-3 text-[14px] text-text/55">Formulir daring tetap menerima pengajuan di luar jam loket.</p>
            )}
            <button type="button" onClick={() => smoothTo("lacak")} data-hero-fade className="mt-8 text-[15px] font-semibold text-navy">
              <span className="u-gold">Sudah mengajukan? Lacak pengajuan ↓</span>
            </button>
          </div>

          {/* mesin nomor antrean, menyatu dengan band */}
          <div data-machine className="relative rounded-[28px] bg-maroon p-6 text-white shadow-[0_40px_80px_-45px_rgb(78_14_25/0.8)] sm:p-8">
            <span className="pointer-events-none absolute -right-6 -top-20 z-10 hidden xl:block">
              <span className="relative block">
                <ElvoPeek pose="wave" size={84} side="left" say="Simpan kode pengajuanmu, ya. Itu kunci pelacaknya." />
              </span>
            </span>
            {/* layar status */}
            <div aria-live="polite" className="rounded-xl bg-black/40 px-5 py-4 font-mono ring-1 ring-white/10">
              <p className="text-[10.5px] uppercase tracking-[0.2em] text-white/40">Status loket</p>
              {status ? (
                <>
                  <p className={cn("mt-1.5 flex items-center gap-2 text-[1.3rem] uppercase tracking-[0.08em]", status.tone === "open" ? "text-[#7be3a2]" : status.tone === "rest" ? "text-gold" : "text-[#ff9b9b]")}>
                    <span className="relative grid size-3 place-items-center">
                      {status.tone === "open" && <span className="absolute inset-0 animate-ping rounded-full bg-[#7be3a2]/50 motion-reduce:hidden" />}
                      <span className="relative size-2.5 rounded-full bg-current" />
                    </span>
                    {status.head}
                  </p>
                  <p className="mt-1 text-[12.5px] text-white/55">
                    {status.tail}
                    {today ? ` · hari ini ${today.open}–${today.close}` : ""}
                  </p>
                </>
              ) : (
                <span className="mt-2 block h-6 w-40 animate-shimmer rounded bg-white/10" />
              )}
            </div>

            {/* celah tiket + tombol */}
            <div className="group relative mt-6 flex items-center gap-6">
              <button
                type="button"
                onClick={() => openWizard()}
                className="relative grid size-28 shrink-0 place-items-center rounded-full bg-gold text-center text-navy shadow-[0_0_0_10px_rgb(255_255_255/0.1),0_20px_40px_-20px_rgb(0_0_0/0.6)] transition-[background-color,transform] duration-300 ease-cinematic hover:bg-gold-soft active:scale-95"
              >
                <span className="font-serif text-[1.1rem] leading-tight">
                  Ambil
                  <br />
                  nomor
                </span>
              </button>
              <div className="relative min-w-0 flex-1">
                <span aria-hidden className="block h-2 rounded-full bg-black/50" />
                <span
                  aria-hidden
                  className="mx-3 block origin-top rounded-b-md bg-white px-4 pb-3 pt-3 text-navy shadow-md transition-transform duration-500 ease-cinematic group-hover:translate-y-1"
                >
                  <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-text/50">Tiket layanan</span>
                  <span className="mt-1 block font-serif text-[1.35rem] leading-none text-maroon">{services.length} pilihan</span>
                  <span className="mt-1.5 block text-[12px] text-text/55">Isi formulir, dapat kode pelacak.</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
