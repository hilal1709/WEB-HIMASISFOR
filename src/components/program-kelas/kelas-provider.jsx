"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ClassModal } from "./class-modal";
import { QuizModal } from "./quiz-modal";

const Ctx = createContext(null);
export const useKelas = () => useContext(Ctx);

const HASH = "#kelas-";

/** Ganti hash tanpa menambah riwayat dan tanpa melompat. */
export function setHash(value) {
  try {
    history.replaceState(null, "", `${location.pathname}${location.search}${value ? `#${value}` : ""}`);
  } catch {}
}

/**
 * State bersama halaman Program Kelas: kelas aktif (tab switcher, jadwal mingguan,
 * sorotan tabel, jalur di ilustrasi hero), modal detail kelas, dan modal kuis.
 * Deep link: `#kelas-<key>` memilih tab, `#kelas-<key>-detail` membuka modal detail.
 */
export function KelasProvider({ data, children }) {
  const { classes } = data;
  const [active, setActiveRaw] = useState(0);
  const [detail, setDetail] = useState(null);
  const [quizOpen, setQuizOpen] = useState(false);

  const setActive = useCallback(
    (i, { hash = true } = {}) => {
      setActiveRaw(i);
      if (hash) setHash(`kelas-${classes[i].key}`);
    },
    [classes]
  );

  const openDetail = useCallback(
    (i) => {
      setDetail(i);
      setHash(`kelas-${classes[i].key}-detail`);
    },
    [classes]
  );

  const closeDetail = useCallback(() => {
    setDetail(null);
    setHash(`kelas-${classes[active].key}`);
  }, [classes, active]);

  useEffect(() => {
    const fromHash = () => {
      const h = location.hash;
      if (!h.startsWith(HASH)) return;
      const rest = h.slice(HASH.length);
      const isDetail = rest.endsWith("-detail");
      const key = isDetail ? rest.slice(0, -"-detail".length) : rest;
      const i = classes.findIndex((c) => c.key === key);
      if (i < 0) return;
      setActiveRaw(i);
      if (isDetail) setDetail(i);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [classes]);

  const value = useMemo(
    () => ({ ...data, active, setActive, openDetail, openQuiz: () => setQuizOpen(true) }),
    [data, active, setActive, openDetail]
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <ClassModal classes={classes} index={detail} onIndex={openDetail} onClose={closeDetail} />
      <QuizModal open={quizOpen} onOpenChange={setQuizOpen} />
    </Ctx.Provider>
  );
}
