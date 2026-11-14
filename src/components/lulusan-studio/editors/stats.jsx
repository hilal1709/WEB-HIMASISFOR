"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { animate } from "animejs";
import { prefersReducedMotion } from "@/lib/motion";
import { LIMITS } from "@/lib/profil-lulusan-cms/schema";
import { cn } from "@/lib/utils";
import { AddButton, Field, Grip, IconBtn, Panel, Switch, moveItem, useSortable } from "../fields";

const MAX = 1000000;
/** Langkah seret menyesuaikan besar angka: kecil halus, besar cepat. */
const stepFor = (n) => (n < 20 ? 1 : n < 200 ? 1 : n < 2000 ? 10 : 100);

/**
 * Dial angka: seret naik/turun pada angka (atau gulir roda, atau panah) untuk mengubah nilai.
 * Angka menghitung ke nilai baru (anime.js); ketik langsung juga bisa.
 */
function Dial({ value, onChange, suffix }) {
  const num = useRef(null);
  const shown = useRef(value);
  const [editing, setEditing] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const el = num.current;
    if (!el) return;
    if (prefersReducedMotion() || dragging) {
      shown.current = value;
      el.textContent = value.toLocaleString("id-ID");
      return;
    }
    const s = { v: shown.current };
    const a = animate(s, { v: value, duration: 600, ease: "outExpo", onUpdate: () => (el.textContent = Math.round(s.v).toLocaleString("id-ID")) });
    shown.current = value;
    return () => a.pause?.();
  }, [value, dragging, editing]);

  const clamp = (x) => Math.max(0, Math.min(MAX, Math.round(x)));
  const down = (e) => {
    if (editing || e.button !== 0) return;
    e.preventDefault();
    const sy = e.clientY;
    const start = value;
    let moved = false;
    setDragging(true);
    const move = (ev) => {
      const dy = sy - ev.clientY;
      if (Math.abs(dy) > 3) moved = true;
      onChange(clamp(start + Math.round(dy / 6) * stepFor(start)));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      setDragging(false);
      document.body.style.cursor = "";
      if (!moved) setEditing(true);
    };
    document.body.style.cursor = "ns-resize";
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <div className="relative">
      {editing ? (
        <input
          autoFocus
          inputMode="numeric"
          defaultValue={value}
          onBlur={(e) => (onChange(clamp(Number(e.target.value.replace(/\D/g, "")) || 0)), setEditing(false))}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          className="w-full bg-transparent font-serif text-[3rem] leading-none tabular-nums text-white focus:outline-none"
        />
      ) : (
        <button
          type="button"
          role="spinbutton"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={MAX}
          aria-label="Nilai angka — seret naik/turun, gulir, atau panah; klik untuk mengetik"
          onPointerDown={down}
          onWheel={(e) => document.activeElement === e.currentTarget && onChange(clamp(value + (e.deltaY < 0 ? 1 : -1) * stepFor(value)))}
          onKeyDown={(e) => {
            const d = { ArrowUp: 1, ArrowDown: -1, PageUp: 10, PageDown: -10 }[e.key];
            if (d) {
              e.preventDefault();
              onChange(clamp(value + d * stepFor(value)));
            } else if (e.key === "Enter") setEditing(true);
          }}
          className={cn("group flex w-full cursor-ns-resize touch-none items-baseline gap-1 text-left font-serif text-[3rem] leading-none tabular-nums text-white outline-none", dragging && "text-gold-soft")}
        >
          <span ref={num}>{value.toLocaleString("id-ID")}</span>
          <span className="text-gold">{suffix}</span>
          <span aria-hidden className="ml-auto flex flex-col text-[10px] text-white/30 transition-colors group-hover:text-gold-soft">
            <span>▲</span>
            <span>▼</span>
          </span>
        </button>
      )}
    </div>
  );
}

/** Angka — pita sorotan tracer study. */
export function StatsEditor({ v, set, ask, path }) {
  const items = v.items;
  const sort = useSortable((a, b) => set("items", moveItem(items, a, b)));
  return (
    <div className="space-y-4">
      <Panel title="Pita angka" hint="Seret angka ke atas/bawah untuk mengubah, klik untuk mengetik.">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <Field path={path("label")} label="Label pembaca layar" value={v.label} onChange={(x) => set("label", x)} max={60} />
          <Switch checked={v.sample} onChange={(x) => set("sample", x)} label="Tandai sebagai contoh" />
        </div>
      </Panel>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((s, i) => (
          <motion.div key={i} layout transition={{ type: "spring", stiffness: 380, damping: 34 }}>
            <div ref={sort.itemRef(i)} className={cn("rounded-2xl border bg-white/[0.03] p-4", sort.drag?.over === i && sort.drag.from !== i ? "border-dashed border-gold/70" : "border-white/[0.08]")}>
              <div className="flex items-center">
                <span className="block h-[3px] w-10 bg-gold" />
                <span className="ml-auto flex">
                  <Grip {...sort.handle(i, items.length)} />
                  <IconBtn label="Hapus angka" danger onClick={() => ask({ title: `Hapus angka “${s.label || i + 1}”?`, confirmLabel: "Hapus", onConfirm: () => set("items", items.filter((_, k) => k !== i)) })}>
                    ×
                  </IconBtn>
                </span>
              </div>
              <div className="mt-4">
                <Dial value={s.value} suffix={s.suffix} onChange={(x) => set(`items.${i}.value`, x)} />
              </div>
              <div className="mt-4 grid grid-cols-[5rem_1fr] gap-2">
                <Field path={path(`items.${i}.suffix`)} label="Akhiran" value={s.suffix} onChange={(x) => set(`items.${i}.suffix`, x)} max={10} placeholder="%" />
                <Field path={path(`items.${i}.label`)} label="Keterangan" value={s.label} onChange={(x) => set(`items.${i}.label`, x)} max={80} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <AddButton disabled={items.length >= LIMITS.stats} onClick={() => set("items", [...items, { value: 0, suffix: "", label: "" }])}>
        Angka baru
      </AddButton>
    </div>
  );
}
