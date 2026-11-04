"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { cva } from "class-variance-authority";
import AppIcon from "./AppIcon";
import { cn } from "@/lib/utils";

const bannerVariants = cva("relative flex w-full items-start gap-3 overflow-hidden rounded-xl border px-4 py-3 text-sm", {
  variants: {
    variant: {
      brand: "border-brand-700 bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 text-white",
      info: "border-info/20 bg-info-soft text-info",
      success: "border-success/20 bg-success-soft text-success",
      warning: "border-warning/20 bg-warning-soft text-warning",
      danger: "border-danger/20 bg-danger-soft text-danger",
    },
  },
  defaultVariants: { variant: "info" },
});

const ICON = { brand: "bell", info: "info", success: "success", warning: "warning", danger: "error" };

/**
 * Banner pengumuman. `storageKey` → setelah ditutup tidak muncul lagi di browser ini.
 * <Banner variant="brand" title="Pendaftaran dibuka!" action={<a href="#">Daftar</a>} dismissible />
 */
export default function Banner({ variant = "info", title, children, action, dismissible = false, storageKey, className }) {
  const [visible, setVisible] = useState(true);
  const ref = useRef(null);

  useEffect(() => {
    if (!storageKey) return;
    try { if (localStorage.getItem(`banner:${storageKey}`) === "closed") setVisible(false); } catch {}
  }, [storageKey]);

  const dismiss = () => {
    gsap.to(ref.current, {
      height: 0, opacity: 0, paddingTop: 0, paddingBottom: 0, marginTop: 0, marginBottom: 0, duration: 0.35, ease: "power2.inOut",
      onComplete: () => setVisible(false),
    });
    if (storageKey) { try { localStorage.setItem(`banner:${storageKey}`, "closed"); } catch {} }
  };

  if (!visible) return null;

  return (
    <div ref={ref} role="status" className={cn(bannerVariants({ variant }), className)}>
      {variant === "brand" && <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.18)_50%,transparent_70%)] bg-[length:200%_100%] animate-shimmer" />}
      <AppIcon name={ICON[variant]} size={18} className="mt-0.5 shrink-0" />
      <div className="relative flex-1 min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn(title && "mt-0.5", variant === "brand" ? "text-white/85" : "opacity-90")}>{children}</div>}
      </div>
      {action && <div className="relative shrink-0 self-center">{action}</div>}
      {dismissible && (
        <button onClick={dismiss} aria-label="Tutup banner" className="relative -mr-1 shrink-0 rounded-md p-1 opacity-70 transition hover:opacity-100 hover:bg-black/5 cursor-pointer">
          <AppIcon name="close" size={16} />
        </button>
      )}
    </div>
  );
}
