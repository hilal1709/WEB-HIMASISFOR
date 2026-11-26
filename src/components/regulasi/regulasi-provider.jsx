"use client";
import { createContext, useCallback, useContext, useLayoutEffect as useEffect, useMemo, useRef, useState } from "react";
import { MARKS_KEY } from "@/lib/regulasi-content";
import { fillRegulasi } from "@/lib/regulasi-cms/copy";
import { prefersReducedMotion } from "@/lib/motion";
import { useToast } from "@/components/ui/toast";
import { ProcedureModal } from "./procedure-modal";
import { DocModal } from "./doc-modal";

const Ctx = createContext(null);
export const useRegulasi = () => useContext(Ctx);

export function setHash(value) {
  try {
    history.replaceState(null, "", `${location.pathname}${location.search}${value ? `#${value}` : ""}`);
  } catch {}
}

export function smoothTo(id, behavior = prefersReducedMotion() ? "auto" : "smooth") {
  const target = document.getElementById(id);
  if (!target) return;
  if (window.parent !== window) {
    // scrollIntoView also scrolls the containing editor when called inside an iframe.
    const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    window.scrollTo({ top: window.scrollY + target.getBoundingClientRect().top - margin, behavior });
    return;
  }
  target.scrollIntoView({ behavior, block: "start" });
}

/**
 * State bersama halaman Regulasi Akademik:
 * - `chapter`  : bab yang sedang dibaca (pita ilustrasi hero ↔ minimap pembaca) — index
 * - `mode`     : "formal" (bahasa pedoman) | "plain" (bahasa sehari-hari)
 * - `flash`    : id pasal yang baru dituju (disorot sebentar)
 * - `marks`    : pasal yang ditandai (localStorage `sisfor:regulasi:tandai`)
 * - modal prosedur & modal dokumen
 * Deep link: `#pasal-1-3`, `#prosedur-<key>`, `#dokumen-<key>`.
 */
export function RegulasiProvider({ data, preview, children }) {
  const { chapters, scenarios, docs, copy } = data;
  const toast = useToast();
  const [chapter, setChapter] = useState(0);
  const [mode, setMode] = useState("plain");
  const [flash, setFlash] = useState(null);
  const [simFocus, setSimFocus] = useState(null);
  const [marks, setMarks] = useState([]);
  const [proc, setProc] = useState(null);
  const [doc, setDoc] = useState(null);
  const procedureIndex = scenarios.findIndex((item) => item.key === proc);
  const documentIndex = docs.findIndex((item) => item.key === doc);
  const flashTimer = useRef();

  const allPasal = useMemo(() => chapters.flatMap((c) => c.pasal.map((p) => ({ ...p, chapterTitle: c.title, roman: c.roman, chapterIndex: c.index }))), [chapters]);
  const findPasal = useCallback((no) => allPasal.find((p) => p.id === no) ?? allPasal.find((p) => p.no === no) ?? null, [allPasal]);

  useEffect(() => {
    if (preview) return;
    try {
      const raw = JSON.parse(localStorage.getItem(MARKS_KEY) ?? "[]");
      if (Array.isArray(raw)) setMarks(raw.filter((id) => allPasal.some((p) => p.id === id)));
    } catch {}
  }, [allPasal, preview]);

  const marksRef = useRef(marks);
  marksRef.current = marks;
  const saveMarks = useCallback((list) => {
    marksRef.current = list;
    setMarks(list);
    if (preview) return;
    try {
      localStorage.setItem(MARKS_KEY, JSON.stringify(list));
    } catch {}
  }, [preview]);

  const toggleMark = useCallback(
    (id) => {
      const p = findPasal(id);
      if (!p) return;
      const cur = marksRef.current;
      const on = cur.includes(id);
      const next = on ? cur.filter((x) => x !== id) : [...cur, id];
      marksRef.current = next;
      saveMarks(next);
      const undo = { label: copy.general.undo, onClick: () => ((marksRef.current = cur), saveMarks(cur)) };
      if (!on) toast.success(fillRegulasi(copy.reader.saved, p), { description: p.title, action: undo });
      else toast.info(fillRegulasi(copy.reader.removed, p), { action: undo });
    },
    [findPasal, saveMarks, toast, copy]
  );

  /** Gulir ke pasal dan sorot sebentar. */
  const goPasal = useCallback(
    (no) => {
      const p = findPasal(no);
      if (!p) return;
      setChapter(p.chapterIndex);
      setProc(null);
      setDoc(null);
      setHash(`pasal-${p.id}`);
      requestAnimationFrame(() => smoothTo(`pasal-${p.id}`));
      clearTimeout(flashTimer.current);
      setFlash(p.id);
      flashTimer.current = setTimeout(() => setFlash(null), 2600);
    },
    [findPasal]
  );

  const goSim = useCallback((key) => {
    setSimFocus(key);
    smoothTo("simulasi");
    setTimeout(() => setSimFocus(null), 2400);
  }, []);

  const openProc = useCallback(
    (i) => {
      if (!scenarios[i]) return;
      setDoc(null);
      setProc(scenarios[i].key);
      setHash(`prosedur-${scenarios[i].key}`);
    },
    [scenarios]
  );
  const openDoc = useCallback(
    (i) => {
      if (!docs[i]) return;
      setProc(null);
      setDoc(docs[i].key);
      setHash(`dokumen-${docs[i].key}`);
    },
    [docs]
  );
  const close = useCallback(() => {
    setProc(null);
    setDoc(null);
    setHash("");
  }, []);

  useEffect(() => {
    const fromHash = () => {
      const h = location.hash.slice(1);
      let m;
      if ((m = h.match(/^pasal-([a-z0-9-]+)$/))) {
        const p = findPasal(m[1]);
        if (p) setTimeout(() => goPasal(p.id), 400);
      } else if ((m = h.match(/^prosedur-([a-z0-9-]+)$/))) {
        const i = scenarios.findIndex((s) => s.key === m[1]);
        if (i >= 0) setProc(scenarios[i].key);
      } else if ((m = h.match(/^dokumen-([a-z0-9-]+)$/))) {
        const i = docs.findIndex((d) => d.key === m[1]);
        if (i >= 0) setDoc(docs[i].key);
      }
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [findPasal, goPasal, scenarios, docs]);

  const value = useMemo(
    () => ({ ...data, preview, allPasal, findPasal, chapter, setChapter, mode, setMode, flash, marks, toggleMark, saveMarks, goPasal, simFocus, goSim, openProc, openDoc }),
    [data, preview, allPasal, findPasal, chapter, mode, flash, marks, toggleMark, saveMarks, goPasal, simFocus, goSim, openProc, openDoc]
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <ProcedureModal scenarios={scenarios} index={procedureIndex < 0 ? null : procedureIndex} preview={preview} copy={copy} onIndex={openProc} onClose={close} findPasal={findPasal} onPasal={goPasal} />
      <DocModal docs={docs} chapters={chapters} version={data.version} index={documentIndex < 0 ? null : documentIndex} preview={preview} copy={copy} onIndex={openDoc} onClose={close} />
    </Ctx.Provider>
  );
}
