"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { MARKS_KEY } from "@/lib/regulasi-content";
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

export function smoothTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
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
export function RegulasiProvider({ data, children }) {
  const { chapters, scenarios, docs } = data;
  const toast = useToast();
  const [chapter, setChapter] = useState(0);
  const [mode, setMode] = useState("plain");
  const [flash, setFlash] = useState(null);
  const [simFocus, setSimFocus] = useState(null);
  const [marks, setMarks] = useState([]);
  const [proc, setProc] = useState(null);
  const [doc, setDoc] = useState(null);
  const flashTimer = useRef();

  const allPasal = useMemo(() => chapters.flatMap((c) => c.pasal.map((p) => ({ ...p, chapterTitle: c.title, roman: c.roman, chapterIndex: c.index }))), [chapters]);
  const findPasal = useCallback((no) => allPasal.find((p) => p.no === no || p.id === no) ?? null, [allPasal]);

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(MARKS_KEY) ?? "[]");
      if (Array.isArray(raw)) setMarks(raw.filter((id) => allPasal.some((p) => p.id === id)));
    } catch {}
  }, [allPasal]);

  const marksRef = useRef(marks);
  marksRef.current = marks;
  const saveMarks = useCallback((list) => {
    marksRef.current = list;
    setMarks(list);
    try {
      localStorage.setItem(MARKS_KEY, JSON.stringify(list));
    } catch {}
  }, []);

  const toggleMark = useCallback(
    (id) => {
      const p = findPasal(id);
      const cur = marksRef.current;
      const on = cur.includes(id);
      const next = on ? cur.filter((x) => x !== id) : [...cur, id];
      marksRef.current = next;
      saveMarks(next);
      const undo = { label: "Batalkan", onClick: () => ((marksRef.current = cur), saveMarks(cur)) };
      if (!on) toast.success(`Pasal ${p?.no} ditandai`, { description: p?.title, action: undo });
      else toast.info(`Tanda pasal ${p?.no} dilepas`, { action: undo });
    },
    [findPasal, saveMarks, toast]
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
      setDoc(null);
      setProc(i);
      setHash(`prosedur-${scenarios[i].key}`);
    },
    [scenarios]
  );
  const openDoc = useCallback(
    (i) => {
      setProc(null);
      setDoc(i);
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
      if ((m = h.match(/^pasal-(\d+-\d+)$/))) {
        const p = findPasal(m[1]);
        if (p) setTimeout(() => goPasal(p.no), 400);
      } else if ((m = h.match(/^prosedur-([a-z-]+)$/))) {
        const i = scenarios.findIndex((s) => s.key === m[1]);
        if (i >= 0) setProc(i);
      } else if ((m = h.match(/^dokumen-([a-z-]+)$/))) {
        const i = docs.findIndex((d) => d.key === m[1]);
        if (i >= 0) setDoc(i);
      }
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [findPasal, goPasal, scenarios, docs]);

  const value = useMemo(
    () => ({ ...data, allPasal, findPasal, chapter, setChapter, mode, setMode, flash, marks, toggleMark, saveMarks, goPasal, simFocus, goSim, openProc, openDoc }),
    [data, allPasal, findPasal, chapter, mode, flash, marks, toggleMark, saveMarks, goPasal, simFocus, goSim, openProc, openDoc]
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <ProcedureModal scenarios={scenarios} index={proc} onIndex={openProc} onClose={close} findPasal={findPasal} onPasal={goPasal} />
      <DocModal docs={docs} chapters={chapters} version={data.version} index={doc} onIndex={openDoc} onClose={close} />
    </Ctx.Provider>
  );
}
