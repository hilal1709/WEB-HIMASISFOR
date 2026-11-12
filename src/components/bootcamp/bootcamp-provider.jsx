"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { FILTERS, PLAN_KEY, WEEKLY_LIMIT } from "@/lib/bootcamp-content";
import { prefersReducedMotion } from "@/lib/motion";
import { useToast } from "@/components/ui/toast";
import { CohortModal } from "./cohort-modal";
import { CourseModal } from "./course-modal";

const Ctx = createContext(null);
export const useBootcamp = () => useContext(Ctx);

/**
 * Daftarkan ulang elemen `data-aos` yang baru dipasang (ganti mode, ganti kohort, banner muncul/ditutup) dan
 * hitung ulang posisi pemicu ScrollTrigger. AOS hanya memindai DOM sekali saat init — tanpa ini elemen yang
 * dipasang belakangan tertahan di opacity 0. Aman dipanggil sebelum AOS siap (refreshHard tidak meng-init).
 */
export function refreshScroll() {
  if (typeof window === "undefined") return;
  requestAnimationFrame(() =>
    requestAnimationFrame(async () => {
      const [{ default: AOS }, { ScrollTrigger }] = await Promise.all([import("aos"), import("@/lib/scroll")]);
      AOS.refreshHard();
      ScrollTrigger.refresh();
    })
  );
}

export function smoothTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
}

/**
 * State bersama halaman Bootcamp & Course:
 * - `mode`        : "bootcamp" | "course" (sakelar hero → seluruh halaman)
 * - `cohort`      : slug kohort aktif (hover stack, silabus, modal)
 * - `filter`      : isian kalimat { topic, pace, level } + `busy` singkat saat berubah (Skeleton)
 * - `plan`        : slug kursus di rencana belajar (localStorage `sisfor:bootcamp:rencana`, toast + Batalkan)
 * - modal kohort / kursus, deep link `#bootcamp-<slug>` dan `#course-<slug>`
 * - `now`         : jam klien (null saat SSR agar hitung mundur tidak membuat hidrasi meleset)
 */
export function BootcampProvider({ data, children }) {
  const toast = useToast();
  const [mode, setModeState] = useState("bootcamp");
  const [cohort, setCohort] = useState(data.bootcamps[0].slug);
  const [filter, setFilterState] = useState({ topic: "all", pace: "all", level: "all" });
  const [busy, setBusy] = useState(false);
  const [plan, setPlan] = useState([]);
  const [cohortOpen, setCohortOpen] = useState(null);
  const [courseOpen, setCourseOpen] = useState(null);
  const [now, setNow] = useState(null);
  const busyTimer = useRef(null);
  const loaded = useRef(false);
  const warned = useRef(false);

  // isi halaman berganti → daftarkan ulang animasi gulir
  useEffect(() => {
    refreshScroll();
  }, [mode, cohort]);

  // tinggi halaman bergeser (katalog berganti isi, banner, gambar, Lottie, font) → hitung ulang setelah tenang
  useEffect(() => {
    let t;
    let last = document.body.scrollHeight;
    const ro = new ResizeObserver(() => {
      const h = document.body.scrollHeight;
      if (Math.abs(h - last) < 2) return;
      last = h;
      clearTimeout(t);
      t = setTimeout(refreshScroll, 160);
    });
    ro.observe(document.body);
    return () => {
      clearTimeout(t);
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const setMode = useCallback((m) => {
    setModeState(m);
  }, []);

  const setFilter = useCallback((patch) => {
    setFilterState((f) => ({ ...f, ...patch }));
    setBusy(true);
    clearTimeout(busyTimer.current);
    busyTimer.current = setTimeout(() => setBusy(false), 320);
  }, []);
  const resetFilter = useCallback(() => setFilter({ topic: "all", pace: "all", level: "all" }), [setFilter]);
  useEffect(() => () => clearTimeout(busyTimer.current), []);

  const courses = useMemo(() => {
    const pace = FILTERS.pace.find((p) => p.key === filter.pace) ?? FILTERS.pace[0];
    return data.courses.filter(
      (c) => (filter.topic === "all" || c.topic === filter.topic) && (filter.level === "all" || c.level === filter.level) && pace.test(c)
    );
  }, [data.courses, filter]);

  const bySlug = useCallback((slug) => data.courses.find((c) => c.slug === slug) ?? null, [data.courses]);
  const cohortBy = useCallback((slug) => data.bootcamps.find((b) => b.slug === slug) ?? null, [data.bootcamps]);
  const planCourses = useMemo(() => plan.map(bySlug).filter(Boolean), [plan, bySlug]);
  const planHours = planCourses.reduce((t, c) => t + c.hours, 0);
  const planWeekly = planCourses.reduce((t, c) => t + c.perWeek, 0);
  const planWeeks = planWeekly ? Math.ceil(planHours / planWeekly) : 0;
  const overload = planWeekly > WEEKLY_LIMIT;

  // muat rencana tersimpan
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PLAN_KEY) ?? "[]");
      const valid = Array.isArray(saved) ? saved.filter((s) => data.courses.some((c) => c.slug === s)) : [];
      if (valid.length) {
        setPlan(valid);
        toast.info("Rencana belajarmu dimuat", { description: `${valid.length} kursus menunggu di dok bawah.`, duration: 3400 });
      }
    } catch {}
    loaded.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
    } catch {}
  }, [plan]);

  useEffect(() => {
    if (overload && !warned.current) {
      warned.current = true;
      toast.warning(`Lebih dari ${WEEKLY_LIMIT} jam per minggu`, { description: "Rencanamu berat untuk dijalani di samping kuliah. Pertimbangkan mengurangi satu kursus." });
    }
    if (!overload) warned.current = false;
  }, [overload, toast]);

  const inPlan = useCallback((slug) => plan.includes(slug), [plan]);

  const togglePlan = useCallback(
    (slug) => {
      const c = bySlug(slug);
      if (!c) return;
      const prev = plan;
      if (plan.includes(slug)) {
        setPlan(plan.filter((s) => s !== slug));
        toast.info("Dikeluarkan dari rencana", { description: c.title, action: { label: "Batalkan", onClick: () => setPlan(prev) }, duration: 3600 });
      } else {
        setPlan([...plan, slug]);
        toast.success("Masuk rencana belajar", { description: `${c.title} · ${c.hours} jam`, action: { label: "Batalkan", onClick: () => setPlan(prev) }, duration: 3600 });
      }
    },
    [bySlug, plan, toast]
  );

  const clearPlan = useCallback(() => {
    const prev = plan;
    setPlan([]);
    toast.info("Rencana dikosongkan", { action: { label: "Batalkan", onClick: () => setPlan(prev) } });
  }, [plan, toast]);

  const openCohort = useCallback((slug) => {
    setCourseOpen(null);
    setCohortOpen(slug);
    if (slug) setCohort(slug);
  }, []);
  const openCourse = useCallback((slug) => {
    setCohortOpen(null);
    setCourseOpen(slug);
  }, []);
  const close = useCallback(() => {
    setCohortOpen(null);
    setCourseOpen(null);
    if (/^#(bootcamp|course)-/.test(window.location.hash)) history.replaceState(null, "", window.location.pathname + window.location.search);
  }, []);

  // deep link
  useEffect(() => {
    const read = () => {
      const h = decodeURIComponent(window.location.hash.slice(1));
      const b = h.match(/^bootcamp-(.+)$/)?.[1];
      const c = h.match(/^course-(.+)$/)?.[1];
      if (b && cohortBy(b)) {
        setModeState("bootcamp");
        openCohort(b);
      } else if (c && bySlug(c)) {
        setModeState("course");
        openCourse(c);
      }
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, [bySlug, cohortBy, openCohort, openCourse]);

  const nextCohort = useMemo(() => {
    const upcoming = [...data.bootcamps].sort((a, b) => a.start.localeCompare(b.start));
    if (!now) return upcoming[0];
    return upcoming.find((b) => new Date(`${b.start}T08:00:00+07:00`) > now) ?? upcoming[upcoming.length - 1];
  }, [data.bootcamps, now]);

  const value = useMemo(
    () => ({
      ...data,
      mode, setMode, cohort, setCohort, active: cohortBy(cohort) ?? data.bootcamps[0], cohortBy,
      filter, setFilter, resetFilter, busy, filtered: courses, bySlug,
      plan, planCourses, planHours, planWeekly, planWeeks, overload, inPlan, togglePlan, clearPlan,
      openCohort, openCourse, now, nextCohort,
    }),
    [data, mode, setMode, cohort, cohortBy, filter, setFilter, resetFilter, busy, courses, bySlug, plan, planCourses, planHours, planWeekly, planWeeks, overload, inPlan, togglePlan, clearPlan, openCohort, openCourse, now, nextCohort]
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <CohortModal slug={cohortOpen} onSlug={openCohort} onClose={close} />
      <CourseModal slug={courseOpen} onSlug={openCourse} onClose={close} />
    </Ctx.Provider>
  );
}
