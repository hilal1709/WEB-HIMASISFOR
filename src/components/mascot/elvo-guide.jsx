"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Compass, ArrowUpRight } from "lucide-react";
import { useSmooth } from "@/components/scroll/smooth-scroll";
import { Elvo } from "./elvo";
import { cn } from "@/lib/utils";

const STORE = "elvo-guide-hidden";

/**
 * Elvo sang pemandu: maskot fixed yang berganti pose & dialog sesuai babak aktif.
 * Klik Elvo → menu "Mau ke mana?" untuk lompat babak. Bisa diperkecil (diingat per browser).
 */
export function ElvoGuide({ chapters }) {
  const { active, scrollToScene } = useSmooth();
  const [open, setOpen] = useState(false);
  const [bubble, setBubble] = useState(true);
  const [hidden, setHidden] = useState(false);
  const chapter = chapters.find((c) => c.id === active) ?? chapters[0];

  useEffect(() => {
    try {
      setHidden(localStorage.getItem(STORE) === "1");
    } catch {}
  }, []);

  // dialog muncul setiap ganti babak, lalu menghilang sendiri
  useEffect(() => {
    setBubble(true);
    const t = setTimeout(() => setBubble(false), 6500);
    return () => clearTimeout(t);
  }, [chapter.id]);

  const setHide = (v) => {
    setHidden(v);
    setOpen(false);
    try {
      localStorage.setItem(STORE, v ? "1" : "0");
    } catch {}
  };

  if (hidden) {
    return (
      <button
        onClick={() => setHide(false)}
        aria-label="Tampilkan Elvo, pemandu halaman"
        className="fixed bottom-4 right-4 z-[60] grid size-14 place-items-end justify-center overflow-hidden rounded-full border border-white/70 bg-white/85 shadow-float backdrop-blur-xl transition hover:scale-110 active:scale-95"
      >
        <span className="translate-y-3">
          <Elvo pose="wave" height={56} decorative />
        </span>
      </button>
    );
  }

  // babak yang sudah menampilkan Elvo besar (hero, penutup) — pemandu menyingkir
  const onHero = chapter.guide === false && !open;

  return (
    <div
      className={cn(
        "pointer-events-none fixed bottom-2 right-2 z-[60] flex flex-col items-end transition-all duration-700 ease-cinematic md:bottom-4 md:right-5",
        onHero && "translate-y-8 scale-75 opacity-0 [&_*]:!pointer-events-none"
      )}
      aria-hidden={onHero || undefined}
    >
      <AnimatePresence mode="wait">
        {open ? (
          <motion.nav
            key="menu"
            aria-label="Lompat ke babak"
            initial={{ opacity: 0, y: 12, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="glass pointer-events-auto mb-2 w-60 origin-bottom-right rounded-3xl p-2 shadow-float"
          >
            <p className="flex items-center gap-2 px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              <Compass className="size-3.5" /> Mau ke mana?
            </p>
            <ul>
              {chapters.map((c, i) => (
                <li key={c.id}>
                  <button
                    onClick={() => {
                      scrollToScene(c.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm transition-colors hover:bg-primary/10",
                      c.id === chapter.id && "bg-primary/10 font-semibold text-primary"
                    )}
                  >
                    <span className="w-5 font-mono text-[11px] tabular-nums text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                    <span className="flex-1">{c.label}</span>
                    <ArrowUpRight className="size-3.5 opacity-0 transition group-hover:opacity-100" />
                  </button>
                </li>
              ))}
            </ul>
          </motion.nav>
        ) : (
          bubble && (
            <motion.p
              key={chapter.id}
              role="status"
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 420, damping: 26 }}
              className="pointer-events-auto mb-1 mr-14 hidden max-w-[15rem] origin-bottom-right rounded-2xl rounded-br-md bg-ink px-4 py-3 text-[13px] leading-snug text-white shadow-float sm:block md:mr-24"
            >
              {chapter.say}
            </motion.p>
          )
        )}
      </AnimatePresence>

      <div className="group/elvo pointer-events-auto relative">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={`Elvo, pemandu halaman. Babak sekarang: ${chapter.label}. Buka menu navigasi`}
          className="group relative block animate-float rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <span aria-hidden className="absolute inset-x-5 bottom-0 h-3 rounded-full bg-ink/25 blur-md" />
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={chapter.pose}
              className="block origin-bottom transition-transform duration-300 group-hover:-rotate-6 group-active:scale-95"
              initial={{ opacity: 0, y: 24, scale: 0.7, rotate: -8 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, y: 12, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
            >
              <span className="block md:hidden">
                <Elvo pose={chapter.pose} height={84} decorative />
              </span>
              <span className="hidden md:block">
                <Elvo pose={chapter.pose} height={128} decorative />
              </span>
            </motion.span>
          </AnimatePresence>
        </button>
        <button
          onClick={() => setHide(true)}
          aria-label="Sembunyikan Elvo"
          className="absolute -left-1 top-1 grid size-6 place-items-center rounded-full bg-white text-muted-foreground opacity-0 shadow transition hover:text-foreground focus-visible:opacity-100 group-hover/elvo:opacity-100"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
