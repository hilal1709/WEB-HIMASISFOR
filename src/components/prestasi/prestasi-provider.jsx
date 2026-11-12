"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AchieverModal } from "./achiever-modal";

const Ctx = createContext(null);
export const usePrestasi = () => useContext(Ctx);

const HASH = "#prestasi-";
export const PAGE = 10;

function setHash(value) {
  try {
    history.replaceState(null, "", `${location.pathname}${location.search}${value ? `#${value}` : ""}`);
  } catch {}
}

export const norm = (s) =>
  String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

/**
 * State bersama halaman Prestasi: kategori (mahasiswa/dosen), tingkat (juga menyalakan podium hero),
 * tahun, kata kunci, jumlah baris tampil, dan modal peraih. Deep link `#prestasi-<slug>` membuka modal.
 */
export function PrestasiProvider({ data, children }) {
  const { items, achievers } = data;
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");
  const [year, setYear] = useState("all");
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE);
  const [open, setOpen] = useState(null);

  const filtered = useMemo(() => {
    const q = norm(query.trim());
    return items.filter((i) => {
      if (category !== "all" && i.category !== category) return false;
      if (level !== "all" && i.level !== level) return false;
      if (year !== "all" && i.group !== year) return false;
      return !q || norm(`${i.title} ${i.name} ${i.role}`).includes(q);
    });
  }, [items, category, level, year, query]);

  // filter berubah → mulai lagi dari halaman pertama
  useEffect(() => setVisible(PAGE), [category, level, year, query]);

  const openProfile = useCallback((slug) => {
    setOpen(slug);
    setHash(`prestasi-${slug}`);
  }, []);
  const closeProfile = useCallback(() => {
    setOpen(null);
    setHash("");
  }, []);
  const reset = useCallback(() => {
    setCategory("all");
    setLevel("all");
    setYear("all");
    setQuery("");
  }, []);

  useEffect(() => {
    const fromHash = () => {
      if (!location.hash.startsWith(HASH)) return;
      const slug = decodeURIComponent(location.hash.slice(HASH.length));
      if (achievers.some((a) => a.slug === slug)) setOpen(slug);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [achievers]);

  const value = useMemo(
    () => ({ ...data, category, setCategory, level, setLevel, year, setYear, query, setQuery, visible, setVisible, filtered, openProfile, reset }),
    [data, category, level, year, query, visible, filtered, openProfile, reset]
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <AchieverModal achievers={achievers} slug={open} onSlug={openProfile} onClose={closeProfile} />
    </Ctx.Provider>
  );
}

/** Sorot bagian teks yang cocok dengan kata kunci. */
export function Highlight({ text, query }) {
  const q = query?.trim();
  if (!q) return text;
  const i = norm(text).indexOf(norm(q));
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark className="dosen-mark">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

/** Badge tingkat: internasional = navy, nasional = maroon, regional = garis. */
export function LevelBadge({ level, label, tone = "light", className = "" }) {
  const cls =
    level === "internasional"
      ? tone === "light" ? "bg-navy text-white" : "bg-gold text-navy"
      : level === "nasional"
        ? tone === "light" ? "bg-maroon text-white" : "bg-white/15 text-white"
        : tone === "light" ? "border border-line bg-white text-navy" : "border border-white/25 text-white";
  return <span className={`kicker inline-flex items-center rounded px-2 py-1 text-[10px] leading-none ${cls} ${className}`}>{label}</span>;
}
