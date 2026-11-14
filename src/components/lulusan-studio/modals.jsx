"use client";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { SCENES } from "@/lib/profil-lulusan-cms/schema";
import { Modal, ModalContent, ModalDescription, ModalTitle } from "@/components/ui/modal";
import { LordIcon } from "@/components/media/lord-icon";
import { cn } from "@/lib/utils";

/** Ratakan objek → { "a.b.0": "teks" }. Array teks digabung supaya chip terbaca utuh. */
function flatten(v, path = "", out = {}) {
  if (Array.isArray(v) && v.every((x) => typeof x !== "object")) out[path] = v.join(" · ");
  else if (Array.isArray(v)) v.forEach((x, i) => flatten(x, `${path}.${i}`, out));
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) flatten(x, path ? `${path}.${k}` : k, out);
  else out[path] = typeof v === "boolean" ? (v ? "ya" : "tidak") : String(v ?? "");
  return out;
}

const pretty = (p) =>
  p
    .split(".")
    .slice(1)
    .map((x) => (/^\d+$/.test(x) ? `#${Number(x) + 1}` : x))
    .join(" › ");

/** Perubahan per tile: [{scene, label, rows:[{path, from, to}]}]. */
function diffDoc(value, live) {
  const a = flatten(live);
  const b = flatten(value);
  const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])];
  return SCENES.map((s) => ({
    ...s,
    rows: keys.filter((k) => k.split(".")[0] === s.key && (a[k] ?? "") !== (b[k] ?? "")).map((k) => ({ path: k, from: a[k] ?? "", to: b[k] ?? "" })),
  })).filter((s) => s.rows.length);
}

/**
 * Modal terbit "Ijazah": perubahan ditulis di atas lembar sertifikat per tile,
 * lalu segel emas menekan dan toga-toga kecil terlempar saat berhasil.
 */
export function IjazahModal({ open, onOpenChange, value, live, redundancy = [], onPublish, onJump, by }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const sheet = useRef(null);
  const changes = useMemo(() => (open ? diffDoc(value, live) : []), [open, value, live]);
  const total = changes.reduce((n, s) => n + s.rows.length, 0);

  useLayoutEffect(() => {
    if (!done || !sheet.current || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo("[data-seal]", { scale: 2.4, rotate: -30, opacity: 0 }, { scale: 1, rotate: -8, opacity: 1, duration: 0.55, ease: "back.out(2.2)" });
      gsap.fromTo(
        "[data-cap]",
        { y: 0, x: 0, opacity: 1, rotate: 0 },
        { y: () => -120 - Math.random() * 120, x: () => (Math.random() - 0.5) * 260, rotate: () => (Math.random() - 0.5) * 540, opacity: 0, duration: 1.4, ease: "power2.out", stagger: 0.04, delay: 0.2 }
      );
    }, sheet.current);
    return () => ctx.revert();
  }, [done]);

  const go = async () => {
    setBusy(true);
    try {
      await onPublish();
      setDone(true);
      setTimeout(() => {
        onOpenChange(false);
        setDone(false);
      }, 1900);
    } catch {
      // toast sudah dikirim pemanggil
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <ModalContent className="max-w-2xl border-0 bg-transparent p-0 shadow-none sm:p-0" hideClose>
        <div ref={sheet} className="relative max-h-[92vh] overflow-y-auto overflow-x-hidden rounded-2xl bg-[#fbf7ec] text-navy shadow-[0_40px_90px_-30px_rgb(0_0_0/0.8)]">
          {/* bingkai ganda sertifikat */}
          <div aria-hidden className="pointer-events-none absolute inset-3 rounded-xl border border-gold/50" />
          <div aria-hidden className="pointer-events-none absolute inset-[18px] rounded-lg border border-gold/25" />
          <div className="relative px-7 pb-6 pt-9 sm:px-10">
            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-gold">Lembar terbit</p>
            <ModalTitle className="mt-2 text-center font-serif text-[1.9rem] leading-tight text-navy">
              Profil <em className="text-maroon">Lulusan</em>
            </ModalTitle>
            <ModalDescription className="mt-1 text-center text-[13px] text-text/60">
              {total ? `${total} perubahan di ${changes.length} tile akan langsung tayang untuk pengunjung.` : "Tidak ada perubahan dibanding versi tayang."}
            </ModalDescription>

            {redundancy.length > 0 && (
              <div className="mt-5 rounded-lg border border-orange-300 bg-orange-50 px-4 py-3 text-[13px] text-orange-900">
                <p className="font-semibold">{redundancy.length} kalimat kembar masih ada</p>
                <ul className="mt-1 space-y-1">
                  {redundancy.slice(0, 3).map((r, i) => (
                    <li key={i}>
                      <button type="button" onClick={() => (onOpenChange(false), onJump(r.b.path))} className="text-left underline decoration-orange-400 underline-offset-2">
                        {r.a.label} ↔ {r.b.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-5 max-h-[42vh] min-h-16 space-y-4 overflow-y-auto pr-1">
              {changes.map((s) => (
                <section key={s.key}>
                  <p className="flex items-center gap-2 font-serif text-[1.05rem] text-navy">
                    <span className="h-px w-5 bg-gold" />
                    {s.label}
                    <span className="text-[11px] font-sans text-text/45">{s.rows.length} isian</span>
                  </p>
                  <ul className="mt-2 space-y-2">
                    {s.rows.slice(0, 8).map((r) => (
                      <li key={r.path} className="rounded-md bg-white/70 px-3 py-2 text-[12.5px] leading-relaxed">
                        <span className="block text-[10.5px] uppercase tracking-[0.12em] text-text/40">{pretty(r.path) || s.label}</span>
                        {r.from && <span className="block text-text/45 line-through decoration-maroon/50">{r.from.slice(0, 160)}</span>}
                        <span className="block text-navy">{r.to ? r.to.slice(0, 160) : <em className="text-text/40">dihapus</em>}</span>
                      </li>
                    ))}
                    {s.rows.length > 8 && <li className="text-[12px] text-text/45">+ {s.rows.length - 8} perubahan lain</li>}
                  </ul>
                </section>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gold/30 pt-5">
              <p className="font-serif text-[13px] italic text-text/55">Ditandatangani: {by || "Admin"}</p>
              <div className="flex gap-2">
                <button type="button" disabled={busy} onClick={() => onOpenChange(false)} className="rounded-full px-4 py-2 text-[13px] font-semibold text-navy hover:bg-navy/5">
                  Batal
                </button>
                <button
                  type="button"
                  disabled={busy || !total}
                  onClick={go}
                  className="lord-pub inline-flex items-center gap-2 rounded-full bg-maroon px-5 py-2 text-[13px] font-semibold text-white transition-[background-color,transform] hover:bg-maroon-deep active:scale-95 disabled:opacity-40"
                >
                  <LordIcon name="check" size={18} trigger="hover" target=".lord-pub" colors="primary:#ffffff,secondary:#e6d3a1" />
                  {busy ? "Menerbitkan…" : "Terbitkan sekarang"}
                </button>
              </div>
            </div>
          </div>

          {done && (
            <div className="absolute inset-0 grid place-items-center bg-[#fbf7ec]/85 backdrop-blur-[2px]">
              <div className="relative">
                {Array.from({ length: 12 }, (_, i) => (
                  <svg key={i} data-cap viewBox="0 0 24 16" className="absolute left-1/2 top-1/2 h-4 w-6 -translate-x-1/2 -translate-y-1/2 text-navy" aria-hidden>
                    <path d="M12 1L23 6 12 11 1 6z" fill="currentColor" />
                    <path d="M6 8v4c3 2.5 9 2.5 12 0V8" fill="none" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M21 6.5v5" stroke="var(--gold)" strokeWidth="1.2" />
                  </svg>
                ))}
                <div data-seal className="grid size-36 place-items-center rounded-full border-[3px] border-dashed border-gold bg-gold/15 text-center">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-maroon">Resmi tayang</p>
                    <p className="font-serif text-[1.6rem] leading-none text-maroon">Terbit</p>
                    <p className="mt-1 text-[10px] tabular-nums text-maroon/70">{new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ModalContent>
    </Modal>
  );
}

const fmt = (d) => (d ? new Date(d).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—");

/** Riwayat: angkatan terbitan sebagai deret toga pada garis waktu; pilih satu untuk dipulihkan ke draf. */
export function HistoryModal({ open, onOpenChange, history = [], publishedAt, publishedBy, onRestore }) {
  const [busy, setBusy] = useState(null);
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-lg border-white/10 bg-[#0d1830] text-white">
        <ModalTitle className="font-serif text-2xl text-white">
          Angkatan <em className="text-gold-soft">terbitan</em>
        </ModalTitle>
        <ModalDescription className="text-white/55">Lima versi terakhir disimpan. Memulihkan hanya mengisi draf; terbitkan untuk menayangkannya.</ModalDescription>
        <ol className="relative mt-5 space-y-3 border-l border-white/10 pl-6">
          <li className="relative">
            <span aria-hidden className="absolute -left-[31px] top-1 grid size-3.5 place-items-center rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
            <p className="text-[13px] font-semibold">Sedang tayang</p>
            <p className="text-[12px] text-white/50">
              {fmt(publishedAt)} · {publishedBy || "belum pernah terbit"}
            </p>
          </li>
          {history.map((h) => (
            <li key={h.index} className="group relative flex items-center justify-between gap-3">
              <span aria-hidden className="absolute -left-[29px] top-1.5 size-2.5 rounded-full bg-white/30 transition-colors group-hover:bg-gold" />
              <div>
                <p className="text-[13px]">Versi {fmt(h.publishedAt)}</p>
                <p className="text-[12px] text-white/45">{h.publishedBy || "Admin"}</p>
              </div>
              <button
                type="button"
                disabled={busy != null}
                onClick={async () => {
                  setBusy(h.index);
                  try {
                    await onRestore(h.index);
                    onOpenChange(false);
                  } catch {
                  } finally {
                    setBusy(null);
                  }
                }}
                className={cn("shrink-0 rounded-full border border-white/15 px-3 py-1 text-[12px] font-semibold transition-colors hover:border-gold hover:text-gold-soft", busy === h.index && "animate-pulse")}
              >
                {busy === h.index ? "Memulihkan…" : "Pulihkan ke draf"}
              </button>
            </li>
          ))}
          {!history.length && <li className="text-[13px] text-white/45">Belum ada versi lama.</li>}
        </ol>
      </ModalContent>
    </Modal>
  );
}
