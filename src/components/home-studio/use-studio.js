"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { socketId, useChannel } from "@/lib/realtime/client";

const AUTOSAVE_MS = 1200;

async function api(url, init) {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...init });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) throw new Error(json.error || "Permintaan gagal");
  return json;
}

/**
 * State Studio Beranda: muat snapshot, autosave draf per section (debounce), terbitkan,
 * buang draf, dan sinkron dengan admin lain lewat Pusher (`private-admin`).
 */
export function useStudio({ onRemote, onSaved } = {}) {
  const [sections, setSections] = useState(null);
  const [status, setStatus] = useState({});
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const timers = useRef({});
  const pending = useRef({});
  const latest = useRef({});
  const hooks = useRef({ onRemote, onSaved });
  hooks.current = { onRemote, onSaved };

  const load = useCallback(async () => {
    setError(null);
    try {
      const json = await api("/api/home-cms");
      setSections(json.data);
      setUser(json.user);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    load();
    const t = timers.current;
    return () => Object.values(t).forEach(clearTimeout);
  }, [load]);

  const save = useCallback(async (key) => {
    clearTimeout(timers.current[key]);
    const value = latest.current[key];
    if (value === undefined) return;
    pending.current[key] = true;
    setStatus((s) => ({ ...s, [key]: "saving" }));
    try {
      const { data } = await api(`/api/home-cms/${key}`, { method: "PUT", body: JSON.stringify({ value, socketId: socketId() }) });
      // hanya terapkan respons bila tidak ada ketikan baru sejak permintaan dikirim
      if (latest.current[key] === value) {
        delete latest.current[key];
        pending.current[key] = false;
        setSections((s) => ({ ...s, [key]: { ...data, value: s[key].value } }));
      }
      setStatus((s) => ({ ...s, [key]: "saved" }));
      hooks.current.onSaved?.(key);
    } catch (e) {
      pending.current[key] = false;
      setStatus((s) => ({ ...s, [key]: "error" }));
      throw e;
    }
  }, []);

  const update = useCallback(
    (key, value) => {
      latest.current[key] = value;
      setSections((s) => ({ ...s, [key]: { ...s[key], value, dirty: true } }));
      setStatus((s) => ({ ...s, [key]: "typing" }));
      clearTimeout(timers.current[key]);
      timers.current[key] = setTimeout(() => save(key).catch(() => {}), AUTOSAVE_MS);
    },
    [save]
  );

  /** Simpan semua yang masih tertunda (mis. sebelum terbit). */
  const flush = useCallback(async () => {
    await Promise.all(Object.keys(latest.current).map((k) => save(k)));
  }, [save]);

  const discard = useCallback(async (key) => {
    clearTimeout(timers.current[key]);
    delete latest.current[key];
    const { data } = await api(`/api/home-cms/${key}`, { method: "DELETE", headers: { "x-socket-id": socketId() ?? "" } });
    setSections((s) => ({ ...s, [key]: data }));
    setStatus((s) => ({ ...s, [key]: "saved" }));
    hooks.current.onSaved?.(key);
    return data;
  }, []);

  const publish = useCallback(
    async (keys) => {
      await flush();
      const json = await api("/api/home-cms/publish", { method: "POST", body: JSON.stringify({ sections: keys, socketId: socketId() }) });
      setSections(json.data);
      return json.published;
    },
    [flush]
  );

  useChannel(
    "private-admin",
    {
      "home:draft": ({ section, by, data }) => {
        if (pending.current[section] || latest.current[section] !== undefined) {
          hooks.current.onRemote?.({ type: "conflict", section, by });
          return;
        }
        setSections((s) => (s ? { ...s, [section]: data } : s));
        hooks.current.onRemote?.({ type: "draft", section, by });
      },
      "home:published": ({ sections: keys, by }) => {
        load();
        hooks.current.onRemote?.({ type: "published", sections: keys, by });
      },
    },
    Boolean(sections)
  );

  const dirtyKeys = sections ? Object.keys(sections).filter((k) => sections[k].dirty) : [];
  const saving = Object.values(status).some((s) => s === "saving" || s === "typing");
  const failed = Object.values(status).some((s) => s === "error");

  return { sections, status, user, error, load, update, save, flush, discard, publish, dirtyKeys, saving, failed };
}
