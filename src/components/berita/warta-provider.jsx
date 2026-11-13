"use client";
import { createContext, useCallback, useContext, useLayoutEffect as useEffect, useMemo, useState } from "react";
import { PAGE_SIZE, RUBRICS } from "@/lib/berita-content";
import { prefersReducedMotion } from "@/lib/motion";

const Ctx = createContext(null);
export const useWarta = () => useContext(Ctx);

export function smoothTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
}

const norm = (s = "") => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
const matches = (q) => (x) => !q || norm(`${x.title} ${x.excerpt ?? x.summary ?? ""} ${x.category} ${x.author ?? x.place ?? ""}`).includes(q);

/**
 * State bersama Warta: rubrik aktif (sinkron `?rubrik=`), kategori (`?kategori=`), kata kunci ber-debounce,
 * jumlah berita tampil, agenda yang dibuka di modal (`#agenda-<slug>`), dan `now` klien (null saat SSR).
 */
export function WartaProvider({ data, children }) {
  const [rubric, setRubric] = useState("berita");
  const [category, setCategory] = useState(null);
  const [rawQuery, setRawQuery] = useState("");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [eventSlug, setEventSlug] = useState(null);
  const [now, setNow] = useState(null);

  // URL → state (sekali saat mount)
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const r = sp.get("rubrik");
    if (RUBRICS.some((x) => x.key === r)) setRubric(r);
    if (sp.get("kategori")) setCategory(sp.get("kategori"));
    if (sp.get("q")) setRawQuery(sp.get("q"));
    const h = decodeURIComponent(location.hash.slice(1));
    if (h.startsWith("agenda-") && data.events.some((e) => e.slug === h.slice(7))) {
      setRubric("agenda");
      setEventSlug(h.slice(7));
    }
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, [data.events]);

  // debounce kata kunci + indikator sibuk singkat
  useEffect(() => {
    setBusy(true);
    const t = setTimeout(() => {
      setQuery(norm(rawQuery.trim()));
      setBusy(false);
    }, 280);
    return () => clearTimeout(t);
  }, [rawQuery]);

  // state → URL (tanpa menambah riwayat)
  useEffect(() => {
    if (now === null) return;
    const sp = new URLSearchParams();
    if (rubric !== "berita") sp.set("rubrik", rubric);
    if (category) sp.set("kategori", category);
    if (query) sp.set("q", rawQuery.trim());
    const hash = eventSlug ? `#agenda-${eventSlug}` : "";
    history.replaceState(null, "", `${location.pathname}${sp.size ? `?${sp}` : ""}${hash}`);
  }, [rubric, category, query, eventSlug, now === null]); // eslint-disable-line react-hooks/exhaustive-deps

  const pickRubric = useCallback((key, { scroll = false } = {}) => {
    setRubric(key);
    setCategory(null);
    setVisible(PAGE_SIZE);
    if (scroll) requestAnimationFrame(() => smoothTo("rubrik"));
  }, []);

  const pickCategory = useCallback((c) => {
    setCategory((cur) => (cur === c ? null : c));
    setVisible(PAGE_SIZE);
  }, []);

  const value = useMemo(() => {
    const m = matches(query);
    const berita = data.posts.filter((p) => p.type === "berita");
    const artikel = data.posts.filter((p) => p.type === "artikel");
    // halaman depan: berita utama (featured terbaru, atau terbaru) + dua berita berikutnya
    const lead = berita.find((p) => p.featured) ?? berita[0] ?? null;
    const front = lead ? [lead, ...berita.filter((p) => p !== lead).slice(0, 2)] : [];
    const picks = artikel.filter((p) => p.featured);
    const results = {
      berita: berita.filter(m),
      artikel: artikel.filter(m),
      agenda: data.events.filter(m),
    };
    return {
      ...data,
      berita,
      artikel,
      front,
      picks,
      results,
      rubric,
      pickRubric,
      category,
      pickCategory,
      rawQuery,
      setRawQuery,
      query,
      busy,
      visible,
      setVisible,
      eventSlug,
      openEvent: setEventSlug,
      now,
    };
  }, [data, rubric, pickRubric, category, pickCategory, rawQuery, query, busy, visible, eventSlug, now]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Sorot kata kunci di dalam teks. */
export function Highlight({ text = "", query }) {
  if (!query) return text;
  const n = norm(text);
  const i = n.indexOf(query);
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-sm bg-gold/30 px-0.5 text-inherit">{text.slice(i, i + query.length)}</mark>
      {text.slice(i + query.length)}
    </>
  );
}
