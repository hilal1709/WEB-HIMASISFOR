"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Magnetic } from "@/components/motion/magnetic";
import { NAV, PMB_URL } from "@/lib/home-content";
import { cn } from "@/lib/utils";

/** Navbar kaca melayang. Menyusut saat scroll turun, muncul lagi saat scroll naik. */
export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setHidden(y > 400 && y > last + 4);
      if (y < last - 4) setHidden(false);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[70] flex justify-center px-4 pt-3 transition-transform duration-700 ease-cinematic md:pt-4",
          hidden && !open && "-translate-y-[130%]"
        )}
      >
        <nav
          aria-label="Navigasi utama"
          className={cn(
            "flex w-full max-w-6xl items-center justify-between gap-4 rounded-full py-2 pl-5 pr-2 transition-all duration-700 ease-cinematic",
            scrolled ? "glass shadow-float" : "bg-transparent"
          )}
        >
          <Link href="/" aria-label="Sistem Informasi UISI, ke beranda" className="shrink-0">
            <Image src="/img/logo.png" alt="Sistem Informasi UISI" width={183} height={58} priority className="h-8 w-auto md:h-9" />
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {NAV.map((n, i) => (
              <li key={n.label}>
                <Link
                  href={n.href}
                  className={cn(
                    "group relative block rounded-full px-3.5 py-2 text-[13px] font-medium text-ink/70 transition-colors hover:text-ink",
                    i === 0 && "text-primary hover:text-primary"
                  )}
                  aria-current={i === 0 ? "page" : undefined}
                >
                  <span className="absolute inset-0 scale-75 rounded-full bg-ink/5 opacity-0 transition-all duration-300 ease-cinematic group-hover:scale-100 group-hover:opacity-100" />
                  <span className="relative">{n.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <Magnetic strength={0.25} className="hidden sm:inline-block">
              <a
                href={PMB_URL}
                className="group inline-flex h-10 items-center gap-2 rounded-full bg-gradient-to-r from-brand-from to-brand-to pl-5 pr-1.5 text-[13px] font-semibold text-white shadow-[0_10px_24px_-10px_rgb(193_15_17/0.8)]"
              >
                Daftar Sekarang
                <span className="grid size-7 place-items-center rounded-full bg-white/20 transition-transform duration-500 ease-cinematic group-hover:rotate-45">
                  <ArrowUpRight className="size-3.5" />
                </span>
              </a>
            </Magnetic>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? "Tutup menu" : "Buka menu"}
              className="grid size-10 place-items-center rounded-full bg-ink text-white lg:hidden"
            >
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ clipPath: "circle(0% at calc(100% - 40px) 40px)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 40px) 40px)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 40px) 40px)" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[65] flex flex-col bg-ink px-6 pb-10 pt-28 text-white lg:hidden"
          >
            <ul className="flex flex-col gap-1">
              {NAV.map((n, i) => (
                <motion.li key={n.label} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05 }}>
                  <Link href={n.href} onClick={() => setOpen(false)} className="flex items-baseline gap-4 border-b border-white/10 py-4 text-3xl font-semibold tracking-tight">
                    <span className="font-mono text-xs text-white/40">{String(i + 1).padStart(2, "0")}</span>
                    {n.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <a href={PMB_URL} className="mt-auto flex h-14 items-center justify-center rounded-full bg-gradient-to-r from-brand-from to-brand-to font-semibold">
              Daftar Sekarang
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
