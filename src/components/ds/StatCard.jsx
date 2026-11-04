"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { animate } from "animejs";
import AppIcon from "./AppIcon";
import { cn } from "@/lib/utils";

/** Angka yang "menghitung naik" dengan anime.js. */
export function CountUp({ value = 0, duration = 1200, className }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const obj = { n: 0 };
    const a = animate(obj, {
      n: Number(value) || 0,
      duration,
      ease: "outExpo",
      onUpdate: () => { if (ref.current) ref.current.textContent = Math.round(obj.n).toLocaleString("id-ID"); },
    });
    return () => a.pause();
  }, [value, duration]);
  return <span ref={ref} className={className}>0</span>;
}

/** Kartu statistik dashboard. */
export default function StatCard({ title, value, icon = "trophy", hint, href, loading, className }) {
  const body = (
    <div className={cn("group relative overflow-hidden rounded-2xl border bg-white p-5 shadow-soft transition-all duration-300 ease-brand hover:-translate-y-1 hover:shadow-lift hover:border-brand-200", className)}>
      <div className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-brand-50 transition-transform duration-500 group-hover:scale-150" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-500">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">
            {loading ? <span className="inline-block h-8 w-16 animate-pulse rounded bg-zinc-100" /> : <CountUp value={value} />}
          </p>
          {hint && <p className="mt-1 text-xs text-zinc-400">{hint}</p>}
        </div>
        <div className="flex size-11 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lift">
          <AppIcon name={icon} size={22} target=".group" />
        </div>
      </div>
    </div>
  );
  return href ? <Link href={href} className="block">{body}</Link> : body;
}
