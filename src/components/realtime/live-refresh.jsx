"use client";
import { useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useChannel } from "@/lib/realtime/client";
import { cn } from "@/lib/utils";

const matches = (paths = [], pathname) =>
  paths.some((p) => p === "*" || p === pathname || (p.endsWith("/*") && pathname.startsWith(p.slice(0, -1))));

/**
 * Pengunjung melihat konten terbaru tanpa memuat ulang: saat admin menerbitkan sesuatu,
 * server menyiarkan `site:refresh` dan halaman yang cocok menarik data RSC baru.
 * Pil kecil di bawah layar memberi tahu bahwa isi baru saja diperbarui.
 */
export function LiveRefresh() {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const [pending, start] = useTransition();
  const [flash, setFlash] = useState(false);
  const timer = useRef();
  const off = pathname.startsWith("/admin");

  useChannel(
    "site",
    {
      refresh: ({ paths }) => {
        if (!matches(paths, pathname)) return;
        clearTimeout(timer.current);
        // jeda kecil: beri waktu revalidasi selesai, dan gabungkan siaran beruntun
        timer.current = setTimeout(() => {
          start(() => router.refresh());
          setFlash(true);
          setTimeout(() => setFlash(false), 2600);
        }, 600);
      },
    },
    !off
  );

  if (off) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "pointer-events-none fixed bottom-5 left-1/2 z-[150] -translate-x-1/2 transition-[opacity,transform] duration-500 ease-cinematic",
        flash ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      )}
    >
      <span className="flex items-center gap-2.5 rounded-full border border-gold/40 bg-maroon-deep/95 py-2 pl-3 pr-4 text-xs font-medium text-white shadow-[0_18px_40px_-18px_rgb(26_6_7/0.8)] backdrop-blur">
        <span className="relative flex size-2">
          <span className="absolute inset-0 animate-ping rounded-full bg-gold/70" />
          <span className="relative size-2 rounded-full bg-gold" />
        </span>
        {flash ? (pending ? "Memuat isi terbaru…" : "Isi halaman baru saja diperbarui") : ""}
      </span>
    </div>
  );
}
