"use client";
import { useEffect, useRef, useState } from "react";
import { animate, stagger } from "animejs";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, EffectCoverflow, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { CHAPTERS, changedChapters } from "@/lib/prestasi-cms/schema";
import { Modal, ModalClose, ModalContent, ModalDescription, ModalTitle } from "@/components/ui/modal";
import { MovingBorderButton } from "@/components/aceternity/moving-border";
import { LordIcon } from "@/components/media/lord-icon";
import { cn } from "@/lib/utils";

const DARK = "kurator max-w-xl border-[var(--k-line-2)] bg-[var(--k-panel)] p-0 text-[var(--k-ink)] shadow-[0_40px_100px_-30px_black]";
const fmt = (d) => (d ? new Date(d).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "—");

function CloseX() {
  return (
    <ModalClose aria-label="Tutup" className="absolute right-4 top-4 grid size-8 place-items-center rounded-full text-[var(--k-faint)] transition-colors hover:bg-white/5 hover:text-[var(--k-ink)]">
      ×
    </ModalClose>
  );
}

/** Taburan konfeti emas tipis dari titik tengah (anime.js), dibersihkan sendiri. */
function confetti(host) {
  if (!host || prefersReducedMotion()) return;
  const bits = Array.from({ length: 36 }, (_, i) => {
    const s = document.createElement("span");
    s.className = "pointer-events-none absolute left-1/2 top-[38%] block rounded-[1px]";
    s.style.width = `${4 + (i % 3) * 2}px`;
    s.style.height = `${8 + (i % 4) * 2}px`;
    s.style.background = ["#d6b04a", "#f3e7c4", "#9b2335", "#eceae4"][i % 4];
    host.appendChild(s);
    return s;
  });
  animate(bits, {
    translateX: () => (Math.random() - 0.5) * 520,
    translateY: () => [0, 120 + Math.random() * 220],
    rotate: () => (Math.random() - 0.5) * 720,
    opacity: [1, 0],
    duration: () => 1100 + Math.random() * 700,
    delay: stagger(8),
    ease: "outCubic",
    onComplete: () => bits.forEach((b) => b.remove()),
  });
}

/**
 * Modal terbit "Upacara penganugerahan": tiga balok podium naik (GSAP) memuat bab yang berubah,
 * peringatan kalimat kembar bila ada, lalu tombol bercahaya. Sukses → konfeti emas & tutup.
 */
export function CeremonyModal({ open, onOpenChange, doc, value, redundancy, onPublish }) {
  const stage = useRef(null);
  const [state, setState] = useState("idle"); // idle | busy | done
  const changed = doc && value ? changedChapters(value, doc.live) : [];
  const names = changed.map((k) => CHAPTERS.find((c) => c.key === k)?.label ?? k);
  const podium = [names[1], names[0], names[2]]; // tengah = tertinggi

  useEffect(() => {
    if (!open) return;
    setState("idle");
    let tl;
    const id = requestAnimationFrame(() => {
      const el = stage.current;
      if (!el || prefersReducedMotion()) return;
      tl = gsap
        .timeline()
        .fromTo(el.querySelectorAll("[data-block]"), { scaleY: 0, transformOrigin: "50% 100%" }, { scaleY: 1, duration: 0.7, ease: "expo.out", stagger: { each: 0.12, from: "center" } })
        .fromTo(el.querySelectorAll("[data-tag]"), { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.08 }, "-=0.35");
    });
    return () => {
      cancelAnimationFrame(id);
      tl?.kill();
    };
  }, [open]);

  const go = async () => {
    setState("busy");
    const ok = await onPublish();
    if (!ok) return setState("idle");
    setState("done");
    confetti(stage.current);
    setTimeout(() => onOpenChange(false), 1500);
  };

  return (
    <Modal open={open} onOpenChange={(o) => state !== "busy" && onOpenChange(o)}>
      <ModalContent hideClose className={DARK}>
        <CloseX />
        <div ref={stage} className="kurator-grid relative overflow-hidden px-6 pb-2 pt-8">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[var(--k-gold)]">Upacara terbit</p>
          <ModalTitle className="mt-1 font-serif text-[1.7rem] font-normal text-[var(--k-ink)]">{state === "done" ? "Halaman Prestasi diperbarui" : "Terbitkan ke pengunjung?"}</ModalTitle>
          <ModalDescription className="mt-1 text-[13.5px] text-[var(--k-mute)]">
            {changed.length ? `${changed.length} bab berubah dari versi live.` : "Tidak ada perbedaan teks dari versi live."}
          </ModalDescription>

          <div className="mt-8 grid grid-cols-3 items-end gap-2">
            {podium.map((n, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <span data-tag className={cn("max-w-full truncate rounded-full px-2.5 py-0.5 text-[12px]", n ? "bg-[var(--k-gold)]/15 text-[var(--k-gold)]" : "text-[var(--k-faint)]")}>
                  {n ?? "—"}
                </span>
                <span
                  data-block
                  className={cn(
                    "grid w-full place-items-start justify-center rounded-t-lg border border-b-0 border-[var(--k-gold)]/35 bg-[linear-gradient(180deg,rgb(214_176_74/0.25),rgb(214_176_74/0.04))] pt-2 font-serif text-[1.3rem] text-[var(--k-gold)]",
                    i === 1 ? "h-24" : i === 0 ? "h-16" : "h-11"
                  )}
                >
                  {i === 1 ? "1" : i === 0 ? "2" : "3"}
                </span>
              </div>
            ))}
          </div>
          {names.length > 3 && <p className="mt-2 text-center text-[12px] text-[var(--k-faint)]">+ {names.slice(3).join(", ")}</p>}
        </div>

        <div className="space-y-3 border-t border-[var(--k-line)] px-6 py-5">
          {redundancy > 0 && (
            <p className="rounded-xl border border-[var(--k-maroon)]/50 bg-[var(--k-maroon)]/10 px-3.5 py-2.5 text-[13px] text-[#f0b8c1]">
              {redundancy} pasang kalimat masih mirip. Tetap bisa terbit, tapi sebaiknya dirapikan dulu.
            </p>
          )}
          <p className="text-[12.5px] text-[var(--k-faint)]">Data plakat di Vitrin sudah tayang sejak disimpan; upacara ini hanya untuk teks halaman.</p>
          <div className="flex items-center justify-end gap-2 pt-1">
            <ModalClose className="h-11 rounded-xl px-4 text-[13.5px] text-[var(--k-mute)] hover:text-[var(--k-ink)]" disabled={state === "busy"}>
              Nanti dulu
            </ModalClose>
            <MovingBorderButton onClick={go} disabled={state !== "idle"} className="bg-[var(--k-raise)] text-[var(--k-ink)]">
              {state === "busy" ? (
                <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
              ) : (
                <LordIcon name="check" size={20} trigger="loop" colors="primary:#d6b04a,secondary:#d6b04a" fallback={<span>★</span>} />
              )}
              {state === "done" ? "Terbit" : "Terbitkan"}
            </MovingBorderButton>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}

/**
 * Riwayat versi sebagai deret plakat coverflow (Swiper): tiap versi menampilkan judul sampul &
 * kutipan kisah saat itu, siapa yang menerbitkan, dan tombol salin ke draf.
 */
export function HistoryModal({ open, onOpenChange, doc, onRestore }) {
  const list = doc?.history ?? [];
  const [busy, setBusy] = useState(null);
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent hideClose className={cn(DARK, "max-w-3xl")}>
        <CloseX />
        <div className="px-6 pt-8">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[var(--k-gold)]">Arsip versi</p>
          <ModalTitle className="mt-1 font-serif text-[1.6rem] font-normal text-[var(--k-ink)]">Riwayat terbit</ModalTitle>
          <ModalDescription className="mt-1 text-[13.5px] text-[var(--k-mute)]">
            Live sejak {fmt(doc?.publishedAt)}
            {doc?.publishedBy ? ` oleh ${doc.publishedBy}` : ""}. Memulihkan menyalin versi ke draf, belum diterbitkan.
          </ModalDescription>
        </div>
        {list.length === 0 ? (
          <p className="mx-6 my-8 rounded-xl border border-dashed border-[var(--k-line-2)] px-4 py-10 text-center text-[13.5px] text-[var(--k-mute)]">Belum ada versi lama. Riwayat terisi setelah terbit kedua.</p>
        ) : (
          <div className="py-8">
            <Swiper
              modules={[EffectCoverflow, Keyboard, A11y]}
              effect="coverflow"
              centeredSlides
              slidesPerView="auto"
              keyboard={{ enabled: true }}
              coverflowEffect={{ rotate: 18, stretch: 0, depth: 140, modifier: 1, slideShadows: false }}
              className="!px-6"
            >
              {list.map((h) => (
                <SwiperSlide key={h.index} className="!w-[260px]">
                  <article className="flex h-full flex-col rounded-2xl border border-[var(--k-gold)]/30 bg-[linear-gradient(150deg,#2a2416,#14120c)] p-5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--k-gold)]">Versi {list.length - h.index}</p>
                    <p className="mt-3 font-serif text-[1.15rem] leading-tight text-[#f3e7c4]">
                      {h.value?.hero?.titleTop} <em className="text-[var(--k-gold)]">{h.value?.hero?.titleAccent}</em>
                    </p>
                    <p className="mt-2 line-clamp-3 text-[12.5px] leading-relaxed text-[#f3e7c4]/60">{h.value?.story?.quote}</p>
                    <p className="mt-auto pt-4 text-[12px] text-[#f3e7c4]/50">
                      {fmt(h.publishedAt)}
                      <br />
                      {h.publishedBy ?? "—"}
                    </p>
                    <button
                      type="button"
                      disabled={busy != null}
                      onClick={async () => {
                        setBusy(h.index);
                        await onRestore(h.index);
                        setBusy(null);
                        onOpenChange(false);
                      }}
                      className="mt-4 h-9 rounded-lg border border-[var(--k-gold)]/40 text-[13px] font-semibold text-[var(--k-gold)] transition-colors hover:bg-[var(--k-gold)] hover:text-[var(--k-gold-ink)] disabled:opacity-50"
                    >
                      {busy === h.index ? "Menyalin…" : "Salin ke draf"}
                    </button>
                  </article>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
}

/** Konfirmasi bertema kurator (hapus plakat, buang draf). */
export function KuratorConfirm({ open, onOpenChange, title, description, confirmLabel = "Ya, lanjutkan", onConfirm }) {
  const [busy, setBusy] = useState(false);
  const icon = useRef(null);
  useEffect(() => {
    if (open && icon.current && !prefersReducedMotion()) animate(icon.current, { rotate: [0, -12, 10, -6, 0], duration: 700, ease: "outSine" });
    if (open) setBusy(false);
  }, [open]);
  return (
    <Modal open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <ModalContent hideClose className={cn(DARK, "max-w-md")}>
        <div className="flex gap-4 px-6 pb-2 pt-7">
          <span ref={icon} aria-hidden className="grid size-11 shrink-0 place-items-center rounded-full border border-[var(--k-maroon)]/60 bg-[var(--k-maroon)]/15 font-serif text-lg text-[#f0b8c1]">
            !
          </span>
          <div>
            <ModalTitle className="font-serif text-[1.3rem] font-normal text-[var(--k-ink)]">{title}</ModalTitle>
            {description && <ModalDescription className="mt-1 text-[13.5px] text-[var(--k-mute)]">{description}</ModalDescription>}
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-5">
          <ModalClose disabled={busy} className="h-10 rounded-[10px] px-4 text-[13.5px] text-[var(--k-mute)] hover:text-[var(--k-ink)]">
            Batal
          </ModalClose>
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onConfirm();
              } finally {
                setBusy(false);
              }
            }}
            className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[var(--k-maroon)] px-4 text-[13.5px] font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
          >
            {busy && <span className="size-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" />}
            {confirmLabel}
          </button>
        </div>
      </ModalContent>
    </Modal>
  );
}
