"use client";
import { createContext, useCallback, useContext, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";

const Ctx = createContext(null);
export const useKontak = () => useContext(Ctx);

export function smoothTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
}

/**
 * State bersama halaman Kontak: topik yang "disambung" di papan sambung (`topicKey`) mengisi
 * "Kepada Yth." dan perihal surat. `pick(key, { scroll })` dipakai papan sambung maupun formulir.
 */
export function KontakProvider({ data, children }) {
  const [topicKey, setTopicKey] = useState(null);
  const pick = useCallback((key, { scroll = false } = {}) => {
    setTopicKey(key);
    if (scroll) requestAnimationFrame(() => smoothTo("surat"));
  }, []);
  const hasChannel = Boolean(data.channels.email || data.channels.whatsapp);
  return <Ctx.Provider value={{ ...data, topicKey, pick, hasChannel }}>{children}</Ctx.Provider>;
}
