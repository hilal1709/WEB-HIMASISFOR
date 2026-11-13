"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Reorder, useDragControls } from "motion/react";
import { animate } from "animejs";
import { cn } from "@/lib/utils";
import { fieldDomId } from "./paper-field";

let seq = 0;
const nid = () => `p${++seq}`;

/**
 * Paragraf surat sebagai lembar yang bisa diseret. Di antara paragraf ada "sela":
 * sela aktif = posisi kutipan (pita emas); sela lain bisa dijadikan posisi kutipan atau tempat paragraf baru.
 */
export function ParagraphList({ paragraphs, quoteAfter, quote, onChange, onQuoteAfter, max = 12 }) {
  const [ids, setIds] = useState(() => paragraphs.map(nid));
  // jaga id tetap sejajar bila jumlah berubah dari luar (urungkan, pulihkan versi, admin lain)
  useEffect(() => {
    setIds((cur) => (cur.length === paragraphs.length ? cur : paragraphs.map((_, i) => cur[i] ?? nid())));
  }, [paragraphs.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const list = ids.slice(0, paragraphs.length);
  const byId = Object.fromEntries(list.map((id, i) => [id, paragraphs[i]]));
  const qa = Math.min(quoteAfter ?? 0, paragraphs.length);

  const reorder = (next) => {
    // pertahankan kutipan setelah paragraf yang sama
    const anchor = qa > 0 ? list[qa - 1] : null;
    setIds(next);
    onChange(next.map((id) => byId[id]));
    if (anchor) onQuoteAfter(next.indexOf(anchor) + 1);
  };

  const insertAt = (at) => {
    if (paragraphs.length >= max) return;
    const id = nid();
    setIds([...list.slice(0, at), id, ...list.slice(at)]);
    onChange([...paragraphs.slice(0, at), "", ...paragraphs.slice(at)]);
    if (at < qa) onQuoteAfter(qa + 1);
    requestAnimationFrame(() => document.querySelector(`[data-pid="${id}"] textarea`)?.focus());
  };

  const remove = (i, el) => {
    animate(el, {
      opacity: 0,
      translateX: -24,
      duration: 260,
      ease: "inQuad",
      onComplete: () => {
        setIds(list.filter((_, j) => j !== i));
        onChange(paragraphs.filter((_, j) => j !== i));
        if (i < qa) onQuoteAfter(qa - 1);
      },
    });
  };

  return (
    <div>
      <Gap active={qa === 0} quote={quote} onQuote={() => onQuoteAfter(0)} onInsert={() => insertAt(0)} canInsert={paragraphs.length < max} />
      <Reorder.Group axis="y" values={list} onReorder={reorder} className="space-y-0">
        {list.map((id, i) => (
          <Item key={id} id={id} index={i} text={paragraphs[i]} onText={(v) => onChange(paragraphs.map((p, j) => (j === i ? v : p)))} onRemove={(el) => remove(i, el)}>
            <Gap
              active={qa === i + 1}
              quote={quote}
              onQuote={() => onQuoteAfter(i + 1)}
              onInsert={() => insertAt(i + 1)}
              canInsert={paragraphs.length < max}
            />
          </Item>
        ))}
      </Reorder.Group>
      {!paragraphs.length && <p className="py-6 text-center text-sm text-text/45">Belum ada paragraf. Klik “+ paragraf” di atas.</p>}
    </div>
  );
}

function Item({ id, index, text, onText, onRemove, children }) {
  const controls = useDragControls();
  const ta = useRef(null);
  const row = useRef(null);
  useLayoutEffect(() => {
    const el = ta.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${el.scrollHeight}px`;
  }, [text]);
  return (
    <Reorder.Item value={id} dragListener={false} dragControls={controls} data-pid={id} className="relative list-none" whileDrag={{ scale: 1.015, boxShadow: "0 30px 60px -30px rgb(20 33 61 / 0.45)", zIndex: 5 }}>
      <div ref={row} className="group/para relative -mx-3 rounded-lg bg-white px-3 py-2 transition-colors hover:bg-cream/50 sm:-mx-5 sm:px-5">
        <div className="absolute -left-9 top-3 hidden flex-col items-center gap-1 sm:flex">
          <button
            type="button"
            onPointerDown={(e) => controls.start(e)}
            aria-label={`Seret paragraf ${index + 1}`}
            className="grid size-7 cursor-grab touch-none place-items-center rounded-md text-text/25 opacity-0 transition-[opacity,color] hover:text-navy group-hover/para:opacity-100 active:cursor-grabbing"
          >
            <svg viewBox="0 0 10 16" className="h-4 w-2.5 fill-current" aria-hidden>
              {[2, 8, 14].flatMap((y) => [<circle key={`a${y}`} cx="2" cy={y} r="1.4" />, <circle key={`b${y}`} cx="8" cy={y} r="1.4" />])}
            </svg>
          </button>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="w-5 shrink-0 font-serif text-sm tabular-nums text-gold">{String(index + 1).padStart(2, "0")}</span>
          <textarea
            id={fieldDomId(`letter.paragraphs.${index}`)}
            ref={ta}
            rows={1}
            cols={1}
            value={text}
            maxLength={2000}
            placeholder="Tulis paragraf…"
            onChange={(e) => onText(e.target.value)}
            className={cn(
              "block w-full resize-none overflow-hidden bg-transparent text-[16.5px] leading-[1.8] text-text/85 outline-none placeholder:text-text/25",
              index === 0 && "first-letter:font-serif first-letter:text-[2.4rem] first-letter:text-maroon"
            )}
          />
          <button
            type="button"
            onClick={() => onRemove(row.current)}
            aria-label={`Hapus paragraf ${index + 1}`}
            className="shrink-0 rounded-md px-1.5 text-lg leading-none text-text/25 opacity-0 transition-[opacity,color] hover:text-maroon group-hover/para:opacity-100 focus:opacity-100"
          >
            ×
          </button>
        </div>
        {/* seret di layar sentuh */}
        <button type="button" onPointerDown={(e) => controls.start(e)} className="mt-1 touch-none text-[11px] text-text/35 sm:hidden">
          ⇅ seret
        </button>
      </div>
      {children}
    </Reorder.Item>
  );
}

function Gap({ active, quote, onQuote, onInsert, canInsert }) {
  const ref = useRef(null);
  useEffect(() => {
    if (active && ref.current) animate(ref.current, { scaleX: [0.6, 1], opacity: [0.4, 1], duration: 520, ease: "outElastic(1, .6)" });
  }, [active]);
  if (active)
    return (
      <div className="relative my-3 py-2">
        <div ref={ref} className="flex items-center gap-3 rounded-md border border-gold/50 bg-gold/[0.07] px-4 py-3">
          <span className="font-serif text-3xl leading-none text-gold">&ldquo;</span>
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-maroon">Kutipan muncul di sini</span>
            <span className="line-clamp-1 font-serif text-[15px] italic text-navy/70">{quote || "Kutipan kosong — tidak ditampilkan."}</span>
          </span>
          {canInsert && (
            <button type="button" onClick={onInsert} className="shrink-0 rounded-full border border-navy/15 px-2.5 py-1 text-[12px] text-navy transition-colors hover:border-navy">
              + paragraf
            </button>
          )}
        </div>
      </div>
    );
  return (
    <div className="group/gap relative flex h-5 items-center justify-center">
      <span className="absolute inset-x-8 top-1/2 h-px bg-transparent transition-colors group-hover/gap:bg-gold/40" />
      <span className="relative flex gap-1.5 opacity-0 transition-opacity duration-200 focus-within:opacity-100 group-hover/gap:opacity-100">
        {canInsert && (
          <button type="button" onClick={onInsert} className="rounded-full bg-white px-2.5 py-0.5 text-[11.5px] text-navy shadow-sm ring-1 ring-navy/10 hover:ring-navy/30">
            + paragraf
          </button>
        )}
        <button type="button" onClick={onQuote} className="rounded-full bg-white px-2.5 py-0.5 text-[11.5px] text-maroon shadow-sm ring-1 ring-gold/40 hover:ring-gold">
          “ pindahkan kutipan ke sini
        </button>
      </span>
    </div>
  );
}
