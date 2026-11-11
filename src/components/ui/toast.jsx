"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Toast custom — tanpa dependensi.
 *   const toast = useToast();
 *   toast.success("Tersimpan"); toast.error("Gagal", { description: "..." });
 * Pasang <ToastProvider> sekali di layout.
 */
const ToastContext = createContext(null);

const STYLE = {
  // Kartu navy; warna status dipakai hanya untuk aksen bar + ikon (versi terang agar kontras di atas navy)
  success: { icon: CheckCircle2, bar: "bg-emerald-400", text: "text-emerald-400" },
  error: { icon: XCircle, bar: "bg-red-400", text: "text-red-400" },
  warning: { icon: AlertTriangle, bar: "bg-gold", text: "text-gold" },
  info: { icon: Info, bar: "bg-sky-400", text: "text-sky-400" },
};

function ToastItem({ toast, onClose }) {
  const [leaving, setLeaving] = useState(false);
  const timer = useRef();
  const { icon: Icon, bar, text } = STYLE[toast.type];

  const close = useCallback(() => {
    setLeaving(true);
    setTimeout(() => onClose(toast.id), 200);
  }, [onClose, toast.id]);

  useEffect(() => {
    if (toast.duration === Infinity) return;
    timer.current = setTimeout(close, toast.duration);
    return () => clearTimeout(timer.current);
  }, [close, toast.duration]);

  return (
    <div
      role={toast.type === "error" ? "alert" : "status"}
      onMouseEnter={() => clearTimeout(timer.current)}
      className={cn(
        "relative flex w-full items-start gap-3 overflow-hidden rounded-lg border border-white/10 bg-navy p-4 pl-5 pr-10 text-white shadow-[0_24px_50px_-20px_rgb(14_24_48/0.7)]",
        leaving ? "animate-toast-out" : "animate-toast-in"
      )}
    >
      <span className={cn("absolute inset-y-0 left-0 w-1", bar)} />
      <Icon className={cn("mt-0.5 size-5 shrink-0", text)} />
      <div className="min-w-0">
        <p className="text-sm font-semibold">{toast.title}</p>
        {toast.description && <p className="mt-0.5 text-[13px] leading-relaxed text-white/70">{toast.description}</p>}
      </div>
      <button
        onClick={close}
        aria-label="Tutup notifikasi"
        className="absolute right-3 top-3 rounded p-0.5 text-white/50 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const remove = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const api = useMemo(() => {
    const push = (type) => (title, opts = {}) => {
      const id = crypto.randomUUID();
      setToasts((t) => [...t.slice(-4), { id, type, title, duration: 4500, ...opts }]);
      return id;
    };
    return {
      success: push("success"),
      error: push("error"),
      warning: push("warning"),
      info: push("info"),
      dismiss: remove,
    };
  }, [remove]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[200] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onClose={remove} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const noop = () => undefined;
const NOOP_TOAST = { success: noop, error: noop, warning: noop, info: noop, dismiss: noop };

/**
 * Di luar <ToastProvider> (mis. saat SSR ketika bundler memuat modul ini dua kali) kembalikan API kosong
 * alih-alih melempar error, supaya halaman tidak jatuh ke client rendering. Toast hanya dipicu dari event klien.
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx && process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
    console.warn("useToast dipakai di luar <ToastProvider>; toast diabaikan.");
  }
  return ctx ?? NOOP_TOAST;
}
