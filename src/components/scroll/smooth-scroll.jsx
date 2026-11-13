"use client";
import { createContext, useCallback, useContext, useLayoutEffect as useEffect, useMemo, useRef, useState } from "react";
import { gsap, ScrollSmoother, ScrollTrigger, CINEMATIC_QUERY, sceneTokens } from "@/lib/scroll";

const SmoothCtx = createContext({
  cinematic: false,
  active: null,
  setActive: () => {},
  registerScene: () => () => {},
  scrollToScene: () => {},
});

export const useSmooth = () => useContext(SmoothCtx);

/**
 * Bungkus halaman dengan ScrollSmoother.
 * - `children` masuk ke #smooth-content (ikut di-scroll halus).
 * - `overlay` = elemen fixed (navbar, maskot, chapter rail) — WAJIB di luar wrapper,
 *   karena ScrollSmoother memakai transform sehingga `position: fixed` di dalamnya rusak.
 */
export function SmoothScroll({ children, overlay }) {
  const [cinematic, setCinematic] = useState(false);
  const [active, setActive] = useState(null);
  const scenes = useRef(new Map()); // id -> () => scrollY awal scene

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(CINEMATIC_QUERY, () => {
      document.documentElement.dataset.cinematic = "";
      ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: sceneTokens.smooth,
        effects: true, // aktifkan data-speed / data-lag untuk parallax
        smoothTouch: false,
        normalizeScroll: false,
      });
      setCinematic(true);
      return () => {
        delete document.documentElement.dataset.cinematic;
        ScrollSmoother.get()?.kill();
        setCinematic(false);
      };
    });
    // gambar/font selesai dimuat → ukur ulang posisi trigger
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    return () => {
      window.removeEventListener("load", onLoad);
      mm.revert();
    };
  }, []);

  const registerScene = useCallback((id, getStart) => {
    scenes.current.set(id, getStart);
    return () => scenes.current.delete(id);
  }, []);

  const scrollToScene = useCallback((id) => {
    const getStart = scenes.current.get(id);
    const el = document.getElementById(id);
    const smoother = ScrollSmoother.get();
    const y = getStart ? getStart() : el ? el.getBoundingClientRect().top + window.scrollY : 0;
    if (smoother) smoother.scrollTo(y + 2, true);
    else window.scrollTo({ top: y, behavior: "smooth" });
  }, []);

  const value = useMemo(
    () => ({ cinematic, active, setActive, registerScene, scrollToScene }),
    [cinematic, active, registerScene, scrollToScene]
  );

  return (
    <SmoothCtx.Provider value={value}>
      {overlay}
      <div id="smooth-wrapper">
        <div id="smooth-content">{children}</div>
      </div>
    </SmoothCtx.Provider>
  );
}
