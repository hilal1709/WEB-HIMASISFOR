"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Modal, ModalContent, ModalDescription, ModalTitle } from "@/components/ui/modal";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { cn } from "@/lib/utils";
import { fill } from "@/lib/kurikulum-content";

const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

function Mark({ text, q }) {
  if (!q) return text;
  const i = norm(text).indexOf(norm(q));
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark className="dosen-mark">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}



/**
 * Palet pencarian mata kuliah (Ctrl/⌘+K atau "/"): ketik → hasil per semester dengan teks cocok disorot,
 * ↑/↓ memilih, Enter membuka laci RPS. Kosong → ilustrasi + saran kata kunci.
 */
export function CourseSearch({ open, onOpenChange, courses, onPick, copy: t }) {
  const [q, setQ] = useState("");
  const [dq, setDq] = useState("");
  const [sel, setSel] = useState(0);
  const listRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setDq(q.trim()), 120);
    return () => clearTimeout(t);
  }, [q]);
  useEffect(() => {
    if (open) {
      setQ("");
      setDq("");
    }
  }, [open]);
  useEffect(() => setSel(0), [dq]);

  const results = useMemo(() => {
    const n = norm(dq);
    const hit = n ? courses.filter((c) => norm(`${c.nama} ${c.kode}`).includes(n)) : courses.filter((c) => c.rps);
    return hit.slice(0, 40);
  }, [dq, courses]);

  const groups = useMemo(() => {
    const m = new Map();
    results.forEach((c, i) => {
      const k = c.semester ? fill(t.semesterGroup, { n: c.semester }) : t.electiveGroup;
      if (!m.has(k)) m.set(k, []);
      m.get(k).push({ c, i });
    });
    return [...m.entries()];
  }, [results, t.semesterGroup, t.electiveGroup]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-i="${sel}"]`)?.scrollIntoView({ block: "nearest" });
  }, [sel]);

  const pick = (c) => {
    onOpenChange(false);
    setTimeout(() => onPick(c.slug), 120);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="top-[14%] max-w-xl translate-y-0 p-0" hideClose>
        <ModalTitle className="sr-only">{t.title}</ModalTitle>
        <ModalDescription className="sr-only">{t.description}</ModalDescription>
        <div className="flex items-center gap-3 border-b border-line px-5 pt-2">
          <svg aria-hidden viewBox="0 0 20 20" className="size-5 shrink-0 text-text/40">
            <circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path d="M14 14l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") (e.preventDefault(), setSel((s) => Math.min(results.length - 1, s + 1)));
              if (e.key === "ArrowUp") (e.preventDefault(), setSel((s) => Math.max(0, s - 1)));
              if (e.key === "Enter" && results[sel]) pick(results[sel]);
            }}
            placeholder={t.placeholder}
            role="combobox"
            aria-expanded="true"
            aria-controls="cur-search-list"
            aria-activedescendant={results[sel] ? `cur-opt-${sel}` : undefined}
            className="h-14 flex-1 bg-transparent text-[16px] text-navy outline-none placeholder:text-text/40"
          />
          <kbd className="rounded border border-line bg-cream px-1.5 py-0.5 text-[11px] text-text/50">Esc</kbd>
        </div>

        <div ref={listRef} id="cur-search-list" role="listbox" className="max-h-[56vh] overflow-y-auto p-2">
          {!dq && <p className="px-3 pb-1 pt-2 text-[12px] text-text/45">{t.readyLabel}</p>}
          {groups.map(([label, items]) => (
            <div key={label} className="pb-1">
              <p className="kicker px-3 pb-1 pt-3 text-[10.5px] text-maroon">{label}</p>
              {items.map(({ c, i }) => (
                <button
                  key={c.slug}
                  id={`cur-opt-${i}`}
                  role="option"
                  aria-selected={sel === i}
                  data-i={i}
                  onMouseMove={() => setSel(i)}
                  onClick={() => pick(c)}
                  className={cn("flex w-full items-center justify-between gap-4 rounded-md px-3 py-2.5 text-left transition-colors", sel === i ? "bg-cream" : "hover:bg-cream/60")}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span aria-hidden className={cn("h-6 w-[3px] shrink-0 rounded-full transition-colors", sel === i ? "bg-gold" : "bg-transparent")} />
                    <span className="truncate text-[15px] text-navy"><Mark text={c.nama} q={dq} /></span>
                  </span>
                  <span className="shrink-0 text-[12.5px] tabular-nums text-text/45">{c.sks ? `${c.sks} SKS` : ""}{c.rps ? ` · ${t.rpsTag}` : ""}</span>
                </button>
              ))}
            </div>
          ))}
          {dq && results.length === 0 && (
            <div className="flex flex-col items-center px-6 py-8 text-center">
              {t.emptyLottie && <div className="w-24"><LottieIllustration src={t.emptyLottie} /></div>}
              <p className="mt-3 font-serif text-lg text-navy">{fill(t.emptyTitle, { q: dq })}</p>
              <p className="mt-3 flex flex-wrap justify-center gap-2 text-[13px] text-text/55">
                {t.tryLabel}
                {t.suggestions.map((s) => (
                  <button key={s} type="button" onClick={() => setQ(s)} className="rounded-full border border-line px-2.5 py-0.5 text-navy hover:border-gold">{s}</button>
                ))}
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 border-t border-line bg-cream/50 px-5 py-2.5 text-[12px] text-text/50">
          <span>{t.hintNav}</span>
          <span>{t.hintOpen}</span>
          <span className="ml-auto">{fill(t.count, { n: courses.length })}</span>
        </div>
      </ModalContent>
    </Modal>
  );
}
