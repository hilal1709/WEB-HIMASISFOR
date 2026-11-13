"use client";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { fmtDate } from "@/lib/beasiswa-content";
import { downloadDeadlinesIcs } from "@/lib/ics";
import { Container, SceneTitle, ArrowLink } from "@/components/home/shared";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { smoothTo, useBeasiswa } from "./beasiswa-provider";

const TONES = ["bs-card-navy", "bs-card-cream", "bs-card-gold", "bs-card-white"];

/**
 * Penutup — Dompet beasiswa `#dompet` (pola 21st.dev Wallet Card): beasiswa yang disimpan masuk sebagai kartu
 * bertumpuk di dompet kulit maroon (pegas `motion`), hover/fokus → kartu berkipas keluar dari saku.
 * Klik kartu → modal. "Ingatkan semua tenggat" → satu .ics berisi semua tenggat (pengingat 3 hari sebelumnya).
 * Kosong → Lottie dompet + ajakan. Tanpa CTA PMB, tanpa Elvo (Elvo footer sudah dekat).
 */
export function WalletClosing() {
  const { wallet, bySlug, setWallet, open } = useBeasiswa();
  const toast = useToast();
  const reduce = useReducedMotion();
  const [fan, setFan] = useState(false);
  const cards = wallet.map(bySlug).filter(Boolean);
  const nearest = [...cards].filter((s) => s.window).sort((a, b) => (a.window.state === "buka" ? a.window.close : a.window.open) - (b.window.state === "buka" ? b.window.close : b.window.open))[0];
  const visible = cards.slice(-5);

  const remindAll = () => {
    const ok = downloadDeadlinesIcs(
      cards.filter((s) => s.window).map((s) => ({ uid: `beasiswa-${s.slug}`, title: `Tenggat ${s.name}`, date: s.window.close, description: `${s.org} · ${s.window.label}` })),
      { filename: "tenggat-beasiswa.ics" }
    );
    if (ok) toast.success(`${cards.length} tenggat siap masuk kalender`, { description: "Buka berkas .ics; pengingat muncul 3 hari sebelum tiap tenggat." });
    else toast.warning("Belum ada tanggal pasti", { description: "Tenggat akan muncul setelah prodi mengumumkan periodenya." });
  };

  const emptyAll = () => {
    const prev = wallet;
    setWallet([]);
    toast.info("Dompet dikosongkan", { action: { label: "Batalkan", onClick: () => setWallet(prev) } });
  };

  return (
    <section id="dompet" className="relative scroll-mt-24 overflow-hidden border-t border-line bg-white py-20 md:py-28">
      <Container className="grid items-center gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
        {/* dompet */}
        <div
          className="relative mx-auto w-full max-w-[420px]"
          onPointerEnter={() => setFan(true)}
          onPointerLeave={() => setFan(false)}
          onFocus={() => setFan(true)}
          onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setFan(false)}
        >
          <div className="bs-wallet">
            <span aria-hidden className="bs-wallet-back" />
            <ul aria-label="Isi dompet beasiswa" className="absolute inset-x-[7%] bottom-[34%] top-[6%]">
              <AnimatePresence initial={false}>
                {visible.map((s, i) => {
                  const n = visible.length;
                  const mid = (n - 1) / 2;
                  return (
                    <motion.li
                      key={s.slug}
                      layout={!reduce}
                      initial={reduce ? false : { y: -160, opacity: 0, rotate: -8 }}
                      animate={{
                        y: fan ? -54 - (n - 1 - i) * 6 + Math.abs(i - mid) * 8 : (n - 1 - i) * -16,
                        x: fan ? (i - mid) * 46 : 0,
                        rotate: fan ? (i - mid) * 7 : 0,
                        opacity: 1,
                      }}
                      exit={reduce ? { opacity: 0 } : { y: -140, opacity: 0, rotate: 10 }}
                      transition={{ type: "spring", stiffness: 260, damping: 24 }}
                      className="absolute inset-x-0 top-0"
                      style={{ zIndex: i + 1 }}
                    >
                      <button type="button" onClick={() => open(s.slug)} className={cn("bs-card", TONES[i % TONES.length])}>
                        <span className="flex items-start justify-between gap-3">
                          <span className="min-w-0">
                            <span className="kicker block truncate text-[9.5px] opacity-70">{s.org}</span>
                            <span className="mt-1 block truncate font-serif text-[1.1rem] leading-tight">{s.name}</span>
                          </span>
                          <span className="bs-card-chip" aria-hidden />
                        </span>
                        <span className="mt-auto flex items-end justify-between gap-3 text-[11.5px]">
                          <span className="opacity-75">{s.window ? `${s.window.state === "buka" ? "Tutup" : "Buka"} ${fmtDate(s.window.state === "buka" ? s.window.close : s.window.open)}` : "Jadwal menyusul"}</span>
                          <span className="tabular font-semibold">{s.coverage}%</span>
                        </span>
                      </button>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
            <span aria-hidden className="bs-wallet-front">
              <span className="bs-wallet-stitch" />
              <span className="bs-wallet-clasp" />
            </span>
            {!cards.length && (
              <div className="absolute inset-x-0 top-[2%] mx-auto w-[46%]">
                <LottieIllustration src="/lottie/wallet.json" label="Dompet beasiswa yang masih kosong" fallback={<span className="block aspect-square" />} />
              </div>
            )}
          </div>
          {cards.length > visible.length && <p className="mt-3 text-center text-[12px] text-text/50">+{cards.length - visible.length} kartu lain di dompet</p>}
        </div>

        {/* teks */}
        <div>
          <span aria-hidden className="mb-5 block h-[3px] w-10 bg-gold" />
          {/* key: SplitReveal memecah teks sekali, jadi judul dipasang ulang saat dompet berganti kosong ⇄ terisi */}
          <SceneTitle key={cards.length ? "isi" : "kosong"} title={cards.length ? ["Dompet", "beasiswamu"] : ["Dompetmu masih", "kosong"]} />
          <p aria-live="polite" className="mt-4 max-w-md text-pretty text-[16px] leading-relaxed text-text/65">
            {cards.length ? (
              nearest ? (
                <>
                  {cards.length} beasiswa tersimpan. Paling dekat: <strong className="font-semibold text-navy">{nearest.name}</strong>,{" "}
                  {nearest.window.state === "buka" ? `ditutup ${nearest.window.days} hari lagi` : `dibuka ${nearest.window.days} hari lagi`}.
                </>
              ) : (
                `${cards.length} beasiswa tersimpan. Jadwalnya menyusul.`
              )
            ) : (
              "Simpan beasiswa dari rinciannya. Tenggat semua isi dompet bisa kamu masukkan ke kalender sekaligus."
            )}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
            {cards.length ? (
              <>
                <button
                  type="button"
                  onClick={remindAll}
                  className="group inline-flex h-12 items-center gap-2 rounded-md bg-navy px-6 text-[15px] font-semibold text-white transition-[background-color,transform] duration-300 ease-cinematic hover:bg-navy-deep active:scale-[0.98]"
                >
                  Ingatkan semua tenggat
                  <span className="tabular grid h-7 min-w-7 place-items-center rounded bg-gold px-1.5 text-[12px] font-bold text-navy">{cards.length}</span>
                </button>
                <button type="button" onClick={emptyAll} className="text-[14px] font-semibold text-maroon">
                  <span className="u-gold">Kosongkan dompet</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => smoothTo("spektrum")}
                className="inline-flex h-12 items-center rounded-md bg-maroon px-6 text-[15px] font-semibold text-white transition-[background-color,transform] duration-300 ease-cinematic hover:bg-maroon-deep active:scale-[0.98]"
              >
                Pilih dari penggaris cakupan
              </button>
            )}
          </div>

          <div className="mt-12 border-t border-line pt-6">
            <p className="kicker text-[11px] text-text/45">Masih ada pertanyaan</p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-8">
              <ArrowLink href="/program-kelas">Biaya tiap kelas</ArrowLink>
              <ArrowLink href="/kontak">Tanya sekretariat prodi</ArrowLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
