"use client";
import { createContext, useCallback, useContext, useDeferredValue, useLayoutEffect as useEffect, useMemo, useState } from "react";
import { matches } from "@/lib/faq-content";
import { prefersReducedMotion } from "@/lib/motion";

const Ctx = createContext(null);
export const useFaq = () => useContext(Ctx);

export const cardId = (slug) => `kartu-${slug}`;

/** Salin teks ke papan klip: Clipboard API (maks. 1,2 dtk) lalu jatuh ke execCommand. Resolve true/false. */
export async function copyText(text) {
  const legacy = () => {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  };
  if (navigator.clipboard?.writeText) {
    try {
      const ok = await Promise.race([navigator.clipboard.writeText(text).then(() => true), new Promise((r) => setTimeout(() => r(null), 1200))]);
      if (ok) return true;
    } catch {}
  }
  return legacy();
}

export function smoothTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center" });
}

/**
 * State bersama halaman FAQ: persona & kata kunci (kalimat isian hero), laci aktif, kartu terbuka,
 * dan modal "kartu kosong". Hash `#kartu-<slug>` membuka kartu saat halaman dimuat dan ikut berubah
 * ketika kartu dibuka/ditutup (tanpa menambah riwayat).
 */
export function FaqProvider({ data, children }) {
  const [persona, setPersona] = useState("all");
  const [query, setQuery] = useState("");
  const [drawer, setDrawer] = useState(null);
  const [openSlug, setOpenSlug] = useState(null);
  const [ask, setAsk] = useState(null); // { q, drawer } | null
  const deferred = useDeferredValue(query);
  const searching = query !== deferred;

  const drawerOf = useCallback((key) => data.drawers.find((d) => d.key === key), [data.drawers]);

  // kartu yang lolos persona + kata kunci (belum disaring laci → dipakai menghitung isi tiap laci)
  const pool = useMemo(
    () => data.cards.filter((c) => (persona === "all" || c.personas.includes(persona)) && matches(c, deferred, drawerOf(c.drawer)?.label)),
    [data.cards, persona, deferred, drawerOf]
  );
  const counts = useMemo(() => Object.fromEntries(data.drawers.map((d) => [d.key, pool.filter((c) => c.drawer === d.key).length])), [pool, data.drawers]);
  const visible = useMemo(() => (drawer ? pool.filter((c) => c.drawer === drawer) : pool), [pool, drawer]);

  const open = useCallback((slug, { scroll = false } = {}) => {
    setOpenSlug(slug);
    try {
      history.replaceState(null, "", slug ? `#${cardId(slug)}` : location.pathname + location.search);
    } catch {}
    if (slug && scroll) requestAnimationFrame(() => smoothTo(cardId(slug)));
  }, []);

  // deep link saat dimuat & saat hash berubah manual
  useEffect(() => {
    const read = () => {
      const m = location.hash.match(/^#kartu-(.+)$/);
      const card = m && data.cards.find((c) => c.slug === decodeURIComponent(m[1]));      if (!card) return;
      setPersona("all");
      setQuery("");
      setDrawer(card.drawer);
      setOpenSlug(card.slug);
      setTimeout(() => smoothTo(cardId(card.slug)), 450);
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, [data.cards]);

  // kartu terbuka yang tersaring keluar → tutup
  useEffect(() => {
    if (openSlug && !visible.some((c) => c.slug === openSlug)) setOpenSlug(null);
  }, [visible, openSlug]);

  const reset = useCallback(() => {
    setPersona("all");
    setQuery("");
    setDrawer(null);
  }, []);

  const value = {
    ...data,
    persona,
    setPersona,
    query,
    setQuery,
    deferred,
    searching,
    drawer,
    setDrawer,
    openSlug,
    open,
    ask,
    setAsk,
    pool,
    counts,
    visible,
    drawerOf,
    reset,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
