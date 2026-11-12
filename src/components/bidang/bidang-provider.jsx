"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_PROFILE, SHORTLIST_KEY, matchScore } from "@/lib/bidang-keahlian-content";
import { useToast } from "@/components/ui/toast";
import { FieldModal } from "./field-modal";

const Ctx = createContext(null);
export const useBidang = () => useContext(Ctx);

const HASH = "#bidang-";

export function setHash(value) {
  try {
    history.replaceState(null, "", `${location.pathname}${location.search}${value ? `#${value}` : ""}`);
  } catch {}
}

/**
 * State bersama halaman Bidang Keahlian:
 * - `focus`     : bidang yang disorot (kompas hero, mosaik, studi kasus) — index atau null
 * - modal detail bidang (`openField(i, originEl?)` → modal "tumbuh" dari kartu asalnya)
 * - `profile`   : lima nilai slider penakar minat → `scores` kecocokan per bidang
 * - `shortlist` : slug bidang yang ditandai (localStorage), dengan toast + "Batalkan"
 * Deep link: `#bidang-<slug>` membuka modal.
 */
export function BidangProvider({ data, children }) {
  const { fields } = data;
  const toast = useToast();
  const [focus, setFocus] = useState(null);
  const [detail, setDetail] = useState(null);
  const [origin, setOrigin] = useState(null);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [shortlist, setShortlist] = useState([]);
  const loaded = useRef(false);
  const listRef = useRef(shortlist);
  listRef.current = shortlist;

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(SHORTLIST_KEY) ?? "[]");
      if (Array.isArray(raw)) setShortlist(raw.filter((s) => fields.some((f) => f.slug === s)));
    } catch {}
    loaded.current = true;
  }, [fields]);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(SHORTLIST_KEY, JSON.stringify(shortlist));
    } catch {}
  }, [shortlist]);

  const openField = useCallback(
    (i, el) => {
      if (el?.getBoundingClientRect) {
        const r = el.getBoundingClientRect();
        setOrigin({ x: r.left + r.width / 2 - window.innerWidth / 2, y: r.top + r.height / 2 - window.innerHeight / 2 });
      } else setOrigin(null);
      setDetail(i);
      setHash(`bidang-${fields[i].slug}`);
    },
    [fields]
  );

  const closeField = useCallback(() => {
    setDetail(null);
    setHash("");
  }, []);

  useEffect(() => {
    const fromHash = () => {
      const h = location.hash;
      if (!h.startsWith(HASH)) return;
      const i = fields.findIndex((f) => f.slug === h.slice(HASH.length));
      if (i >= 0) {
        setOrigin(null);
        setDetail(i);
      }
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [fields]);

  const toggleShortlist = useCallback(
    (slug, { quiet = false } = {}) => {
      const f = fields.find((x) => x.slug === slug);
      const list = listRef.current;
      const has = list.includes(slug);
      setShortlist(has ? list.filter((s) => s !== slug) : [...list, slug]);
      if (quiet || !f) return;
      const undo = () => setShortlist(list);
      if (has) toast.info(`${f.title} dilepas dari rak`, { action: { label: "Batalkan", onClick: undo } });
      else toast.success(`${f.title} masuk rak pilihanmu`, { description: "Rangkumannya menunggu di akhir halaman.", action: { label: "Batalkan", onClick: undo } });
    },
    [fields, toast]
  );

  const scores = useMemo(() => fields.map((f) => matchScore(profile, f.profile)), [fields, profile]);

  const value = useMemo(
    () => ({ ...data, focus, setFocus, openField, profile, setProfile, scores, shortlist, setShortlist, toggleShortlist }),
    [data, focus, openField, profile, scores, shortlist, toggleShortlist]
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <FieldModal fields={fields} index={detail} origin={origin} onIndex={(i) => openField(i)} onClose={closeField} />
    </Ctx.Provider>
  );
}
