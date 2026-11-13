"use client";
import { createContext, useCallback, useContext, useLayoutEffect as useEffect, useMemo, useRef, useState } from "react";
import { SIM_KEY, LIMITS, creditsFor } from "@/lib/konversi-content";
import { prefersReducedMotion } from "@/lib/motion";
import { useToast } from "@/components/ui/toast";
import { ConfirmModal } from "@/components/ui/modal";
import { CourseModal } from "./course-modal";
import { TemplateModal } from "./template-modal";

const Ctx = createContext(null);
export const useKonversi = () => useContext(Ctx);

export function smoothTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
}

const clamp = (v, [lo, hi]) => Math.min(hi, Math.max(lo, Math.round(Number(v) || lo)));

/** Urutan kandidat mata kuliah untuk satu bentuk kegiatan: yang di-pin → rumpun yang relevan → semester. */
function rankCourses(courses, program) {
  const pin = program.pin ? new RegExp(program.pin, "i") : null;
  const pref = (c) => {
    const i = program.prefer.indexOf(c.rumpun);
    return i < 0 ? 9 : i;
  };
  return [...courses].sort((a, b) => Number(!!pin?.test(b.nama)) - Number(!!pin?.test(a.nama)) || pref(a) - pref(b) || (a.semester ?? 9) - (b.semester ?? 9));
}

/**
 * State bersama halaman Konversi SKS:
 * - kegiatan (`programKey`) + masukan meja (`weeks`, `hours`, atau `sks` untuk pertukaran)
 * - `picked`  : slug mata kuliah di "kantong" (tidak boleh melebihi SKS yang diakui)
 * - simulasi tersimpan di localStorage `sisfor:konversi:simulasi` (toast + Batalkan)
 * - modal mata kuliah (`openCourse`), modal berkas (`openDoc`), konfirmasi reset
 * - `busy`    : jeda singkat "menghitung" setelah masukan berubah (DotsLoader + Skeleton di struk)
 */
export function KonversiProvider({ data, children }) {
  const toast = useToast();
  const first = data.programs[0];
  const [programKey, setProgramKey] = useState(first.key);
  const [weeks, setWeeksState] = useState(first.weeks ?? 16);
  const [hours, setHoursState] = useState(first.hours ?? 40);
  const [sks, setSksState] = useState(18);
  const [picked, setPicked] = useState([]);
  const [busy, setBusy] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [courseSlug, setCourseSlug] = useState(null);
  const [docKey, setDocKey] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const busyTimer = useRef(null);
  const overWarned = useRef(false);
  const shrinkToast = useRef(0);

  const program = data.programs.find((p) => p.key === programKey) ?? first;
  const raw = creditsFor({ mode: program.mode, weeks, hours, sks }, data.rate);
  const credits = Math.min(raw, data.cap);
  const over = raw > data.cap;
  const bySlug = useCallback((slug) => data.courses.find((c) => c.slug === slug) ?? null, [data.courses]);
  const pickedCourses = useMemo(() => picked.map(bySlug).filter(Boolean), [picked, bySlug]);
  const used = pickedCourses.reduce((t, c) => t + c.sks, 0);
  const left = credits - used;
  const ranked = useMemo(() => rankCourses(data.courses, program), [data.courses, program]);

  const pulse = useCallback(() => {
    setBusy(true);
    clearTimeout(busyTimer.current);
    busyTimer.current = setTimeout(() => setBusy(false), 320);
  }, []);
  useEffect(() => () => clearTimeout(busyTimer.current), []);

  const setWeeks = useCallback((v) => (setWeeksState(clamp(v, LIMITS.weeks)), pulse()), [pulse]);
  const setHours = useCallback((v) => (setHoursState(clamp(v, LIMITS.hours)), pulse()), [pulse]);
  const setSks = useCallback((v) => (setSksState(clamp(v, LIMITS.sks)), pulse()), [pulse]);

  // SKS yang diakui turun di bawah isi kantong → keluarkan mata kuliah terakhir sampai muat
  useEffect(() => {
    if (used <= credits) return;
    let total = 0;
    const keep = [];
    for (const c of pickedCourses) {
      if (total + c.sks > credits) continue;
      total += c.sks;
      keep.push(c.slug);
    }
    setPicked(keep);
    // saat angka diseret turun, beri tahu sekali saja (bukan tiap langkah)
    if (Date.now() - shrinkToast.current > 5000) {
      shrinkToast.current = Date.now();
      toast.info("Kantong menyesuaikan SKS", { description: "Mata kuliah yang tidak muat lagi dikeluarkan.", duration: 3200 });
    }
  }, [credits, used, pickedCourses, toast]);

  // toast sekali saat melewati batas
  useEffect(() => {
    if (over && !overWarned.current) {
      overWarned.current = true;
      toast.warning(`Batasnya ${data.cap} SKS per semester`, { description: "Jam kegiatan di atas batas tetap tercatat, tapi tidak menambah SKS." });
    }
    if (!over) overWarned.current = false;
  }, [over, data.cap, toast]);

  const choose = useCallback(
    (key, { scroll = false } = {}) => {
      const p = data.programs.find((x) => x.key === key);
      if (!p) return;
      setProgramKey(key);
      if (p.mode === "jam") {
        setWeeksState(p.weeks);
        setHoursState(p.hours);
      } else setSksState(p.sks ?? 18);
      setPicked([]);
      pulse();
      if (scroll) smoothTo("kalkulator");
    },
    [data.programs, pulse]
  );

  const toggleCourse = useCallback(
    (slug) => {
      const c = bySlug(slug);
      if (!c) return;
      if (picked.includes(slug)) {
        setPicked((p) => p.filter((s) => s !== slug));
        return;
      }
      if (c.sks > left) {
        toast.warning("SKS tidak cukup", { description: `${c.nama} butuh ${c.sks} SKS, sisa kantongmu ${Math.max(left, 0)} SKS.` });
        return;
      }
      setPicked((p) => [...p, slug]);
    },
    [bySlug, picked, left, toast]
  );

  /** Isi kantong otomatis: ambil kandidat teratas yang masih muat. */
  const autofill = useCallback(() => {
    let total = 0;
    const next = [];
    for (const c of ranked) {
      if (total + c.sks > credits) continue;
      total += c.sks;
      next.push(c.slug);
      if (total === credits) break;
    }
    setPicked(next);
    if (!next.length) toast.info("Belum ada SKS untuk dipetakan", { description: "Tambah durasi atau jam per minggu dulu." });
  }, [ranked, credits, toast]);

  const snapshot = useCallback(() => ({ programKey, weeks, hours, sks, picked, at: new Date().toISOString() }), [programKey, weeks, hours, sks, picked]);

  const restore = useCallback(
    (s) => {
      if (!s || !data.programs.some((p) => p.key === s.programKey)) return false;
      setProgramKey(s.programKey);
      setWeeksState(clamp(s.weeks, LIMITS.weeks));
      setHoursState(clamp(s.hours, LIMITS.hours));
      setSksState(clamp(s.sks, LIMITS.sks));
      setPicked((Array.isArray(s.picked) ? s.picked : []).filter((slug) => data.courses.some((c) => c.slug === slug)));
      return true;
    },
    [data.programs, data.courses]
  );

  // muat simulasi terakhir
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(SIM_KEY) ?? "null");
      if (s && restore(s)) {
        setSavedAt(s.at ?? null);
        toast.info("Simulasi terakhirmu dimuat", {
          description: "Lanjutkan dari meja konversi.",
          action: { label: "Lihat", onClick: () => smoothTo("kalkulator") },
          duration: 3800,
        });
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = useCallback(() => {
    let prev = null;
    try {
      prev = localStorage.getItem(SIM_KEY);
      const s = snapshot();
      localStorage.setItem(SIM_KEY, JSON.stringify(s));
      setSavedAt(s.at);
    } catch {
      toast.error("Gagal menyimpan", { description: "Penyimpanan peramban tidak tersedia." });
      return;
    }
    toast.success("Simulasi tersimpan", {
      description: "Tetap ada saat kamu kembali ke halaman ini.",
      action: {
        label: "Batalkan",
        onClick: () => {
          try {
            prev ? localStorage.setItem(SIM_KEY, prev) : localStorage.removeItem(SIM_KEY);
            setSavedAt(prev ? JSON.parse(prev).at ?? null : null);
          } catch {}
        },
      },
    });
  }, [snapshot, toast]);

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(SIM_KEY);
    } catch {}
    setSavedAt(null);
    choose(first.key);
    setConfirmReset(false);
    toast.info("Meja dikosongkan", { duration: 2600 });
  }, [choose, first.key, toast]);

  const applyCase = useCallback(
    (key) => {
      const k = data.cases.find((x) => x.key === key);
      if (!k) return;
      setProgramKey(k.program);
      setWeeksState(k.weeks);
      setHoursState(k.hours);
      setPicked(k.rows.map((r) => r.course.slug));
      pulse();
      smoothTo("kalkulator");
      toast.success("Kasus dipindah ke meja", { description: k.label, duration: 3000 });
    },
    [data.cases, pulse, toast]
  );

  const openCourse = useCallback((slug) => {
    setDocKey(null);
    setCourseSlug(slug);
  }, []);
  const openDoc = useCallback((key) => {
    setCourseSlug(null);
    setDocKey(key);
  }, []);
  const close = useCallback(() => {
    setCourseSlug(null);
    setDocKey(null);
  }, []);

  const value = useMemo(
    () => ({
      ...data,
      program, programKey, choose, weeks, hours, sks, setWeeks, setHours, setSks,
      raw, credits, over, used, left, picked, pickedCourses, ranked, toggleCourse, autofill,
      busy, savedAt, save, askReset: () => setConfirmReset(true), applyCase, openCourse, openDoc, bySlug,
    }),
    [data, program, programKey, choose, weeks, hours, sks, setWeeks, setHours, setSks, raw, credits, over, used, left, picked, pickedCourses, ranked, toggleCourse, autofill, busy, savedAt, save, applyCase, openCourse, openDoc, bySlug]
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <CourseModal slug={courseSlug} onSlug={openCourse} onClose={close} />
      <TemplateModal docKey={docKey} onClose={close} />
      <ConfirmModal
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title="Kosongkan meja konversi?"
        description="Kegiatan, angka, isi kantong, dan simulasi tersimpan akan dihapus. Tindakan ini tidak bisa dibatalkan."
        confirmLabel="Ya, kosongkan"
        destructive
        onConfirm={reset}
      />
    </Ctx.Provider>
  );
}
