"use client";
import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { Modal, ModalContent, ModalDescription, ModalTitle } from "@/components/ui/modal";
import { Signature, drawSignature } from "@/components/sambutan/signature";
import { cn } from "@/lib/utils";

const VB = { w: 240, h: 96 };
const r1 = (n) => Math.round(n * 10) / 10;

/** Titik mentah → path halus (kurva kuadrat lewat titik tengah), titik terlalu rapat dibuang. */
function toPath(points) {
  const pts = points.filter((p, i) => i === 0 || Math.hypot(p.x - points[i - 1].x, p.y - points[i - 1].y) > 1.2);
  if (pts.length < 2) return pts.length ? `M${r1(pts[0].x)} ${r1(pts[0].y)}l0.1 0` : "";
  let d = `M${r1(pts[0].x)} ${r1(pts[0].y)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i].x + pts[i + 1].x) / 2;
    const my = (pts[i].y + pts[i + 1].y) / 2;
    d += `Q${r1(pts[i].x)} ${r1(pts[i].y)} ${r1(mx)} ${r1(my)}`;
  }
  const last = pts[pts.length - 1];
  return `${d}L${r1(last.x)} ${r1(last.y)}`;
}

/**
 * Pad tanda tangan: gambar dengan mouse/jari/pena → goresan SVG yang dianimasikan
 * anime.js persis seperti di halaman publik. Bisa juga memakai berkas SVG unggahan.
 */
export function SignaturePad({ open, onOpenChange, signature, onSave, onPickSvg }) {
  const [paths, setPaths] = useState([]);
  const [accent, setAccent] = useState(true);
  const [live, setLive] = useState(null);
  const svg = useRef(null);
  const preview = useRef(null);
  const pts = useRef([]);

  useEffect(() => {
    if (!open) return;
    const own = signature.mode === "draw" && signature.viewBox === `0 0 ${VB.w} ${VB.h}`;
    setPaths(own ? signature.paths : []);
    setAccent(signature.accentLast);
  }, [open, signature]);

  const at = (e) => {
    const r = svg.current.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * VB.w, y: ((e.clientY - r.top) / r.height) * VB.h };
  };
  const down = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pts.current = [at(e)];
    setLive(toPath(pts.current));
  };
  const move = (e) => {
    if (!pts.current.length) return;
    pts.current.push(at(e));
    setLive(toPath(pts.current));
  };
  const up = () => {
    if (pts.current.length) {
      const d = toPath(pts.current);
      if (d) setPaths((p) => [...p, d].slice(0, 24));
    }
    pts.current = [];
    setLive(null);
  };

  const draft = { mode: "draw", viewBox: `0 0 ${VB.w} ${VB.h}`, paths, svgUrl: "", accentLast: accent };
  const replay = () => drawSignature(animate, preview.current, { duration: 900, gap: 260 });

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-2xl">
        <ModalTitle className="text-2xl">Tanda tangan</ModalTitle>
        <ModalDescription>Gambar di kertas bergaris. Setiap goresan diputar ulang berurutan di halaman publik.</ModalDescription>

        <div className="relative mt-5 overflow-hidden rounded-xl border border-line bg-[#fffdf9]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ backgroundImage: "repeating-linear-gradient(transparent 0 31px, rgb(20 33 61 / 0.07) 31px 32px)" }}
          />
          <span aria-hidden className="pointer-events-none absolute bottom-7 left-6 right-6 border-b border-dashed border-gold/60" />
          <span aria-hidden className="pointer-events-none absolute bottom-2 left-6 text-[11px] uppercase tracking-[0.16em] text-text/30">
            tanda tangan di atas garis
          </span>
          <svg
            ref={svg}
            viewBox={`0 0 ${VB.w} ${VB.h}`}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            className="relative block aspect-[5/2] w-full cursor-crosshair touch-none text-navy"
          >
            {paths.map((d, i) => {
              const gold = accent && i === paths.length - 1 && paths.length > 1;
              return <path key={i} d={d} fill="none" stroke={gold ? "var(--gold)" : "currentColor"} strokeWidth={gold ? 1.4 : 2.2} strokeLinecap="round" strokeLinejoin="round" />;
            })}
            {live && <path d={live} fill="none" stroke="var(--maroon)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />}
          </svg>
          {!paths.length && !live && (
            <p className="pointer-events-none absolute inset-0 grid place-items-center font-serif text-xl italic text-text/25">Mulai menggambar di sini</p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <button type="button" disabled={!paths.length} onClick={() => setPaths((p) => p.slice(0, -1))} className="rounded-full border border-line px-3.5 py-1.5 text-navy transition-colors hover:border-navy disabled:opacity-40">
            Urungkan goresan
          </button>
          <button type="button" disabled={!paths.length} onClick={() => setPaths([])} className="rounded-full border border-line px-3.5 py-1.5 text-navy transition-colors hover:border-maroon hover:text-maroon disabled:opacity-40">
            Bersihkan
          </button>
          <label className="ml-auto inline-flex cursor-pointer items-center gap-2 text-text/70">
            <input type="checkbox" checked={accent} onChange={(e) => setAccent(e.target.checked)} className="accent-[var(--gold)]" />
            Goresan terakhir berwarna emas
          </label>
        </div>

        <div className={cn("mt-5 flex items-center gap-5 rounded-xl bg-cream px-5 py-4 transition-opacity", !paths.length && "opacity-50")}>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text/45">Pratinjau di surat</p>
            <Signature ref={preview} signature={draft} className="mt-1 h-16" />
          </div>
          <button type="button" disabled={!paths.length} onClick={replay} className="rounded-full bg-white px-3.5 py-1.5 text-sm text-navy shadow-sm ring-1 ring-navy/10 transition hover:ring-navy/30">
            ▶ Putar ulang
          </button>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={onPickSvg} className="text-sm text-navy underline decoration-gold underline-offset-4 hover:text-maroon">
            Pakai berkas SVG/PNG
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={() => onOpenChange(false)} className="h-10 rounded-md border border-navy/20 px-4 text-sm font-semibold text-navy hover:border-navy">
              Batal
            </button>
            <button
              type="button"
              disabled={!paths.length}
              onClick={() => {
                onSave(draft);
                onOpenChange(false);
              }}
              className="h-10 rounded-md bg-maroon px-5 text-sm font-semibold text-white transition-[background-color,transform] hover:bg-maroon-deep active:scale-[0.98] disabled:opacity-40"
            >
              Pakai tanda tangan ini
            </button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
