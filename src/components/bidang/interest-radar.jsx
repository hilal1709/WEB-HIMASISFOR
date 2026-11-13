"use client";
import { useLayoutEffect as useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_PROFILE, DIMENSIONS } from "@/lib/bidang-keahlian-content";
import { Flip, gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { Container, PlaceholderTag, SectionHeader } from "@/components/home/shared";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { useBidang } from "./bidang-provider";

const SIZE = 380;
const C = SIZE / 2;
const R = 136;
const MAX = 10;
const angleOf = (i) => ((-90 + (i * 360) / DIMENSIONS.length) * Math.PI) / 180;
const pt = (i, v) => [C + Math.cos(angleOf(i)) * (R * v) / MAX, C + Math.sin(angleOf(i)) * (R * v) / MAX];
const poly = (vals) => vals.map((v, i) => pt(i, v).map((n) => n.toFixed(1)).join(",")).join(" ");

/** Gaya garis tiap bidang (dalam palet: maroon/navy, padat/putus-putus). "Kamu" = emas. */
const STROKE = {
  enterprise: { stroke: "var(--maroon)", dash: undefined },
  audit: { stroke: "var(--navy)", dash: undefined },
  data: { stroke: "var(--navy)", dash: "5 5" },
  msi: { stroke: "var(--maroon)", dash: "5 5" },
};

/**
 * "Cocokkan dirimu" (pola 21st.dev radar chart + mixer). Lima slider (atau tarik titik emas langsung di radar)
 * membentuk poligon "Kamu"; poligon bergerak halus ke nilai baru (GSAP). Peringkat kecocokan 4 bidang
 * berurutan ulang dengan GSAP Flip; hover baris menyorot poligon bidangnya, klik membuka modal.
 * "Simpan ke rak" menandai bidang teratas (toast). Profil bidang = contoh.
 */
export function InterestRadar() {
  const { fields, profile, setProfile, scores, openField, shortlist, toggleShortlist } = useBidang();
  const toast = useToast();
  const [shown, setShown] = useState(profile);
  const [hover, setHover] = useState(null);
  const [dragging, setDragging] = useState(null);
  const tween = useRef({ v: [...profile] });
  const svgRef = useRef(null);
  const list = useRef(null);
  const flipState = useRef(null);

  // poligon "Kamu" menyusul nilai slider
  useEffect(() => {
    const target = profile;
    if (prefersReducedMotion() || dragging != null) {
      tween.current.v = [...target];
      setShown([...target]);
      return;
    }
    const obj = tween.current;
    const t = gsap.to(obj.v, { ...Object.fromEntries(target.map((v, i) => [i, v])), duration: 0.6, ease: "expo.out", onUpdate: () => setShown([...obj.v]) });
    return () => t.kill();
  }, [profile, dragging]);

  const order = useMemo(() => fields.map((_, i) => i).sort((a, b) => scores[b] - scores[a]), [fields, scores]);
  const orderKey = order.join("");
  const prevKey = useRef(orderKey);
  if (prevKey.current !== orderKey && list.current) {
    flipState.current = Flip.getState(list.current.querySelectorAll("[data-rank]"));
    prevKey.current = orderKey;
  }
  useLayoutEffect(() => {
    if (!flipState.current) return;
    if (!prefersReducedMotion()) Flip.from(flipState.current, { duration: 0.6, ease: "expo.out" });
    flipState.current = null;
  }, [orderKey]);

  const top = order[0];
  const setDim = (i, v) => setProfile((p) => p.map((x, j) => (j === i ? v : x)));

  // tarik titik emas di radar: proyeksikan posisi pointer ke sumbu titik tsb
  const onPointerMove = (e) => {
    if (dragging == null) return;
    const r = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * SIZE - C;
    const y = ((e.clientY - r.top) / r.height) * SIZE - C;
    const a = angleOf(dragging);
    const along = x * Math.cos(a) + y * Math.sin(a);
    setDim(dragging, Math.max(0, Math.min(MAX, Math.round((along / R) * MAX))));
  };

  const saveTop = () => {
    const f = fields[top];
    if (shortlist.includes(f.slug)) toast.info(`${f.title} sudah ada di rakmu`, { description: `Kecocokanmu saat ini ${scores[top]}%.` });
    else toggleShortlist(f.slug);
  };

  return (
    <section id="cocokkan" className="relative scroll-mt-24 bg-white py-16 md:py-20">
      <Container>
        <SectionHeader
          title={["Geser, lalu lihat", "siapa yang mirip", "denganmu"]}
          body="Seberapa kamu menikmati lima hal berikut? Poligon emas adalah kamu. Tarik titiknya langsung di radar bila lebih suka."
          action={<PlaceholderTag />}
        />

        <div className="mt-10 grid gap-10 md:mt-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          {/* slider */}
          <div className="order-2 lg:order-1">
            <ul className="space-y-6">
              {DIMENSIONS.map((d, i) => (
                <li key={d.key}>
                  <div className="flex items-baseline justify-between gap-3">
                    <label htmlFor={`dim-${d.key}`} className="text-[15px] font-medium text-navy">{d.label}</label>
                    <span className="tabular w-8 overflow-hidden text-right font-serif text-[1.35rem] leading-none text-maroon">
                      <span key={profile[i]} className="inline-block animate-in slide-in-from-bottom-2 fade-in-0 duration-300">{profile[i]}</span>
                    </span>
                  </div>
                  <div className="relative mt-2 h-7">
                    <span aria-hidden className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-line" />
                    <span
                      aria-hidden
                      className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-maroon transition-[width] duration-200"
                      style={{ width: `calc(${profile[i] / MAX} * (100% - 22px) + 11px)` }}
                    />
                    <input
                      id={`dim-${d.key}`}
                      type="range"
                      min={0}
                      max={MAX}
                      step={1}
                      value={profile[i]}
                      onChange={(e) => setDim(i, Number(e.target.value))}
                      aria-valuetext={`${profile[i]} dari ${MAX}`}
                      className="bk-range absolute inset-0"
                    />
                  </div>
                  <div aria-hidden className="mt-1 flex justify-between text-[11.5px] text-text/40">
                    <span>Kurang</span>
                    <span>Sangat</span>
                  </div>
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => setProfile(DEFAULT_PROFILE)} className="mt-6 text-[14px] font-semibold text-navy">
              <span className="u-gold">Kembalikan ke awal</span>
            </button>
          </div>

          {/* radar + peringkat */}
          <div className="order-1 grid gap-8 lg:order-2 xl:grid-cols-[1fr_250px] xl:items-center">
            <div className="relative mx-auto w-full max-w-[420px]">
              <svg
                ref={svgRef}
                viewBox={`0 0 ${SIZE} ${SIZE}`}
                className={cn("h-auto w-full touch-none select-none overflow-visible", dragging != null && "cursor-grabbing")}
                onPointerMove={onPointerMove}
                onPointerUp={() => setDragging(null)}
                onPointerLeave={() => setDragging(null)}
                role="img"
                aria-label={`Radar minat. Kecocokan tertinggi: ${fields[top].title} ${scores[top]} persen.`}
              >
                {[2, 4, 6, 8, 10].map((g) => (
                  <polygon key={g} points={poly(DIMENSIONS.map(() => g))} fill={g === 10 ? "var(--cream)" : "none"} stroke="var(--line)" strokeWidth="1" />
                ))}
                {DIMENSIONS.map((d, i) => {
                  const [x, y] = pt(i, MAX);
                  const [lx, ly] = pt(i, MAX + 1.9);
                  return (
                    <g key={d.key}>
                      <line x1={C} y1={C} x2={x} y2={y} stroke="var(--line)" strokeWidth="1" />
                      <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" className="fill-text/55 text-[11.5px] font-semibold uppercase tracking-[0.12em]">
                        {d.short}
                      </text>
                    </g>
                  );
                })}
                {fields.map((f, i) => {
                  const s = STROKE[f.slug] ?? STROKE.audit;
                  const dim = hover != null && hover !== i;
                  const on = hover === i;
                  return (
                    <polygon
                      key={f.slug}
                      points={poly(f.profile)}
                      fill={s.stroke}
                      fillOpacity={on ? 0.12 : 0.03}
                      stroke={s.stroke}
                      strokeWidth={on ? 2.2 : 1.3}
                      strokeDasharray={s.dash}
                      strokeLinejoin="round"
                      style={{ opacity: dim ? 0.15 : 0.85, transition: "opacity .4s, fill-opacity .4s, stroke-width .4s" }}
                    />
                  );
                })}
                <polygon points={poly(shown)} fill="var(--gold)" fillOpacity="0.22" stroke="var(--gold)" strokeWidth="2.5" strokeLinejoin="round" />
                {shown.map((v, i) => {
                  const [x, y] = pt(i, v);
                  return (
                    <g key={i} onPointerDown={(e) => (e.currentTarget.ownerSVGElement.setPointerCapture?.(e.pointerId), setDragging(i))} className="cursor-grab">
                      <circle cx={x} cy={y} r="16" fill="transparent" />
                      <circle cx={x} cy={y} r={dragging === i ? 8 : 6} fill="var(--gold)" stroke="white" strokeWidth="2.5" style={{ transition: "r .2s" }} />
                    </g>
                  );
                })}
              </svg>
            </div>

            <div>
              <ol ref={list} className="space-y-2" onMouseLeave={() => setHover(null)}>
                {order.map((i, rank) => {
                  const f = fields[i];
                  const s = STROKE[f.slug] ?? STROKE.audit;
                  return (
                    <li key={f.slug} data-rank data-flip-id={f.slug}>
                      <button
                        type="button"
                        onMouseEnter={() => setHover(i)}
                        onFocus={() => setHover(i)}
                        onBlur={() => setHover(null)}
                        onClick={(e) => openField(i, e.currentTarget)}
                        className={cn(
                          "group w-full rounded-lg border px-3.5 py-3 text-left transition-[border-color,background-color] duration-300",
                          rank === 0 ? "border-gold bg-cream/70" : "border-line bg-white hover:border-navy/25"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <svg aria-hidden viewBox="0 0 24 6" className="w-6 shrink-0">
                            <line x1="1" y1="3" x2="23" y2="3" stroke={s.stroke} strokeWidth="2.2" strokeDasharray={s.dash ? "4 3" : undefined} strokeLinecap="round" />
                          </svg>
                          <span className="min-w-0 flex-1 truncate text-[14.5px] font-semibold text-navy">{f.title}</span>
                          <span className="tabular text-[14px] font-semibold text-maroon">{scores[i]}%</span>
                        </div>
                        <span aria-hidden className="mt-2 block h-1 overflow-hidden rounded-full bg-line">
                          <span className={cn("block h-full rounded-full transition-[width] duration-500 ease-cinematic", rank === 0 ? "bg-gold" : "bg-navy/40")} style={{ width: `${scores[i]}%` }} />
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>

              <div className="mt-5 flex items-center gap-4 rounded-xl bg-navy p-4 text-white" data-lottie-hover aria-live="polite">
                {fields[top].lottie && <LottieIllustration src={fields[top].lottie} className="size-14 shrink-0" />}
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] text-white/55">Paling dekat denganmu</p>
                  <p key={fields[top].slug} className="font-serif text-[1.15rem] leading-tight animate-in fade-in-0 slide-in-from-bottom-1 duration-500">{fields[top].title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={saveTop}
                className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-maroon text-[14.5px] font-semibold text-white transition-[background-color,transform] duration-300 hover:bg-maroon-deep active:scale-[0.98]"
              >
                {shortlist.includes(fields[top].slug) ? "Sudah di rakmu" : "Simpan ke rak pilihan"}
              </button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
