"use client";
import { useMemo, useRef, useState } from "react";
import { animate } from "animejs";
import { prefersReducedMotion } from "@/lib/motion";
import { LIMITS } from "@/lib/visi-misi-cms/schema";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Line, Panel, PosePicker, fieldDomId } from "../fields";

/** Pecah teks visi jadi segmen biasa / sorotan (sama dengan halaman publik). */
function tokenize(text, highlights) {
  if (!highlights.length) return [{ seg: text, hl: false }];
  const esc = highlights.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`(${esc.join("|")})`, "gi");
  return text.split(re).filter(Boolean).map((seg) => ({ seg, hl: highlights.some((h) => h.toLowerCase() === seg.toLowerCase()) }));
}

/**
 * Adegan Visi: tulis pernyataan di blok maroon. Blok teks lalu klik "Sorot" pada popover yang melayang
 * di dekat kursor untuk menjadikan frasa bergaris bawah emas. Klik frasa di pratinjau untuk melepasnya.
 */
export function VisiScene({ value: v, set, flags }) {
  const area = useRef(null);
  const point = useRef({ x: 0, y: 0 });
  const [sel, setSel] = useState(null);
  const highlights = v.highlights ?? [];
  const parts = useMemo(() => tokenize(v.text ?? "", highlights), [v.text, highlights]);
  const words = (v.text ?? "").trim().split(/\s+/).filter(Boolean).length;
  const found = (h) => (v.text ?? "").toLowerCase().includes(h.toLowerCase());

  const anchor = useMemo(() => ({ getBoundingClientRect: () => DOMRect.fromRect({ x: point.current.x, y: point.current.y, width: 0, height: 0 }) }), []);

  const readSelection = (e) => {
    const el = area.current;
    if (!el) return;
    const raw = el.value.slice(el.selectionStart, el.selectionEnd);
    const text = raw.trim().replace(/[.,;:]+$/, "");
    if (text.length < 2 || text.length > 60 || /\n/.test(text)) return setSel(null);
    if (e?.clientX) point.current = { x: e.clientX, y: e.clientY - 6 };
    else {
      const r = el.getBoundingClientRect();
      point.current = { x: r.left + r.width / 2, y: r.top };
    }
    setSel(text);
  };

  const add = () => {
    if (!sel) return;
    if (!highlights.some((h) => h.toLowerCase() === sel.toLowerCase()) && highlights.length < LIMITS.highlights) set("visi.highlights", [...highlights, sel]);
    setSel(null);
  };
  const remove = (h, el) => {
    const done = () => set("visi.highlights", highlights.filter((x) => x !== h));
    if (prefersReducedMotion() || !el) return done();
    animate(el, { backgroundSize: ["100% 3px", "0% 3px"], color: ["#e6d3a1", "#ffffff"], duration: 380, ease: "inQuad", onComplete: done });
  };
  const exists = sel && highlights.some((h) => h.toLowerCase() === sel.toLowerCase());

  return (
    <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
      <div className="relative overflow-hidden rounded-2xl bg-maroon p-6 text-white sm:p-9">
        <span aria-hidden className="absolute -left-1 -top-6 font-serif text-[7rem] leading-none text-gold/70">&ldquo;</span>
        <div className="relative grid gap-4 sm:grid-cols-2">
          <Line tone="dark" path="visi.label" label="Label" value={v.label} max={40} onChange={(x) => set("visi.label", x)} size="sm" />
          <Line tone="dark" path="visi.sublabel" label="Sublabel" value={v.sublabel} max={120} onChange={(x) => set("visi.sublabel", x)} size="sm" />
        </div>

        <Popover open={Boolean(sel)} onOpenChange={(o) => !o && setSel(null)}>
          <PopoverAnchor virtualRef={{ current: anchor }} />
          <label htmlFor={fieldDomId("visi.text")} className="mt-7 block text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-soft/80">
            Pernyataan visi
          </label>
          <textarea
            ref={area}
            id={fieldDomId("visi.text")}
            value={v.text ?? ""}
            maxLength={900}
            rows={6}
            onChange={(e) => set("visi.text", e.target.value)}
            onMouseUp={readSelection}
            onKeyUp={(e) => e.shiftKey && readSelection()}
            className={cn("mt-2 block w-full resize-y rounded-lg border-0 bg-white/[0.06] p-4 font-serif text-[clamp(1.1rem,1.8vw,1.45rem)] leading-[1.45] text-white outline-none ring-1 ring-white/10 transition-shadow focus:ring-gold/60", flags("visi.text") && "ring-[#e86a7c]")}
          />
          <PopoverContent side="top" sideOffset={10} className="w-auto p-1.5" onOpenAutoFocus={(e) => e.preventDefault()} onCloseAutoFocus={(e) => e.preventDefault()}>
            <button
              type="button"
              disabled={exists}
              onClick={add}
              className="inline-flex items-center gap-2 rounded-md bg-navy px-3 py-1.5 text-[12.5px] font-semibold text-white transition-transform hover:scale-[1.03] active:scale-95 disabled:opacity-50"
            >
              <span aria-hidden className="h-[3px] w-4 rounded-full bg-gold" />
              {exists ? "Sudah disorot" : `Sorot “${sel?.length > 24 ? `${sel.slice(0, 24)}…` : sel}”`}
            </button>
          </PopoverContent>
        </Popover>
        <p className="mt-2 flex flex-wrap justify-between gap-2 text-[12px] text-white/50">
          <span>Blok kata di atas untuk menyorot · {highlights.length}/{LIMITS.highlights} frasa</span>
          <span className="tabular-nums">
            {words} kata · {v.text?.length ?? 0}/900
          </span>
        </p>

        <div className="mt-6 border-t border-white/10 pt-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-soft/80">Tampilan di halaman</p>
          <p className="mt-3 font-serif text-[clamp(1.05rem,1.6vw,1.3rem)] leading-[1.5]">
            {parts.map(({ seg, hl }, i) =>
              hl ? (
                <button
                  key={i}
                  type="button"
                  title="Klik untuk melepas sorotan"
                  onClick={(e) => remove(highlights.find((h) => h.toLowerCase() === seg.toLowerCase()), e.currentTarget)}
                  className="italic text-gold-soft [background:linear-gradient(var(--gold),var(--gold))_left_bottom/100%_3px_no-repeat] transition-opacity hover:opacity-70"
                >
                  {seg}
                </button>
              ) : (
                <span key={i}>{seg}</span>
              )
            )}
          </p>
        </div>
        <Line tone="dark" path="visi.caption" label="Keterangan di bawah kutipan" value={v.caption} max={120} onChange={(x) => set("visi.caption", x)} size="sm" className="mt-6" />
      </div>

      <div className="space-y-6">
        <Panel title="Frasa sorotan">
          {highlights.length ? (
            <ul className="flex flex-wrap gap-2">
              {highlights.map((h) => (
                <li
                  key={h}
                  title={found(h) ? undefined : "Frasa tidak ditemukan di teks visi — akan dibuang saat disimpan"}
                  className={cn("inline-flex items-center gap-1.5 rounded-full py-1 pl-3 pr-1.5 text-[13px] italic", found(h) ? "bg-gold/15 text-navy" : "bg-[#e86a7c]/10 text-maroon/70 line-through")}
                >
                  {h}
                  <button type="button" aria-label={`Lepas sorotan ${h}`} onClick={() => set("visi.highlights", highlights.filter((x) => x !== h))} className="grid size-5 place-items-center rounded-full not-italic text-navy/50 hover:bg-maroon hover:text-white">
                    ×
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13.5px] text-text/55">Belum ada frasa. Blok kata kunci pada pernyataan visi untuk memberi garis emas.</p>
          )}
        </Panel>
        <Panel title="Elvo di blok visi">
          <PosePicker path="visi.mascot" value={v.mascot} onChange={(x) => set("visi.mascot", x)} />
        </Panel>
      </div>
    </div>
  );
}
