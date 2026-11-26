"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { MAGANG_PREVIEW_EVENT } from "@/lib/magang-cms/schema";
import { Modal, ModalContent, ModalDescription, ModalHeader, ModalTitle } from "@/components/ui/modal";

const VIEW = { desktop: 1280, mobile: 390 };

export function PreviewSignal() {
  useEffect(() => { window.parent.postMessage(MAGANG_PREVIEW_EVENT, location.origin); }, []);
  return null;
}

export function PreviewMagang({ open, onOpenChange, revision, restoreFocus }) {
  const stage = useRef(null);
  const iframe = useRef(null);
  const [width, setWidth] = useState(0);
  const [view, setView] = useState("desktop");
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const viewport = VIEW[view];
  const scale = width ? Math.min(1, width / viewport) : 0;

  useEffect(() => {
    if (!open) return;
    setView(window.matchMedia("(max-width: 47.99rem)").matches ? "mobile" : "desktop");
    let observer;
    const frame = requestAnimationFrame(() => {
      if (!stage.current) return;
      observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
      observer.observe(stage.current);
    });
    return () => { cancelAnimationFrame(frame); observer?.disconnect(); };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const ready = (event) => {
      if (event.origin !== location.origin || event.source !== iframe.current?.contentWindow || event.data !== MAGANG_PREVIEW_EVENT) return;
      setLoaded(true);
      setTimedOut(false);
    };
    window.addEventListener("message", ready);
    return () => window.removeEventListener("message", ready);
  }, [open]);

  useEffect(() => {
    if (!open || loaded) return;
    const timer = setTimeout(() => setTimedOut(true), 12000);
    return () => clearTimeout(timer);
  }, [open, loaded, attempt]);

  return <Modal open={open} onOpenChange={onOpenChange}>
    <ModalContent onCloseAutoFocus={(event) => { event.preventDefault(); restoreFocus(); }} className="flex max-h-[94dvh] w-[calc(100%-1rem)] max-w-[85rem] flex-col gap-4 bg-cream p-3 sm:p-5">
      <ModalHeader className="mb-0">
        <ModalTitle>Pratinjau Magang</ModalTitle>
        <ModalDescription>Menampilkan perubahan terakhir yang disimpan.</ModalDescription>
      </ModalHeader>
      <div aria-label="Lebar pratinjau" role="group" className="flex flex-wrap gap-2">
        {Object.keys(VIEW).map((key) => <Button key={key} type="button" size="sm" aria-pressed={key === view} variant={key === view ? "navy" : "outline-navy"} onClick={() => setView(key)}>
          {key === "desktop" ? "Desktop" : "Ponsel"}
        </Button>)}
      </div>
      <div ref={stage} className="relative h-[68dvh] min-h-0 overflow-hidden rounded-md border border-navy/20 bg-cream-2">
        <div className="relative mx-auto h-full overflow-hidden bg-white" style={{ width: scale ? viewport * scale : "100%" }}>
          <iframe
            key={attempt}
            ref={iframe}
            title="Halaman publik Magang"
            src={"/admin/magang/pratinjau?revisi=" + encodeURIComponent(revision)}
            sandbox="allow-scripts allow-same-origin"
            tabIndex={loaded ? 0 : -1}
            aria-hidden={!loaded}
            className="absolute left-0 top-0 max-w-none origin-top-left border-0"
            style={{ width: viewport, height: scale ? 100 / scale + "%" : "100%", transform: "scale(" + scale + ")" }}
          />
          {!loaded && <div className="absolute inset-0 grid place-content-center gap-3 bg-cream text-center text-sm text-navy" role="status">
            {timedOut ? "Pratinjau belum berhasil dimuat." : "Menyiapkan pratinjau…"}
            {timedOut && <Button type="button" variant="outline-navy" onClick={() => { setTimedOut(false); setAttempt((i) => i + 1); }}>Coba lagi</Button>}
          </div>}
        </div>
      </div>
    </ModalContent>
  </Modal>;
}
