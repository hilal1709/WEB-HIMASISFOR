"use client";
import { useLayoutEffect as useEffect, useRef } from "react";
import { animate } from "animejs";
import { DialogTitle, DialogDescription } from "@radix-ui/react-dialog";
import { prefersReducedMotion } from "@/lib/motion";
import { KINDS, fmtDate, rupiahLess } from "@/lib/beasiswa-content";
import { ResponsiveDialog } from "@/components/layanan/responsive-dialog";
import { LordIcon } from "@/components/media/lord-icon";
import { PlaceholderTag } from "@/components/home/shared";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { useBeasiswa } from "./beasiswa-provider";

/** Segel lilin maroon: saat modal dibuka, dua belahannya "retak" menjauh lalu memudar (anime.js). */
function WaxSeal({ initials, play }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !play || prefersReducedMotion()) return;
    const [l, r] = el.querySelectorAll("[data-half]");
    const a = animate(l, { translateX: [0, -10], rotate: [0, -14], duration: 700, delay: 260, ease: "outBack(1.6)" });
    const b = animate(r, { translateX: [0, 10], rotate: [0, 14], duration: 700, delay: 260, ease: "outBack(1.6)" });
    const c = animate(el.querySelector("[data-crack]"), { opacity: [0, 1, 0.6], duration: 300, delay: 200 });
    return () => {
      a.revert();
      b.revert();
      c.revert();
    };
  }, [play]);
  return (
    <span ref={ref} aria-hidden className="bs-seal">
      <svg viewBox="0 0 72 72" className="h-full w-full overflow-visible">
        <g data-half style={{ transformBox: "fill-box", transformOrigin: "100% 50%" }}>
          <path d="M36 4C20 6 8 18 6 34c-2 16 10 32 30 34z" fill="var(--maroon)" />
        </g>
        <g data-half style={{ transformBox: "fill-box", transformOrigin: "0% 50%" }}>
          <path d="M36 4c16 2 28 14 30 30 2 16-10 32-30 34z" fill="var(--maroon-deep)" />
        </g>
        <path data-crack d="M36 6l-3 14 5 8-4 12 4 10-3 16" fill="none" stroke="var(--gold)" strokeWidth="1.2" opacity="0" />
        <circle cx="36" cy="36" r="20" fill="none" stroke="var(--gold-soft)" strokeOpacity="0.55" strokeDasharray="2 3" />
        <text x="36" y="41" textAnchor="middle" className="bs-seal-text" fill="var(--gold-soft)">{initials}</text>
      </svg>
    </span>
  );
}

/**
 * Modal beasiswa bergaya piagam: bingkai garis rangkap emas, segel lilin yang retak saat dibuka,
 * cakupan, syarat (tercentang dari paspor bila sudah diisi), berkas, jendela pendaftaran, tautan resmi.
 * Simpan ke dompet (Lordicon plus-circle → check) → toast. ‹ › + panah keyboard. Ponsel: lembar bawah.
 */
export function ScholarshipModal({ slug, onSlug, onClose }) {
  const { items, results, passport, wallet, toggleSave } = useBeasiswa();
  const toast = useToast();
  const idx = items.findIndex((s) => s.slug === slug);
  const s = idx >= 0 ? items[idx] : null;
  const saved = s ? wallet.includes(s.slug) : false;
  const res = s ? results[s.slug] : null;

  useEffect(() => {
    if (!s) return;
    const onKey = (e) => {
      if (e.target.closest?.("input, textarea")) return;
      if (e.key === "ArrowRight") onSlug(items[(idx + 1) % items.length].slug);
      if (e.key === "ArrowLeft") onSlug(items[(idx - 1 + items.length) % items.length].slug);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [s, idx, items, onSlug]);

  const go = (d) => onSlug(items[(idx + d + items.length) % items.length].slug);
  const register = () => {
    if (s.href) window.open(s.href, "_blank", "noopener,noreferrer");
    else toast.info("Tautan resmi menyusul", { description: "Prodi akan mengumumkannya di laman ini dan di Warta." });
  };

  return (
    <ResponsiveDialog open={Boolean(s)} onOpenChange={(o) => !o && onClose()} className="max-w-[760px]" sheetClassName="max-h-[92dvh] overflow-y-auto">
      {s && (
        <div className="bs-certificate">
          <div className="bs-certificate-frame">
            <div className="flex items-start gap-5">
              <WaxSeal key={s.slug} initials={s.monogram} play />
              <div className="min-w-0 flex-1 pr-6">
                <span className="kicker block text-[10.5px] text-maroon">
                  {KINDS[s.kind]} · {s.org}
                </span>
                <DialogTitle className="mt-1.5 font-serif text-[clamp(1.6rem,3vw,2.2rem)] leading-tight text-navy">{s.name}</DialogTitle>
                <DialogDescription className="mt-2 text-[15px] leading-relaxed text-text/70">{s.lead}</DialogDescription>
              </div>
            </div>

            {/* cakupan */}
            <div className="mt-7">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-[13px] font-semibold text-navy">Ditanggung</span>
                <span className="font-serif text-[1.15rem] italic text-maroon">{rupiahLess(s)}</span>
              </div>
              <span aria-hidden className="bs-cert-bar mt-2">
                <span style={{ "--v": s.coverage }} />
              </span>
              <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                {s.covers.map((c) => (
                  <li key={c} className="flex gap-2.5 text-[13.5px] leading-snug text-text/70">
                    <span aria-hidden className="mt-[7px] h-px w-3 shrink-0 bg-gold" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-7 grid gap-7 sm:grid-cols-2">
              <div>
                <p className="text-[13px] font-semibold text-navy">
                  Syarat {passport ? <span className="font-normal text-text/50">· dicek dari paspormu</span> : null}
                </p>
                <ul className="mt-3 grid gap-2">
                  {res?.checks.map((c) => (
                    <li key={c.key} className="flex items-start gap-2.5 text-[13.5px] leading-snug">
                      <span
                        aria-hidden
                        className={cn(
                          "mt-[3px] grid size-4 shrink-0 place-items-center rounded-full border",
                          !passport ? "border-navy/25" : c.ok ? "border-gold bg-gold text-navy" : "border-maroon/40 text-maroon"
                        )}
                      >
                        {passport && c.ok && (
                          <svg viewBox="0 0 12 12" className="size-2.5"><path d="M2.5 6.2l2.2 2.2 4.8-4.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        )}
                      </span>
                      <span className={cn("text-text/75", passport && !c.ok && "text-maroon")}>
                        {c.label}
                        {passport && !c.ok && c.gap && <span className="block text-[12px] text-text/50">{c.gap}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-navy">Berkas</p>
                <ul className="mt-3 grid gap-2">
                  {s.docs.map((d) => (
                    <li key={d} className="flex gap-2.5 text-[13.5px] leading-snug text-text/70">
                      <span aria-hidden className="mt-[7px] h-px w-3 shrink-0 bg-gold" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {s.window && (
              <div className="bs-cert-window mt-7">
                <span>
                  <span className="kicker block text-[10px] text-text/50">{s.window.state === "buka" ? "Sedang dibuka" : "Dibuka berikutnya"}</span>
                  <span className="mt-0.5 block font-serif text-[1.1rem] text-navy">
                    {fmtDate(s.window.open)} – {fmtDate(s.window.close, { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </span>
                <span className="text-right">
                  <span className="tabular block font-serif text-[1.6rem] leading-none text-maroon">{s.window.days}</span>
                  <span className="text-[11px] text-text/50">hari lagi {s.window.state === "buka" ? "tutup" : "buka"}</span>
                </span>
              </div>
            )}

            {s.sample && <PlaceholderTag className="mt-5" />}

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={register}
                className="inline-flex h-11 items-center gap-2 rounded-md bg-maroon px-5 text-sm font-semibold text-white transition-[background-color,transform] duration-300 hover:bg-maroon-deep active:scale-[0.98]"
              >
                Ke laman pendaftaran
                <svg aria-hidden viewBox="0 0 16 16" className="size-4"><path d="M5 11l6-6M6 5h5v5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <button
                type="button"
                onClick={() => toggleSave(s.slug)}
                aria-pressed={saved}
                className={cn(
                  "group inline-flex h-11 items-center gap-2 rounded-md border px-4 text-sm font-semibold transition-[background-color,border-color,color,transform] duration-300 active:scale-[0.98]",
                  saved ? "border-gold bg-gold/15 text-navy" : "border-navy/20 bg-white text-navy hover:border-navy/40"
                )}
              >
                <LordIcon key={saved ? "y" : "n"} name={saved ? "check" : "plus-circle"} size={20} trigger={saved ? "once" : "hover"} target=".group" colors="primary:#14213d,secondary:#c9a227" />
                {saved ? "Ada di dompet" : "Simpan ke dompet"}
              </button>
              <span className="ml-auto flex items-center gap-1">
                <button type="button" aria-label="Beasiswa sebelumnya" onClick={() => go(-1)} className="bs-nav-btn">
                  <svg aria-hidden viewBox="0 0 16 16" className="size-4"><path d="M10 3L5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                <span className="tabular w-12 text-center text-[12px] text-text/50">
                  {idx + 1}/{items.length}
                </span>
                <button type="button" aria-label="Beasiswa berikutnya" onClick={() => go(1)} className="bs-nav-btn">
                  <svg aria-hidden viewBox="0 0 16 16" className="size-4"><path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              </span>
            </div>
          </div>
        </div>
      )}
    </ResponsiveDialog>
  );
}
