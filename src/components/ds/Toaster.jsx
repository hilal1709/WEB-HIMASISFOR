"use client";
import { Toaster as Sonner } from "sonner";
import AppIcon from "./AppIcon";

/** Toaster global Sisfor DS — dipasang sekali di root layout. */
export default function Toaster(props) {
  return (
    <Sonner
      position="top-right"
      richColors={false}
      closeButton
      gap={10}
      icons={{
        success: <AppIcon name="success" size={18} className="text-success" />,
        error: <AppIcon name="error" size={18} className="text-danger" />,
        warning: <AppIcon name="warning" size={18} className="text-warning" />,
        info: <AppIcon name="info" size={18} className="text-info" />,
      }}
      toastOptions={{
        classNames: {
          toast: "!rounded-xl !border !border-border !bg-white !shadow-soft !font-sans !gap-3 !items-start",
          title: "!text-sm !font-semibold !text-zinc-900",
          description: "!text-xs !text-zinc-500",
          success: "!border-l-4 !border-l-[var(--success)]",
          error: "!border-l-4 !border-l-[var(--danger)]",
          warning: "!border-l-4 !border-l-[var(--warning)]",
          info: "!border-l-4 !border-l-[var(--info)]",
          actionButton: "!bg-brand-600 !text-white !rounded-md",
          closeButton: "!bg-white !border-border",
        },
      }}
      {...props}
    />
  );
}
