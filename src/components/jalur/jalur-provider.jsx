"use client";
import { createContext, useCallback, useContext, useLayoutEffect as useEffect, useMemo, useState } from "react";
import { READY_KEY } from "@/lib/jalur-kelulusan-content";
import { readJalurChecks, stageFromHash } from "@/lib/jalur-cms/schema";
import { prefersReducedMotion } from "@/lib/motion";
import { StageModal } from "./stage-modal";
import { PathModal } from "./path-modal";

const Ctx = createContext(null);
export const useJalur = () => useContext(Ctx);

export function setHash(value) {
  try {
    history.replaceState(history.state, "", `${location.pathname}${location.search}${value ? `#${value}` : ""}`);
  } catch {}
}

export function smoothTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
}

export function handleJalurTabs(event, index, setIndex, length) {
  if (!length) return;
  const positions = { ArrowLeft: (index + length - 1) % length, ArrowRight: (index + 1) % length, Home: 0, End: length - 1 };
  const next = positions[event.key];
  if (typeof next !== "number") return;
  event.preventDefault();
  setIndex(next);
  event.currentTarget.querySelectorAll("button")[next]?.focus();
}

export function JalurProvider({ data, children }) {
  const { paths, preview, copy: { labels }, method, academic } = data;
  const [activeKey, setActiveKey] = useState(paths[0]?.key);
  const [modal, setModal] = useState(null);
  const [checks, setChecks] = useState({});
  const active = Math.max(0, paths.findIndex((path) => path.key === activeKey));
  const setActive = useCallback((i) => setActiveKey(paths[i]?.key), [paths]);
  const ready = useMemo(() => paths.map((p) => p.ready.map((item) => checks[p.key]?.[item.id] === true)), [paths, checks]);

  useEffect(() => {
    if (preview) return;
    setChecks(Object.fromEntries(paths.map((p) => {
        try {
          const raw = JSON.parse(localStorage.getItem(READY_KEY + p.key) ?? "[]");
          return [p.key, readJalurChecks(raw)];
        } catch {
          return [p.key, {}];
        }
      })));
  }, [paths, preview]);

  const setReadyFor = useCallback(
    (p, list) => {
      const path = paths[p];
      if (!path) return;
      const values = Object.fromEntries(path.ready.map((item, i) => [item.id, list[i] === true]));
      setChecks((all) => ({ ...all, [path.key]: { ...all[path.key], ...values } }));
      if (preview) return;
      try {
        const key = READY_KEY + path.key;
        const saved = readJalurChecks(JSON.parse(localStorage.getItem(key) ?? "[]"));
        localStorage.setItem(key, JSON.stringify({ ...saved, ...values }));
      } catch {}
    },
    [paths, preview]
  );

  const openStage = useCallback(
    (p, s) => {
      const path = paths[p];
      const stage = path?.stages[s];
      if (!stage) return;
      setModal({ key: path.key, stage: stage.id });
      setHash(`jalur-${path.key}/tahap/${stage.id}`);
    },
    [paths]
  );
  const openPath = useCallback(
    (p) => {
      if (!paths[p]) return;
      setModal({ key: paths[p].key });
      setHash(`jalur-${paths[p].key}`);
    },
    [paths]
  );
  const close = useCallback(() => {
    setModal(null);
    setHash("");
  }, []);

  useEffect(() => {
    const fromHash = () => {
      const target = stageFromHash(paths, location.hash);
      setModal(target);
      if (target) setActiveKey(target.key);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [paths]);

  const value = useMemo(() => ({ ...data, active, setActive, openStage, openPath, ready, setReadyFor }), [data, active, setActive, openStage, openPath, ready, setReadyFor]);
  const modalPath = paths.findIndex((path) => path.key === modal?.key);
  const modalStage = modal?.stage ? paths[modalPath]?.stages.findIndex((stage) => stage.id === modal.stage) ?? -1 : -1;

  return (
    <Ctx.Provider value={value}>
      {children}
      <StageModal paths={paths} at={modalStage >= 0 ? { p: modalPath, s: modalStage } : null} onAt={openStage} onClose={close} labels={labels} />
      <PathModal paths={paths} index={modalPath >= 0 && !modal.stage ? modalPath : null} onIndex={openPath} onClose={close} onStage={openStage} method={method} prerequisitePath={academic.prerequisitePath} labels={labels} />
    </Ctx.Provider>
  );
}
