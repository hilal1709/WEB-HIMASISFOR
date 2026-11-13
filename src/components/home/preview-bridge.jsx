"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Jembatan pratinjau Studio Beranda (hanya dirender saat draft mode).
 * Di dalam iframe Studio: menerima perintah `scroll` & `refresh`, melapor section yang terlihat.
 * Dibuka langsung di tab: menampilkan pita "pratinjau draf" + tautan keluar.
 */
export function PreviewBridge({ source = "home-studio", exitHref = "/api/home-cms/preview?off=1" }) {
  const router = useRouter();
  const [framed, setFramed] = useState(true);

  useEffect(() => {
    const inFrame = window.self !== window.top;
    setFramed(inFrame);
    if (!inFrame) return;
    // tirai intro tidak perlu di pratinjau
    try {
      sessionStorage.setItem("sisfor:intro", "1");
    } catch {}
    const onMsg = (e) => {
      if (e.origin !== window.location.origin || e.data?.source !== source) return;
      if (e.data.type === "refresh") router.refresh();
      if (e.data.type === "scroll") {
        const el = e.data.anchor === "top" ? document.body : document.getElementById(e.data.anchor);
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    window.addEventListener("message", onMsg);
    window.parent.postMessage({ source: "home-preview", type: "ready" }, window.location.origin);
    return () => window.removeEventListener("message", onMsg);
  }, [router, source]);

  if (framed) return null;
  return (
    <div className="fixed inset-x-0 top-0 z-[160] flex items-center justify-center gap-3 bg-gold px-4 py-1.5 text-xs font-semibold text-maroon-deep">
      Pratinjau draf — pengunjung belum melihat versi ini.
      <a href={exitHref} className="underline underline-offset-2">Keluar pratinjau</a>
    </div>
  );
}
