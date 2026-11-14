"use client";
import { useEffect, useRef, useState } from "react";
import { LayoutGroup, motion } from "motion/react";
import { prefersReducedMotion } from "@/lib/motion";
import { slugify } from "@/lib/kurikulum-content";
import { LordIcon } from "@/components/media/lord-icon";
import { cn } from "@/lib/utils";
import { getIn } from "./use-kartografer";
import { EmptyPlatformIllustration } from "./illustrations";

export const newId = () => `mk-${Math.random().toString(36).slice(2, 9)}`;

/** Slug unik dari nama; dibekukan saat dibuat agar tautan #rps- tidak berubah ketika nama diganti. */
export function uniqueSlug(name, taken) {
  const base = slugify(name) || "mata-kuliah";
  let s = base;
  let n = 2;
  while (taken.has(s)) s = `${base}-${n++}`;
  return s;
}

const rpsState = (c) => {
  const r = c.rps;
  if (!r) return { label: "Tanpa RPS", tone: "muted" };
  const weeks = r.minggu?.length ?? 0;
  if (r.pdf && weeks >= 16) return { label: "RPS lengkap", tone: "full" };
  if (r.pdf) return { label: "PDF", tone: "half" };
  return { label: weeks ? `${weeks}/16 mgg` : "Draf RPS", tone: "half" };
};

function SksCount({ value }) {
  const ref = useRef(null);
  const prev = useRef(value);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion() || prev.current === value) return void (el.textContent = value);
    const from = prev.current;
    prev.current = value;
    let raf;
    const t0 = performance.now();
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / 500);
      el.textContent = Math.round(from + (value - from) * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span ref={ref}>{value}</span>;
}

/** Satu karcis mata kuliah: sobekan berlubang di kiri, strip warna rumpun, status RPS bergaya cap. */
function Ticket({ c, rumpun, onOpen, onDragStart, onDragEnd, onDropBefore, dragging }) {
  const st = rpsState(c);
  return (
    <motion.li
      layout
      layoutId={c.id}
      transition={{ type: "spring", stiffness: 520, damping: 38 }}
      onDragOver={(e) => (e.preventDefault(), e.stopPropagation())}
      onDrop={(e) => (e.preventDefault(), e.stopPropagation(), onDropBefore())}
      className={cn("kf-ticket group relative", dragging && "opacity-40")}
    >
      <button
        type="button"
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onClick={onOpen}
        className="flex h-full w-full min-w-0 items-stretch overflow-hidden rounded-lg bg-white text-left shadow-[0_1px_0_rgb(20_33_61/0.08),0_10px_24px_-18px_rgb(20_33_61/0.5)] ring-1 ring-navy/10 transition-[transform,box-shadow] duration-300 ease-cinematic hover:-translate-y-0.5 hover:shadow-[0_20px_36px_-22px_rgb(20_33_61/0.6)] focus-visible:ring-2 focus-visible:ring-gold"
      >
        <span aria-hidden className="kf-perf relative w-3 shrink-0" style={{ background: c.slot ? "var(--cream-2)" : rumpun?.css ?? "var(--navy)" }} />
        <span className="flex min-w-0 flex-1 flex-col gap-1 px-3 py-2.5">
          <span className="flex items-start justify-between gap-2">
            <span className={cn("line-clamp-2 text-[13.5px] font-semibold leading-snug", c.slot ? "text-navy/60 italic" : "text-navy")}>{c.nama || "Tanpa nama"}</span>
            <span className="shrink-0 font-serif text-[15px] tabular-nums text-navy">{c.sks ?? "–"}</span>
          </span>
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-text/55">
            {c.slot ? <span>Slot pilihan</span> : <span className="font-mono">{c.kode || "kode —"}</span>}
            {!c.slot && (
              <span className={cn("rounded-sm border px-1 py-px text-[10px] font-semibold uppercase tracking-wide", st.tone === "full" ? "border-success/40 text-success" : st.tone === "half" ? "border-gold text-navy" : "border-navy/15 text-text/40")}>{st.label}</span>
            )}
          </span>
        </span>
        <span aria-hidden className="grid w-6 shrink-0 cursor-grab place-items-center text-navy/25 transition-colors group-hover:text-navy/60 active:cursor-grabbing">⋮⋮</span>
      </button>
    </motion.li>
  );
}

/**
 * Papan jadwal: tiap baris = satu kontainer (semester atau bidang pilihan) berisi karcis mata kuliah.
 * Karcis bisa diseret antar baris (HTML5 DnD) dan mendarat dengan pegas (layoutId). Klik karcis → Lembar RPS.
 * `lanes` = [{ path, title, sub, number, allowSlot, footer }]
 */
export function Board({ value, lanes, rumpunByKey, update, onOpen, onAddCourse, onAddSlot, onRemoveLane, laneActions, emptyText }) {
  const [drag, setDrag] = useState(null); // { path, index }
  const [over, setOver] = useState(null);

  const moveTo = (toPath, toIndex) => {
    if (!drag) return;
    const fromList = [...(getIn(value, drag.path) ?? [])];
    const item = fromList[drag.index];
    if (!item) return;
    const lane = lanes.find((l) => l.path === toPath);
    if (item.slot && !lane?.allowSlot) return;
    if (drag.path === toPath) {
      fromList.splice(drag.index, 1);
      const at = toIndex > drag.index ? toIndex - 1 : toIndex;
      fromList.splice(at < 0 ? fromList.length : at, 0, item);
      update(toPath, fromList);
    } else {
      fromList.splice(drag.index, 1);
      const toList = [...(getIn(value, toPath) ?? [])];
      toList.splice(toIndex < 0 ? toList.length : toIndex, 0, item);
      // dua perubahan dalam satu langkah urungkan
      update(drag.path, fromList);
      update(toPath, toList);
    }
    setDrag(null);
    setOver(null);
  };

  return (
    <LayoutGroup>
      <div className="space-y-3">
        {lanes.map((lane) => {
          const list = getIn(value, lane.path) ?? [];
          const sks = list.reduce((t, c) => t + (c.sks ?? 0), 0);
          const isOver = over === lane.path;
          return (
            <section
              key={lane.path}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(lane.path);
              }}
              onDragLeave={(e) => !e.currentTarget.contains(e.relatedTarget) && setOver(null)}
              onDrop={(e) => {
                e.preventDefault();
                moveTo(lane.path, -1);
              }}
              className={cn(
                "kf-lane grid gap-4 rounded-2xl border bg-paper/85 p-3 backdrop-blur-sm transition-[border-color,box-shadow,background-color] duration-300 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:p-4",
                isOver ? "border-gold bg-gold/[0.06] shadow-[0_0_0_4px_rgb(201_162_39/0.15)]" : "border-navy/10"
              )}
            >
              <header className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-1">
                <span className="font-serif text-[2.4rem] leading-none tabular-nums text-navy">{lane.number}</span>
                <div className="min-w-0 flex-1 sm:w-full">
                  <p className="truncate text-[12.5px] font-semibold text-navy">{lane.title}</p>
                  <p className="text-[11.5px] text-text/55">
                    <span className="font-semibold tabular-nums text-navy">
                      <SksCount value={sks} />
                    </span>{" "}
                    SKS · {list.filter((c) => !c.slot).length} mk
                  </p>
                  <span aria-hidden className="mt-1.5 block h-1 w-full overflow-hidden rounded-full bg-cream-2">
                    <span className="block h-full rounded-full bg-maroon transition-[width] duration-700 ease-cinematic" style={{ width: `${Math.min(100, (sks / 24) * 100)}%` }} />
                  </span>
                </div>
                {laneActions?.(lane)}
              </header>

              <ol className="grid grid-cols-[repeat(auto-fill,minmax(13.5rem,1fr))] gap-2">
                {list.map((c, i) => (
                  <Ticket
                    key={c.id ?? i}
                    c={c}
                    rumpun={rumpunByKey[c.rumpun]}
                    dragging={drag?.path === lane.path && drag.index === i}
                    onOpen={() => onOpen(`${lane.path}.${i}`)}
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", c.id ?? String(i));
                      setDrag({ path: lane.path, index: i });
                    }}
                    onDragEnd={() => (setDrag(null), setOver(null))}
                    onDropBefore={() => moveTo(lane.path, i)}
                  />
                ))}
                {!list.length && (
                  <li className="col-span-full flex items-center gap-4 rounded-lg border border-dashed border-navy/15 px-4 py-3">
                    <EmptyPlatformIllustration className="h-14 w-28 shrink-0" />
                    <p className="text-[13px] text-text/55">{emptyText}</p>
                  </li>
                )}
                <li className="flex gap-2">
                  <button type="button" onClick={() => onAddCourse(lane.path)} className="kf-ghost flex min-h-[62px] flex-1 items-center justify-center gap-2 rounded-lg border-2 border-dashed border-navy/15 text-[12.5px] font-semibold text-navy/55 transition-colors hover:border-maroon hover:text-maroon">
                    <LordIcon name="plus-circle" size={20} target=".kf-ghost" colors="primary:#6e1423,secondary:#c9a227" />
                    Mata kuliah
                  </button>
                  {lane.allowSlot && (
                    <button type="button" onClick={() => onAddSlot(lane.path)} className="flex min-h-[62px] items-center rounded-lg border-2 border-dashed border-navy/15 px-3 text-[12px] text-navy/50 transition-colors hover:border-gold hover:text-navy">
                      + Slot
                    </button>
                  )}
                </li>
              </ol>
            </section>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
