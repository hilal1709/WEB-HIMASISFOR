"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { LecturerModal } from "./lecturer-modal";

const Ctx = createContext(null);
export const useDosen = () => useContext(Ctx);

const HASH = "#dosen-";

function setHash(value) {
  try {
    history.replaceState(null, "", `${location.pathname}${location.search}${value ? `#${value}` : ""}`);
  } catch {}
}

const norm = (s) =>
  String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

/**
 * State bersama halaman Dosen: rumpun aktif (filter direktori + sorotan ilustrasi hero + peta keahlian),
 * kata kunci cari, mode tampilan (grid/daftar), dan modal profil dosen.
 * Deep link: `#dosen-<slug>` membuka modal profil.
 */
export function DosenProvider({ data, children }) {
  const { lecturers, fields, modal, certs } = data;
  const [field, setField] = useState("all");
  const [query, setQuery] = useState("");
  const [view, setView] = useState("grid");
  const [open, setOpen] = useState(null); // slug

  const filtered = useMemo(() => {
    const q = norm(query.trim());
    return lecturers.filter((l) => {
      if (field !== "all" && !l.fields.includes(field)) return false;
      if (!q) return true;
      return norm([l.name, l.credentials, l.role, ...l.expertise, ...l.courses].join(" ")).includes(q);
    });
  }, [lecturers, field, query]);

  const openProfile = useCallback((slug) => {
    setOpen(slug);
    setHash(`dosen-${slug}`);
  }, []);

  const closeProfile = useCallback(() => {
    setOpen(null);
    setHash("");
  }, []);

  const reset = useCallback(() => {
    setField("all");
    setQuery("");
  }, []);

  useEffect(() => {
    const fromHash = () => {
      if (!location.hash.startsWith(HASH)) return;
      const slug = decodeURIComponent(location.hash.slice(HASH.length));
      if (lecturers.some((l) => l.slug === slug)) setOpen(slug);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [lecturers]);

  const value = useMemo(
    () => ({ ...data, field, setField, query, setQuery, view, setView, filtered, openProfile, reset }),
    [data, field, query, view, filtered, openProfile, reset]
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <LecturerModal lecturers={lecturers} fields={fields} labels={modal} certs={certs} sampleLabel={data.directory.sampleLabel} slug={open} onSlug={openProfile} onClose={closeProfile} />
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
