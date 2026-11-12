"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { animate } from "animejs";
import { gsap, ScrollTrigger } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { RUMPUN } from "@/lib/kurikulum-content";
import { Container, SectionHeader } from "@/components/home/shared";
import { cn } from "@/lib/utils";
import { useKurikulum } from "./kurikulum-provider";
import { RumpunDot } from "./rumpun-dot";
import { smoothTo } from "./kurikulum-hero";

const GAP = 250; // jarak antar stasiun (px)
const PAD = 120;
const LANE_Y = [132, 178, 224, 270];
const H = 330;
/** Warna titik stasiun per rumpun (data = putih bergaris navy agar beda dari fondasi). */
const DOT = {
  fondasi: { fill: "var(--navy)", text: "white", stroke: 0 },
  enterprise: { fill: "var(--maroon)", text: "white", stroke: 0 },
  "tata-kelola": { fill: "var(--gold)", text: "var(--navy)", stroke: 0 },
  data: { fill: "white", text: "var(--navy)", stroke: 2 },
};

/** Hitung isi tiap stasiun: jumlah mata kuliah per rumpun. */
function useStations(semesters) {
  return useMemo(
    () =>
      semesters.map((s, i) => {
        const counts = Object.fromEntries(RUMPUN.map((r) => [r.key, 0]));
        s.items.forEach((c) => !c.slot && counts[c.rumpun]++);
        return { ...s, i, x: PAD + i * GAP, counts, core: s.items.filter((c) => !c.slot), slots: s.items.filter((c) => c.slot) };
      }),
    [semesters]
  );
}

function RumpunChips({ focus, setFocus, className }) {
  return (
    <ul className={cn("flex flex-wrap gap-2", className)} aria-label="Sorot rumpun mata kuliah">
      {RUMPUN.map((r) => {
        const on = focus === r.key;
        return (
          <li key={r.key}>
            <button
              type="button"
              aria-pressed={on}
              onClick={() => setFocus(on ? null : r.key)}
              onMouseEnter={() => !focus && setFocus(r.key, true)}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-[13.5px] transition-[border-color,background-color,color] duration-300",
                on ? "border-navy bg-navy text-white" : "border-line bg-white text-text/70 hover:border-navy/40 hover:text-navy"
              )}
            >
              <svg aria-hidden viewBox="0 0 28 6" className="h-1.5 w-7">
                <line x1="1" y1="3" x2="27" y2="3" stroke={on && r.color === "var(--navy)" ? "white" : r.color} strokeWidth="4" strokeLinecap="round" strokeDasharray={r.dash ?? undefined} />
              </svg>
              {r.name}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Peta Studi gaya peta kereta (inspirasi 21st.dev "Metro Map"): 8 stasiun = semester, 4 jalur = rumpun.
 * Titik di jalur = ada mata kuliah rumpun itu (angka = jumlahnya); jalur putus-putus tipis = rumpun absen.
 * ≥ lg: section di-pin dan peta bergeser horizontal mengikuti scroll, kereta emas menandai stasiun terdekat
 * dan panel bawah menampilkan isinya. Ponsel / reduced-motion: daftar stasiun vertikal.
 */
export function StudyMap() {
  const { semesters, focus: globalFocus, setFocus: setGlobalFocus, setSemester } = useKurikulum();
  const stations = useStations(semesters);
  const W = PAD * 2 + (stations.length - 1) * GAP;
  const section = useRef(null);
  const viewport = useRef(null);
  const track = useRef(null);
  const train = useRef(null);
  const [near, setNear] = useState(0);
  const [hoverFocus, setHoverFocus] = useState(null);
  const focus = globalFocus ?? hoverFocus;
  const setFocus = (k, hover) => (hover ? setHoverFocus(k) : (setGlobalFocus(k), setHoverFocus(null)));

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const vp = viewport.current;
      const tr = track.current;
      vp.style.overflowX = "hidden";
      const headerH = document.querySelector("header")?.offsetHeight ?? 72;
      const dist = () => Math.max(0, tr.scrollWidth - vp.clientWidth);
      const last = stations.length - 1;
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section.current,
          start: () => `top ${headerH}`,
          end: () => `+=${dist() + window.innerHeight * 0.35}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          onUpdate: (self) => setNear(Math.round(self.progress * last)),
        },
      });
      tl.to(tr, { x: () => -dist() }, 0).fromTo(train.current, { x: PAD }, { x: PAD + last * GAP }, 0);
      // pin menambah tinggi halaman setelah browser melompat ke #anchor → lompat ulang ke section tujuan
      const id = location.hash.slice(1);
      const target = id && !id.startsWith("rps-") ? document.getElementById(id) : null;
      if (target && target !== section.current) requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
      return () => {
        vp.style.overflowX = "";
      };
    });
    return () => mm.revert();
  }, [stations.length]);

  // stasiun terdekat berganti → titiknya "memantul"
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = track.current?.querySelector(`[data-station="${near}"] [data-ring]`);
    if (!el) return;
    const a = animate(el, { scale: [1, 1.35, 1], duration: 600, ease: "outElastic(1, .6)" });
    return () => a.revert?.();
  }, [near]);

  const go = (sem) => {
    setSemester(sem);
    smoothTo("semester");
  };

  const cur = stations[near];

  return (
    <section id="peta" ref={section} className="relative scroll-mt-24 border-y border-line bg-white py-14 md:py-20 lg:flex lg:min-h-[calc(100vh-72px)] lg:flex-col lg:justify-center lg:py-10">
      <Container>
        <SectionHeader
          title={["Peta studi", "delapan stasiun"]}
          body="Setiap stasiun adalah satu semester. Ikuti jalur warna untuk melihat kapan tiap rumpun ilmu muncul dan menguat."
          size="sm"
        />
        <RumpunChips focus={globalFocus} setFocus={setFocus} className="mt-7" />
      </Container>

      {/* ≥ lg: peta horizontal */}
      <div className="mt-8 hidden lg:block" onMouseLeave={() => setHoverFocus(null)}>
        <div ref={viewport} className="overflow-x-auto" style={{ scrollbarWidth: "thin" }}>
          <div ref={track} className="relative" style={{ width: W, height: H }}>
            <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className={cn("study-map absolute inset-0")} data-focus={focus ? "" : undefined} aria-hidden>
              {/* rel kereta */}
              <line x1={PAD - 40} y1="64" x2={W - PAD + 40} y2="64" stroke="var(--line)" strokeWidth="2" />
              {stations.map((s) => (
                <line key={s.i} x1={s.x} y1="58" x2={s.x} y2="70" stroke="var(--line)" strokeWidth="2" />
              ))}
              {/* jalur rumpun */}
              {RUMPUN.map((r, li) => (
                <g key={r.key} data-lane={r.key} data-on={focus === r.key ? "" : undefined}>
                  {stations.slice(0, -1).map((s, i) => {
                    const both = s.counts[r.key] > 0 && stations[i + 1].counts[r.key] > 0;
                    return (
                      <line
                        key={i}
                        x1={s.x}
                        y1={LANE_Y[li]}
                        x2={stations[i + 1].x}
                        y2={LANE_Y[li]}
                        stroke={r.color}
                        strokeOpacity={both ? 1 : 0.35}
                        strokeWidth={both ? 6 : 2}
                        strokeLinecap="round"
                        strokeDasharray={both ? r.dash ?? undefined : "3 8"}
                      />
                    );
                  })}
                </g>
              ))}
              {/* stasiun */}
              {stations.map((s) => (
                <g key={s.i} data-station={s.i}>
                  <rect x={s.x - 19} y={LANE_Y[0] - 24} width="38" height={LANE_Y[3] - LANE_Y[0] + 48} rx="19" fill="white" stroke={near === s.i ? "var(--navy)" : "var(--line)"} strokeWidth="2" style={{ transition: "stroke .4s" }} />
                  {RUMPUN.map((r, li) =>
                    s.counts[r.key] > 0 ? (
                      <g key={r.key} data-lane={r.key} data-on={focus === r.key ? "" : undefined}>
                        <circle data-ring={li === 0 ? "" : undefined} cx={s.x} cy={LANE_Y[li]} r="11" fill={DOT[r.key].fill} stroke="var(--navy)" strokeWidth={DOT[r.key].stroke} style={{ transformBox: "fill-box", transformOrigin: "center" }} />
                        <text x={s.x} y={LANE_Y[li] + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill={DOT[r.key].text}>
                          {s.counts[r.key]}
                        </text>
                      </g>
                    ) : null
                  )}
                </g>
              ))}
            </svg>

            {/* label & tombol stasiun (HTML agar bisa difokus) */}
            {stations.map((s) => (
              <button
                key={s.i}
                type="button"
                onClick={() => go(s.semester)}
                onMouseEnter={() => setNear(s.i)}
                onFocus={() => setNear(s.i)}
                aria-label={`Semester ${s.semester}, ${s.sks} SKS, ${s.core.length} mata kuliah. Buka di buku semester.`}
                className="group absolute top-[300px] -translate-x-1/2 text-center outline-none"
                style={{ left: s.x }}
              >
                <span className={cn("block font-serif text-[1.35rem] leading-none transition-colors duration-300", near === s.i ? "text-maroon" : "text-navy group-hover:text-maroon")}>
                  Semester {s.semester}
                </span>
                <span className="mt-1 block text-[12.5px] tabular-nums text-text/50">{s.sks} SKS</span>
                <span aria-hidden className="mx-auto mt-1 block h-[2px] w-0 bg-gold transition-[width] duration-300 group-hover:w-10 group-focus-visible:w-10" />
              </button>
            ))}

            {/* kereta */}
            <div ref={train} aria-hidden className="pointer-events-none absolute left-0 top-[52px]" style={{ transform: `translateX(${PAD}px)` }}>
              <div className="-translate-x-1/2">
                <div className="flex h-6 w-14 items-center justify-center gap-1 rounded-md bg-gold shadow-[0_8px_18px_-8px_rgb(201_162_39/0.9)]">
                  <span className="size-1.5 rounded-full bg-navy" />
                  <span className="size-1.5 rounded-full bg-navy" />
                  <span className="size-1.5 rounded-full bg-navy" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* panel stasiun terdekat */}
        <Container className="mt-6">
          <div className="flex flex-wrap items-start justify-between gap-6 rounded-xl border border-line bg-cream/60 p-5" aria-live="polite">
            <div className="min-w-0 flex-1">
              <p className="kicker text-maroon">
                Stasiun {cur.semester} · {cur.core.length} mata kuliah{cur.slots.length ? ` + ${cur.slots.length} slot pilihan` : ""}
              </p>
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[14px] text-navy">
                {cur.core.map((c) => (
                  <li key={c.slug} className={cn("flex items-center gap-1.5 transition-opacity duration-300", focus && focus !== c.rumpun && "opacity-30")}>
                    <RumpunDot rumpun={c.rumpun} />
                    {c.nama}
                  </li>
                ))}
              </ul>
            </div>
            <button type="button" onClick={() => go(cur.semester)} className="shrink-0 text-[14.5px] font-semibold text-maroon">
              <span className="u-gold">Buka semester {cur.semester}</span>
            </button>
          </div>
        </Container>
      </div>

      {/* < lg: daftar stasiun vertikal */}
      <Container className="mt-8 lg:hidden">
        <ol className="relative border-l-2 border-line pl-6">
          {stations.map((s) => (
            <li key={s.i} className="relative pb-6 last:pb-0">
              <span aria-hidden className="absolute -left-[33px] top-1 grid size-4 place-items-center rounded-full border-2 border-navy bg-white" />
              <button type="button" onClick={() => go(s.semester)} className="group w-full text-left">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="font-serif text-[1.3rem] text-navy group-hover:text-maroon">Semester {s.semester}</span>
                  <span className="text-[13px] tabular-nums text-text/50">{s.sks} SKS</span>
                </span>
                <span className="mt-2 flex flex-wrap gap-1.5">
                  {RUMPUN.filter((r) => s.counts[r.key]).map((r) => (
                    <span key={r.key} className={cn("inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1 text-[12px] text-text/70 transition-opacity", focus && focus !== r.key && "opacity-30")}>
                      <RumpunDot rumpun={r.key} />
                      {r.short} · {s.counts[r.key]}
                    </span>
                  ))}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

// ScrollTrigger perlu dihitung ulang saat font/gambar selesai dimuat
if (typeof window !== "undefined") window.addEventListener("load", () => ScrollTrigger.refresh());
