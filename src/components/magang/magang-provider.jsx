"use client";
import { createContext, useCallback, useContext, useLayoutEffect as useEffect, useMemo, useState } from "react";
import { TRACK_KEY, daysLeft } from "@/lib/magang-content";
import { interpolate } from "@/lib/magang-cms/copy";
import { magangLink } from "@/lib/magang-cms/schema";
import { prefersReducedMotion } from "@/lib/motion";
import { useToast } from "@/components/ui/toast";
import { JobModal } from "./job-modal";
import { DocModal } from "./doc-modal";

const Ctx = createContext(null);
export const useMagang = () => useContext(Ctx);

export function setHash(value) {
  try {
    history.replaceState(history.state, "", `${location.pathname}${location.search}${value ? `#${value}` : ""}`);
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
export function MagangProvider({ data, children, preview }) {
  const toast = useToast();
  const { stages, copy } = data;
  const [routeKey, setRouteKey] = useState(null);
  const route = Math.max(0, data.routes.findIndex((item) => item.key === routeKey));
  const setRoute = useCallback((index) => setRouteKey(data.routes[index]?.key ?? null), [data.routes]);
  const visible = useCallback((key) => data.blocks.some((item) => item.key === key && item.visible), [data.blocks]);
  const link = useCallback((href) => magangLink(data, href), [data]);
  const trackerCopy = copy.tracker;
  const [filter, setFilterState] = useState(EMPTY_FILTER);
  const [track, setTrackState] = useState({});
  const [jobSlug, setJobSlug] = useState(null);
  const [docKey, setDocKey] = useState(null);
  const [now, setNow] = useState(null);

  useEffect(() => {
    if (preview) return;
    try {
      const raw = JSON.parse(localStorage.getItem(TRACK_KEY) ?? "{}");
      const valid = Object.fromEntries(
        Object.entries(raw).filter(([slug, st]) => data.jobs.some((j) => j.slug === slug) && stages.some((s) => s.key === st))
      );
      setTrackState(valid);
    } catch {}
  }, [data.jobs, preview, stages]);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const timer = setInterval(tick, 60000);
    window.addEventListener("focus", tick);
    return () => { clearInterval(timer); window.removeEventListener("focus", tick); };
  }, []);

  useEffect(() => {
    setFilterState((current) => {
      const options = { field: data.fields, mode: data.modes, program: data.routes };
      const invalid = Object.keys(options).filter((key) => current[key] !== "all" && !options[key].some((item) => item.key === current[key]));
      return invalid.length ? { ...current, ...Object.fromEntries(invalid.map((key) => [key, "all"])) } : current;
    });
  }, [data.fields, data.modes, data.routes]);

  useEffect(() => {
    if (!preview) return;
    const stopNavigation = (event) => {
      const anchor = event.target.closest?.("a[href]");
      if (!anchor) return;
      const url = new URL(anchor.href, location.href);
      if (url.origin === location.origin && url.pathname === location.pathname && url.hash) return;
      event.preventDefault();
      if (url.origin === location.origin && url.pathname === "/magang" && url.hash) {
        history.replaceState(history.state, "", url.hash);
        window.dispatchEvent(new HashChangeEvent("hashchange"));
        document.getElementById(url.hash.slice(1))?.scrollIntoView();
      }
    };
    document.addEventListener("click", stopNavigation, true);
    document.addEventListener("auxclick", stopNavigation, true);
    document.addEventListener("contextmenu", stopNavigation, true);
    return () => {
      document.removeEventListener("click", stopNavigation, true);
      document.removeEventListener("auxclick", stopNavigation, true);
      document.removeEventListener("contextmenu", stopNavigation, true);
    };
  }, [preview]);

  const setTrack = useCallback((updater) => {
    setTrackState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (!preview) {
        try {
          localStorage.setItem(TRACK_KEY, JSON.stringify(next));
        } catch {}
      }
      return next;
    });
  }, [preview]);

  /** Lowongan berurutan: yang masih buka menurut tenggat terdekat, yang ditutup di bawah. */
  const jobs = useMemo(() => {
    const withDays = data.jobs.map((j) => ({ ...j, days: now ? daysLeft(j.deadline, now) : null }));
    const closed = (j) => j.days != null && j.days < 0;
    return withDays.sort((a, b) => Number(closed(a)) - Number(closed(b)) || (data.jobOrder === "manual" ? 0 : (a.deadline || "9999").localeCompare(b.deadline || "9999")));
  }, [data.jobs, data.jobOrder, now]);

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
        toast.info(trackerCopy.toastRemoved, {
          description: job.title,
          action: { label: trackerCopy.undo, onClick: () => setTrack((t) => ({ ...t, [slug]: prevStage })) },
        });
      } else {
        setTrack((t) => ({ ...t, [slug]: "simpan" }));
        toast.success(trackerCopy.toastSaved, {
          description: job.title,
          action: visible("tracker") ? { label: trackerCopy.view, onClick: () => smoothTo("jejak") } : undefined,
        });
      }
    },
    [bySlug, track, setTrack, toast, trackerCopy, visible]
  );

  const moveTo = useCallback(
    (slug, stage) => {
      const job = bySlug(slug);
      const prev = track[slug];
      if (!job || !prev || prev === stage || !stages.some((item) => item.key === stage)) return;
      setTrack((t) => ({ ...t, [slug]: stage }));
      const label = stages.find((s) => s.key === stage)?.label;
      if (stage === "diterima") {
        toast.success(interpolate(trackerCopy.toastAccepted, job), {
          description: trackerCopy.toastAcceptedBody,
          action: visible("logbook") ? { label: trackerCopy.viewDocs, onClick: () => smoothTo("logbook") } : undefined,
        });
      } else {
        toast.info(interpolate(trackerCopy.toastMoved, { stage: label }), {
          description: job.title,
          action: { label: trackerCopy.undo, onClick: () => setTrack((t) => ({ ...t, [slug]: prev })) },
          duration: 3500,
        });
      }
    },
    [bySlug, track, setTrack, toast, trackerCopy, visible, stages]
  );

  /** Dari tombol "Lamar": langsung ke tahap Melamar (membuat kartu bila belum disimpan). */
  const markApplied = useCallback(
    (slug) => {
      const job = bySlug(slug);
      if (!job) return;
      setTrack((t) => ({ ...t, [slug]: "lamar" }));
      toast.success(trackerCopy.toastApplied, { description: job.title, action: visible("tracker") ? { label: trackerCopy.view, onClick: () => smoothTo("jejak") } : undefined });
    },
    [bySlug, setTrack, toast, trackerCopy, visible]
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
      if (m && (visible("jobs") || visible("tracker")) && data.jobs.some((j) => j.slug === m[1])) setJobSlug(m[1]);
      else setJobSlug(null);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [data.jobs, visible]);

  const setFilter = useCallback((patch) => setFilterState((f) => ({ ...f, ...patch })), []);
  const resetFilter = useCallback(() => setFilterState(EMPTY_FILTER), []);

  const value = useMemo(
    () => ({ ...data, jobs, now, route, setRoute, filter, setFilter, resetFilter, track, toggleSave, moveTo, markApplied, openJob, openDoc, bySlug, visible, link, preview }),
    [data, jobs, now, route, setRoute, filter, setFilter, resetFilter, track, toggleSave, moveTo, markApplied, openJob, openDoc, bySlug, visible, link, preview]
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      {(visible("jobs") || visible("tracker")) && <JobModal slug={jobSlug} onSlug={openJob} onClose={close} />}
      {visible("logbook") && <DocModal docKey={docKey} onClose={close} />}
    </Ctx.Provider>
  );
}
