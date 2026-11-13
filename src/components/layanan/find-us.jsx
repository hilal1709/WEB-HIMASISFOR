"use client";
import { useLayoutEffect as useEffect, useRef, useState } from "react";
import { animate, stagger, svg } from "animejs";
import { AnimatePresence, motion } from "motion/react";
import { prefersReducedMotion } from "@/lib/motion";
import { DAYS, fmtTime } from "@/lib/layanan-content";
import { Container, PlaceholderTag, SectionHeader } from "@/components/home/shared";
import { FloorPlanIllustration, FLOOR_ROOMS, isoPoint } from "@/components/illustrations/line-illustrations";
import { LordIcon } from "@/components/media/lord-icon";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { useLayanan } from "./layanan-provider";

const ORDER = [1, 2, 3, 4, 5, 6, 0];
const SPAN = [7, 17]; // jam yang ditampilkan di bilah
const toH = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h + m / 60;
};
const pct = (h) => `${((Math.min(Math.max(h, SPAN[0]), SPAN[1]) - SPAN[0]) / (SPAN[1] - SPAN[0])) * 100}%`;

function CopyChannel({ label, value, display, href }) {
  const toast = useToast();
  const [done, setDone] = useState(false);
  const empty = !value;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setDone(true);
      toast.success(`${label} disalin`);
      setTimeout(() => setDone(false), 2000);
    } catch {
      toast.warning("Tidak bisa menyalin otomatis");
    }
  };
  return (
    <li className="flex items-center gap-3 border-t border-line py-4 first:border-t-0">
      <div className="min-w-0 flex-1">
        <p className="kicker text-[10.5px] text-maroon">{label}</p>
        {empty ? (
          <p className="mt-1 text-[15px] text-text/45">Menyusul</p>
        ) : (
          <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="mt-1 block truncate text-[15px] font-semibold text-navy">
            <span className="u-gold">{display ?? value}</span>
          </a>
        )}
      </div>
      <button
        type="button"
        onClick={copy}
        disabled={empty}
        aria-label={`Salin ${label.toLowerCase()}`}
        className="relative grid size-10 shrink-0 place-items-center rounded-md border border-line text-navy transition-[background-color,border-color] duration-300 hover:border-navy/30 hover:bg-cream disabled:opacity-35"
      >
        <AnimatePresence mode="wait" initial={false}>
          {done ? (
            <motion.span key="ok" initial={{ scale: 0.3, rotate: -40, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} exit={{ scale: 0.3, opacity: 0 }}>
              <LordIcon name="check" size={22} trigger="once" colors="primary:#14213d,secondary:#c9a227" />
            </motion.span>
          ) : (
            <motion.svg key="copy" viewBox="0 0 16 16" className="size-4" initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.3, opacity: 0 }}>
              <rect x="5" y="5" width="8.5" height="8.5" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
              <path d="M10.5 3H4a1.5 1.5 0 0 0-1.5 1.5V11" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </motion.svg>
          )}
        </AnimatePresence>
      </button>
    </li>
  );
}

/**
 * "Temukan kami": denah lantai isometrik (ruang menyala saat di-hover/fokus, label melayang di atas ruang, pin loket
 * berdenyut) + jadwal per hari dengan bilah jam buka (hari ini disorot, garis emas = sekarang) + kanal kontak yang
 * bisa disalin.
 */
export function FindUs() {
  const { rooms, hours, hoursSample, contact, now } = useLayanan();
  const [room, setRoom] = useState("sekretariat");
  const plan = useRef(null);
  const active = rooms.find((r) => r.key === room) ?? rooms[0];

  useEffect(() => {
    const el = plan.current;
    if (!el || prefersReducedMotion()) return;
    const lines = el.querySelectorAll("[data-line]");
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        animate(svg.createDrawable(lines), { draw: ["0 0", "0 1"], duration: 1000, delay: stagger(20), ease: "inOutCubic" });
        io.disconnect();
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const label = (() => {
    const r = FLOOR_ROOMS[room];
    if (!r) return null;
    const [x, y] = isoPoint(r[0] + r[2] / 2, r[1] + r[3] / 2);
    return { left: `${(x / 590) * 100}%`, top: `${(y / 400) * 100}%` };
  })();

  const nowH = now ? now.getHours() + now.getMinutes() / 60 : null;
  const wa = contact.whatsapp.replace(/^0/, "62").replace(/^\+/, "");

  return (
    <section id="lokasi" className="scroll-mt-24 bg-white py-16 md:py-24">
      <Container>
        <SectionHeader title={["Datang ke loket,", "tanpa tersesat"]} body={`${contact.room} · ${contact.building}`} action={contact.sample && <PlaceholderTag />} />

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          {/* denah */}
          <div>
            <div ref={plan} className="relative rounded-2xl border border-line bg-cream p-4 sm:p-8" onPointerLeave={() => setRoom("sekretariat")}>
              <div className="relative">
              <FloorPlanIllustration active={room} onRoom={setRoom} className="floorplan h-auto w-full text-navy" />
              <AnimatePresence>
                {label && (
                  <motion.span
                    key={room}
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.25 }}
                    className="pointer-events-none absolute -translate-x-1/2 translate-y-2 whitespace-nowrap rounded-md bg-navy px-2.5 py-1 text-[12px] font-semibold text-white shadow-lg"
                    style={{ left: label.left, top: label.top }}
                  >
                    {active.label}
                  </motion.span>
                )}
              </AnimatePresence>
              </div>
            </div>
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Ruang di denah">
              {rooms.map((r) => (
                <li key={r.key}>
                  <button
                    type="button"
                    onClick={() => setRoom(r.key)}
                    onFocus={() => setRoom(r.key)}
                    aria-pressed={room === r.key}
                    className={cn(
                      "rounded-md border px-3 py-1.5 text-[13px] font-medium transition-[background-color,border-color,color] duration-300",
                      room === r.key ? "border-navy bg-navy text-white" : "border-line bg-white text-navy hover:border-navy/30"
                    )}
                  >
                    {r.label}
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-3 min-h-[1.5rem] text-[14px] text-text/65" aria-live="polite">
              <strong className="font-semibold text-navy">{active.label}</strong> · {active.note}
              {active.href && (
                <>
                  {" · "}
                  <a href={active.href} className="font-semibold text-maroon">
                    <span className="u-gold">lihat</span>
                  </a>
                </>
              )}
            </p>
          </div>

          {/* jam + kontak */}
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-[1.5rem] text-navy">Jam loket</h3>
              {hoursSample && <PlaceholderTag />}
            </div>
            <ul className="mt-4 divide-y divide-line rounded-xl border border-line">
              {ORDER.map((d) => {
                const h = hours.find((x) => x.day === d);
                const today = now?.getDay() === d;
                return (
                  <li key={d} className={cn("relative grid grid-cols-[5.5rem_1fr] items-center gap-3 px-4 py-3 text-[14px]", today && "bg-cream")}>
                    {today && <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-gold" />}
                    <span className={cn("font-semibold", today ? "text-navy" : "text-text/70")}>
                      {DAYS[d]}
                      {today && <span className="block text-[11px] font-medium text-maroon">Hari ini</span>}
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className={cn("tabular", h ? "text-navy" : "text-text/40")}>{h ? `${fmtTime(h.open)}–${fmtTime(h.close)}` : "Tutup"}</span>
                        {h?.rest && <span className="tabular text-[12px] text-text/45">rehat {fmtTime(h.rest[0])}–{fmtTime(h.rest[1])}</span>}
                      </span>
                      <span aria-hidden className="relative mt-1.5 block h-1.5 rounded-full bg-cream-2">
                        {h && (
                          <>
                            <span className="absolute inset-y-0 rounded-full bg-navy/70" style={{ left: pct(toH(h.open)), right: `calc(100% - ${pct(toH(h.close))})` }} />
                            {h.rest && <span className="absolute inset-y-0 bg-cream-2" style={{ left: pct(toH(h.rest[0])), right: `calc(100% - ${pct(toH(h.rest[1])) })` }} />}
                          </>
                        )}
                        {today && nowH != null && nowH >= SPAN[0] && nowH <= SPAN[1] && (
                          <span className="absolute -top-1 h-3.5 w-0.5 rounded bg-gold" style={{ left: pct(nowH) }} />
                        )}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>

            <ul className="mt-8 rounded-xl border border-line px-4">
              <CopyChannel label="Email sekretariat" value={contact.email} href={`mailto:${contact.email}`} />
              <CopyChannel label="WhatsApp layanan" value={contact.whatsapp} display={contact.whatsapp} href={`https://wa.me/${wa}`} />
            </ul>
            {(!contact.email || !contact.whatsapp) && (
              <p className="mt-3 text-[12.5px] text-text/50">Kanal resmi diumumkan prodi. Sementara itu, ajukan lewat formulir di halaman ini.</p>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
