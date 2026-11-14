"use client";
import { useLayoutEffect, useRef, useState } from "react";
import { Flip } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { LIMITS } from "@/lib/visi-misi-cms/schema";
import { GraduatePathIllustration } from "@/components/illustrations/line-illustrations";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Href, Line, Mini, Panel, PosePicker, Toggle } from "../fields";

function useFlip(ref) {
  const state = useRef(null);
  useLayoutEffect(() => {
    if (!state.current) return;
    Flip.from(state.current, { duration: 0.55, ease: "expo.out" });
    state.current = null;
  });
  return () => {
    if (ref.current && !prefersReducedMotion()) state.current = Flip.getState(ref.current.querySelectorAll("[data-flip-id]"));
  };
}

/* ───────────── Perjalanan: timeline simpul tahun ───────────── */
export function RoadmapScene({ value: r, set, flags }) {
  const items = r.items ?? [];
  const line = useRef(null);
  const capture = useFlip(line);
  const [open, setOpen] = useState(null);

  const commit = (next) => (capture(), set("roadmap.items", next));
  const settle = () => {
    const sorted = [...items].sort((a, b) => (Number(a.year) || 9999) - (Number(b.year) || 9999));
    if (sorted.some((it, j) => it !== items[j])) commit(sorted);
  };
  const setItem = (i, k, v) => {
    let next = items.map((it, j) => (j === i ? { ...it, [k]: v } : it));
    if (k === "goal" && v) next = next.map((it, j) => (j === i ? it : { ...it, goal: false }));
    set("roadmap.items", next);
  };
  const add = () => {
    if (items.length >= LIMITS.roadmap) return;
    const last = Number(items.at(-1)?.year) || new Date().getFullYear();
    commit([...items, { year: String(last + 1), title: "", body: "", sample: true, goal: false }]);
    setOpen(items.length);
  };

  return (
    <div className="space-y-6">
      <Panel title="Kepala section">
        <div className="grid gap-5 md:grid-cols-2">
          <Line path="roadmap.titleTop" label="Judul" value={r.titleTop} max={60} onChange={(v) => set("roadmap.titleTop", v)} />
          <Line path="roadmap.titleAccent" label="Aksen miring" value={r.titleAccent} max={60} onChange={(v) => set("roadmap.titleAccent", v)} />
        </div>
        <Line path="roadmap.body" label="Pengantar" value={r.body} max={240} flag={flags("roadmap.body")} onChange={(v) => set("roadmap.body", v)} />
        <div className="grid gap-5 sm:grid-cols-3">
          <Line path="roadmap.sampleLabel" label="Label contoh" value={r.sampleLabel} max={30} size="sm" onChange={(v) => set("roadmap.sampleLabel", v)} />
          <Line path="roadmap.prevLabel" label="Tombol mundur (aksesibel)" value={r.prevLabel} max={30} size="sm" onChange={(v) => set("roadmap.prevLabel", v)} />
          <Line path="roadmap.nextLabel" label="Tombol maju (aksesibel)" value={r.nextLabel} max={30} size="sm" onChange={(v) => set("roadmap.nextLabel", v)} />
        </div>
      </Panel>

      <div className="rounded-2xl bg-white p-5 ring-1 ring-navy/[0.07] sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-navy/50">Klik simpul untuk mengubah · urut otomatis per tahun</p>
          <span className="text-[12px] text-text/45">
            {items.length}/{LIMITS.roadmap}
          </span>
        </div>
        {items.length === 0 ? (
          <div className="grid place-items-center py-10 text-center">
            <div className="w-64 text-navy">
              <GraduatePathIllustration className="h-auto w-full text-navy" />
            </div>
            <p className="mt-3 text-[13.5px] text-text/55">Belum ada tonggak — section perjalanan disembunyikan.</p>
          </div>
        ) : (
          <div className="relative mt-8 overflow-x-auto pb-4">
            <ol ref={line} className="relative flex min-w-max gap-3 px-2">
              <span aria-hidden className="absolute inset-x-6 top-[22px] h-[2px] bg-gold/50" />
              {items.map((it, i) => (
                <li key={i} data-flip-id={`ms-${it.year}-${it.title}`} className="relative w-44 shrink-0">
                  <Popover
                    open={open === i}
                    onOpenChange={(o) => {
                      if (!o) settle();
                      setOpen(o ? i : null);
                    }}
                  >
                    <PopoverTrigger asChild>
                      <button type="button" className="group flex w-full flex-col items-start text-left focus-visible:outline-none">
                        <span className={cn("relative z-10 ml-3 grid size-[46px] place-items-center rounded-full border-2 bg-white transition-transform duration-500 ease-cinematic group-hover:scale-110", it.goal ? "border-maroon" : "border-gold", open === i && "scale-110 ring-4 ring-gold/25")}>
                          <span className={cn("size-3 rounded-full", it.goal ? "bg-maroon" : "bg-gold")} />
                        </span>
                        <span className={cn("mt-4 block w-full rounded-lg border p-4 transition-[transform,box-shadow] duration-500 ease-cinematic group-hover:-translate-y-1", it.goal ? "border-navy bg-navy text-white" : "border-line bg-cream/50", flags(`roadmap.items.${i}.body`) && "ring-2 ring-[#e86a7c]")}>
                          <span className={cn("block font-serif text-[1.8rem] leading-none tabular-nums", it.goal ? "text-gold-soft" : "text-navy")}>{it.year || "????"}</span>
                          <span className={cn("mt-2 block line-clamp-2 text-[13.5px] font-semibold", it.goal ? "text-white" : "text-navy")}>{it.title || "Tanpa judul"}</span>
                          {it.sample && <span className="mt-2 block text-[10.5px] opacity-50">contoh</span>}
                        </span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-80 space-y-4 p-4">
                      <div className="grid grid-cols-[90px_1fr] gap-3">
                        <Line
                          path={`roadmap.items.${i}.year`}
                          label="Tahun"
                          value={it.year}
                          max={4}
                          onChange={(v) => setItem(i, "year", v.replace(/\D/g, "").slice(0, 4))}
                          inputClassName="font-serif text-xl tabular-nums"
                          flag={it.year && it.year.length !== 4}
                        />
                        <Line path={`roadmap.items.${i}.title`} label="Judul" value={it.title} max={80} onChange={(v) => setItem(i, "title", v)} />
                      </div>
                      <Line path={`roadmap.items.${i}.body`} label="Keterangan" value={it.body} max={240} multiline rows={3} onChange={(v) => setItem(i, "body", v)} />
                      <Toggle checked={it.goal} onChange={(v) => setItem(i, "goal", v)} label="Jadikan tujuan" hint="Kartu navy & titik berdenyut. Hanya satu." />
                      <Toggle checked={it.sample} onChange={(v) => setItem(i, "sample", v)} label="Data contoh" hint="Diberi label kecil sampai dikonfirmasi." />
                      <div className="flex items-center justify-between border-t border-line pt-3">
                        <button type="button" onClick={() => (commit(items.filter((_, j) => j !== i)), setOpen(null))} className="text-[13px] text-maroon hover:underline">
                          Hapus tonggak
                        </button>
                        <button type="button" onClick={() => (settle(), setOpen(null))} className="rounded-md bg-navy px-3 py-1.5 text-[13px] font-semibold text-white">
                          Selesai
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </li>
              ))}
              {items.length < LIMITS.roadmap && (
                <li className="relative w-32 shrink-0">
                  <button type="button" onClick={add} className="group flex flex-col items-start">
                    <span className="relative z-10 ml-3 grid size-[46px] place-items-center rounded-full border-2 border-dashed border-maroon/50 bg-white text-xl text-maroon transition-transform duration-300 group-hover:rotate-90">+</span>
                    <span className="mt-4 text-[13px] font-medium text-maroon">Tambah tonggak</span>
                  </button>
                </li>
              )}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────── Langkah berikutnya: halte rute ───────────── */
export function ClosingScene({ value: c, set, flags }) {
  const stops = c.stops ?? [];
  const list = useRef(null);
  const capture = useFlip(list);
  const commit = (next) => (capture(), set("closing.stops", next));
  const setStop = (i, k, v) => {
    let next = stops.map((s, j) => (j === i ? { ...s, [k]: v } : s));
    if (k === "final" && v) next = next.map((s, j) => (j === i ? s : { ...s, final: false }));
    set("closing.stops", next);
  };
  const move = (i, d) => {
    const to = i + d;
    if (to < 0 || to >= stops.length) return;
    const next = [...stops];
    [next[i], next[to]] = [next[to], next[i]];
    commit(next);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Panel title="Kepala section">
          <div className="grid gap-5 sm:grid-cols-2">
            <Line path="closing.titleTop" label="Judul" value={c.titleTop} max={60} onChange={(v) => set("closing.titleTop", v)} />
            <Line path="closing.titleAccent" label="Aksen miring" value={c.titleAccent} max={60} onChange={(v) => set("closing.titleAccent", v)} />
          </div>
        </Panel>
        <Panel title="Elvo di penutup">
          <PosePicker path="closing.mascot" value={c.mascot} onChange={(v) => set("closing.mascot", v)} />
        </Panel>
      </div>

      <div className="relative">
        <span aria-hidden className="absolute bottom-6 left-[19px] top-6 border-l-2 border-dashed border-gold/70" />
        <ol ref={list} className="relative space-y-4">
          {stops.map((s, i) => (
            <li key={i} data-flip-id={`stop-${s.title}-${s.href}`} className="relative grid grid-cols-[40px_1fr] gap-4">
              <button
                type="button"
                onClick={() => setStop(i, "final", !s.final)}
                title={s.final ? "Halte akhir (disorot maroon)" : "Jadikan halte akhir"}
                className={cn("relative z-10 mt-5 grid size-10 place-items-center rounded-full border-2 text-[12px] font-semibold transition-colors", s.final ? "border-maroon bg-maroon text-white ring-4 ring-maroon/15" : "border-navy bg-cream text-navy hover:bg-white")}
              >
                {i + 1}
              </button>
              <div className={cn("rounded-xl p-5 ring-1 transition-colors", s.final ? "bg-maroon text-white ring-maroon" : "bg-white ring-navy/[0.08]", flags(`closing.stops.${i}.body`) && "ring-2 ring-[#e86a7c]")}>
                <div className="grid gap-4 md:grid-cols-[140px_1fr_1fr]">
                  <Line tone={s.final ? "dark" : "light"} path={`closing.stops.${i}.kicker`} label="Kicker" value={s.kicker} max={30} size="sm" onChange={(v) => setStop(i, "kicker", v)} />
                  <Line tone={s.final ? "dark" : "light"} path={`closing.stops.${i}.title`} label="Judul" value={s.title} max={60} onChange={(v) => setStop(i, "title", v)} inputClassName="font-serif text-[1.15rem]" />
                  <Href tone={s.final ? "dark" : "light"} path={`closing.stops.${i}.href`} value={s.href} onChange={(v) => setStop(i, "href", v)} />
                </div>
                <Line tone={s.final ? "dark" : "light"} path={`closing.stops.${i}.body`} label="Keterangan" value={s.body} max={160} size="sm" onChange={(v) => setStop(i, "body", v)} className="mt-4" />
                <div className="mt-4 flex items-center justify-end gap-2">
                  <Mini label="Naikkan" disabled={i === 0} onClick={() => move(i, -1)} className={s.final ? "text-white ring-white/30" : undefined}>↑</Mini>
                  <Mini label="Turunkan" disabled={i === stops.length - 1} onClick={() => move(i, 1)} className={s.final ? "text-white ring-white/30" : undefined}>↓</Mini>
                  <Mini danger label="Hapus halte" onClick={() => commit(stops.filter((_, j) => j !== i))} className={s.final ? "text-white ring-white/30" : undefined}>×</Mini>
                </div>
              </div>
            </li>
          ))}
        </ol>
        {stops.length < LIMITS.stops && (
          <button
            type="button"
            onClick={() => commit([...stops, { kicker: "", title: "", body: "", href: "", final: false }])}
            className="relative ml-14 mt-4 rounded-lg border border-dashed border-maroon/40 px-4 py-2.5 text-[13.5px] font-medium text-maroon hover:bg-maroon/5"
          >
            + Tambah halte ({stops.length}/{LIMITS.stops})
          </button>
        )}
        {stops.length === 0 && <p className="ml-14 mt-2 text-[13px] text-text/50">Tanpa halte, section “Langkah berikutnya” disembunyikan.</p>}
      </div>
    </div>
  );
}
