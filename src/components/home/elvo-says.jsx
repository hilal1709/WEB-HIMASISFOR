"use client";
import { useEffect, useRef, useState } from "react";
import { Elvo } from "@/components/mascot/elvo";
import { cn } from "@/lib/utils";

/**
 * Elvo muncul di dalam babak dan berbicara lewat bubble (bukan widget pojok).
 * Melompat masuk saat babak terlihat; bubble menyusul. `side` menentukan arah ekor bubble.
 */
export function ElvoSays({ pose, say, height = 220, side = "left", className }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <figure ref={ref} className={cn("elvo-says", side === "right" && "elvo-says--right", shown && "is-shown", className)}>
      <span className="elvo-says__body">
        <Elvo pose={pose} height={height} />
      </span>
      <figcaption className="speech-bubble elvo-says__bubble">{say}</figcaption>
    </figure>
  );
}
