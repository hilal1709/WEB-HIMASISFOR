"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { socketId, useChannel } from "@/lib/realtime/client";

const AUTOSAVE_MS = 1200;
const UNDO_MAX = 40;

async function api(url, init) {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...init });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) throw new Error(json.error || "Permintaan gagal");
  return json;
}

/** Set nilai bersarang secara imutabel: setIn(obj, "letter.banner.title", "…"). */
export function setIn(obj, path, val) {
  const [k, ...rest] = typeof path === "string" ? path.split(".") : path;
  const key = Array.isArray(obj) ? Number(k) : k;
  const copy = Array.isArray(obj) ? [...obj] : { ...obj };
  copy[key] = rest.length ? setIn(obj?.[key] ?? {}, rest, val) : val;
  return copy;
}
export const getIn = (obj, path) => path.split(".").reduce((o, k) => o?.[k], obj);

/**
 * State Kartografer Kurikulum: satu dokumen, autosave debounce, riwayat urungkan lokal,
 * terbit/buang/pulihkan versi, sinkron admin lain lewat Pusher.
 */
export function useKartografer({ onRemote, onSaved } = {}) {
  const [doc, setDoc] = useState(null); // snapshot server
  const [value, setValue] = useState(null); // isi kerja
  const [status, setStatus] = useState("idle"); // idle | typing | saving | saved | error
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const timer = useRef(null);
  const latest = useRef(undefined);
  const undo = useRef([]);
  const redo = useRef([]);
  const lastPush = useRef(0);
  const cur = useRef(null);
  const hooks = useRef({ onRemote, onSaved });
  hooks.current = { onRemote, onSaved };

  const load = useCallback(async () => {
    setError(null);
    try {
      const json = await api("/api/kurikulum-cms");
      setDoc(json.data);
      cur.current = json.data.value;
      setValue(json.data.value);
      setUser(json.user);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    load();
    return () => clearTimeout(timer.current);
  }, [load]);

  const save = useCallback(async () => {
    clearTimeout(timer.current);
    const v = latest.current;
    if (v === undefined) return;
    setStatus("saving");
    try {
      const { data } = await api("/api/kurikulum-cms", { method: "PUT", body: JSON.stringify({ value: v, socketId: socketId() }) });
      if (latest.current === v) {
        latest.current = undefined;
        setDoc(data);
      } else {
        setDoc((d) => ({ ...data, value: d?.value }));
      }
      setStatus("saved");
      hooks.current.onSaved?.();
    } catch (e) {
      setStatus("error");
      throw e;
    }
  }, []);

  const schedule = useCallback(
    (next) => {
      latest.current = next;
      setStatus("typing");
      clearTimeout(timer.current);
      timer.current = setTimeout(() => save().catch(() => {}), AUTOSAVE_MS);
    },
    [save]
  );

  const commit = useCallback(
    (next, { merge = false } = {}) => {
      const now = Date.now();
      if (!merge || now - lastPush.current > 900) {
        undo.current = [...undo.current.slice(-UNDO_MAX + 1), cur.current];
        redo.current = [];
      }
      lastPush.current = merge ? now : 0;
      cur.current = next;
      setValue(next);
      schedule(next);
    },
    [schedule]
  );

  /** Ubah satu field. Ketikan beruntun (< 900 ms) digabung jadi satu langkah urungkan. */
  const update = useCallback((path, val) => commit(setIn(cur.current, path, val), { merge: true }), [commit]);
  const replace = useCallback((next) => commit(next), [commit]);

  const step = useCallback(
    (dir) => {
      const from = dir < 0 ? undo : redo;
      const to = dir < 0 ? redo : undo;
      if (!from.current.length) return false;
      const prev = from.current[from.current.length - 1];
      from.current = from.current.slice(0, -1);
      to.current = [...to.current, cur.current];
      lastPush.current = 0;
      cur.current = prev;
      setValue(prev);
      schedule(prev);
      return true;
    },
    [schedule]
  );

  const flush = useCallback(() => save(), [save]);

  const discard = useCallback(async () => {
    clearTimeout(timer.current);
    latest.current = undefined;
    const { data } = await api("/api/kurikulum-cms", { method: "DELETE", headers: { "x-socket-id": socketId() ?? "" } });
    setDoc(data);
    cur.current = data.value;
    setValue(data.value);
    undo.current = [];
    redo.current = [];
    setStatus("saved");
    return data;
  }, []);

  const publish = useCallback(async () => {
    await save();
    const json = await api("/api/kurikulum-cms/publish", { method: "POST", body: JSON.stringify({ socketId: socketId() }) });
    setDoc(json.data);
    cur.current = json.data.value;
    setValue(json.data.value);
    return json.published;
  }, [save]);

  const restore = useCallback(async (index) => {
    clearTimeout(timer.current);
    latest.current = undefined;
    const { data } = await api("/api/kurikulum-cms/history", { method: "POST", body: JSON.stringify({ index, socketId: socketId() }) });
    undo.current = [...undo.current, cur.current];
    cur.current = data.value;
    setValue(data.value);
    setDoc(data);
    setStatus("saved");
    hooks.current.onSaved?.();
    return data;
  }, []);

  useChannel(
    "private-admin",
    {
      "kurikulum:draft": ({ by, data }) => {
        if (latest.current !== undefined) return hooks.current.onRemote?.({ type: "conflict", by });
        setDoc(data);
        cur.current = data.value;
        setValue(data.value);
        hooks.current.onRemote?.({ type: "draft", by });
      },
      "kurikulum:published": ({ by }) => {
        load();
        hooks.current.onRemote?.({ type: "published", by });
      },
    },
    Boolean(doc)
  );

  const dirty = Boolean(doc?.dirty) || latest.current !== undefined;
  return {
    doc,
    value,
    status,
    user,
    error,
    dirty,
    load,
    update,
    replace,
    undo: () => step(-1),
    redo: () => step(1),
    canUndo: undo.current.length > 0,
    flush,
    discard,
    publish,
    restore,
  };
}
