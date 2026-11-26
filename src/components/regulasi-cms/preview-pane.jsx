"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { SpotlightCard } from "@/components/aceternity/spotlight-card";
import { PREVIEW_EVENT, PREVIEW_URL } from "@/lib/regulasi-cms/schema";

const SIZES = { desktop: 1120, mobile: 390 };

export function PreviewPane({ value, anchor }) {
  const [size, setSize] = useState("desktop");
  const [width, setWidth] = useState(0);
  const [ready, setReady] = useState(false);
  const [late, setLate] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const stage = useRef(null);
  const iframe = useRef(null);
  const widthAtSize = SIZES[size];
  const scale = width ? Math.min(1, width / widthAtSize) : 0;
  const send = useCallback((fields) => {
    iframe.current?.contentWindow?.postMessage({ type: PREVIEW_EVENT, ...fields }, location.origin);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(max-width: 63.99rem)").matches) setSize("mobile");
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setWidth(entry.contentRect.width);
    });
    if (stage.current) observer.observe(stage.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onMessage = (event) => {
      if (event.origin !== location.origin || event.source !== iframe.current?.contentWindow) return;
      if (event.data?.type === PREVIEW_EVENT && event.data.ready) {
        setReady(true);
        setLate(false);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (ready) return;
    const timer = setTimeout(() => setLate(true), 15000);
    return () => clearTimeout(timer);
  }, [ready, attempt]);

  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => send({ value }), 125);
    return () => clearTimeout(timer);
  }, [ready, send, value]);

  useEffect(() => {
    if (ready && anchor) send({ anchor });
  }, [ready, send, anchor]);

  return (
    <SpotlightCard as="section" aria-labelledby="regulasi-preview-title" className="rounded-[inherit] [--proof-paper:#fcf9f3]">
      <div aria-hidden className="pointer-events-none absolute z-0 hidden size-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/15 opacity-0 blur-3xl motion-safe:transition-opacity group-hover:opacity-100 lg:block" style={{ left: "var(--mx, 50%)", top: "var(--my, 0px)" }} />
      <div className="relative flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-white sm:px-5">
        <h2 id="regulasi-preview-title" className="font-serif text-[1.3rem]">Pratinjau publik</h2>
        <div aria-label="Ukuran layar pratinjau" className="flex gap-1 rounded-md border border-white/30 p-0.5">
          {Object.keys(SIZES).map((mode) => (
            <button
              key={mode}
              type="button"
              aria-pressed={mode === size}
              onClick={() => setSize(mode)}
              className="min-h-8 rounded px-2.5 text-xs font-semibold text-white/85 transition-colors hover:bg-white/10 aria-pressed:bg-gold-soft aria-pressed:text-navy"
            >
              {mode === "desktop" ? "Desktop" : "Ponsel"}
            </button>
          ))}
        </div>
      </div>
      <div className="relative border-t border-gold/40 bg-cream-2 p-3 sm:p-4">
        <div ref={stage} className="flex justify-center">
          <div className="relative h-[min(64dvh,44rem)] min-h-[19rem] overflow-hidden rounded border border-navy/15 bg-[var(--proof-paper)] shadow-[0_10px_26px_-20px_#14213d]" style={{ width: scale ? widthAtSize * scale : "100%" }}>
            <iframe
              key={attempt}
              ref={iframe}
              title="Tampilan Regulasi Akademik"
              src={PREVIEW_URL}
              tabIndex={ready ? 0 : -1}
              aria-hidden={!ready}
              className="absolute inset-0 max-w-none origin-top-left border-0 bg-cream"
              style={{ width: widthAtSize, height: scale ? `${100 / scale}%` : "100%", transform: `scale(${scale})` }}
            />
            {!ready && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[var(--proof-paper)] px-4 text-center text-sm text-navy">
                <p role="status">{late ? "Pratinjau belum berhasil dimuat." : "Menyiapkan pratinjau…"}</p>
                {late && <Button type="button" size="sm" variant="outline-navy" onClick={() => { setLate(false); setAttempt((count) => count + 1); }}>Coba lagi</Button>}
              </div>
            )}
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
}
