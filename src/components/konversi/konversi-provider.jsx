"use client";
import { createContext, useCallback, useContext, useLayoutEffect as useEffect, useMemo, useRef, useState } from "react";
import { SIM_KEY, creditsFor } from "@/lib/konversi-content";
import { clampInput, fitCourses, rankCourses } from "@/lib/konversi-cms/schema";
import { konversiText as msg } from "@/lib/konversi-cms/copy";
import { prefersReducedMotion } from "@/lib/motion";
import { useToast } from "@/components/ui/toast";
import { ConfirmModal } from "@/components/ui/modal";
import { CourseModal } from "./course-modal";
import { TemplateModal } from "./template-modal";

const Ctx = createContext(null);
const NO_PROGRAM = { key: "", label: "", mode: "jam", weeks: 0, hours: 0, sks: 0, recommended: [] };
export const useKonversi = () => useContext(Ctx);

export function smoothTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
}

export function KonversiProvider({ data, preview, children }) {
  const toast = useToast();
  const first = data.programs[0] ?? NO_PROGRAM;
  const { rules, copy: { feedback } } = data;
  const { limits, cap } = rules;
  const canCalculate = data.programs.length > 0 && data.blocks.some((block) => block.key === "calculator" && block.visible);
  const [programKey, setProgramKey] = useState(first.key);
  const [weeksInput, setWeeksState] = useState(first.weeks);
  const [hoursInput, setHoursState] = useState(first.hours);
  const [sksInput, setSksState] = useState(first.sks);
  const [picked, setPicked] = useState([]);
  const [busy, setBusy] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [courseSlug, setCourseSlug] = useState(null);
  const [docKey, setDocKey] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const busyTimer = useRef(null);
  const overWarned = useRef(false);
  const shrinkToast = useRef(0);
  const previewSave = useRef(null);
  const modalTrigger = useRef(null);

  const program = data.programs.find((p) => p.key === programKey) ?? first;
  const keep = program.key === programKey;
  const weeks = keep && program.mode === "jam" ? clampInput(weeksInput, limits.weeks, program.weeks) : program.weeks;
  const hours = keep && program.mode === "jam" ? clampInput(hoursInput, limits.hours, program.hours) : program.hours;
  const sks = keep && program.mode === "sks" ? clampInput(sksInput, limits.sks, program.sks) : program.sks;
  const raw = creditsFor({ mode: program.mode, weeks, hours, sks }, rules);
  const credits = Math.min(raw, cap);
  const over = raw > cap;
  const bySlug = useCallback((slug) => data.courses.find((c) => c.slug === slug) ?? null, [data.courses]);
  const pickedCourses = useMemo(() => picked.map(bySlug).filter(Boolean), [picked, bySlug]);
  const used = pickedCourses.reduce((total, c) => total + c.sks, 0);
  const left = credits - used;
  const ranked = useMemo(() => rankCourses(data.courses, program), [data.courses, program]);

  const pulse = useCallback(() => {
    if (prefersReducedMotion()) return;
    setBusy(true);
    clearTimeout(busyTimer.current);
    busyTimer.current = setTimeout(() => setBusy(false), 320);
  }, []);
  useEffect(() => () => clearTimeout(busyTimer.current), []);

  const setWeeks = (v) => { setWeeksState(clampInput(v, limits.weeks, program.weeks)); pulse(); };
  const setHours = (v) => { setHoursState(clampInput(v, limits.hours, program.hours)); pulse(); };
  const setSks = (v) => { setSksState(clampInput(v, limits.sks, program.sks)); pulse(); };

  useEffect(() => {
    if (picked.length === pickedCourses.length && used <= credits) return;
    setPicked(fitCourses(picked, data.courses, credits));
    if (Date.now() - shrinkToast.current > 5000) {
      shrinkToast.current = Date.now();
      toast.info(feedback.shrank, { description: feedback.shrankBody, duration: 3200 });
    }
  }, [credits, used, picked, pickedCourses, data.courses, feedback, toast]);

  useEffect(() => {
    if (canCalculate && over && !overWarned.current) {
      overWarned.current = true;
      toast.warning(msg(feedback.cap, { cap }), { description: feedback.capBody });
    }
    if (!over) overWarned.current = false;
  }, [over, cap, canCalculate, feedback, toast]);

  function choose(key, { scroll = false } = {}) {
    const selected = data.programs.find((item) => item.key === key);
    if (!selected) return;
    setProgramKey(key);
    setWeeksState(selected.weeks);
    setHoursState(selected.hours);
    setSksState(selected.sks);
    setPicked([]);
    pulse();
    if (scroll && canCalculate) smoothTo("kalkulator");
  }

  function toggleCourse(slug) {
    const course = bySlug(slug);
    if (!course) return;
    if (picked.includes(slug)) return setPicked((current) => current.filter((item) => item !== slug));
    if (course.sks > left) {
      toast.warning(feedback.insufficient, { description: msg(feedback.insufficientBody, { course: course.nama, credits: course.sks, remaining: Math.max(left, 0) }) });
      return;
    }
    setPicked((current) => fitCourses([...current, slug], data.courses, credits));
  }

  function autofill() {
    const next = fitCourses(ranked.map((course) => course.slug), ranked, credits);
    setPicked(next);
    if (!next.length) toast.info(feedback.autofillEmpty, { description: feedback.autofillBody });
  }

  const restore = useCallback((saved) => {
    const selected = data.programs.find((item) => item.key === saved?.programKey);
    if (!selected) return false;
    const inputs = { mode: selected.mode };
    for (const field of Object.keys(limits)) {
      inputs[field] = field === "sks" && selected.mode !== "sks" || field !== "sks" && selected.mode !== "jam"
        ? selected[field]
        : clampInput(saved[field], limits[field], selected[field]);
    }
    const total = Math.min(creditsFor(inputs, rules), rules.cap);
    setProgramKey(selected.key);
    setWeeksState(inputs.weeks);
    setHoursState(inputs.hours);
    setSksState(inputs.sks);
    setPicked(fitCourses(Array.isArray(saved.picked) ? saved.picked : [], data.courses, total));
    return true;
  }, [data.programs, data.courses, limits, rules]);

  useEffect(() => {
    if (preview || !canCalculate) return;
    try {
      const saved = JSON.parse(localStorage.getItem(SIM_KEY) ?? "null");
      if (restore(saved)) {
        setSavedAt(saved.at ?? null);
        toast.info(feedback.restored, {
          description: feedback.restoredBody, action: { label: feedback.view, onClick: () => smoothTo("kalkulator") }, duration: 3800,
        });
      }
    } catch {}
    // Restore once on mount. A refresh that changes the configuration is handled by the live-state checks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function save() {
    let previous;
    const current = { programKey: program.key, weeks, hours, sks, picked, at: new Date().toISOString() };
    const store = (value) => {
      if (preview) previewSave.current = value;
      else if (value) localStorage.setItem(SIM_KEY, JSON.stringify(value));
      else localStorage.removeItem(SIM_KEY);
      setSavedAt(value?.at ?? null);
    };
    try {
      previous = preview ? previewSave.current : JSON.parse(localStorage.getItem(SIM_KEY) ?? "null");
      store(current);
    } catch {
      toast.error(feedback.failed, { description: feedback.failedBody });
      return;
    }
    toast.success(feedback.saved, {
      description: preview ? feedback.previewSavedBody : feedback.savedBody,
      action: { label: feedback.undo, onClick: () => {
        try {
          const stored = preview ? previewSave.current : JSON.parse(localStorage.getItem(SIM_KEY) ?? "null");
          if (stored?.at === current.at) store(previous);
        } catch {}
      } },
    });
  }

  function reset() {
    if (preview) previewSave.current = null;
    else {
      try {
        localStorage.removeItem(SIM_KEY);
      } catch {
        toast.error(feedback.failed, { description: feedback.failedBody });
        return;
      }
    }
    setSavedAt(null);
    choose(first.key);
    setConfirmReset(false);
    toast.info(feedback.resetDone, { duration: 2600 });
  }

  function applyCase(key) {
    const item = data.cases.find((candidate) => candidate.key === key);
    if (!item || !canCalculate || !restore({ ...item, programKey: item.program, picked: item.rows.map((row) => row.course.slug) })) return;
    pulse();
    smoothTo("kalkulator");
    toast.success(feedback.caseApplied, { description: item.label, duration: 3000 });
  }

  function openCourse(slug) {
    if (!courseSlug) modalTrigger.current = document.activeElement;
    setDocKey(null);
    setCourseSlug(slug);
  }
  function openDoc(key) {
    if (!docKey) modalTrigger.current = document.activeElement;
    setCourseSlug(null);
    setDocKey(key);
  }
  const close = () => { setCourseSlug(null); setDocKey(null); };
  const restoreFocus = (event) => {
    if (!modalTrigger.current?.isConnected) return;
    event.preventDefault();
    modalTrigger.current.focus({ preventScroll: true });
  };

  return (
    <Ctx.Provider value={{
      ...data, ...rules, preview, canCalculate, program, programKey: program.key, choose, weeks, hours, sks, setWeeks, setHours, setSks,
      raw, credits, over, used, left, picked, pickedCourses, ranked, toggleCourse, autofill,
      busy, savedAt, save, askReset: () => { modalTrigger.current = document.activeElement; setConfirmReset(true); }, applyCase, openCourse, openDoc, bySlug, restoreFocus,
    }}>
      {children}
      <CourseModal slug={courseSlug} onSlug={openCourse} onClose={close} />
      <TemplateModal docKey={docKey} onClose={close} />
      <ConfirmModal
        open={confirmReset} onOpenChange={setConfirmReset}
        title={feedback.resetTitle} description={feedback.resetBody} confirmLabel={feedback.resetConfirm}
        cancelLabel={feedback.cancel} closeLabel={feedback.close} onCloseAutoFocus={restoreFocus} destructive onConfirm={reset}
      />
    </Ctx.Provider>
  );
}
