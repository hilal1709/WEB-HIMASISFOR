"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { socketId, useChannel } from "@/lib/realtime/client";
import { setIn, getIn } from "@/components/sambutan-studio/use-meja";
import { findRoot, isDescendant, uniqueKey } from "@/lib/struktur-cms/schema";

const AUTOSAVE_MS = 1200;
const UNDO_MAX = 40;

async function api(url, init) {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...init });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) throw new Error(json.error || "Permintaan gagal");
  return json;
}

export { setIn, getIn };

/**
 * State Studio Bagan: satu dokumen, autosave debounce, riwayat urungkan lokal,
 * terbit/buang/pulihkan versi, sinkron admin lain lewat Pusher.
 */
export function useBagan({ onRemote, onSaved } = {}) {
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
      const json = await api("/api/struktur-cms");
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
      const { data } = await api("/api/struktur-cms", { method: "PUT", body: JSON.stringify({ value: v, socketId: socketId() }) });
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
    const { data } = await api("/api/struktur-cms", { method: "DELETE", headers: { "x-socket-id": socketId() ?? "" } });
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
    const json = await api("/api/struktur-cms/publish", { method: "POST", body: JSON.stringify({ socketId: socketId() }) });
    setDoc(json.data);
    cur.current = json.data.value;
    setValue(json.data.value);
    return json.published;
  }, [save]);

  const restore = useCallback(async (index) => {
    clearTimeout(timer.current);
    latest.current = undefined;
    const { data } = await api("/api/struktur-cms/history", { method: "POST", body: JSON.stringify({ index, socketId: socketId() }) });
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
      "struktur:draft": ({ by, data }) => {
        if (latest.current !== undefined) return hooks.current.onRemote?.({ type: "conflict", by });
        setDoc(data);
        cur.current = data.value;
        setValue(data.value);
        hooks.current.onRemote?.({ type: "draft", by });
      },
      "struktur:published": ({ by }) => {
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

/* ───────────── operasi pohon (murni; hasilnya dikirim lewat `replace`) ───────────── */


export const blankPerson = (people, reportsTo, group = "main") => ({
  key: uniqueKey("orang-baru", people),
  reportsTo,
  group,
  name: "Orang baru",
  credentials: "",
  role: group === "staff" ? "Staf" : "Dosen",
  photo: "",
  expertise: [],
  duties: [],
  hidden: false,
  division: "",
});

/** Tambah bawahan langsung `parent`; disisipkan setelah saudara terakhirnya. */
export function addChild(people, parent, group = "main") {
  // bawahan baru ikut divisi atasannya
  const p = { ...blankPerson(people, parent, group), division: people.find((x) => x.key === parent)?.division ?? "" };
  let at = people.length;
  for (let i = people.length - 1; i >= 0; i--) if (people[i].reportsTo === parent || people[i].key === parent) { at = i + 1; break; }
  return { people: [...people.slice(0, at), p, ...people.slice(at)], key: p.key };
}

/** Pindah atasan. Ditolak (null) bila membentuk siklus. */
export function moveTo(people, key, parent, group) {
  if (key === parent || isDescendant(people, parent, key)) return null;
  return people.map((p) => (p.key === key ? { ...p, reportsTo: parent, group: group ?? (p.group === "staff" && parent !== findRoot(people)?.key ? "main" : p.group) } : p));
}

/** Hapus orang; bawahannya naik ke atasan orang itu. Puncak tidak bisa dihapus. */
export function removePerson(people, key) {
  const target = people.find((p) => p.key === key);
  if (!target || !target.reportsTo) return null;
  return people.filter((p) => p.key !== key).map((p) => (p.reportsTo === key ? { ...p, reportsTo: target.reportsTo } : p));
}

/** Salin orang (tanpa bawahan) sebagai saudara. */
export function duplicate(people, key) {
  const i = people.findIndex((p) => p.key === key);
  if (i < 0 || !people[i].reportsTo) return null;
  const copy = { ...people[i], key: uniqueKey(people[i].name, people), name: `${people[i].name} (salinan)` };
  return { people: [...people.slice(0, i + 1), copy, ...people.slice(i + 1)], key: copy.key };
}

/** Geser urutan di antara saudara (dir −1 kiri, +1 kanan). */
export function shift(people, key, dir) {
  const me = people.find((p) => p.key === key);
  if (!me) return null;
  const sibs = people.map((p, i) => [p, i]).filter(([p]) => p.reportsTo === me.reportsTo && (p.group === "staff") === (me.group === "staff"));
  const pos = sibs.findIndex(([p]) => p.key === key);
  const other = sibs[pos + dir];
  if (!other) return null;
  const next = [...people];
  const a = sibs[pos][1];
  const b = other[1];
  [next[a], next[b]] = [next[b], next[a]];
  return next;
}

/** Jadikan puncak: puncak lama melapor ke orang ini. */
export function promote(people, key) {
  const root = findRoot(people);
  if (!root || root.key === key) return null;
  return people.map((p) => {
    if (p.key === key) return { ...p, reportsTo: "", group: "main" };
    if (p.key === root.key) return { ...p, reportsTo: key };
    return p;
  });
}
