"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { socketId, useChannel } from "@/lib/realtime/client";

const AUTOSAVE_MS = 1200;
const UNDO_MAX = 40;

export async function api(url, init) {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...init });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) throw new Error(json.error || "Permintaan gagal");
  return json;
}

/** Set nilai bersarang secara imutabel: setIn(obj, "hero.titleTop", "…"). */
export function setIn(obj, path, val) {
  const [k, ...rest] = typeof path === "string" ? path.split(".") : path;
  const key = Array.isArray(obj) ? Number(k) : k;
  const copy = Array.isArray(obj) ? [...obj] : { ...obj };
  copy[key] = rest.length ? setIn(obj?.[key] ?? {}, rest, val) : val;
  return copy;
}
export const getIn = (obj, path) => path.split(".").reduce((o, k) => o?.[k], obj);

/**
 * State Ruang Kurator.
 * - Panggung (teks halaman): satu dokumen draf, autosave debounce, urungkan lokal, terbit/buang/pulihkan.
 * - Vitrin (baris Achievement): CRUD langsung tayang dengan pembaruan optimistis.
 * Admin lain disinkronkan lewat Pusher (`prestasi:*`).
 */
export function useKurator({ onRemote, onSaved } = {}) {
  const [doc, setDoc] = useState(null);
  const [value, setValue] = useState(null);
  const [records, setRecords] = useState(null);
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

  const loadRecords = useCallback(async () => {
    const json = await api("/api/achievements?format=list");
    setRecords(json.data);
    return json.data;
  }, []);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [json] = await Promise.all([api("/api/prestasi-cms"), loadRecords()]);
      setDoc(json.data);
      cur.current = json.data.value;
      setValue(json.data.value);
      setUser(json.user);
    } catch (e) {
      setError(e.message);
    }
  }, [loadRecords]);

  useEffect(() => {
    load();
    return () => clearTimeout(timer.current);
  }, [load]);

  /* ---------- Panggung: draf teks ---------- */

  const save = useCallback(async () => {
    clearTimeout(timer.current);
    const v = latest.current;
    if (v === undefined) return;
    setStatus("saving");
    try {
      const { data } = await api("/api/prestasi-cms", { method: "PUT", body: JSON.stringify({ value: v, socketId: socketId() }) });
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

  const discard = useCallback(async () => {
    clearTimeout(timer.current);
    latest.current = undefined;
    const { data } = await api("/api/prestasi-cms", { method: "DELETE", headers: { "x-socket-id": socketId() ?? "" } });
    setDoc(data);
    cur.current = data.value;
    setValue(data.value);
    undo.current = [];
    redo.current = [];
    setStatus("saved");
    hooks.current.onSaved?.();
    return data;
  }, []);

  const publish = useCallback(async () => {
    await save();
    const json = await api("/api/prestasi-cms/publish", { method: "POST", body: JSON.stringify({ socketId: socketId() }) });
    setDoc(json.data);
    cur.current = json.data.value;
    setValue(json.data.value);
    return json.published;
  }, [save]);

  const restore = useCallback(async (index) => {
    clearTimeout(timer.current);
    latest.current = undefined;
    const { data } = await api("/api/prestasi-cms/history", { method: "POST", body: JSON.stringify({ index, socketId: socketId() }) });
    undo.current = [...undo.current, cur.current];
    cur.current = data.value;
    setValue(data.value);
    setDoc(data);
    setStatus("saved");
    hooks.current.onSaved?.();
    return data;
  }, []);

  /* ---------- Vitrin: baris prestasi (langsung tayang) ---------- */

  const createRecord = useCallback(async (fields) => {
    const { data } = await api("/api/achievements", { method: "POST", body: JSON.stringify({ ...fields, socketId: socketId() }) });
    setRecords((list) => [data, ...(list ?? [])]);
    hooks.current.onSaved?.();
    return data;
  }, []);

  const updateRecord = useCallback(async (id, fields) => {
    let before;
    setRecords((list) =>
      list.map((r) => {
        if (r.id !== id) return r;
        before = r;
        return { ...r, ...fields };
      })
    );
    try {
      const { data } = await api("/api/achievements", { method: "PUT", body: JSON.stringify({ id, ...fields, socketId: socketId() }) });
      setRecords((list) => list.map((r) => (r.id === id ? data : r)));
      hooks.current.onSaved?.();
      return data;
    } catch (e) {
      if (before) setRecords((list) => list.map((r) => (r.id === id ? before : r)));
      throw e;
    }
  }, []);

  const deleteRecords = useCallback(async (ids) => {
    let removed = [];
    setRecords((list) => {
      removed = list.filter((r) => ids.includes(r.id));
      return list.filter((r) => !ids.includes(r.id));
    });
    try {
      if (ids.length === 1) await api(`/api/achievements?id=${ids[0]}`, { method: "DELETE", headers: { "x-socket-id": socketId() ?? "" } });
      else await api("/api/achievements", { method: "PATCH", body: JSON.stringify({ ids, action: "delete", socketId: socketId() }) });
      hooks.current.onSaved?.();
      return removed;
    } catch (e) {
      setRecords((list) => [...removed, ...list]);
      throw e;
    }
  }, []);

  /** Ubah tingkat/kategori banyak baris sekaligus. `set` memakai kunci (mis. { tingkatan: "nasional" }). */
  const bulkSet = useCallback(
    async (ids, set) => {
      const label = { internasional: "Internasional", nasional: "Nasional", regional: "Regional" };
      const patch = { ...(set.tingkatan && { tingkatan: label[set.tingkatan] }), ...(set.category && { category: set.category }) };
      setRecords((list) => list.map((r) => (ids.includes(r.id) ? { ...r, ...patch } : r)));
      try {
        await api("/api/achievements", { method: "PATCH", body: JSON.stringify({ ids, action: "set", set, socketId: socketId() }) });
        hooks.current.onSaved?.();
      } catch (e) {
        await loadRecords().catch(() => {});
        throw e;
      }
    },
    [loadRecords]
  );

  useChannel(
    "private-admin",
    {
      "prestasi:draft": ({ by, data }) => {
        if (latest.current !== undefined) return hooks.current.onRemote?.({ type: "conflict", by });
        setDoc(data);
        cur.current = data.value;
        setValue(data.value);
        hooks.current.onRemote?.({ type: "draft", by });
      },
      "prestasi:published": ({ by }) => {
        load();
        hooks.current.onRemote?.({ type: "published", by });
      },
      "prestasi:records": ({ by }) => {
        loadRecords().catch(() => {});
        hooks.current.onRemote?.({ type: "records", by });
      },
    },
    Boolean(doc)
  );

  const dirty = Boolean(doc?.dirty) || latest.current !== undefined;
  return {
    doc,
    value,
    records,
    status,
    user,
    error,
    dirty,
    load,
    update,
    undo: () => step(-1),
    redo: () => step(1),
    canUndo: undo.current.length > 0,
    canRedo: redo.current.length > 0,
    flush: save,
    discard,
    publish,
    restore,
    createRecord,
    updateRecord,
    deleteRecords,
    bulkSet,
  };
}
