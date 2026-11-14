"use client";
import Image from "next/image";
import { motion } from "motion/react";
import { SpotlightCard } from "@/components/aceternity/spotlight-card";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { cn } from "@/lib/utils";
import { Fader } from "./fader";

const pad = (n) => String(n).padStart(2, "0");
const ACCENT = { maroon: "#a3253a", navy: "#3a5a9c", gold: "#d9b23a" };
const LED = { ok: ["var(--k-led-ok)", "Tersimpan & sama dengan live"], warn: ["var(--k-led-warn)", "Ada perubahan belum terbit"], bad: ["var(--k-led-bad)", "Ada kalimat mengulang"] };
const TILE = [
  ["besar", "B", "Tile besar (2×2)"],
  ["lebar", "L", "Tile lebar (2×1)"],
  ["kecil", "K", "Tile kecil (1×1)"],
];

/**
 * Satu channel strip = satu bidang. Atas: grip urutan + nomor channel + LED status.
 * Tengah: foto/Lottie (klik → inspector), nama, bank fader profil minat (satu per dimensi).
 * Bawah: warna aksen, ukuran tile mosaik, Mute (sembunyikan dari publik), Solo (pratinjau modal bidang).
 */
export function ChannelStrip({ field: f, index, dims, led = "ok", selected, dragging, dropHint, onOpen, onProfile, onPatch, onSolo, dragProps }) {
  const muted = f.visible === false;
  const [ledColor, ledTitle] = LED[led] ?? LED.ok;
  return (
    <motion.div layout="position" layoutId={`ch-${f.slug}`} transition={{ type: "spring", stiffness: 420, damping: 38 }} className={cn("relative shrink-0", dragging && "opacity-40")}>
      {dropHint && <span aria-hidden className="absolute -left-2 inset-y-4 w-0.5 rounded-full bg-[var(--k-gold)] shadow-[0_0_12px_var(--k-gold)]" />}
      <SpotlightCard
        style={{ width: Math.max(220, dims.length * 38 + 42) }}
        className={cn(
          "flex flex-col rounded-2xl border bg-gradient-to-b from-[var(--k-panel-2)] to-[var(--k-panel)] p-3 shadow-[0_30px_50px_-35px_rgb(0_0_0/0.9)] transition-[border-color,opacity] duration-300",
          selected ? "border-[var(--k-gold)]/70" : "border-[var(--k-line)]",
          muted && "opacity-55"
        )}
      >
        {/* kepala channel */}
        <div className="flex items-center gap-2">
          <button type="button" {...dragProps} aria-label={`Seret untuk mengurutkan ${f.title}`} className="cursor-grab touch-none rounded px-0.5 text-[var(--k-faint)] hover:text-[var(--k-gold)] active:cursor-grabbing">
            <svg viewBox="0 0 10 16" className="h-4 w-2.5" aria-hidden>
              {[3, 8, 13].map((y) => [2.5, 7.5].map((x) => <circle key={`${x}${y}`} cx={x} cy={y} r="1.3" fill="currentColor" />))}
            </svg>
          </button>
          <span className="font-mono text-[10.5px] tracking-[0.2em] text-[var(--k-mute)]">CH {pad(index + 1)}</span>
          <span title={ledTitle} className="k-led ml-auto size-2 rounded-full transition-colors duration-500" style={{ color: ledColor }} />
        </div>

        {/* wajah channel */}
        <button type="button" onClick={onOpen} data-lottie-hover className="group/t relative mt-2.5 block aspect-[16/10] overflow-hidden rounded-xl bg-black/40 text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--k-gold)]" aria-label={`Buka pengaturan ${f.title}`}>
          {f.image && <Image src={f.image} alt="" fill sizes="186px" className={cn("object-cover opacity-80 transition-transform duration-700 ease-cinematic group-hover/t:scale-105", f.crop && "scale-[1.12]")} />}
          <span className="absolute inset-0 bg-gradient-to-t from-[#0b1222] via-[#0b1222]/30 to-transparent" />
          {f.lottie && <LottieIllustration src={f.lottie} replayOnHover className="absolute right-1.5 top-1.5 size-9" />}
          {muted && (
            <span className="absolute inset-0 grid place-items-center bg-[repeating-linear-gradient(135deg,rgb(0_0_0/0.45)_0_6px,transparent_6px_12px)] font-mono text-[11px] tracking-[0.3em] text-[var(--k-ink)]">MUTE</span>
          )}
          <span className="absolute inset-x-2 bottom-1.5">
            <span className="line-clamp-2 font-serif text-[15px] leading-tight text-[var(--k-ink)]">{f.title || "Tanpa nama"}</span>
          </span>
        </button>
        <p className="mt-1.5 truncate font-mono text-[10.5px] text-[var(--k-faint)]">/{f.slug} · {f.short}</p>

        {/* bank fader */}
        <div className="mt-3 flex justify-center gap-1.5 rounded-xl border border-[var(--k-line)] bg-black/20 px-2 py-2.5">
          {dims.map((d, i) => (
            <Fader key={d.key} value={f.profile?.[i] ?? 5} onChange={(v) => onProfile(i, v)} label={`${f.short || f.title} · ${d.label}`} short={d.short} height={dims.length > 5 ? 112 : 128} accent={ACCENT[f.accent]} />
          ))}
        </div>

        {/* aksen + tile */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex gap-1.5" role="radiogroup" aria-label="Warna aksen">
            {Object.entries(ACCENT).map(([k, c]) => (
              <button key={k} type="button" role="radio" aria-checked={f.accent === k} aria-label={`Aksen ${k}`} onClick={() => onPatch({ accent: k })} className={cn("size-4 rounded-full ring-offset-2 ring-offset-[var(--k-panel)] transition-[box-shadow,transform] hover:scale-110", f.accent === k && "ring-2 ring-[var(--k-ink)]")} style={{ background: c }} />
            ))}
          </div>
          <div className="inline-flex rounded-md border border-[var(--k-line-2)] bg-black/25 p-0.5" role="radiogroup" aria-label="Ukuran tile mosaik">
            {TILE.map(([k, l, t]) => (
              <button key={k} type="button" role="radio" aria-checked={f.tile === k} title={t} onClick={() => onPatch({ tile: k })} className={cn("rounded px-1.5 py-0.5 font-mono text-[10.5px]", f.tile === k ? "bg-[var(--k-gold)] text-[#1a1406]" : "text-[var(--k-mute)] hover:text-[var(--k-ink)]")}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* M / S / Edit */}
        <div className="mt-3 grid grid-cols-[auto_auto_1fr] gap-1.5">
          <button type="button" aria-pressed={muted} title={muted ? "Tampilkan lagi di publik" : "Sembunyikan dari publik"} onClick={() => onPatch({ visible: muted })} className={cn("h-8 w-9 rounded-md border font-mono text-[12px] font-bold transition-colors", muted ? "border-[var(--k-maroon)] bg-[var(--k-maroon)] text-white" : "border-[var(--k-line-2)] text-[var(--k-mute)] hover:border-[var(--k-maroon)] hover:text-[var(--k-ink)]")}>
            M
          </button>
          <button type="button" title="Solo: pratinjau rangkuman bidang ini" onClick={onSolo} className="h-8 w-9 rounded-md border border-[var(--k-line-2)] font-mono text-[12px] font-bold text-[var(--k-mute)] transition-colors hover:border-[var(--k-gold)] hover:text-[var(--k-gold)]">
            S
          </button>
          <button type="button" onClick={onOpen} className="h-8 rounded-md bg-white/[0.06] text-[12.5px] font-semibold transition-colors hover:bg-[var(--k-gold)] hover:text-[#1a1406]">
            Atur
          </button>
        </div>
      </SpotlightCard>
    </motion.div>
  );
}

/** Slot kosong di ujung rak untuk menambah channel. */
export function AddChannel({ onAdd, disabled, max, icon }) {
  return (
    <button
      type="button"
      onClick={onAdd}
      disabled={disabled}
      className="group grid w-[150px] shrink-0 place-items-center rounded-2xl border border-dashed border-[var(--k-line-2)] p-4 text-center text-[var(--k-mute)] transition-[border-color,color,background-color] duration-300 hover:border-[var(--k-gold)] hover:bg-[var(--k-gold)]/5 hover:text-[var(--k-ink)] disabled:pointer-events-none disabled:opacity-40"
    >
      <span className="flex flex-col items-center gap-2">
        {icon}
        <span className="text-[13px] font-semibold">Channel baru</span>
        <span className="font-mono text-[10px] tracking-wider text-[var(--k-faint)]">{disabled ? `MAKS ${max}` : "TAMBAH BIDANG"}</span>
      </span>
    </button>
  );
}
