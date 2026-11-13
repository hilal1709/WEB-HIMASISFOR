"use client";
import { useLayoutEffect as useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { fmtDate, monthPos } from "@/lib/beasiswa-content";
import { Container, SectionHeader } from "@/components/home/shared";
import { BeasiswaBanner } from "./beasiswa-banner";
import { cn } from "@/lib/utils";
import { useBeasiswa } from "./beasiswa-provider";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const MONTHS_LONG = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const C = 220;
const R0 = 186;
const GAP = 14;

const polar = (r, pos) => {
  const a = (pos / 12) * Math.PI * 2 - Math.PI / 2;
  // dibulatkan agar SSR dan klien menghasilkan atribut yang sama (hidrasi)
  return [Math.round((C + r * Math.cos(a)) * 100) / 100, Math.round((C + r * Math.sin(a)) * 100) / 100];
};
function arc(r, from, to) {
  let b = to;
  if (b <= from) b += 12;
  const [x1, y1] = polar(r, from);
  const [x2, y2] = polar(r, b);
  return `M${x1.toFixed(1)} ${y1.toFixed(1)}A${r} ${r} 0 ${b - from > 6 ? 1 : 0} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`;
}

/** Jendela berulang tiap tahun: "buka" bila hari ini di dalamnya, selain itu "nanti". */
function stateOf(w, now) {
  if (!now) return "nanti";
  const y = now.getFullYear();
  const [om, od] = w.open.split("-").map(Number);
  const [cm, cd] = w.close.split("-").map(Number);
  for (const yy of [y - 1, y]) {
    const open = new Date(yy, om - 1, od);
    let close = new Date(yy, cm - 1, cd, 23, 59);
    if (close < open) close = new Date(yy + 1, cm - 1, cd, 23, 59);
    if (now >= open && now <= close) return "buka";
  }
  return "nanti";
}

const inMonth = (w, m) => {
  const a = monthPos(w.open);
  let b = monthPos(w.close);
  if (b < a) b += 12;
  return [m, m + 12].some((x) => x + 0.999 >= a && x <= b);
};

/** Angka hari yang "bergulir" saat berganti. */
function RollDays({ value }) {
  return (
    <span key={value} className="bs-roll tabular inline-block">
      {value}
    </span>
  );
}

/**
 * Cincin tahun `#jadwal`: dial 12 bulan, tiap beasiswa punya cincin sendiri berisi busur jendela pendaftarannya.
 * Jarum emas = hari ini. Busur yang sedang buka berdenyut. Label bulan di separuh bawah dibalik agar tetap terbaca.
 * Dial diputar dengan diseret (GSAP quickTo, kembali tepat ke bulan saat dilepas) atau ‹ › / ←→; bulan di penanda atas
 * = bulan pilihan → pusat dial menyebut beasiswa yang buka bulan itu. Hover/fokus busur → pusat menampilkan rinciannya.
 * Ponsel (< md): daftar urut tenggat dengan pita 12 bulan.
 */
export function YearDial() {
  const { items, now, open } = useBeasiswa();
  const dial = useRef(null);
  const rot = useRef(0);
  const spin = useRef(null);
  const [month, setMonth] = useState(null);
  const [hover, setHover] = useState(null);

  // bulan awal = bulan sekarang (klien)
  useEffect(() => {
    if (now && month === null) {
      setMonth(now.getMonth());
      rot.current = -(now.getMonth() * 30 + 15);
      gsap.set(dial.current, { rotation: rot.current, svgOrigin: `${C} ${C}` });
    }
  }, [now, month]);

  useEffect(() => {
    spin.current = gsap.quickTo(dial.current, "rotation", { duration: 0.7, ease: "power3.out" });
  }, []);

  const goMonth = (m) => {
    const target = ((m % 12) + 12) % 12;
    // putar lewat jalur terpendek dari rotasi sekarang
    const want = -(target * 30 + 15);
    let delta = (want - rot.current) % 360;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    rot.current += delta;
    setMonth(target);
    if (prefersReducedMotion()) gsap.set(dial.current, { rotation: rot.current, svgOrigin: `${C} ${C}` });
    else gsap.to(dial.current, { rotation: rot.current, svgOrigin: `${C} ${C}`, duration: 0.9, ease: "elastic.out(1, 0.7)" });
  };

  // seret memutar dial
  const drag = useRef(null);
  const angleAt = (e) => {
    const r = dial.current.ownerSVGElement.getBoundingClientRect();
    return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI;
  };
  const onDown = (e) => {
    if (e.target.closest("[data-arc]")) return;
    drag.current = { a: angleAt(e), r: rot.current, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e) => {
    if (!drag.current) return;
    let d = angleAt(e) - drag.current.a;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    if (Math.abs(d) > 2) drag.current.moved = true;
    rot.current = drag.current.r + d;
    gsap.set(dial.current, { svgOrigin: `${C} ${C}` });
    spin.current?.(rot.current);
  };
  const onUp = () => {
    if (!drag.current) return;
    const moved = drag.current.moved;
    drag.current = null;
    if (!moved) return;
    const m = Math.round((-rot.current - 15) / 30);
    goMonth(m);
  };

  const rings = useMemo(() => items.map((s, i) => ({ ...s, r: R0 - i * GAP })), [items]);
  const nowPos = now ? now.getMonth() + (now.getDate() - 1) / new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() : null;
  const hovered = rings.find((s) => s.slug === hover);
  const openIn = month == null ? [] : rings.filter((s) => s.windows.some((w) => inMonth(w, month)));
  const sorted = [...items].filter((s) => s.window).sort((a, b) => (a.window.state === "buka" ? a.window.close : a.window.open) - (b.window.state === "buka" ? b.window.close : b.window.open));

  return (
    <section id="jadwal" className="relative scroll-mt-24 overflow-hidden bg-navy py-20 text-white md:py-28">
      <Container>
        <SectionHeader tone="dark" title={["Setahun penuh", "jendela", "pendaftaran"]} body="Tiap cincin satu beasiswa. Putar dial ke bulan yang kamu incar, atau sentuh busurnya untuk melihat tanggal dan sisa harinya." />
        <BeasiswaBanner className="mt-8" />

        {/* dial — layar lebar */}
        <div className="mt-14 hidden items-center gap-12 md:grid md:grid-cols-[minmax(0,560px)_1fr] lg:gap-20">
          <div className="relative">
            <svg
              viewBox="0 0 440 440"
              className="bs-dial h-auto w-full touch-none select-none"
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              role="group"
              aria-label="Dial jendela pendaftaran beasiswa"
            >
              {/* penanda bulan pilihan */}
              <path d={`M${C - 9} 4h18l-9 12z`} fill="var(--gold)" />
              <g ref={dial}>
                {MONTHS.map((m, i) => {
                  const [x, y] = polar(206, i + 0.5);
                  const [x1, y1] = polar(R0 + 8, i);
                  const [x2, y2] = polar(R0 - (items.length - 1) * GAP - 8, i);
                  return (
                    <g key={m}>
                      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeOpacity="0.08" />
                      <text
                        x={x}
                        y={y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={`rotate(${(i + 0.5) * 30 + (Math.abs(((((i - (month ?? 0)) * 30) % 360) + 540) % 360 - 180) > 90 ? 180 : 0)} ${x} ${y})`}
                        className={cn("bs-dial-month", month === i && "bs-dial-month-on")}
                      >
                        {m}
                      </text>
                    </g>
                  );
                })}
                {rings.map((s) => (
                  <g key={s.slug}>
                    <circle cx={C} cy={C} r={s.r} fill="none" stroke="white" strokeOpacity="0.07" strokeWidth="8" />
                    {s.windows.map((w, k) => {
                      const st = stateOf(w, now);
                      return (
                        <path
                          key={k}
                          data-arc
                          tabIndex={0}
                          role="button"
                          aria-label={`${s.name}: ${w.open} sampai ${w.close}, ${st === "buka" ? "sedang buka" : "belum buka"}`}
                          d={arc(s.r, monthPos(w.open), monthPos(w.close) + 1 / 31)}
                          className={cn("bs-arc", `bs-arc-${st}`, hover && hover !== s.slug && "bs-arc-dim", hover === s.slug && "bs-arc-on")}
                          onPointerEnter={() => setHover(s.slug)}
                          onPointerLeave={() => setHover(null)}
                          onFocus={() => setHover(s.slug)}
                          onBlur={() => setHover(null)}
                          onClick={() => open(s.slug)}
                          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), open(s.slug))}
                        />
                      );
                    })}
                  </g>
                ))}
                {nowPos != null && (
                  <g className="bs-needle">
                    <line x1={polar(R0 + 10, nowPos)[0]} y1={polar(R0 + 10, nowPos)[1]} x2={polar(R0 - (items.length - 1) * GAP - 10, nowPos)[0]} y2={polar(R0 - (items.length - 1) * GAP - 10, nowPos)[1]} stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" />
                    <circle cx={polar(R0 + 12, nowPos)[0]} cy={polar(R0 + 12, nowPos)[1]} r="4" fill="var(--gold)" />
                  </g>
                )}
              </g>
            </svg>

            {/* pusat dial (tidak ikut berputar) */}
            <div aria-live="polite" className="pointer-events-none absolute inset-[29%] grid place-items-center text-center">
              {hovered ? (
                <div>
                  <span className="kicker block text-[10px] text-gold-soft">{hovered.org}</span>
                  <p className="mt-1 font-serif text-[1.15rem] leading-tight">{hovered.name}</p>
                  {hovered.window && (
                    <>
                      <p className="mt-2 font-serif text-[2.4rem] leading-none text-gold-soft">
                        <RollDays value={hovered.window.days} />
                      </p>
                      <p className="mt-1 text-[11.5px] text-white/60">hari lagi {hovered.window.state === "buka" ? "ditutup" : "dibuka"}</p>
                      <p className="mt-2 text-[11.5px] text-white/50">
                        {fmtDate(hovered.window.open)} – {fmtDate(hovered.window.close)}
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div>
                  <span className="kicker block text-[10px] text-gold-soft">{month != null ? MONTHS_LONG[month] : "Memuat"}</span>
                  <p className="mt-1 font-serif text-[2.2rem] leading-none">{openIn.length}</p>
                  <p className="mt-1 text-[12px] text-white/60">jendela terbuka</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3">
              <button type="button" aria-label="Bulan sebelumnya" onClick={() => goMonth((month ?? 0) - 1)} className="bs-dial-btn">
                <svg aria-hidden viewBox="0 0 16 16" className="size-4"><path d="M10 3L5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <p className="min-w-[9ch] text-center font-serif text-[1.6rem]">{month != null ? MONTHS_LONG[month] : "—"}</p>
              <button type="button" aria-label="Bulan berikutnya" onClick={() => goMonth((month ?? 0) + 1)} className="bs-dial-btn">
                <svg aria-hidden viewBox="0 0 16 16" className="size-4"><path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
            <ul className="mt-6 border-b border-white/15">
              {rings.map((s, i) => {
                const active = openIn.some((x) => x.slug === s.slug);
                return (
                  <li key={s.slug} className="border-t border-white/15">
                    <button
                      type="button"
                      onClick={() => open(s.slug)}
                      onPointerEnter={() => setHover(s.slug)}
                      onPointerLeave={() => setHover(null)}
                      onFocus={() => setHover(s.slug)}
                      onBlur={() => setHover(null)}
                      className={cn("group flex w-full items-center gap-4 py-3 text-left transition-opacity duration-300", !active && "opacity-45 hover:opacity-100")}
                    >
                      <span aria-hidden className="tabular w-5 text-[11px] text-white/40">{String(i + 1).padStart(2, "0")}</span>
                      <span className="min-w-0 flex-1 truncate text-[15px]">{s.name}</span>
                      <span className="shrink-0 text-[12px] text-white/55">{s.windows.map((w) => (w.open.slice(0, 2) === w.close.slice(0, 2) ? MONTHS[w.open.slice(0, 2) - 1] : `${MONTHS[w.open.slice(0, 2) - 1]}–${MONTHS[w.close.slice(0, 2) - 1]}`)).join(" · ")}</span>
                      {s.window?.state === "buka" && <span className="bs-live" aria-label="sedang buka" />}
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 text-[12px] text-white/45">Seret dial untuk memutarnya. Garis emas menunjuk hari ini.</p>
          </div>
        </div>

        {/* ponsel — daftar urut tenggat */}
        <ul className="mt-10 grid gap-3 md:hidden">
          {sorted.map((s) => (
            <li key={s.slug}>
              <button type="button" onClick={() => open(s.slug)} className="block w-full rounded-lg border border-white/12 bg-white/[0.04] p-4 text-left">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="font-serif text-[1.1rem] leading-tight">{s.name}</span>
                  <span className="tabular shrink-0 text-[12px] text-gold-soft">
                    {s.window.state === "buka" ? `tutup ${s.window.days} hr` : `buka ${s.window.days} hr`}
                  </span>
                </span>
                <span aria-hidden className="mt-3 grid grid-cols-12 gap-0.5">
                  {MONTHS.map((m, i) => (
                    <span key={m} className={cn("h-1.5 rounded-sm", s.windows.some((w) => inMonth(w, i)) ? "bg-gold" : "bg-white/10")} />
                  ))}
                </span>
                <span className="mt-2 block text-[11.5px] text-white/55">
                  {fmtDate(s.window.open)} – {fmtDate(s.window.close)} · {s.window.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
