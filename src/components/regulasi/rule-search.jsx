"use client";
import { Fragment, useEffect, useId, useMemo, useRef, useState } from "react";
import { DotsLoader } from "@/components/ui/loader";
import { WordRotate } from "@/components/motion/word-rotate";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { cn } from "@/lib/utils";
import { useRegulasi } from "./regulasi-provider";

const SUGGEST = ["cuti", "nilai E", "titip absen", "batas SKS"];
const norm = (s) => String(s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Sorot bagian teks yang cocok dengan kata kunci. */
export function Highlight({ text, q }) {
  const words = norm(q).split(/\s+/).filter((w) => w.length > 1);
  if (!words.length) return text;
  const re = new RegExp(`(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  return String(text)
    .split(re)
    .map((part, i) => (i % 2 ? <mark key={i} className="dosen-mark">{part}</mark> : <Fragment key={i}>{part}</Fragment>));
}

/**
 * Kolom tanya gaya command picker kaca (inspirasi horizonx): hasil instan langsung di bawah input
 * (bukan modal), ↑/↓/Enter/Esc, "/" memfokuskan. Mencari di pasal (judul, tag, kedua versi bahasa) dan
 * situasi "Kalau terjadi…". Pasal → gulir + sorot; situasi → modal prosedur.
 */
export function RuleSearch() {
  const { allPasal, scenarios, goPasal, openProc } = useRegulasi();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [settled, setSettled] = useState("");
  const [cursor, setCursor] = useState(0);
  const input = useRef(null);
  const box = useRef(null);
  const id = useId();

  // jeda singkat → loader titik, lalu hasil (terasa "mencari", bukan berkedip tiap ketukan)
  useEffect(() => {
    if (!q.trim()) {
      setSettled("");
      setBusy(false);
      return;
    }
    setBusy(true);
    const t = setTimeout(() => {
      setSettled(q);
      setBusy(false);
      setCursor(0);
    }, 260);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey) return;
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      e.preventDefault();
      input.current?.focus();
    };
    const onDown = (e) => !box.current?.contains(e.target) && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, []);

  const results = useMemo(() => {
    const words = norm(settled).split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    const score = (fields) =>
      words.reduce((t, w) => {
        const s = fields.reduce((acc, [text, weight]) => acc + (norm(text).includes(w) ? weight : 0), 0);
        return s ? t + s : -Infinity;
      }, 0);
    const pasal = allPasal.map((p) => ({ type: "pasal", item: p, s: score([[p.title, 4], [p.tags.join(" "), 3], [p.plain, 1], [p.formal, 1]]) }));
    const sc = scenarios.map((x, i) => ({ type: "scenario", item: x, index: i, s: score([[x.title, 5], [x.steps.join(" "), 1]]) }));
    return [...sc, ...pasal].filter((r) => r.s > 0).sort((a, b) => b.s - a.s).slice(0, 6);
  }, [settled, allPasal, scenarios]);

  const pick = (r) => {
    setOpen(false);
    input.current?.blur();
    if (r.type === "pasal") goPasal(r.item.no);
    else openProc(r.index);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setCursor((c) => Math.min(c + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === "Enter" && results[cursor]) {
      e.preventDefault();
      pick(results[cursor]);
    } else if (e.key === "Escape") {
      setOpen(false);
      input.current?.blur();
    }
  };

  const showPanel = open && q.trim().length > 0;

  return (
    <div ref={box} className="relative z-30 mx-auto w-full max-w-2xl">
      <div
        className={cn(
          "relative flex h-[60px] items-center gap-3 rounded-xl border bg-white/80 px-5 shadow-[0_24px_60px_-34px_rgb(20_33_61/0.55)] backdrop-blur-md transition-[border-color,box-shadow] duration-300",
          showPanel ? "rounded-b-none border-navy/25" : "border-line hover:border-navy/25",
          "focus-within:border-navy/40 focus-within:shadow-[0_24px_60px_-30px_rgb(20_33_61/0.6)]"
        )}
      >
        <svg aria-hidden viewBox="0 0 20 20" className="size-5 shrink-0 text-maroon">
          <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="M13 13l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <div className="relative min-w-0 flex-1">
          <input
            ref={input}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded={showPanel}
            aria-controls={`${id}-list`}
            aria-activedescendant={showPanel && results[cursor] ? `${id}-${cursor}` : undefined}
            aria-label="Cari aturan akademik"
            className="h-[58px] w-full bg-transparent text-[16.5px] text-navy outline-none placeholder:text-transparent"
            placeholder="Cari aturan"
          />
          {!q && (
            <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 flex items-center gap-1.5 whitespace-nowrap text-[16.5px] text-text/45">
              Cari aturan tentang <WordRotate words={SUGGEST} className="text-maroon" />
            </span>
          )}
        </div>
        {busy ? (
          <DotsLoader className="text-maroon [&>span]:size-1.5" />
        ) : (
          <kbd className="hidden rounded border border-line bg-cream px-2 py-0.5 font-sans text-[12px] text-text/55 sm:inline-block">/</kbd>
        )}
      </div>

      {!showPanel && (
        <p className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[13px] text-text/50">
          Sering dicari:
          {SUGGEST.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setQ(s);
                setOpen(true);
                input.current?.focus();
              }}
              className="rounded-md border border-line bg-white px-2.5 py-1 text-navy transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-maroon/40"
            >
              {s}
            </button>
          ))}
        </p>
      )}

      {showPanel && (
        <div className="absolute inset-x-0 top-full overflow-hidden rounded-b-xl border border-t-0 border-navy/25 bg-white/95 shadow-[0_40px_80px_-40px_rgb(20_33_61/0.6)] backdrop-blur-md animate-in fade-in-0 slide-in-from-top-1 duration-300">
          {busy && !results.length ? (
            <div className="space-y-2 p-4" aria-hidden>
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-cream" style={{ animationDelay: `${i * 120}ms` }} />
              ))}
            </div>
          ) : results.length ? (
            <ul id={`${id}-list`} role="listbox" aria-label="Hasil pencarian" className="max-h-[360px] overflow-y-auto p-2">
              {results.map((r, i) => (
                <li
                  key={`${r.type}-${r.item.key ?? r.item.id}`}
                  id={`${id}-${i}`}
                  role="option"
                  aria-selected={i === cursor}
                  onPointerEnter={() => setCursor(i)}
                  onClick={() => pick(r)}
                  className={cn(
                    "flex cursor-pointer items-start gap-4 rounded-lg px-3 py-3 transition-colors duration-200 animate-in fade-in-0 slide-in-from-bottom-1 fill-mode-both",
                    i === cursor ? "bg-cream" : "bg-transparent"
                  )}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <span className={cn("mt-0.5 w-12 shrink-0 font-serif text-[15px] tabular", r.type === "pasal" ? "text-maroon" : "text-gold")}>
                    {r.type === "pasal" ? `§ ${r.item.no}` : "Bila"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold text-navy">
                      <Highlight text={r.item.title} q={settled} />
                    </span>
                    <span className="mt-0.5 line-clamp-1 text-[13.5px] text-text/60">
                      {r.type === "pasal" ? <Highlight text={r.item.plain} q={settled} /> : `Prosedur · tenggat ${r.item.deadline.toLowerCase()}`}
                    </span>
                  </span>
                  <span aria-hidden className={cn("mt-1 text-[12px] text-text/40 transition-opacity", i === cursor ? "opacity-100" : "opacity-0")}>
                    ↵
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center gap-4 p-5">
              <LottieIllustration src="/lottie/empty-news.json" className="w-16 shrink-0" />
              <p className="text-[14px] leading-relaxed text-text/65">
                Belum ada pasal tentang “<span className="text-navy">{settled}</span>”. Coba kata lain, atau tanyakan ke dosen wali.
              </p>
            </div>
          )}
          <div className="hidden items-center gap-4 border-t border-line px-4 py-2 text-[12px] text-text/45 sm:flex">
            <span><kbd className="font-sans">↑↓</kbd> pilih</span>
            <span><kbd className="font-sans">Enter</kbd> buka</span>
            <span><kbd className="font-sans">Esc</kbd> tutup</span>
          </div>
        </div>
      )}
    </div>
  );
}
