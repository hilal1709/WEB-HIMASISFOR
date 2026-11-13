"use client";
import { createContext, useCallback, useContext, useLayoutEffect as useEffect, useMemo, useState } from "react";
import { CODES_KEY, loketStatus, serviceByKey } from "@/lib/layanan-content";
import { prefersReducedMotion } from "@/lib/motion";
import { ServiceModal } from "./service-modal";
import { RequestWizard } from "./request-wizard";

const Ctx = createContext(null);
export const useLayanan = () => useContext(Ctx);

export function setHash(value) {
  try {
    history.replaceState(null, "", `${location.pathname}${location.search}${value ? `#${value}` : ""}`);
  } catch {}
}

export function smoothTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
}

const readCodes = () => {
  try {
    const list = JSON.parse(localStorage.getItem(CODES_KEY) ?? "[]");
    return Array.isArray(list) ? list.filter((c) => typeof c?.code === "string").slice(0, 8) : [];
  } catch {
    return [];
  }
};

/**
 * State bersama halaman Layanan Akademik:
 * - `now`         : waktu klien (null saat SSR) → status loket & perkiraan tanggal siap; diperbarui tiap menit
 * - modal layanan : `openService(key)` (deep link `#layanan-<key>`)
 * - wizard        : `openWizard({ serviceKey, fields, attachment, resubmitOf })`
 * - `codes`       : kode pengajuan di perangkat ini (localStorage `sisfor:layanan:kode`)
 * - `track`       : permintaan pelacakan dari bagian lain (`trackCode(code)` → isi pelacak + gulir)
 */
export function LayananProvider({ data, children }) {
  const [now, setNow] = useState(null);
  const [serviceKey, setServiceKey] = useState(null);
  const [wizard, setWizard] = useState(null);
  const [codes, setCodes] = useState([]);
  const [track, setTrack] = useState(null);

  useEffect(() => {
    setNow(new Date());
    setCodes(readCodes());
    const t = setInterval(() => setNow(new Date()), 60_000);
    const fromHash = () => {
      const m = location.hash.match(/^#layanan-(.+)$/);
      if (m && serviceByKey(m[1], data.services)) setServiceKey(m[1]);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => {
      clearInterval(t);
      window.removeEventListener("hashchange", fromHash);
    };
  }, [data.services]);

  const openService = useCallback((key) => {
    setServiceKey(key);
    setHash(key ? `layanan-${key}` : "");
  }, []);

  const openWizard = useCallback((preset = {}) => {
    setServiceKey(null);
    setHash("");
    setWizard({ ...preset, id: Date.now() });
  }, []);

  const addCode = useCallback((entry) => {
    setCodes((prev) => {
      const next = [entry, ...prev.filter((c) => c.code !== entry.code)].slice(0, 8);
      try {
        localStorage.setItem(CODES_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const forgetCode = useCallback((code) => {
    setCodes((prev) => {
      const next = prev.filter((c) => c.code !== code);
      try {
        localStorage.setItem(CODES_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const trackCode = useCallback((code) => {
    setWizard(null);
    setTrack({ code, id: Date.now() });
    requestAnimationFrame(() => smoothTo("lacak"));
  }, []);

  const loket = useMemo(() => loketStatus(now, data.hours), [now, data.hours]);

  const value = {
    ...data,
    now,
    loket,
    serviceKey,
    openService,
    wizard,
    openWizard,
    closeWizard: () => setWizard(null),
    codes,
    addCode,
    forgetCode,
    track,
    trackCode,
  };

  return (
    <Ctx.Provider value={value}>
      {children}
      <ServiceModal />
      <RequestWizard />
    </Ctx.Provider>
  );
}
