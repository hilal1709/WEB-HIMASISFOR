"use client";
import { useCallback, useEffect, useRef, useState } from "react";

async function request(method, body) {
  const response = await fetch("/api/regulasi-cms", {
    method,
    cache: "no-store",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.success) {
    const error = new Error(result?.error || "Perubahan gagal diproses. Coba lagi.");
    error.status = response.status;
    throw error;
  }
  return result.data;
}

export function useRegulasiEditor() {
  const [value, setValue] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const current = useRef(null);
  const saved = useRef(null);
  const revision = useRef(null);
  const pending = useRef(null);
  const conflict = useRef(false);
  const running = useRef(false);

  const handleError = useCallback((failure) => {
    conflict.current = failure.status === 409;
    setStatus(conflict.current ? "conflict" : "error");
    setError(failure.message);
  }, []);

  const accept = useCallback((data, accepted) => {
    revision.current = data.revision;
    saved.current = accepted;
    setSnapshot(data);
  }, []);

  const replace = useCallback((data) => {
    accept(data, data.value);
    current.current = data.value;
    conflict.current = false;
    setValue(data.value);
    setError("");
    setStatus(data.draftAt ? "saved" : "ready");
  }, [accept]);

  const load = useCallback(async () => {
    if (!current.current) setStatus("loading");
    try {
      const data = await request("GET");
      replace(data);
      return true;
    } catch (failure) {
      handleError(failure);
      return false;
    }
  }, [replace, handleError]);

  useEffect(() => { load(); }, [load]);

  const flush = useCallback(() => {
    if (conflict.current) return Promise.resolve(false);
    if (pending.current) return pending.current;
    if (!current.current || current.current === saved.current) return Promise.resolve(true);

    const save = async () => {
      setStatus("saving");
      setError("");
      try {
        while (current.current !== saved.current) {
          const candidate = current.current;
          const data = await request("PUT", { value: candidate, revision: revision.current });
          accept(data, candidate);
        }
        setStatus("saved");
        return true;
      } catch (failure) {
        handleError(failure);
        return false;
      } finally {
        pending.current = null;
      }
    };
    pending.current = save();
    return pending.current;
  }, [accept, handleError]);

  const update = useCallback((next) => {
    if (running.current) return;
    current.current = next;
    setValue(next);
    if (!conflict.current && !pending.current) {
      setError("");
      setStatus("dirty");
    }
  }, []);

  useEffect(() => {
    if (!value || value === saved.current || conflict.current || running.current) return;
    const timer = setTimeout(flush, 700);
    return () => clearTimeout(timer);
  }, [value, flush]);

  const unsaved = value !== saved.current;
  useEffect(() => {
    if (!unsaved) return;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [unsaved]);

  const act = async (action) => {
    if (running.current) return false;
    running.current = true;
    setBusy(action);
    try {
      if (action === "keep") {
        const latest = await request("GET");
        accept(latest, latest.value);
        conflict.current = false;
        return await flush();
      }
      if (action === "reload") return await load();
      if (action === "publish" && !(await flush())) return false;
      if (action === "discard" && pending.current && !(await pending.current)) return false;
      const method = action === "publish" ? "POST" : "DELETE";
      replace(await request(method, { revision: revision.current }));
      return true;
    } catch (failure) {
      handleError(failure);
      return false;
    } finally {
      running.current = false;
      setBusy("");
    }
  };

  return { value, snapshot, status, error, busy, unsaved, load, update, flush, act };
}
