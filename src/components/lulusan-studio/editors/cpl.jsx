"use client";
import { useRef } from "react";
import { motion } from "motion/react";
import { animate, svg } from "animejs";
import { prefersReducedMotion } from "@/lib/motion";
import { CPL_ILLUSTRATIONS, LIMITS, fillCount } from "@/lib/profil-lulusan-cms/schema";
import { ILLUSTRATIONS } from "@/components/illustrations/line-illustrations";
import { cn } from "@/lib/utils";
import { AddButton, Field, Grip, IconBtn, Panel, Segmented, Switch, TitlePair, moveItem, useSortable } from "../fields";

/** Thumbnail ilustrasi yang tergambar ulang saat di-hover (anime.js). */
function IlluThumb({ k, label, active, onPick }) {
  const ref = useRef(null);
  const Illu = ILLUSTRATIONS[k];
  const redraw = () => {
    if (prefersReducedMotion() || !ref.current) return;
    const lines = ref.current.querySelectorAll("[data-line]");
    if (lines.length) animate(svg.createDrawable(lines), { draw: ["0 0", "0 1"], duration: 700, delay: (_, i) => i * 25, ease: "inOutCubic" });
  };
  return (
    <button
      ref={ref}
      type="button"
      title={label}
      onPointerEnter={redraw}
      onClick={onPick}
      className={cn("grid aspect-square place-items-center rounded-lg border bg-black/20 p-1.5 text-gold-soft/80 transition-[border-color,transform] hover:-translate-y-0.5", active ? "border-gold ring-2 ring-gold/30" : "border-white/10")}
    >
      {Illu && <Illu />}
    </button>
  );
}

/**
 * Capaian — papan ranah CPL. Kolom ranah bisa diseret; butir di dalamnya bisa diurutkan
 * atau dipindah ke ranah lain lewat menu "Pindah ke".
 */
export function CplEditor({ v, set, flag, ask, path }) {
  const cols = v.items;
  const sort = useSortable((a, b) => set("items", moveItem(cols, a, b)));

  const moveTo = (from, j, to) => {
    const t = cols[from].items[j];
    const next = cols.map((c, k) => (k === from ? { ...c, items: c.items.filter((_, x) => x !== j) } : k === to ? { ...c, items: [...c.items, t] } : c));
    set("items", next);
  };

  return (
    <div className="space-y-4">
      <Panel title="Kepala section">
        <TitlePair path="cpl" top={v.titleTop} accent={v.titleAccent} onTop={(x) => set("titleTop", x)} onAccent={(x) => set("titleAccent", x)} />
        <Field path={path("body")} label="Pengantar" value={v.body} onChange={(x) => set("body", x)} max={280} multiline rows={2} flag={flag("body")} />
        <div className="grid gap-4 sm:grid-cols-3">
          <Field path={path("kicker")} label="Awalan nomor" value={v.kicker} onChange={(x) => set("kicker", x)} max={16} hint={`Tampil: “${v.kicker} 01”`} />
          <Field path={path("moreLabel")} label="Tombol buka" value={v.moreLabel} onChange={(x) => set("moreLabel", x)} max={40} hint={`Tampil: “${fillCount(v.moreLabel, 2)}”`} />
          <Field path={path("lessLabel")} label="Tombol tutup" value={v.lessLabel} onChange={(x) => set("lessLabel", x)} max={20} />
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Segmented label="Butir terlihat sebelum dibuka" value={v.visible} onChange={(x) => set("visible", x)} options={[1, 2, 3, 4].map((n) => [n, String(n)])} />
          <Switch checked={v.sample} onChange={(x) => set("sample", x)} label="Tandai sebagai contoh" />
        </div>
      </Panel>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {cols.map((c, i) => (
          <motion.div key={c.key} layout transition={{ type: "spring", stiffness: 380, damping: 34 }} className={cn("min-w-0", c.wide && "md:col-span-2 xl:col-span-4")}>
            <div ref={sort.itemRef(i)} className={cn("flex h-full flex-col rounded-2xl border bg-white/[0.03] p-4", sort.drag?.over === i && sort.drag.from !== i ? "border-dashed border-gold/70" : "border-white/[0.08]")}>
              <div className="flex items-center gap-1">
                <Grip {...sort.handle(i, cols.length)} />
                <span className="font-serif text-[13px] tabular-nums text-gold/80">
                  {v.kicker} {String(i + 1).padStart(2, "0")}
                </span>
                <span className="ml-auto" />
                <IconBtn
                  label="Hapus ranah"
                  danger
                  onClick={() =>
                    ask({
                      title: `Hapus ranah “${c.title || i + 1}”?`,
                      description: `${c.items.length} butir capaian ikut terhapus dari draf.`,
                      confirmLabel: "Hapus ranah",
                      onConfirm: () => set("items", cols.filter((_, k) => k !== i)),
                    })
                  }
                >
                  ×
                </IconBtn>
              </div>
              <div className="mt-3 space-y-4">
                <Field path={path(`items.${i}.title`)} label="Nama ranah" value={c.title} onChange={(x) => set(`items.${i}.title`, x)} max={60} size="title" />
                <div className={cn("grid gap-1.5", c.wide ? "grid-cols-6 sm:grid-cols-12" : "grid-cols-6")}>
                  {CPL_ILLUSTRATIONS.map(([k, label]) => (
                    <IlluThumb key={k} k={k} label={label} active={c.illustration === k} onPick={() => set(`items.${i}.illustration`, k)} />
                  ))}
                </div>
                <Switch checked={c.wide} onChange={(x) => set(`items.${i}.wide`, x)} label="Tile lebar" hint="Melintang penuh & semua butir terbuka." />
                <ol className={cn("space-y-2", c.wide && "md:grid md:grid-cols-2 md:gap-3 md:space-y-0")}>
                  {c.items.map((t, j) => (
                    <li key={j} className="rounded-xl border border-white/[0.07] bg-black/20 p-2.5">
                      <div className="mb-1 flex items-center gap-1">
                        <span className="text-[11px] font-semibold tabular-nums text-gold">{String(j + 1).padStart(2, "0")}</span>
                        <span className="ml-auto" />
                        <IconBtn label="Naikkan" disabled={j === 0} onClick={() => set(`items.${i}.items`, moveItem(c.items, j, j - 1))}>
                          ↑
                        </IconBtn>
                        <IconBtn label="Turunkan" disabled={j === c.items.length - 1} onClick={() => set(`items.${i}.items`, moveItem(c.items, j, j + 1))}>
                          ↓
                        </IconBtn>
                        {cols.length > 1 && (
                          <select
                            aria-label="Pindah ke ranah lain"
                            value=""
                            onChange={(e) => e.target.value !== "" && moveTo(i, j, Number(e.target.value))}
                            className="h-8 max-w-[7rem] rounded-lg border border-white/10 bg-[#0d1830] px-1.5 text-[11.5px] text-white/70"
                          >
                            <option value="">Pindah ke…</option>
                            {cols.map((o, k) => k !== i && <option key={o.key} value={k}>{o.title || `Ranah ${k + 1}`}</option>)}
                          </select>
                        )}
                        <IconBtn label="Hapus butir" danger onClick={() => set(`items.${i}.items`, c.items.filter((_, x) => x !== j))}>
                          ×
                        </IconBtn>
                      </div>
                      <Field path={path(`items.${i}.items.${j}`)} label="Butir capaian" value={t} onChange={(x) => set(`items.${i}.items.${j}`, x)} max={260} multiline rows={2} flag={flag(`items.${i}.items.${j}`)} />
                    </li>
                  ))}
                </ol>
                <AddButton disabled={c.items.length >= LIMITS.cplItems} onClick={() => set(`items.${i}.items`, [...c.items, ""])}>
                  Butir capaian
                </AddButton>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <AddButton
        disabled={cols.length >= LIMITS.cpl}
        onClick={() => set("items", [...cols, { key: `ranah-${Date.now().toString(36)}`, title: "", illustration: "knowledge", wide: false, items: [] }])}
      >
        Ranah baru
      </AddButton>
    </div>
  );
}
