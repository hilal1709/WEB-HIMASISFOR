"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const endpoint = "/api/jalur-cms";

async function request(method, body) {
  const response = await fetch(endpoint, {
    method, cache: "no-store", headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.success) {
    const error = new Error(result.error || "Permintaan gagal. Coba lagi.");
    error.status = response.status;
    throw error;
  }
  return result.data;
}

export function useJalurEditor() {
  const [document, setDocument] = useState(null);
  const [value, setValue] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const current = useRef(null);
  const saved = useRef(null);
  const revision = useRef(null);
  const requestInFlight = useRef(null);
  const conflict = useRef(false);

  const accept = useCallback((data, replacement) => {
    setDocument((old) => ({ ...old, ...data }));
    revision.current = data.revision;
    saved.current = replacement;
  }, []);

  const load = useCallback(async () => {
    setStatus("loading");
    setError("");
    try {
      const data = await request("GET");
      accept(data, data.value);
      current.current = data.value;
      conflict.current = false;
      setValue(data.value);
      setStatus(data.draftAt ? "saved" : "ready");
    } catch (failure) {
      setError(failure.message);
      setStatus(conflict.current ? "conflict" : "error");
    }
  }, [accept]);

  useEffect(() => { load(); }, [load]);

  const handleError = useCallback((failure) => {
    conflict.current = failure.status === 409;
    setStatus(conflict.current ? "conflict" : "error");
    setError(failure.message);
  }, []);

  const flush = useCallback(async () => {
    if (conflict.current) return false;
    if (requestInFlight.current) return requestInFlight.current;
    if (current.current === saved.current) return true;
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
        requestInFlight.current = null;
      }
    };
    requestInFlight.current = save();
    return requestInFlight.current;
  }, [accept, handleError]);

  const update = useCallback((change) => {
    const next = change(current.current);
    if (next === current.current) return;
    current.current = next;
    setValue(next);
    if (!conflict.current && !requestInFlight.current) setStatus("dirty");
  }, []);

  useEffect(() => {
    if (!value || value === saved.current || conflict.current) return;
    const timer = setTimeout(flush, 850);
    return () => clearTimeout(timer);
  }, [value, flush]);

  useEffect(() => {
    const warn = (event) => {
      if (current.current === saved.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  const publish = async () => {
    if (!(await flush())) return false;
    try {
      const data = await request("POST", { revision: revision.current });
      accept(data, current.current);
      setStatus("ready");
      setError("");
      return true;
    } catch (failure) {
      handleError(failure);
      return false;
    }
  };

  const keepLocal = async () => {
    try {
      const latest = await request("GET");
      accept(latest, latest.value);
      conflict.current = false;
      return await flush();
    } catch (failure) {
      handleError(failure);
      return false;
    }
  };

  return { document, value, status, error, update, flush, load, publish, keepLocal, hasUnsaved: value !== saved.current };
}
