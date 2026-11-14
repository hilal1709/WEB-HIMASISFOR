"use client";
import { useState } from "react";
import { Magnetic } from "@/components/motion/magnetic";
import { MovingBorder } from "@/components/home-studio/fx";
import { LordIcon } from "@/components/media/lord-icon";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CHAPTERS } from "@/lib/kurikulum-cms/schema";
import { cn } from "@/lib/utils";

const STATUS = {
  idle: ["Siap", "bg-navy/30"],
  typing: ["Mengetik…", "bg-gold kf-pulse"],
  saving: ["Menyimpan…", "bg-gold kf-pulse"],
  saved: ["Draf tersimpan", "bg-success"],
  error: ["Gagal simpan", "bg-danger kf-pulse"],
};
const TONE = { danger: "bg-danger", warning: "bg-gold", info: "bg-navy/40" };

function Btn({ label, onClick, disabled, children, className }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label} title={label} className={cn("grid size-10 place-items-center rounded-full text-white/80 transition-[background-color,color,transform] hover:bg-white/10 hover:text-white active:scale-90 disabled:opacity-30", className)}>
      {children}
    </button>
  );
}

/**
 * Halte: dok kendali di kanan bawah. Lampu sinyal status simpan, urungkan/ulangi, panel sinyal pemeriksa,
 * jejak versi, uji jalan (pratinjau), buang draf, dan tombol terbit magnetik berbingkai kilau.
 */
export function Halte({ status, dirty, canUndo, onUndo, onRedo, signals, onJump, onHistory, onPreview, onDiscard, onPublish }) {
  const [open, setOpen] = useState(false);
  const [label, light] = STATUS[status] ?? STATUS.idle;
  const count = signals.list.length;
  return (
    <div className="fixed inset-x-3 bottom-3 z-50 flex justify-center sm:inset-x-auto sm:right-5 sm:bottom-5">
      <div className="flex items-center gap-1 rounded-full bg-navy-deep/95 p-1.5 pl-4 text-white shadow-[0_24px_50px_-20px_rgb(14_24_48/0.8)] ring-1 ring-white/10 backdrop-blur">
        <span className="flex items-center gap-2 pr-2 text-[12px] text-white/70" aria-live="polite">
          <span aria-hidden className={cn("size-2.5 rounded-full", light)} />
          <span className="hidden md:inline">{dirty && status !== "saving" && status !== "typing" ? "Draf belum terbit" : label}</span>
        </span>
        <Btn label="Urungkan (Ctrl Z)" onClick={onUndo} disabled={!canUndo}>↶</Btn>
        <Btn label="Ulangi (Ctrl Shift Z)" onClick={onRedo}>↷</Btn>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button type="button" aria-label={`${count} sinyal pemeriksa`} className="relative grid size-10 place-items-center rounded-full text-white/80 hover:bg-white/10 hover:text-white">
              <span aria-hidden className="flex flex-col gap-0.5">
                <span className={cn("size-1.5 rounded-full", signals.list.some((x) => x.tone === "danger") ? "bg-danger" : "bg-white/20")} />
                <span className={cn("size-1.5 rounded-full", signals.list.some((x) => x.tone === "warning") ? "bg-gold" : "bg-white/20")} />
                <span className={cn("size-1.5 rounded-full", !count ? "bg-success" : "bg-white/20")} />
              </span>
              {count > 0 && <span className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-gold px-1 text-[9.5px] font-bold text-navy-deep">{count}</span>}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" side="top" className="w-[min(92vw,380px)] p-0">
            <div className="border-b border-line px-4 py-3">
              <p className="font-serif text-lg text-navy">Sinyal pemeriksa</p>
              <p className="text-[12px] text-text/55">Kalimat berulang dan data yang tidak cocok. Klik untuk melompat.</p>
            </div>
            <ul className="max-h-[50vh] overflow-y-auto p-2">
              {!count && <li className="px-2 py-6 text-center text-[13px] text-text/55">Jalur bersih. Tidak ada kalimat berulang atau data janggal.</li>}
              {signals.list.map((s, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onJump(s);
                    }}
                    className="flex w-full gap-2.5 rounded-md px-2.5 py-2 text-left hover:bg-cream"
                  >
                    <span aria-hidden className={cn("mt-1.5 size-2 shrink-0 rounded-full", TONE[s.tone] ?? TONE.info)} />
                    <span className="min-w-0">
                      <span className="block text-[10.5px] font-semibold uppercase tracking-wide text-maroon">
                        {CHAPTERS.find((c) => c.key === s.chapter)?.label ?? s.chapter} · {s.kind}
                      </span>
                      <span className="block text-[13px] leading-snug text-navy">{s.text}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>
        <Btn label="Jejak versi" onClick={onHistory}>
          <span aria-hidden className="text-[15px]">⟲</span>
        </Btn>
        <Btn label="Uji jalan (pratinjau)" onClick={onPreview} className="kf-preview-btn">
          <LordIcon name="globe" size={20} target=".kf-preview-btn" colors="primary:#ffffff,secondary:#c9a227" />
        </Btn>
        <Btn label="Buang draf" onClick={onDiscard} disabled={!dirty}>
          <span aria-hidden className="text-[17px]">×</span>
        </Btn>
        <Magnetic strength={0.25}>
          <MovingBorder onClick={onPublish} disabled={!dirty} className="ml-1 h-10" inner="bg-maroon px-4 text-[13px]">
            Terbitkan
          </MovingBorder>
        </Magnetic>
      </div>
    </div>
  );
}
