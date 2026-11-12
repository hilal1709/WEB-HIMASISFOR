"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { TRACK_KEY, daysLeft } from "@/lib/magang-content";
import { prefersReducedMotion } from "@/lib/motion";
import { useToast } from "@/components/ui/toast";
import { JobModal } from "./job-modal";
import { DocModal } from "./doc-modal";

const Ctx = createContext(null);
export const useMagang = () => useContext(Ctx);

/** Tahapan pelacak lamaran (urutan = kolom). */
export const STAGES = [
  { key: "simpan", label: "Disimpan" },
  { key: "lamar", label: "Melamar" },
  { key: "wawancara", label: "Wawancara" },
  { key: "diterima", label: "Diterima" },
];

export function setHash(value) {
  try {
    history.replaceState(null, "", `${location.pathname}${location.search}${value ? `#${value}` : ""}`);
  } catch {}
}

export function smoothTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
}

const EMPTY_FILTER = { field: "all", mode: "all", program: "all", q: "" };

/**
 * State bersama halaman Magang:
 * - `route`   : pintu aktif (kartu ID hero ↔ Tiga pintu) — index
 * - `filter`  : bidang / mode / program / kata kunci papan lowongan
 * - `track`   : { [slug]: tahap } — pelacak lamaran (localStorage `sisfor:magang:jejak`)
 * - modal lowongan (`openJob(slug)`) dan modal berkas (`openDoc(key)`)
 * - `now`     : tanggal klien (null saat SSR, supaya hitung mundur tenggat tidak membuat hidrasi meleset)
 * Deep link: `#lowongan-<slug>` membuka modal lowongan.
 */
export function MagangProvider({ data, children }) {
  const toast = useToast();
  const [route, setRoute] = useState(0);
  const [filter, setFilterState] = useState(EMPTY_FILTER);
  const [track, setTrackState] = useState({});
  const [jobSlug, setJobSlug] = useState(null);
  const [docKey, setDocKey] = useState(null);
  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(new Date());
    try {
      const raw = JSON.parse(localStorage.getItem(TRACK_KEY) ?? "{}");
      const valid = Object.fromEntries(
        Object.entries(raw).filter(([slug, st]) => data.jobs.some((j) => j.slug === slug) && STAGES.some((s) => s.key === st))
      );
      setTrackState(valid);
    } catch {}
  }, [data.jobs]);

  const setTrack = useCallback((updater) => {
    setTrackState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      try {
        localStorage.setItem(TRACK_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  /** Lowongan berurutan: yang masih buka menurut tenggat terdekat, yang ditutup di bawah. */
  const jobs = useMemo(() => {
    const withDays = data.jobs.map((j) => ({ ...j, days: now ? daysLeft(j.deadline, now) : null }));
    const closed = (j) => j.days != null && j.days < 0;
    return withDays.sort((a, b) => Number(closed(a)) - Number(closed(b)) || (a.deadline || "9999").localeCompare(b.deadline || "9999"));
  }, [data.jobs, now]);

  const bySlug = useCallback((slug) => jobs.find((j) => j.slug === slug) ?? null, [jobs]);

  const toggleSave = useCallback(
    (slug) => {
      const job = bySlug(slug);
      if (!job) return;
      const prevStage = track[slug];
      if (prevStage) {
        setTrack((t) => {
          const { [slug]: _, ...rest } = t;
          return rest;
        });
        toast.info("Dihapus dari jejak lamaran", {
          description: job.title,
          action: { label: "Batalkan", onClick: () => setTrack((t) => ({ ...t, [slug]: prevStage })) },
        });
      } else {
        setTrack((t) => ({ ...t, [slug]: "simpan" }));
        toast.success("Tersimpan ke jejak lamaran", {
          description: job.title,
          action: { label: "Lihat jejak", onClick: () => smoothTo("jejak") },
        });
      }
    },
    [bySlug, track, setTrack, toast]
  );

  const moveTo = useCallback(
    (slug, stage) => {
      const job = bySlug(slug);
      const prev = track[slug];
      if (!job || !prev || prev === stage) return;
      setTrack((t) => ({ ...t, [slug]: stage }));
      const label = STAGES.find((s) => s.key === stage)?.label;
      if (stage === "diterima") {
        toast.success(`Selamat, diterima di ${job.company}!`, {
          description: "Langkah berikutnya: urus surat dan logbook sebelum mulai.",
          action: { label: "Lihat berkas", onClick: () => smoothTo("logbook") },
        });
      } else {
        toast.info(`Dipindah ke ${label}`, {
          description: job.title,
          action: { label: "Batalkan", onClick: () => setTrack((t) => ({ ...t, [slug]: prev })) },
          duration: 3500,
        });
      }
    },
    [bySlug, track, setTrack, toast]
  );

  /** Dari tombol "Lamar": langsung ke tahap Melamar (membuat kartu bila belum disimpan). */
  const markApplied = useCallback(
    (slug) => {
      const job = bySlug(slug);
      if (!job) return;
      setTrack((t) => ({ ...t, [slug]: "lamar" }));
      toast.success("Ditandai sudah melamar", { description: job.title, action: { label: "Lihat jejak", onClick: () => smoothTo("jejak") } });
    },
    [bySlug, setTrack, toast]
  );

  const openJob = useCallback((slug) => {
    setDocKey(null);
    setJobSlug(slug);
    setHash(slug ? `lowongan-${slug}` : "");
  }, []);
  const openDoc = useCallback((key) => {
    setJobSlug(null);
    setDocKey(key);
  }, []);
  const close = useCallback(() => {
    setJobSlug(null);
    setDocKey(null);
    setHash("");
  }, []);

  useEffect(() => {
    const fromHash = () => {
      const m = location.hash.match(/^#lowongan-(.+)$/);
      if (m && data.jobs.some((j) => j.slug === m[1])) setJobSlug(m[1]);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [data.jobs]);

  const setFilter = useCallback((patch) => setFilterState((f) => ({ ...f, ...patch })), []);
  const resetFilter = useCallback(() => setFilterState(EMPTY_FILTER), []);

  const value = useMemo(
    () => ({ ...data, jobs, now, route, setRoute, filter, setFilter, resetFilter, track, toggleSave, moveTo, markApplied, openJob, openDoc, bySlug }),
    [data, jobs, now, route, filter, setFilter, resetFilter, track, toggleSave, moveTo, markApplied, openJob, openDoc, bySlug]
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <JobModal slug={jobSlug} onSlug={openJob} onClose={close} />
      <DocModal docKey={docKey} onClose={close} />
    </Ctx.Provider>
  );
}
