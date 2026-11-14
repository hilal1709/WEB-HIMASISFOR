"use client";
import { useEffect, useRef } from "react";
import { Modal, ModalContent, ModalDescription, ModalTitle } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { RumpunDot } from "@/components/kurikulum/rumpun-dot";
import { RUMPUN_BY_KEY } from "@/lib/kurikulum-content";
import { cn } from "@/lib/utils";
import { useKonversi } from "./konversi-provider";

/**
 * Modal mata kuliah kandidat: kepala maroon (nama, SKS, semester, rumpun), capaian yang harus dibuktikan
 * kegiatanmu (CPMK dari RPS), tombol masuk/keluar kantong, tautan ke RPS lengkap. ‹ › dan ←/→ berpindah
 * mengikuti urutan saran di meja.
 */
export function CourseModal({ slug, onSlug, onClose }) {
  const { ranked, picked, left, toggleCourse, bySlug, program } = useKonversi();
  const last = useRef(null);
  if (slug) last.current = slug;
  const c = bySlug(slug ?? last.current);
  const i = c ? ranked.findIndex((x) => x.slug === c.slug) : -1;
  const prev = i > 0 ? ranked[i - 1] : null;
  const next = i >= 0 && i < ranked.length - 1 ? ranked[i + 1] : null;

  useEffect(() => {
    if (!slug) return;
    const key = (e) => {
      if (e.key === "ArrowLeft" && prev) onSlug(prev.slug);
      if (e.key === "ArrowRight" && next) onSlug(next.slug);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [slug, prev, next, onSlug]);

  if (!c) return <Modal open={false} />;
  const on = picked.includes(c.slug);
  const fits = on || c.sks <= left;

  const Nav = ({ to, dir }) => (
    <button
      type="button"
      disabled={!to}
      onClick={() => to && onSlug(to.slug)}
      aria-label={dir < 0 ? `Sebelumnya: ${to?.nama ?? ""}` : `Berikutnya: ${to?.nama ?? ""}`}
      className="grid size-9 place-items-center rounded-md border border-white/20 text-white transition-[background-color,opacity] hover:bg-white/10 disabled:opacity-30"
    >
      <svg aria-hidden viewBox="0 0 16 16" className="size-4">
        <path d={dir < 0 ? "M10 3L5 8l5 5" : "M6 3l5 5-5 5"} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );

  return (
    <Modal open={!!slug} onOpenChange={(o) => !o && onClose()}>
      <ModalContent className="max-w-xl p-0 [&>button[aria-label=Tutup]]:text-white/70 [&>button[aria-label=Tutup]]:hover:bg-white/10 [&>button[aria-label=Tutup]]:hover:text-white">
        <div key={c.slug} className="animate-in fade-in-0 slide-in-from-right-2 duration-300">
          <div className="bg-maroon px-6 pb-6 pt-7 text-white">
            <p className="flex items-center gap-2 text-[12px] text-gold-soft">
              <RumpunDot rumpun={c.rumpun} className="ring-1 ring-white/60" />
              {RUMPUN_BY_KEY[c.rumpun]?.name} · {c.semester ? `Semester ${c.semester}` : "Mata kuliah pilihan"}
            </p>
            <ModalTitle className="mt-2 pr-8 text-[1.7rem] text-white">{c.nama}</ModalTitle>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="tabular font-serif text-[2.2rem] leading-none text-gold">
                {c.sks} <span className="font-sans text-[13px] text-white/60">SKS</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="tabular text-[12px] text-white/50">{i + 1}/{ranked.length}</span>
                <Nav to={prev} dir={-1} />
                <Nav to={next} dir={1} />
              </span>
            </div>
          </div>
          <div className="p-6">
            <ModalDescription>Capaian yang perlu dibuktikan lewat kegiatanmu ({program.label}):</ModalDescription>
            {c.cpmk.length ? (
              <ol className="mt-3 space-y-2.5">
                {c.cpmk.map((t, k) => (
                  <li key={k} className="flex gap-3 text-[14.5px] leading-snug text-navy">
                    <span className="tabular w-5 shrink-0 font-serif text-gold">{k + 1}</span>
                    {t}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-3 rounded-md bg-cream px-4 py-3 text-[14px] text-text/60">Ringkasan capaian belum diunggah. Tanyakan ke dosen pengampu saat menyusun Learning Agreement.</p>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button variant={on ? "outline-navy" : "maroon"} size="lg" disabled={!fits} onClick={() => toggleCourse(c.slug)} className={cn(!fits && "cursor-not-allowed")}>
                {on ? "Keluarkan dari kantong" : fits ? "Masukkan ke kantong" : `Butuh ${c.sks} SKS, sisa ${Math.max(left, 0)}`}
              </Button>
              <a href={`/curiculum#rps-${c.slug}`} className="text-[14px] font-semibold text-maroon">
                <span className="u-gold">Buka RPS lengkap</span>
              </a>
            </div>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
