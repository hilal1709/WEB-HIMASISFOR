"use client";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { animate, stagger, svg } from "animejs";
import { SCENES, changedScenes } from "@/lib/visi-misi-cms/schema";
import { prefersReducedMotion } from "@/lib/motion";
import { HorizonIllustration } from "@/components/illustrations/line-illustrations";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Ratakan objek → { "a.b.0": "nilai" } untuk menghitung selisih per field. */
function flat(v, pre = "", out = {}) {
  if (v && typeof v === "object") {
    const entries = Array.isArray(v) ? v.map((x, i) => [i, x]) : Object.entries(v);
    if (!entries.length) out[pre] = Array.isArray(v) ? "[]" : "{}";
    for (const [k, x] of entries) flat(x, pre ? `${pre}.${k}` : String(k), out);
  } else out[pre] = v;
  return out;
}

const show = (x) => (x === undefined ? "—" : x === true ? "ya" : x === false ? "tidak" : String(x) || "(kosong)");

function diff(a, b) {
  const A = flat(a);
  const B = flat(b);
  const keys = [...new Set([...Object.keys(A), ...Object.keys(B)])];
  return keys.filter((k) => A[k] !== B[k]).map((k) => ({ path: k, before: B[k], after: A[k] }));
}

/**
 * Modal terbit: selisih per adegan (sebelum → sesudah). Kalimat berulang memblokir terbit
 * sampai admin mencentang "tetap terbitkan". Sukses → matahari terbit di cakrawala.
 */
export function PublishModal({ open, onOpenChange, value, live, redundancy = [], onPublish, onJump }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [force, setForce] = useState(false);
  const scenes = useMemo(() => (open && value && live ? changedScenes(value, live) : []), [open, value, live]);
  const blocked = redundancy.length > 0 && !force;

  const go = async () => {
    setBusy(true);
    try {
      await onPublish();
      setDone(true);
    } catch {
      /* toast ditangani pemanggil */
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) setTimeout(() => (setDone(false), setForce(false)), 300);
      }}
    >
      <ModalContent className="max-w-2xl p-0">
        {done ? (
          <Sunrise onClose={() => onOpenChange(false)} />
        ) : (
          <div className="p-6 sm:p-8">
            <ModalHeader>
              <ModalTitle>Terbitkan arah baru?</ModalTitle>
              <ModalDescription>
                {scenes.length ? `${scenes.length} adegan berubah. Pengunjung yang sedang membuka halaman langsung melihat versi ini.` : "Tidak ada perbedaan dengan versi tayang."}
              </ModalDescription>
            </ModalHeader>

            <ol className="max-h-[46vh] space-y-3 overflow-y-auto pr-1">
              {scenes.map((key) => {
                const sc = SCENES.find((s) => s.key === key);
                const rows = diff(value[key], live[key]);
                return (
                  <li key={key} className="rounded-lg bg-cream/70 p-4 ring-1 ring-navy/[0.06]">
                    <p className="flex items-center gap-2 text-[13px] font-semibold text-navy">
                      <span className="grid size-6 place-items-center rounded-full bg-navy text-[11px] text-gold">{SCENES.indexOf(sc) + 1}</span>
                      {sc.label}
                      <span className="font-normal text-text/45">· {rows.length} perubahan</span>
                    </p>
                    <ul className="mt-3 space-y-2">
                      {rows.slice(0, 4).map((r) => (
                        <li key={r.path} className="grid gap-1 text-[12.5px] sm:grid-cols-2 sm:gap-3">
                          <span className="line-clamp-2 text-text/45 line-through decoration-maroon/40">{show(r.before)}</span>
                          <span className="line-clamp-2 text-navy">{show(r.after)}</span>
                        </li>
                      ))}
                      {rows.length > 4 && <li className="text-[12px] text-text/45">+{rows.length - 4} perubahan lain</li>}
                    </ul>
                  </li>
                );
              })}
            </ol>

            {redundancy.length > 0 && (
              <div className="mt-5 rounded-lg bg-[#e86a7c]/10 p-4 ring-1 ring-[#e86a7c]/30">
                <p className="text-[13px] font-semibold text-maroon">{redundancy.length} kalimat berulang</p>
                <ul className="mt-2 space-y-1.5 text-[12.5px] text-text/70">
                  {redundancy.slice(0, 3).map((r, i) => (
                    <li key={i}>
                      <button type="button" onClick={() => (onOpenChange(false), onJump(r.b.path))} className="text-left hover:text-maroon">
                        “{r.text.slice(0, 80)}{r.text.length > 80 ? "…" : ""}” — {r.a.label} & {r.b.label}
                      </button>
                    </li>
                  ))}
                </ul>
                <label className="mt-3 flex items-center gap-2 text-[12.5px] text-navy">
                  <input type="checkbox" checked={force} onChange={(e) => setForce(e.target.checked)} className="accent-maroon" />
                  Saya sudah memeriksa, tetap terbitkan
                </label>
              </div>
            )}

            <ModalFooter>
              <Button variant="outline-navy" onClick={() => onOpenChange(false)} disabled={busy}>
                Kembali
              </Button>
              <Button variant="maroon" loading={busy} disabled={!scenes.length || blocked} onClick={go}>
                Terbitkan sekarang
              </Button>
            </ModalFooter>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
}

function Sunrise({ onClose }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const a = animate(svg.createDrawable(el.querySelectorAll("[data-line]")), { draw: ["0 0", "0 1"], duration: 1100, delay: stagger(40), ease: "inOutCubic" });
    const b = animate(el.querySelector("[data-sun]"), { translateY: [40, 0], opacity: [0, 1], duration: 1200, delay: 300, ease: "outExpo" });
    return () => [a, b].forEach((x) => x.revert?.());
  }, []);
  return (
    <div ref={ref} className="p-6 text-center sm:p-10">
      <div className="relative mx-auto max-w-sm text-navy">
        <span data-sun aria-hidden className="absolute left-1/2 top-[30%] size-16 -translate-x-1/2 rounded-full bg-gold/40" />
        <HorizonIllustration className="relative h-auto w-full text-navy" />
      </div>
      <ModalTitle className="mt-4">Arah baru sudah tayang</ModalTitle>
      <ModalDescription className="mx-auto mt-2 max-w-sm">Halaman Visi & Misi dan tab visi-misi di Profil memakai versi ini sekarang.</ModalDescription>
      <div className="mt-6 flex justify-center gap-2">
        <Button variant="outline-navy" asChild>
          <a href="/visi-misi" target="_blank" rel="noopener noreferrer">
            Lihat halaman
          </a>
        </Button>
        <Button variant="navy" onClick={onClose}>
          Selesai
        </Button>
      </div>
    </div>
  );
}

/** Riwayat terbit: titik-titik di garis waktu; pilih satu → salin ke draf. */
export function HistoryModal({ open, onOpenChange, history = [], publishedAt, publishedBy, onRestore }) {
  const [pick, setPick] = useState(null);
  const [busy, setBusy] = useState(false);
  const fmt = (d) => (d ? new Date(d).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "—");
  const points = [{ index: "live", publishedAt, publishedBy, live: true }, ...history];
  return (
    <Modal open={open} onOpenChange={(o) => (onOpenChange(o), !o && setPick(null))}>
      <ModalContent className="max-w-xl">
        <ModalHeader>
          <ModalTitle>Jejak terbit</ModalTitle>
          <ModalDescription>Pulihkan versi lama ke draf. Halaman publik baru berubah setelah diterbitkan lagi.</ModalDescription>
        </ModalHeader>
        {!publishedAt && !history.length ? (
          <div className="grid place-items-center py-6 text-center">
            <LottieIllustration src="/lottie/strategy-target-dark.json" className="size-32" label="Belum ada riwayat" />
            <p className="mt-2 text-[13.5px] text-text/60">Belum pernah diterbitkan dari Ruang Kompas.</p>
          </div>
        ) : (
          <ol className="relative ml-3 border-l border-dashed border-gold/60 py-1">
            {points.map((h) => {
              const on = pick === h.index;
              return (
                <li key={h.index} className="relative pb-4 pl-6 last:pb-0">
                  <span className={cn("absolute -left-[7px] top-1.5 size-3.5 rounded-full border-2 transition-transform duration-300", h.live ? "border-maroon bg-maroon" : on ? "scale-125 border-gold bg-gold" : "border-navy/40 bg-white")} />
                  <button
                    type="button"
                    disabled={h.live}
                    onClick={() => setPick(h.index)}
                    className={cn("w-full rounded-lg px-3 py-2 text-left transition-colors", on ? "bg-gold/15" : "hover:bg-cream", h.live && "cursor-default hover:bg-transparent")}
                  >
                    <span className="block text-[13.5px] font-medium text-navy">
                      {fmt(h.publishedAt)} {h.live && <span className="ml-1 rounded bg-maroon px-1.5 py-0.5 text-[10.5px] text-white">Tayang</span>}
                    </span>
                    <span className="text-[12px] text-text/50">oleh {h.publishedBy || "Admin"}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        )}
        <ModalFooter>
          <Button variant="outline-navy" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
          <Button
            variant="maroon"
            disabled={typeof pick !== "number"}
            loading={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onRestore(pick);
                onOpenChange(false);
              } finally {
                setBusy(false);
              }
            }}
          >
            Pulihkan ke draf
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
