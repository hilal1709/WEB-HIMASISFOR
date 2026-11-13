"use client";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { motion } from "motion/react";
import { LogoDraw } from "@/components/ui/loader";
import { cn } from "@/lib/utils";

const DEVICES = [
  { key: "desktop", label: "Desktop", width: "100%" },
  { key: "tablet", label: "Tablet", width: "820px" },
  { key: "phone", label: "Ponsel", width: "390px" },
];

/**
 * Panggung pratinjau: beranda dalam draft mode di iframe. Studio mengirim `refresh` setelah
 * autosave dan `scroll` saat section dipilih (lihat components/home/preview-bridge.jsx).
 */
export const Stage = forwardRef(function Stage({ className }, ref) {
  const frame = useRef(null);
  const queue = useRef([]);
  const [ready, setReady] = useState(false);
  const [device, setDevice] = useState("desktop");
  const [busy, setBusy] = useState(false);

  const post = (msg) => {
    const w = frame.current?.contentWindow;
    if (!w || !ready) return void queue.current.push(msg);
    w.postMessage({ source: "home-studio", ...msg }, window.location.origin);
  };

  useImperativeHandle(ref, () => ({
    refresh: () => {
      setBusy(true);
      post({ type: "refresh" });
      setTimeout(() => setBusy(false), 900);
    },
    scrollTo: (anchor) => post({ type: "scroll", anchor }),
  }));

  useEffect(() => {
    const on = (e) => {
      if (e.origin !== window.location.origin || e.data?.source !== "home-preview") return;
      if (e.data.type === "ready") setReady(true);
    };
    window.addEventListener("message", on);
    return () => window.removeEventListener("message", on);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const q = queue.current.splice(0);
    q.forEach((m) => frame.current?.contentWindow?.postMessage({ source: "home-studio", ...m }, window.location.origin));
  }, [ready]);

  const width = DEVICES.find((d) => d.key === device).width;

  return (
    <section aria-label="Pratinjau beranda" className={cn("flex h-full min-h-0 flex-col", className)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] p-1">
          {DEVICES.map((d) => (
            <button key={d.key} type="button" onClick={() => setDevice(d.key)} aria-pressed={device === d.key} className={cn("relative rounded-full px-3 py-1 text-xs font-medium transition-colors", device === d.key ? "text-ink" : "text-white/55 hover:text-white")}>
              {device === d.key && <motion.span layoutId="stage-device" className="absolute inset-0 rounded-full bg-gold-soft" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className="relative">{d.label}</span>
            </button>
          ))}
        </div>
        <span className="flex items-center gap-2 text-[11px] text-white/45">
          <span className={cn("size-1.5 rounded-full", busy ? "animate-pulse bg-gold" : "bg-emerald-400")} />
          {busy ? "Memperbarui pratinjau…" : "Pratinjau draf"}
        </span>
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-[20px] border border-white/10 bg-[#120405]">
        <div className="mx-auto h-full transition-[width] duration-700 ease-cinematic" style={{ width, maxWidth: "100%" }}>
          <div className={cn("flex h-7 items-center gap-1.5 border-b border-white/10 bg-white/[0.04] px-3", device !== "desktop" && "rounded-t-xl")}>
            {["bg-red-400/60", "bg-gold/60", "bg-emerald-400/60"].map((c) => (
              <span key={c} className={cn("size-2 rounded-full", c)} />
            ))}
            <span className="ml-3 truncate text-[10.5px] text-white/35">si.uisi.ac.id</span>
          </div>
          <iframe ref={frame} title="Pratinjau beranda" src="/api/home-cms/preview" className="h-[calc(100%-1.75rem)] w-full bg-white" />
        </div>
        {!ready && (
          <div className="absolute inset-0 grid place-items-center bg-paper">
            <LogoDraw label="Menyiapkan pratinjau" sub="Memuat beranda versi draf" loop />
          </div>
        )}
      </div>
    </section>
  );
});
