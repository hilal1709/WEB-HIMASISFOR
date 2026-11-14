"use client";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { animate, svg, stagger } from "animejs";
import { EyeOff, Maximize2, Minus, Plus, UserPlus } from "lucide-react";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { findRoot, isDescendant } from "@/lib/struktur-cms/schema";
import { initials } from "@/lib/struktur-content";
import { cn } from "@/lib/utils";

const NW = 212;
const NH = 84;
const GX = 28;
const GY = 92;
const LANE = 76;

/**
 * Tata letak pohon rapi: lebar tiap subpohon = jumlah lebar anak, induk di tengah anaknya.
 * Staf yang melapor ke puncak digambar di jalur samping kanan puncak (seperti halaman publik).
 */
export function layout(people) {
  const root = findRoot(people);
  if (!root) return { nodes: [], edges: [], bounds: { x: 0, y: 0, w: NW, h: NH }, root: null };
  const isLane = (p) => p.reportsTo === root.key && p.group === "staff";
  const kids = (k) => people.filter((p) => p.reportsTo === k && p.key !== root.key && !isLane(p));
  const widthMemo = new Map();
  const width = (k, seen = new Set()) => {
    if (widthMemo.has(k)) return widthMemo.get(k);
    if (seen.has(k)) return NW;
    seen.add(k);
    const ch = kids(k);
    const w = ch.length ? Math.max(NW, ch.reduce((s, c) => s + width(c.key, seen), 0) + GX * (ch.length - 1)) : NW;
    widthMemo.set(k, w);
    return w;
  };
  const pos = new Map();
  const place = (k, left, depth) => {
    if (pos.has(k)) return;
    const w = width(k);
    pos.set(k, { x: left + w / 2 - NW / 2, y: depth * (NH + GY), depth });
    const ch = kids(k);
    const total = ch.reduce((s, c) => s + width(c.key), 0) + GX * Math.max(0, ch.length - 1);
    let x = left + (w - total) / 2;
    for (const c of ch) {
      place(c.key, x, depth + 1);
      x += width(c.key) + GX;
    }
  };
  place(root.key, 0, 0);
  const r = pos.get(root.key);
  people.filter(isLane).forEach((p, i) => pos.set(p.key, { x: r.x + NW + LANE + i * (NW + GX), y: 0, depth: 0, lane: true }));
  // pengaman: simpul yang tidak terjangkau diletakkan di baris terbawah
  const maxDepth = Math.max(0, ...[...pos.values()].map((v) => v.depth));
  let orphanX = 0;
  people.forEach((p) => {
    if (pos.has(p.key)) return;
    pos.set(p.key, { x: orphanX, y: (maxDepth + 1) * (NH + GY), depth: maxDepth + 1 });
    orphanX += NW + GX;
  });

  const nodes = people.map((p) => ({ p, ...pos.get(p.key), root: p.key === root.key }));
  const edges = [];
  for (const n of nodes) {
    if (n.root) continue;
    const par = pos.get(n.p.reportsTo);
    if (!par) continue;
    if (n.lane) {
      edges.push({ key: n.p.key, lane: true, d: `M${par.x + NW} ${NH / 2}H${n.x}` });
    } else {
      const midY = par.y + NH + GY / 2;
      edges.push({ key: n.p.key, d: `M${par.x + NW / 2} ${par.y + NH}V${midY}H${n.x + NW / 2}V${n.y}` });
    }
  }
  const xs = nodes.map((n) => n.x);
  const ys = nodes.map((n) => n.y);
  const minX = Math.min(...xs);
  const bounds = { x: minX, y: 0, w: Math.max(...xs) + NW - minX, h: Math.max(...ys) + NH };
  return { nodes, edges, bounds, root, lane: { x: r.x + NW + LANE + people.filter(isLane).length * (NW + GX), y: 0 } };
}

/**
 * Kanvas bagan: geser (seret latar / gulir), zoom (Ctrl + gulir / tombol), seret kartu ke kartu lain
 * untuk mengganti atasan, atau ke jalur samping untuk menjadikannya staf. Simpul baru muncul
 * dengan pegas (GSAP), garis tergambar saat pertama dimuat (anime.js).
 */
export const Canvas = forwardRef(function Canvas({ people, selected, onSelect, onAdd, onMove, issues, divisions = [] }, api) {
  const divByKey = useMemo(() => Object.fromEntries(divisions.map((d) => [d.key, d])), [divisions]);
  const wrap = useRef(null);
  const stage = useRef(null);
  const [view, setView] = useState({ x: 0, y: 60, k: 1 });
  const viewRef = useRef(view);
  viewRef.current = view;
  const [drag, setDrag] = useState(null); // { key, cx, cy, target, valid }
  const dragRef = useRef(null);
  const g = useMemo(() => layout(people), [people]);
  const seen = useRef(null);
  const flagged = useMemo(() => new Set((issues ?? []).map((i) => i.key)), [issues]);

  const fit = useCallback(
    (animated = true) => {
      const el = wrap.current;
      if (!el) return;
      const { width: W, height: H } = el.getBoundingClientRect();
      const b = g.bounds;
      const k = Math.max(0.35, Math.min(1, (W - 96) / b.w, (H - 160) / b.h));
      const next = { k, x: (W - b.w * k) / 2 - b.x * k, y: Math.max(48, (H - b.h * k) / 2 - 20) };
      if (!animated || prefersReducedMotion()) return setView(next);
      const from = { ...viewRef.current };
      gsap.to(from, { ...next, duration: 0.7, ease: "expo.out", onUpdate: () => setView({ ...from }) });
    },
    [g]
  );

  /** Pusatkan satu orang (dipakai saat memilih dari luar kanvas). */
  const focus = useCallback(
    (key) => {
      const n = g.nodes.find((x) => x.p.key === key);
      const el = wrap.current;
      if (!n || !el) return;
      const { width: W, height: H } = el.getBoundingClientRect();
      const k = viewRef.current.k;
      const target = { k, x: W / 2 - (n.x + NW / 2) * k, y: H / 2.6 - (n.y + NH / 2) * k };
      if (prefersReducedMotion()) return setView(target);
      const from = { ...viewRef.current };
      gsap.to(from, { ...target, duration: 0.6, ease: "expo.out", onUpdate: () => setView({ ...from }) });
    },
    [g]
  );

  useImperativeHandle(api, () => ({ fit, focus }), [fit, focus]);

  const zoomBy = (f, cx, cy) => {
    const el = wrap.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = cx ?? rect.width / 2;
    const py = cy ?? rect.height / 2;
    setView((v) => {
      const k = Math.max(0.3, Math.min(1.8, v.k * f));
      return { k, x: px - ((px - v.x) * k) / v.k, y: py - ((py - v.y) * k) / v.k };
    });
  };

  // gulir = geser, Ctrl/⌘ + gulir = zoom di posisi kursor
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        const r = el.getBoundingClientRect();
        zoomBy(Math.exp(-e.deltaY * 0.0022), e.clientX - r.left, e.clientY - r.top);
      } else setView((v) => ({ ...v, x: v.x - e.deltaX, y: v.y - e.deltaY }));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // muat pertama: paskan + gambar garis + simpul bertahap
  useLayoutEffect(() => {
    if (seen.current) return;
    seen.current = new Set(people.map((p) => p.key));
    fit(false);
    const el = stage.current;
    if (!el || prefersReducedMotion()) return;
    animate(svg.createDrawable(el.querySelectorAll("[data-edge]")), { draw: ["0 0", "0 1"], duration: 900, delay: stagger(40, { start: 250 }), ease: "inOutCubic" });
    gsap.from(el.querySelectorAll("[data-node-card]"), { y: 16, opacity: 0, scale: 0.94, duration: 0.7, stagger: 0.04, ease: "expo.out" });
  }, [people, fit]);

  // simpul baru: muncul dengan pegas
  useLayoutEffect(() => {
    if (!seen.current) return;
    const fresh = people.filter((p) => !seen.current.has(p.key));
    people.forEach((p) => seen.current.add(p.key));
    if (!fresh.length || prefersReducedMotion()) return;
    fresh.forEach((p) => {
      const el = stage.current?.querySelector(`[data-node="${CSS.escape(p.key)}"] [data-node-card]`);
      if (el) gsap.fromTo(el, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.9, ease: "elastic.out(1, 0.6)" });
    });
  }, [people]);

  /* ── geser latar ── */
  const panStart = (e) => {
    if (e.button !== 0 || e.target.closest("[data-node],[data-ui]")) return;
    const el = wrap.current;
    const start = { x: e.clientX, y: e.clientY, v: viewRef.current };
    let moved = false;
    el.setPointerCapture(e.pointerId);
    el.dataset.panning = "1";
    const move = (ev) => {
      if (Math.hypot(ev.clientX - start.x, ev.clientY - start.y) > 3) moved = true;
      setView({ ...start.v, x: start.v.x + ev.clientX - start.x, y: start.v.y + ev.clientY - start.y });
    };
    const up = () => {
      delete el.dataset.panning;
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      if (!moved) onSelect(null);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
  };

  /* ── seret kartu → ganti atasan ── */
  const validTarget = (key, target) => {
    if (!target) return false;
    if (target === "__staff") return key !== g.root?.key;
    return target !== key && !isDescendant(people, target, key);
  };
  const nodeDown = (e, key) => {
    if (e.button !== 0 || e.target.closest("[data-add]")) return;
    const sx = e.clientX;
    const sy = e.clientY;
    let dragging = false;
    const move = (ev) => {
      if (!dragging && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 6) return;
      if (key === g.root?.key) return; // puncak tidak diseret
      dragging = true;
      const hit = document.elementFromPoint(ev.clientX, ev.clientY)?.closest("[data-drop]")?.dataset.drop ?? null;
      const target = hit === key ? null : hit;
      dragRef.current = { key, cx: ev.clientX, cy: ev.clientY, target, valid: validTarget(key, target) };
      setDrag(dragRef.current);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      if (!dragging) return onSelect(key);
      const d = dragRef.current;
      dragRef.current = null;
      setDrag(null);
      if (d?.target && d.valid) {
        if (d.target === "__staff") onMove(key, g.root.key, "staff");
        else onMove(key, d.target, "main");
      }
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const dragged = drag ? people.find((p) => p.key === drag.key) : null;

  return (
    <div
      ref={wrap}
      onPointerDown={panStart}
      className="relative size-full cursor-grab touch-none select-none overflow-hidden data-[panning]:cursor-grabbing"
      style={{
        backgroundImage: "radial-gradient(rgb(255 255 255 / 0.075) 1px, transparent 1px)",
        backgroundSize: `${22 * view.k}px ${22 * view.k}px`,
        backgroundPosition: `${view.x}px ${view.y}px`,
      }}
    >
      <div ref={stage} className="absolute left-0 top-0 origin-top-left will-change-transform" style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})` }}>
        <svg className="pointer-events-none absolute left-0 top-0 overflow-visible" width="1" height="1" aria-hidden>
          {g.edges.map((e) => {
            const on = selected && (e.key === selected || people.find((p) => p.key === e.key)?.reportsTo === selected);
            return (
              <path
                key={e.key}
                data-edge
                d={e.d}
                fill="none"
                strokeWidth={on ? 2.6 : 2}
                strokeDasharray={e.lane ? "5 6" : undefined}
                strokeLinejoin="round"
                className={cn("transition-[stroke] duration-500", on ? "stroke-gold" : "stroke-[#6f83b3]/55")}
              />
            );
          })}
        </svg>

        {g.nodes.map((n) => (
          <Node
            key={n.p.key}
            n={n}
            selected={selected === n.p.key}
            dimmed={drag?.key === n.p.key}
            target={drag && drag.target === n.p.key ? (drag.valid ? "ok" : "bad") : null}
            flagged={flagged.has(n.p.key)}
            division={divByKey[n.p.division]}
            onPointerDown={(e) => nodeDown(e, n.p.key)}
            onSelect={() => onSelect(n.p.key)}
            onAdd={(group) => onAdd(n.p.key, group)}
          />
        ))}

        {/* jalur samping: tujuan seret untuk menjadikan staf */}
        {drag && g.root && (
          <div
            data-drop="__staff"
            className={cn(
              "absolute grid place-items-center rounded-2xl border-2 border-dashed text-center text-[12px] font-medium transition-colors",
              drag.target === "__staff" ? "border-gold bg-gold/10 text-gold-soft" : "border-white/20 text-white/45"
            )}
            style={{ left: g.lane.x, top: 0, width: NW, height: NH }}
          >
            Lepas di sini
            <br />
            jadikan staf di samping puncak
          </div>
        )}
      </div>

      {/* hantu yang mengikuti kursor */}
      {dragged && (
        <div className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 rotate-[-3deg]" style={{ left: drag.cx, top: drag.cy }}>
          <div className={cn("flex w-[212px] items-center gap-3 rounded-2xl border bg-[#18233f]/95 p-3 shadow-2xl backdrop-blur", drag.target ? (drag.valid ? "border-gold" : "border-[#e86a7c]") : "border-white/20")}>
            <Face p={dragged} size={40} />
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-medium text-white">{dragged.name}</span>
              <span className="block truncate text-[11.5px] text-white/50">{drag.target && !drag.valid ? "Tidak bisa ke bawahannya sendiri" : dragged.role}</span>
            </span>
          </div>
        </div>
      )}

      {/* kontrol zoom */}
      <div data-ui className="absolute bottom-4 left-4 flex items-center gap-0.5 rounded-xl border border-white/10 bg-[#0d1529]/85 p-1 text-white/70 backdrop-blur">
        <ZoomBtn label="Perkecil" onClick={() => zoomBy(1 / 1.2)}>
          <Minus className="size-3.5" />
        </ZoomBtn>
        <button type="button" onClick={() => setView((v) => ({ ...v, k: 1 }))} className="w-12 rounded-lg py-1 text-center text-[11.5px] tabular-nums hover:bg-white/10" title="Kembali ke 100%">
          {Math.round(view.k * 100)}%
        </button>
        <ZoomBtn label="Perbesar" onClick={() => zoomBy(1.2)}>
          <Plus className="size-3.5" />
        </ZoomBtn>
        <span className="mx-1 h-4 w-px bg-white/10" />
        <ZoomBtn label="Paskan ke layar (F)" onClick={() => fit()}>
          <Maximize2 className="size-3.5" />
        </ZoomBtn>
      </div>
      <p data-ui className="pointer-events-none absolute bottom-5 right-5 hidden text-[11.5px] text-white/30 md:block">
        Seret kartu ke kartu lain untuk mengganti atasan · Ctrl + gulir untuk zoom
      </p>
    </div>
  );
});

function ZoomBtn({ label, onClick, children }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className="grid size-7 place-items-center rounded-lg transition-colors hover:bg-white/10 hover:text-white active:scale-90">
      {children}
    </button>
  );
}

export function Face({ p, size = 44, className }) {
  return (
    <span className={cn("relative grid shrink-0 place-items-center overflow-hidden rounded-xl bg-white/[0.08] font-serif text-gold-soft", className)} style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {p.photo ? <Image src={p.photo} alt="" fill sizes={`${size}px`} className="object-cover object-top" /> : initials(p.name)}
    </span>
  );
}

const DIV_DOT = { maroon: "bg-[#c0455a]", navy: "bg-[#6f8fd6]", gold: "bg-gold" };

function Node({ n, selected, dimmed, target, flagged, division, onPointerDown, onSelect, onAdd }) {
  const p = n.p;
  const card = useRef(null);
  useEffect(() => {
    if (target !== "ok" || !card.current || prefersReducedMotion()) return;
    const t = gsap.fromTo(card.current, { boxShadow: "0 0 0 0 rgb(214 182 108 / .55)" }, { boxShadow: "0 0 0 14px rgb(214 182 108 / 0)", duration: 0.9, repeat: -1, ease: "power2.out" });
    return () => t.kill();
  }, [target]);

  return (
    <div
      data-node={p.key}
      data-drop={p.key}
      className="group/node absolute transition-transform duration-500 ease-cinematic"
      style={{ width: NW, height: NH, transform: `translate(${n.x}px, ${n.y}px)` }}
    >
      {/* pembungkus tanpa transisi CSS: target animasi GSAP (masuk & denyut) */}
      <div ref={card} data-node-card className="size-full rounded-2xl">
      <button
        type="button"
        onPointerDown={onPointerDown}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect();
          }
        }}
        aria-pressed={selected}
        aria-label={`${p.name}, ${p.role || "tanpa jabatan"}${p.hidden ? ", disembunyikan" : ""}`}
        className={cn(
          "relative flex size-full cursor-pointer items-center gap-3 rounded-2xl border p-3 text-left outline-none backdrop-blur transition-[border-color,background-color,opacity,box-shadow,transform] duration-300",
          "focus-visible:ring-2 focus-visible:ring-gold/70 active:scale-[0.98]",
          n.root ? "bg-[#2a1520]/90" : n.lane ? "bg-[#14213a]/90" : "bg-[#121c33]/90",
          selected ? "border-gold shadow-[0_18px_40px_-18px_rgb(214_182_108/0.55)]" : target === "bad" ? "border-[#e86a7c]" : target === "ok" ? "border-gold/80" : "border-white/[0.09] hover:border-white/25",
          (dimmed || p.hidden) && "opacity-40",
          p.hidden && "border-dashed"
        )}
      >
        {n.root && <span aria-hidden className="absolute -top-px left-5 right-5 h-[2px] rounded-full bg-gradient-to-r from-transparent via-gold to-transparent" />}
        <Face p={p} size={52} />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-gold-soft/80">
            <span className="truncate">{p.role || "Tanpa jabatan"}</span>
            {n.lane && <span className="rounded bg-white/10 px-1 py-px text-[9px] tracking-wider text-white/60">staf</span>}
            {division && <span title={`Divisi ${division.name}`} className={cn("ml-auto size-2 shrink-0 rounded-full", DIV_DOT[division.tone])} />}
          </span>
          <span className="mt-0.5 line-clamp-2 block text-[13.5px] font-medium leading-snug text-white">{p.name}</span>
        </span>
        {p.hidden && <EyeOff aria-hidden className="absolute right-2.5 top-2.5 size-3.5 text-white/50" />}
        {flagged && !p.hidden && <span aria-hidden title="Perlu dilengkapi" className="absolute right-2.5 top-2.5 size-2 rounded-full bg-[#e0a43a] shadow-[0_0_0_3px_rgb(224_164_58/0.2)]" />}
      </button>
      </div>

      {/* tambah bawahan: muncul saat hover / terpilih */}
      <button
        type="button"
        data-add
        onClick={() => onAdd("main")}
        aria-label={`Tambah bawahan ${p.name}`}
        title="Tambah bawahan (N)"
        className={cn(
          "absolute -bottom-3.5 left-1/2 z-10 grid size-7 -translate-x-1/2 place-items-center rounded-full border border-gold/60 bg-navy-deep text-gold-soft shadow-lg transition-[opacity,transform] duration-300 hover:scale-110 hover:bg-gold hover:text-navy",
          selected ? "opacity-100" : "pointer-events-none scale-75 opacity-0 group-hover/node:pointer-events-auto group-hover/node:scale-100 group-hover/node:opacity-100"
        )}
      >
        <Plus className="size-3.5" />
      </button>
      {n.root && (
        <button
          type="button"
          data-add
          onClick={() => onAdd("staff")}
          aria-label="Tambah staf di samping puncak"
          title="Tambah staf di jalur samping"
          className={cn(
            "absolute -right-3.5 top-1/2 z-10 grid size-7 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-navy-deep text-white/70 shadow-lg transition-[opacity,transform] duration-300 hover:scale-110 hover:border-gold hover:text-gold-soft",
            selected ? "opacity-100" : "pointer-events-none opacity-0 group-hover/node:pointer-events-auto group-hover/node:opacity-100"
          )}
        >
          <UserPlus className="size-3.5" />
        </button>
      )}
    </div>
  );
}
