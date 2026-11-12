"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { RpsDrawer } from "./rps-drawer";
import { CourseSearch } from "./course-search";

const Ctx = createContext(null);
export const useKurikulum = () => useContext(Ctx);

const HASH = "#rps-";

function setHash(value) {
  try {
    history.replaceState(null, "", `${location.pathname}${location.search}${value ? `#${value}` : ""}`);
  } catch {}
}

/**
 * State bersama halaman Kurikulum: semester aktif (tangga hero, peta, buku semester),
 * rumpun yang disorot (peta + buku semester), laci RPS, dan palet pencarian (Ctrl+K atau "/").
 * Deep link `#rps-<slug>` membuka laci RPS mata kuliah tersebut.
 */
export function KurikulumProvider({ data, children }) {
  const [semester, setSemester] = useState(1);
  const [focus, setFocus] = useState(null); // key rumpun | null
  const [open, setOpen] = useState(null); // slug mata kuliah
  const [searchOpen, setSearchOpen] = useState(false);

  const bySlug = useMemo(() => Object.fromEntries(data.courses.map((c) => [c.slug, c])), [data.courses]);

  const openRps = useCallback(
    (slug) => {
      if (!bySlug[slug]) return;
      setOpen(slug);
      setHash(`rps-${slug}`);
    },
    [bySlug]
  );
  const closeRps = useCallback(() => {
    setOpen(null);
    setHash("");
  }, []);

  useEffect(() => {
    const fromHash = () => {
      if (!location.hash.startsWith(HASH)) return;
      const slug = decodeURIComponent(location.hash.slice(HASH.length));
      const c = bySlug[slug];
      if (!c) return;
      if (c.semester) setSemester(c.semester);
      setOpen(slug);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [bySlug]);

  // Ctrl/⌘+K atau "/" membuka palet pencarian (kecuali saat mengetik di input)
  useEffect(() => {
    const onKey = (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName) || e.target?.isContentEditable;
      if ((e.key === "k" && (e.ctrlKey || e.metaKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /** Mata kuliah "tetangga" untuk ‹ › di laci: satu semester atau satu bidang pilihan. */
  const siblings = useMemo(() => {
    const c = open && bySlug[open];
    if (!c) return [];
    return data.courses.filter((x) => (c.semester ? x.semester === c.semester : x.track === c.track));
  }, [open, bySlug, data.courses]);

  const value = useMemo(
    () => ({ ...data, bySlug, semester, setSemester, focus, setFocus, openRps, openSearch: () => setSearchOpen(true) }),
    [data, bySlug, semester, focus, openRps]
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <RpsDrawer course={open ? bySlug[open] : null} siblings={siblings} onOpen={openRps} onClose={closeRps} />
      <CourseSearch open={searchOpen} onOpenChange={setSearchOpen} courses={data.courses} onPick={openRps} />
    </Ctx.Provider>
  );
}
