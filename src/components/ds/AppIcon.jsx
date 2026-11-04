"use client";
import { LordIcon } from "@lordicon/react";
import { ICONS } from "@/lib/icons";
import { cn } from "@/lib/utils";

/**
 * Ikon standar Sisfor DS. Memakai Lordicon (animasi) bila tersedia,
 * selain itu ikon lucide dengan micro-interaction CSS saat hover.
 *
 * <AppIcon name="trash" size={20} trigger="hover" target=".group" />
 */
export default function AppIcon({ name, size = 20, trigger = "hover", target, colors, className, ...props }) {
  const entry = ICONS[name];
  if (!entry) return null;
  const Fallback = entry.fallback;
  const fallback = (
    <Fallback
      aria-hidden="true"
      style={{ width: size, height: size }}
      className={cn("transition-transform duration-300 ease-brand group-hover:scale-110 group-hover:-rotate-6", className)}
      {...props}
    />
  );

  if (!entry.lordicon) return fallback;

  return (
    <LordIcon
      src={entry.lordicon}
      trigger={trigger}
      target={target}
      colors={colors || "primary:currentColor,secondary:#dc2626"}
      currentColor={!colors}
      style={{ width: size, height: size }}
      className={className}
      aria-hidden="true"
    >
      {fallback}
    </LordIcon>
  );
}
