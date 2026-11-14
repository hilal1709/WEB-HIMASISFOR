"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { animate, stagger } from "animejs";
import { BLOCK_KINDS } from "@/lib/program-kelas-cms/schema";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Field, MagnetButton, NumberField, Segmented, Sheet, TitleLines, Tokens } from "../fields";

const ROW = 34; // px per jam
const fmt = (h) => `${String(Math.floor(h)).padStart(2, "0")}.${h % 1 ? "30" : "00"}`;
const KIND_BOX = {
  kampus: "bg-maroon text-white",
  daring: "border border-dashed border-navy/50 bg-white text-navy",
  industri: "bg-gold/30 text-navy border-l-[3px] border-gold",
};

/**
 * Editor jadwal: kisi minggu interaktif per kelas.
 * Seret blok untuk memindah hari/jam, tarik tepi bawah untuk mengubah durasi (snap 30 menit),
 * klik slot kosong untuk menambah blok. Blok terpilih diedit di kartu samping.
 */
export function ScheduleEditor({ v, root, set, setRoot, path, ask }) {
  const classes = root.classes.items;
  const [ci, setCi] = useState(0);
  const cls = classes[Math.min(ci, classes.length - 1)];
  const idx = Math.min(ci, classes.length - 1);
  const [sel, setSel] = useState(null);
  const grid = useRef(null);
  const days = v.days;
  const start = v.start;
  const end = v.end;
  const hours = Array.from({ length: end - start }, (_, i) => start + i);
  const week = cls?.week ?? [];
  const setWeek = (next) => setRoot(`classes.items.${idx}.week`, next);

  useEffect(() => setSel(null), [ci]);
  useEffect(() => {
    if (!grid.current || prefersReducedMotion()) return;
    const a = animate(grid.current.querySelectorAll("[data-blk]"), { scaleY: [0.2, 1], opacity: [0, 1], duration: 450, delay: stagger(30), ease: "outBack(1.4)", onComplete: (x) => x.revert() });
    return () => a.revert?.();
  }, [ci]);

  if (!cls) return <Sheet title="Belum ada kelas">Tambahkan kelas dulu di bagian Kelas.</Sheet>;

  const colW = () => (grid.current ? (grid.current.clientWidth - 48) / 7 : 100);
  const snap = (h) => Math.round(h * 2) / 2;

  /** Seret: mode "move" geser blok, "resize" ubah tepi bawah. */
  const drag = (e, i, mode) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    setSel(i);
    const b0 = week[i];
    const sx = e.clientX;
    const sy = e.clientY;
    const w = colW();
    let moved = false;
    const move = (ev) => {
      const dh = snap((ev.clientY - sy) / ROW);
      const dd = Math.round((ev.clientX - sx) / w);
      if (dh || dd) moved = true;
      let next;
      if (mode === "resize") next = { ...b0, end: Math.min(end, Math.max(b0.start + 0.5, b0.end + dh)) };
      else {
        const len = b0.end - b0.start;
        const s = Math.min(end - len, Math.max(start, b0.start + dh));
        next = { ...b0, day: Math.min(6, Math.max(0, b0.day + dd)), start: s, end: s + len };
      }
      setWeek(week.map((x, j) => (j === i ? next : x)));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      document.body.style.userSelect = "";
      if (!moved) setSel(i);
    };
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const addAt = (day, e) => {
    if (week.length >= 16) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const s = Math.min(end - 1, Math.max(start, snap(start + (e.clientY - rect.top) / ROW - 0.25)));
    const next = [...week, { day, start: s, end: Math.min(end, s + 2), label: "Mata kuliah baru", kind: "kampus" }];
    setWeek(next);
    setSel(next.length - 1);
  };

  const b = sel != null ? week[sel] : null;
  const setB = (patch) => setWeek(week.map((x, j) => (j === sel ? { ...x, ...patch } : x)));
  const totalHours = week.reduce((n, x) => n + (x.end - x.start), 0);

  return (
    <div className="space-y-6">
      <Sheet
        title="Kisi minggu"
        hint="Seret blok untuk memindah · tarik tepi bawah untuk durasi · klik ruang kosong untuk menambah."
        aside={
          <Segmented value={cls.key} onChange={(k) => setCi(classes.findIndex((c) => c.key === k))} options={classes.map((c) => [c.key, c.short || c.name])} />
        }
      >
        <div className="flex flex-wrap items-center gap-4 text-[12px] text-text/55">
          {BLOCK_KINDS.map((k) => (
            <span key={k} className="flex items-center gap-1.5">
              <span className={cn("size-3 rounded-sm", KIND_BOX[k])} />
              {v.kinds[k]}
            </span>
          ))}
          <span className="ml-auto tabular-nums">
            <b className="font-serif text-[1.2rem] text-maroon">{totalHours}</b> jam · {week.length}/16 blok
          </span>
        </div>
        <div className="grid gap-5 xl:grid-cols-[1fr_260px]">
          <div className="overflow-x-auto">
            <div className="min-w-[620px] rounded-md border border-navy/10 bg-white">
              <div className="grid grid-cols-[48px_repeat(7,1fr)] border-b border-navy/10">
                <span />
                {days.map((d, i) => (
                  <span key={i} className={cn("py-2 text-center text-[11px] font-semibold uppercase tracking-[0.14em]", i >= 5 ? "text-maroon" : "text-text/50")}>
                    {d}
                  </span>
                ))}
              </div>
              <div ref={grid} className="relative grid grid-cols-[48px_repeat(7,1fr)]" style={{ height: (end - start) * ROW }}>
                <div className="pointer-events-none absolute inset-0">
                  {hours.map((h, i) => (
                    <div key={h} className="absolute inset-x-0 border-t border-navy/[0.07]" style={{ top: i * ROW }}>
                      <span className="absolute left-1.5 top-0.5 text-[10.5px] tabular-nums text-text/40">{fmt(h)}</span>
                    </div>
                  ))}
                </div>
                <span />
                {days.map((d, di) => (
                  <div key={di} onClick={(e) => e.target === e.currentTarget && addAt(di, e)} className={cn("relative cursor-copy border-l border-navy/[0.07] transition-colors hover:bg-gold/[0.06]", di >= 5 && "bg-maroon/[0.025]")}>
                    {week.map((x, i) =>
                      x.day !== di ? null : (
                        <div
                          key={i}
                          data-blk
                          role="button"
                          tabIndex={0}
                          aria-label={`${x.label} ${fmt(x.start)}–${fmt(x.end)}`}
                          onPointerDown={(e) => drag(e, i, "move")}
                          onKeyDown={(e) => e.key === "Enter" && setSel(i)}
                          className={cn(
                            "group/b absolute inset-x-1 origin-top cursor-grab touch-none overflow-hidden rounded-[5px] px-1.5 py-1 text-[11px] leading-snug shadow-[0_6px_10px_-8px_rgb(20_33_61/0.7)] outline-none transition-shadow active:cursor-grabbing",
                            KIND_BOX[x.kind] ?? KIND_BOX.kampus,
                            sel === i && "ring-2 ring-gold ring-offset-1"
                          )}
                          style={{ top: (x.start - start) * ROW + 1, height: Math.max(14, (x.end - x.start) * ROW - 2) }}
                        >
                          <span className="line-clamp-2 font-semibold">{x.label}</span>
                          <span className="block tabular-nums opacity-75">{fmt(x.start)}–{fmt(x.end)}</span>
                          <span onPointerDown={(e) => drag(e, i, "resize")} aria-hidden className="absolute inset-x-0 bottom-0 h-2 cursor-ns-resize opacity-0 transition-opacity group-hover/b:opacity-100">
                            <span className="mx-auto mt-0.5 block h-[3px] w-6 rounded-full bg-current opacity-60" />
                          </span>
                        </div>
                      )
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {b ? (
              <motion.div key={sel} initial={{ opacity: 0, y: 10, rotate: -1 }} animate={{ opacity: 1, y: 0, rotate: 0 }} exit={{ opacity: 0, y: -6 }} className="space-y-4 self-start rounded-md border border-navy/10 bg-cream/60 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-maroon">Blok terpilih</p>
                <Field label="Label" value={b.label} onChange={(x) => setB({ label: x })} max={60} />
                <Segmented size="sm" label="Jenis" value={b.kind} onChange={(x) => setB({ kind: x })} options={BLOCK_KINDS.map((k) => [k, v.kinds[k] || k])} />
                <Segmented size="sm" label="Hari" value={String(b.day)} onChange={(x) => setB({ day: Number(x) })} options={days.map((d, i) => [String(i), d])} />
                <div className="grid grid-cols-2 gap-2">
                  <NumberField label="Mulai" value={b.start} step={0.5} min={start} max={b.end - 0.5} onChange={(x) => setB({ start: x })} />
                  <NumberField label="Selesai" value={b.end} step={0.5} min={b.start + 0.5} max={end} onChange={(x) => setB({ end: x })} />
                </div>
                <div className="flex gap-2">
                  <MagnetButton onClick={() => (setWeek([...week, { ...b }]), setSel(week.length))} disabled={week.length >= 16}>
                    Gandakan
                  </MagnetButton>
                  <MagnetButton
                    tone="danger"
                    onClick={() =>
                      ask({
                        title: `Hapus blok "${b.label}"?`,
                        description: "Blok hilang dari jadwal kelas ini di draf.",
                        onConfirm: () => {
                          setWeek(week.filter((_, j) => j !== sel));
                          setSel(null);
                        },
                      })
                    }
                  >
                    Hapus
                  </MagnetButton>
                </div>
              </motion.div>
            ) : (
              <motion.p key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="self-start rounded-md border border-dashed border-navy/15 p-4 text-[12.5px] text-text/50">
                Pilih satu blok untuk mengubah label, jenis, atau jamnya.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </Sheet>

      <Sheet title="Teks bagian jadwal">
        <TitleLines path={path("title")} value={v.title} onChange={(x) => set("title", x)} tokens={["kelas"]} hint="Nama kelas aktif mengisi" />
        <Field path={path("body")} label="Pengantar" value={v.body} onChange={(x) => set("body", x)} max={240} multiline rows={2} />
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Label total jam" value={v.totalLabel} onChange={(x) => set("totalLabel", x)} max={40} hint="Enter = baris baru" multiline rows={2} />
          <Field label="Label ganti kelas" value={v.switchLabel} onChange={(x) => set("switchLabel", x)} max={30} />
          <Field label="Hari tanpa kuliah" value={v.emptyDay} onChange={(x) => set("emptyDay", x)} max={30} />
        </div>
      </Sheet>

      <Sheet title="Kalender" hint="Nama hari, rentang jam, dan legenda jenis blok.">
        <div className="grid grid-cols-7 gap-2">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <Field key={i} label={`Hari ${i + 1}`} value={days[i]} onChange={(x) => set("days", days.map((d, j) => (j === i ? x : d)))} max={6} />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField label="Jam awal" value={start} min={0} max={end - 1} onChange={(x) => set("start", x)} suffix=".00" />
          <NumberField label="Jam akhir" value={end} min={start + 1} max={24} onChange={(x) => set("end", x)} suffix=".00" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {BLOCK_KINDS.map((k) => (
            <Field key={k} label={`Legenda ${k}`} value={v.kinds[k]} onChange={(x) => set(`kinds.${k}`, x)} max={30} />
          ))}
        </div>
        <p className="text-[12px] text-text/45">
          Blok di luar rentang jam tidak tampil di kalender. Token judul: <Tokens list={["kelas"]} />
        </p>
      </Sheet>
    </div>
  );
}
