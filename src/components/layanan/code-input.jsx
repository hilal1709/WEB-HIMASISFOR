"use client";
import { useRef } from "react";
import { cn } from "@/lib/utils";

const LEN = 8;
/** "LA-2611-7KQ3" ↔ "26117KQ3" */
export const codeToChars = (code) => String(code ?? "").toUpperCase().replace(/^LA-?/, "").replace(/[^A-Z0-9]/g, "").slice(0, LEN);
export const charsToCode = (chars) => (/^\d{4}[A-Z0-9]{4}$/.test(chars) ? `LA-${chars.slice(0, 4)}-${chars.slice(4)}` : "");

/**
 * Kolom kode per karakter (pola 21st.dev OTP Input): awalan "LA" tetap, 4 angka periode + 4 karakter acak.
 * Maju otomatis, Backspace mundur, ←/→ berpindah, tempel kode lengkap mengisi semua kotak.
 */
export function CodeInput({ value, onChange, invalid, tone = "dark", id }) {
  const refs = useRef([]);
  const chars = value.padEnd(LEN, " ").slice(0, LEN).split("");

  const put = (i, ch) => {
    const arr = value.padEnd(LEN, " ").split("");
    arr[i] = ch;
    onChange(arr.join("").slice(0, LEN));
  };

  const onInput = (i, e) => {
    let raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (raw.length > 2) {
      // isian otomatis / tempel tanpa event paste
      const all = codeToChars(raw.startsWith("LA") ? raw : value.slice(0, i).replace(/ /g, "") + raw);
      onChange(all);
      refs.current[Math.min(all.length, LEN - 1)]?.focus();
      return;
    }
    raw = raw.slice(-1);
    if (!raw) return;
    if (i < 4 && !/\d/.test(raw)) return;
    put(i, raw);
    refs.current[i + 1]?.focus();
  };

  const onKey = (i, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (chars[i].trim()) put(i, " ");
      else if (i > 0) {
        put(i - 1, " ");
        refs.current[i - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft") refs.current[i - 1]?.focus();
    else if (e.key === "ArrowRight") refs.current[i + 1]?.focus();
  };

  const onPaste = (e) => {
    const t = e.clipboardData.getData("text");
    if (!t) return;
    e.preventDefault();
    const all = codeToChars(t);
    onChange(all);
    refs.current[Math.min(all.length, LEN - 1)]?.focus();
  };

  const dark = tone === "dark";
  const box = (i) => (
    <input
      key={i}
      id={i === 0 ? id : undefined}
      ref={(el) => (refs.current[i] = el)}
      value={chars[i].trim()}
      onChange={(e) => onInput(i, e)}
      onKeyDown={(e) => onKey(i, e)}
      onPaste={onPaste}
      onFocus={(e) => e.target.select()}
      inputMode={i < 4 ? "numeric" : "text"}
      autoCapitalize="characters"
      autoComplete="off"
      maxLength={LEN + 3}
      aria-label={`Karakter kode ke-${i + 1}`}
      aria-invalid={invalid || undefined}
      className={cn(
        "h-12 w-[2.35rem] rounded-md border text-center font-mono text-[18px] font-bold uppercase outline-none transition-[border-color,background-color,transform] duration-200 focus:-translate-y-0.5 sm:h-14 sm:w-11 sm:text-[20px]",
        dark
          ? "border-white/15 bg-white/5 text-white focus:border-gold focus:bg-white/10"
          : "border-line bg-white text-navy focus:border-navy",
        chars[i].trim() && (dark ? "border-gold/60" : "border-navy/40"),
        invalid && "border-red-400"
      )}
    />
  );

  return (
    <div className="flex items-center gap-1.5 sm:gap-2" role="group" aria-label="Kode pengajuan">
      <span className={cn("font-mono text-[18px] font-bold sm:text-[20px]", dark ? "text-gold" : "text-maroon")}>LA</span>
      <span aria-hidden className={dark ? "text-white/30" : "text-text/30"}>–</span>
      {[0, 1, 2, 3].map(box)}
      <span aria-hidden className={dark ? "text-white/30" : "text-text/30"}>–</span>
      {[4, 5, 6, 7].map(box)}
    </div>
  );
}
