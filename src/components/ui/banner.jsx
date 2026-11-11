"use client";
import { useState } from "react";
import { CheckCircle2, AlertTriangle, Info, XCircle, Megaphone, X } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const bannerVariants = cva("relative flex w-full items-start gap-3 overflow-hidden rounded-lg border border-l-4 px-4 py-3 text-sm", {
  variants: {
    variant: {
      info: "border-navy/15 border-l-navy bg-cream text-navy",
      success: "border-success/20 border-l-success bg-success-soft text-success",
      warning: "border-gold/40 border-l-gold bg-warning-soft text-warning",
      danger: "border-maroon/20 border-l-maroon bg-danger-soft text-maroon",
      // Banner pengumuman bermerek (mis. pendaftaran mahasiswa baru)
      brand: "border-maroon-deep border-l-gold bg-maroon text-white shadow-sm",
    },
  },
  defaultVariants: { variant: "info" },
});

const ICONS = { info: Info, success: CheckCircle2, warning: AlertTriangle, danger: XCircle, brand: Megaphone };

/** Banner inline. Untuk pesan form/CMS (`danger`) atau pengumuman (`brand`). */
export function Banner({ variant = "info", title, children, dismissible = false, action, className }) {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  const Icon = ICONS[variant];
  return (
    <div role={variant === "danger" ? "alert" : "status"} className={cn(bannerVariants({ variant }), className)}>
      <Icon className="mt-0.5 size-5 shrink-0" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn(title && "mt-0.5", variant === "brand" ? "text-white/80" : "text-text/75")}>{children}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
      {dismissible && (
        <button onClick={() => setOpen(false)} aria-label="Tutup banner" className="shrink-0 opacity-70 hover:opacity-100">
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
