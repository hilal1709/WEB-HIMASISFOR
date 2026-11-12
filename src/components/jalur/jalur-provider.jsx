"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { READY_KEY } from "@/lib/jalur-kelulusan-content";
import { prefersReducedMotion } from "@/lib/motion";
import { StageModal } from "./stage-modal";
import { PathModal } from "./path-modal";

const Ctx = createContext(null);
export const useJalur = () => useContext(Ctx);

export function setHash(value) {
  try {
    history.replaceState(null, "", `${location.pathname}${location.search}${value ? `#${value}` : ""}`);
  } catch {}
}

export function smoothTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
}

/**
 * State bersama halaman Jalur Kelulusan:
 * - `active`  : jalur yang sedang dibahas (hero, scrollytelling, cek kesiapan) — index
 * - modal tahap (`openStage(p, s)`) dan modal jalur (`openPath(p)`)
 * - `ready`   : centang daftar kesiapan per jalur (localStorage `sisfor:kesiapan:<key>`)
 * Deep link: `#jalur-<key>` membuka modal jalur, `#jalur-<key>-<n>` membuka tahap ke-n.
 */
export function JalurProvider({ data, children }) {
  const { paths } = data;
  const [active, setActive] = useState(0);
  const [stage, setStage] = useState(null); // { p, s }
  const [pathModal, setPathModal] = useState(null);
  const [ready, setReady] = useState(() => paths.map((p) => p.ready.map(() => false)));

  useEffect(() => {
    setReady(
      paths.map((p) => {
        try {
          const raw = JSON.parse(localStorage.getItem(READY_KEY + p.key) ?? "[]");
          return p.ready.map((_, i) => !!raw[i]);
        } catch {
          return p.ready.map(() => false);
        }
      })
    );
  }, [paths]);

  const setReadyFor = useCallback(
    (p, list) => {
      setReady((all) => all.map((r, i) => (i === p ? list : r)));
      try {
        localStorage.setItem(READY_KEY + paths[p].key, JSON.stringify(list));
      } catch {}
    },
    [paths]
  );

  const openStage = useCallback(
    (p, s) => {
      setPathModal(null);
      setStage({ p, s });
      setHash(`jalur-${paths[p].key}-${s + 1}`);
    },
    [paths]
  );
  const openPath = useCallback(
    (p) => {
      setStage(null);
      setPathModal(p);
      setHash(`jalur-${paths[p].key}`);
    },
    [paths]
  );
  const close = useCallback(() => {
    setStage(null);
    setPathModal(null);
    setHash("");
  }, []);

  useEffect(() => {
    const fromHash = () => {
      const m = location.hash.match(/^#jalur-([a-z]+)(?:-(\d+))?$/);
      if (!m) return;
      const p = paths.findIndex((x) => x.key === m[1]);
      if (p < 0) return;
      setActive(p);
      const s = m[2] ? Number(m[2]) - 1 : null;
      if (s != null && paths[p].stages[s]) setStage({ p, s });
      else if (s == null) setPathModal(p);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [paths]);

  const value = useMemo(() => ({ ...data, active, setActive, openStage, openPath, ready, setReadyFor }), [data, active, openStage, openPath, ready, setReadyFor]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <StageModal paths={paths} at={stage} onAt={(p, s) => openStage(p, s)} onClose={close} />
      <PathModal paths={paths} index={pathModal} onIndex={openPath} onClose={close} onStage={openStage} method={data.method} />
    </Ctx.Provider>
  );
}
