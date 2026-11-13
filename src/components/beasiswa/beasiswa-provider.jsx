"use client";
import { createContext, useCallback, useContext, useLayoutEffect as useEffect, useMemo, useRef, useState } from "react";
import { PASSPORT_KEY, WALLET_KEY, cleanPassport, evaluate, nextWindow, DEFAULT_PASSPORT } from "@/lib/beasiswa-content";
import { prefersReducedMotion } from "@/lib/motion";
import { useToast } from "@/components/ui/toast";
import { ScholarshipModal } from "./scholarship-modal";

const Ctx = createContext(null);
export const useBeasiswa = () => useContext(Ctx);

export function setHash(value) {
  try {
    history.replaceState(null, "", `${location.pathname}${location.search}${value ? `#${value}` : ""}`);
  } catch {}
}

export function smoothTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
}

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};
const write = (key, v) => {
  try {
    if (v == null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(v));
  } catch {}
};

/**
 * State bersama halaman Beasiswa:
 * - `focus`      : slug yang disorot (tag hero ↔ toples, penggaris, dial)
 * - `threshold`  : ambang cakupan minimal di penggaris (0–100)
 * - `passport`   : isian paspor kelayakan (localStorage `sisfor:beasiswa:paspor`; null = belum diisi)
 * - `results`    : { [slug]: evaluate() } — dihitung dari paspor (atau DEFAULT_PASSPORT bila belum diisi)
 * - `wallet`     : slug yang disimpan (localStorage `sisfor:beasiswa:dompet`)
 * - `now`        : tanggal klien (null saat SSR agar hitung mundur tidak membuat hidrasi meleset)
 * - modal piagam (`open(slug)`); deep link `#beasiswa-<slug>`
 */
export function BeasiswaProvider({ data, children }) {
  const toast = useToast();
  const [now, setNow] = useState(null);
  const [focus, setFocus] = useState(data.items[0]?.slug ?? null);
  const [threshold, setThreshold] = useState(0);
  const [passport, setPassportState] = useState(null);
  const [wallet, setWalletState] = useState([]);
  const [modal, setModal] = useState(null);
  const walletRef = useRef(wallet);
  walletRef.current = wallet;

  useEffect(() => {
    setNow(new Date());
    const p = read(PASSPORT_KEY, null);
    if (p) setPassportState(cleanPassport(p));
    const w = read(WALLET_KEY, []);
    if (Array.isArray(w)) setWalletState(w.filter((s) => data.items.some((it) => it.slug === s)));
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, [data.items]);

  const items = useMemo(() => data.items.map((s) => ({ ...s, window: nextWindow(s, now) })), [data.items, now]);
  const bySlug = useCallback((slug) => items.find((s) => s.slug === slug) ?? null, [items]);

  const results = useMemo(() => {
    const p = passport ?? DEFAULT_PASSPORT;
    return Object.fromEntries(items.map((s) => [s.slug, evaluate(s, p)]));
  }, [items, passport]);

  const setPassport = useCallback((patch) => {
    setPassportState((prev) => {
      const next = cleanPassport({ ...(prev ?? DEFAULT_PASSPORT), ...patch });
      write(PASSPORT_KEY, next);
      return next;
    });
  }, []);
  const clearPassport = useCallback(() => {
    write(PASSPORT_KEY, null);
    setPassportState(null);
  }, []);

  const setWallet = useCallback((updater) => {
    setWalletState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      write(WALLET_KEY, next);
      return next;
    });
  }, []);

  const toggleSave = useCallback(
    (slug) => {
      const s = bySlug(slug);
      if (!s) return;
      if (walletRef.current.includes(slug)) {
        const at = walletRef.current.indexOf(slug);
        setWallet((w) => w.filter((x) => x !== slug));
        toast.info("Dikeluarkan dari dompet", {
          description: s.name,
          action: { label: "Batalkan", onClick: () => setWallet((w) => (w.includes(slug) ? w : [...w.slice(0, at), slug, ...w.slice(at)])) },
        });
      } else {
        setWallet((w) => [...w, slug]);
        toast.success("Masuk ke dompet beasiswa", {
          description: s.window ? `${s.name} · ${s.window.state === "buka" ? `tutup ${s.window.days} hari lagi` : `buka ${s.window.days} hari lagi`}` : s.name,
          action: { label: "Lihat dompet", onClick: () => smoothTo("dompet") },
        });
      }
    },
    [bySlug, setWallet, toast]
  );

  const open = useCallback((slug) => {
    setModal(slug);
    setHash(slug ? `beasiswa-${slug}` : "");
  }, []);
  const close = useCallback(() => {
    setModal(null);
    setHash("");
  }, []);

  useEffect(() => {
    const fromHash = () => {
      const m = location.hash.match(/^#beasiswa-(.+)$/);
      if (m && data.items.some((s) => s.slug === m[1])) setModal(m[1]);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [data.items]);

  const value = useMemo(
    () => ({ ...data, items, now, bySlug, focus, setFocus, threshold, setThreshold, passport, setPassport, clearPassport, results, wallet, setWallet, toggleSave, open }),
    [data, items, now, bySlug, focus, threshold, passport, setPassport, clearPassport, results, wallet, setWallet, toggleSave, open]
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <ScholarshipModal slug={modal} onSlug={open} onClose={close} />
    </Ctx.Provider>
  );
}
