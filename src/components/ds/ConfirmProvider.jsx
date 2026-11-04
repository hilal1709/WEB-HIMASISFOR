"use client";
import { createContext, useCallback, useContext, useRef, useState } from "react";
import Modal from "./Modal";
import AppIcon from "./AppIcon";
import { Button } from "@/components/ui/button";

const ConfirmContext = createContext(null);

/**
 * Pengganti window.confirm() berbasis Promise.
 *   const confirm = useConfirm();
 *   if (!(await confirm({ title: "Hapus galeri?", description: "Tidak bisa dibatalkan", tone: "danger" }))) return;
 */
export function ConfirmProvider({ children }) {
  const [state, setState] = useState({ open: false });
  const resolver = useRef(null);

  const confirm = useCallback((opts = {}) => {
    setState({ open: true, ...opts });
    return new Promise((resolve) => { resolver.current = resolve; });
  }, []);

  const close = (value) => {
    resolver.current?.(value);
    resolver.current = null;
    setState((s) => ({ ...s, open: false }));
  };

  const danger = state.tone !== "default";

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        open={state.open}
        onOpenChange={(o) => !o && close(false)}
        size="sm"
        icon={<AppIcon name={danger ? "trash" : "info"} size={24} />}
        title={state.title || "Apakah Anda yakin?"}
        description={state.description}
        footer={
          <>
            <Button variant="outline" onClick={() => close(false)}>{state.cancelText || "Batal"}</Button>
            <Button variant={danger ? "destructive" : "default"} onClick={() => close(true)} autoFocus>
              {state.confirmText || (danger ? "Ya, hapus" : "Lanjutkan")}
            </Button>
          </>
        }
      />
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm harus dipakai di dalam <ConfirmProvider>");
  return ctx;
}
