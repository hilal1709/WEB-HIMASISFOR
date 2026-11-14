"use client";
import { useEffect, useLayoutEffect, useRef } from "react";
import { animate, stagger, svg } from "animejs";
import { prefersReducedMotion } from "@/lib/motion";
import { HorizonIllustration } from "@/components/illustrations/line-illustrations";
import { cn } from "@/lib/utils";
import { Href, Line, Mini, Panel, PosePicker, Toggle } from "../fields";

/* ───────────── Tirai ───────────── */
export function CurtainScene({ value: c, set }) {
  const box = useRef(null);
  const play = () => {
    const el = box.current;
    if (!el || prefersReducedMotion()) return;
    animate(el.querySelector("[data-l]"), { scaleX: [0, 1], duration: 900, ease: "inOutQuart" });
    animate(el.querySelectorAll("[data-w]"), { opacity: [0, 1], translateY: [14, 0], duration: 600, delay: stagger(120, { start: 150 }), ease: "outCubic" });
    animate(el, { clipPath: ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)"], duration: 850, ease: "inOutExpo" });
  };
  useEffect(play, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <div>
        <div ref={box} className={cn("relative grid aspect-[16/10] place-items-center overflow-hidden rounded-xl bg-maroon text-white transition-opacity", !c.enabled && "opacity-40 grayscale")}>
          <div className="text-center">
            <p data-w className="kicker text-gold-soft">Program Studi Sistem Informasi</p>
            <p data-w className="mt-3 font-serif text-[clamp(1.6rem,3.4vw,2.4rem)] leading-none">
              {c.title} {c.accent && <em className="italic text-gold-soft">{c.accent}</em>}
            </p>
            <span data-l className="mx-auto mt-5 block h-[2px] w-32 origin-left bg-gold" />
          </div>
          {!c.enabled && <span className="absolute bottom-3 rounded-full bg-black/30 px-3 py-1 text-[12px]">Tirai dimatikan</span>}
        </div>
        <button type="button" onClick={play} className="mt-3 text-[13px] font-medium text-maroon underline decoration-gold underline-offset-4">
          Putar ulang tirai
        </button>
      </div>
      <Panel title="Layar pembuka">
        <Toggle checked={c.enabled} onChange={(v) => set("curtain.enabled", v)} label="Tampilkan tirai" hint="Muncul sekali per sesi kunjungan, lalu terangkat." />
        <div className="grid gap-5 sm:grid-cols-2">
          <Line path="curtain.title" label="Judul" value={c.title} max={40} onChange={(v) => set("curtain.title", v)} />
          <Line path="curtain.accent" label="Aksen miring" value={c.accent} max={40} onChange={(v) => set("curtain.accent", v)} />
        </div>
        <Line path="curtain.label" label="Label pembaca layar" value={c.label} max={60} onChange={(v) => set("curtain.label", v)} hint="Dibacakan untuk pengguna pembaca layar selama tirai tampil." />
      </Panel>
    </div>
  );
}

/* ───────────── Cakrawala (hero) ───────────── */
function YearDial({ label, value, onChange }) {
  const num = useRef(null);
  const prev = useRef(value);
  useEffect(() => {
    const from = prev.current;
    prev.current = value;
    if (from === value || prefersReducedMotion() || !num.current) return;
    const st = { v: from };
    const a = animate(st, { v: value, duration: 600, ease: "outExpo", onUpdate: () => num.current && (num.current.textContent = Math.round(st.v)) });
    return () => a.pause();
  }, [value]);
  return (
    <div className="flex flex-col items-center">
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-navy/50">{label}</span>
      <div className="mt-1 flex items-center gap-2">
        <Mini label={`${label} −1`} onClick={() => onChange(value - 1)}>−</Mini>
        <span ref={num} className="w-[4.5ch] text-center font-serif text-[2.4rem] leading-none tabular-nums text-navy">{value}</span>
        <Mini label={`${label} +1`} onClick={() => onChange(value + 1)}>+</Mini>
      </div>
    </div>
  );
}

export function HeroScene({ value: h, set, flags }) {
  const canvas = useRef(null);
  useLayoutEffect(() => {
    if (prefersReducedMotion() || !canvas.current) return;
    const a = animate(svg.createDrawable(canvas.current.querySelectorAll("[data-line]")), { draw: ["0 0", "0 1"], duration: 1400, delay: stagger(40), ease: "inOutCubic" });
    return () => a.revert?.();
  }, []);
  const crumbs = h.breadcrumb ?? [];
  const setCrumb = (i, k, v) => set("hero.breadcrumb", crumbs.map((c, j) => (j === i ? { ...c, [k]: v } : c)));

  return (
    <div className="space-y-6">
      {/* kanvas: judul diketik langsung di atas cakrawala */}
      <div ref={canvas} className="relative overflow-hidden rounded-2xl bg-white px-5 pb-0 pt-8 ring-1 ring-navy/[0.07] sm:px-10">
        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <Line path="hero.kicker" value={h.kicker} max={80} onChange={(v) => set("hero.kicker", v)} placeholder="Kicker" size="sm" inputClassName="text-center font-semibold uppercase tracking-[0.18em] text-maroon" />
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Line path="hero.titleTop" value={h.titleTop} max={60} onChange={(v) => set("hero.titleTop", v)} size="lg" inputClassName="text-center sm:text-right" placeholder="Judul" />
            <Line path="hero.titleAccent" value={h.titleAccent} max={60} onChange={(v) => set("hero.titleAccent", v)} size="lg" inputClassName="text-center italic text-maroon sm:text-left" placeholder="Aksen" />
          </div>
          <Line path="hero.subtitle" value={h.subtitle} max={280} multiline rows={2} flag={flags("hero.subtitle")} onChange={(v) => set("hero.subtitle", v)} className="mt-4" inputClassName="text-center text-text/70" placeholder="Subjudul" />
          <div className="mt-5 inline-flex rounded-md bg-maroon px-5 py-2.5">
            <input
              aria-label="Label tombol ajakan"
              id="kompas-hero-ctaLabel"
              value={h.ctaLabel ?? ""}
              maxLength={40}
              onChange={(e) => set("hero.ctaLabel", e.target.value)}
              placeholder="Label tombol (kosong = disembunyikan)"
              className="w-[min(18rem,60vw)] bg-transparent text-center text-[14.5px] font-semibold text-white outline-none placeholder:text-white/50"
            />
          </div>
        </div>
        <div className={cn("relative mx-auto mt-4 max-w-xl text-navy transition-opacity duration-500", !h.showHorizon && "opacity-15")}>
          <HorizonIllustration className="h-auto w-full text-navy" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Hitungan tahun" aside={<span className="text-[12px] text-text/45">angka besar di latar judul</span>}>
          <div className="flex flex-wrap items-center justify-around gap-6">
            <YearDial label="Dari" value={h.yearFrom} onChange={(v) => set("hero.yearFrom", Math.max(1900, Math.min(v, h.yearTo)))} />
            <span aria-hidden className="h-px w-10 bg-gold" />
            <YearDial label="Menuju" value={h.yearTo} onChange={(v) => set("hero.yearTo", Math.min(2100, Math.max(v, h.yearFrom)))} />
          </div>
          <Toggle checked={h.showHorizon} onChange={(v) => set("hero.showHorizon", v)} label="Tampilkan lanskap cakrawala" hint="Ilustrasi garis yang tergambar saat halaman dibuka." />
        </Panel>
        <Panel title="Elvo di cakrawala">
          <PosePicker path="hero.mascot" value={h.mascot} onChange={(v) => set("hero.mascot", v)} />
        </Panel>
      </div>

      <Panel title="Jejak breadcrumb" aside={<span className="text-[12px] text-text/45">item terakhir = halaman ini</span>}>
        <ol className="flex flex-wrap items-end gap-3">
          {crumbs.map((c, i) => (
            <li key={i} className="flex items-end gap-2 animate-in fade-in-0">
              {i > 0 && <span className="pb-3 text-navy/30">/</span>}
              <div className="w-40 space-y-2 rounded-lg bg-cream/60 p-3">
                <Line path={`hero.breadcrumb.${i}.label`} value={c.label} max={60} size="sm" onChange={(v) => setCrumb(i, "label", v)} placeholder="Label" />
                {i < crumbs.length - 1 && <Href path={`hero.breadcrumb.${i}.href`} label="" value={c.href} onChange={(v) => setCrumb(i, "href", v)} />}
                <Mini danger label="Hapus jejak" onClick={() => set("hero.breadcrumb", crumbs.filter((_, j) => j !== i))} className="size-6 text-[11px]">
                  ×
                </Mini>
              </div>
            </li>
          ))}
          {crumbs.length < 5 && (
            <li>
              <button type="button" onClick={() => set("hero.breadcrumb", [...crumbs.slice(0, -1), { label: "", href: "" }, ...crumbs.slice(-1)])} className="mb-3 rounded-full px-3 py-1.5 text-[13px] text-maroon ring-1 ring-dashed ring-maroon/30 hover:bg-maroon/5">
                + Sisipkan jejak
              </button>
            </li>
          )}
        </ol>
      </Panel>
    </div>
  );
}

/* ───────────── Meta (SEO) ───────────── */
function Meter({ len, ideal, max }) {
  const pct = Math.min(1, len / max);
  const tone = len === 0 ? "bg-navy/15" : len <= ideal ? "bg-emerald-500" : len <= max ? "bg-gold" : "bg-[#e86a7c]";
  return (
    <span className="mt-2 block h-1 overflow-hidden rounded-full bg-navy/[0.07]">
      <span className={cn("block h-full rounded-full transition-[width,background-color] duration-500 ease-cinematic", tone)} style={{ width: `${pct * 100}%` }} />
    </span>
  );
}

export function SeoScene({ value: s, set, flags }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <Panel title="Judul & deskripsi">
        <div>
          <Line path="seo.title" label="Judul tab & hasil pencarian" value={s.title} max={90} onChange={(v) => set("seo.title", v)} />
          <Meter len={s.title?.length ?? 0} ideal={60} max={90} />
        </div>
        <div>
          <Line path="seo.description" label="Deskripsi" value={s.description} max={200} multiline rows={3} flag={flags("seo.description")} onChange={(v) => set("seo.description", v)} />
          <Meter len={s.description?.length ?? 0} ideal={160} max={200} />
        </div>
        <p className="text-[12px] text-text/45">Hijau = pas, emas = mungkin terpotong, merah = terlalu panjang.</p>
      </Panel>
      <div className="rounded-2xl bg-white p-6 ring-1 ring-navy/[0.07]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-navy/45">Perkiraan di mesin pencari</p>
        <div className="mt-5 max-w-[600px] font-sans">
          <p className="text-[12.5px] text-[#4d5156]">sisfor.uisi.ac.id › visi-misi</p>
          <p className="mt-1 line-clamp-1 text-[20px] leading-snug text-[#1a0dab]">{s.title || "(judul kosong)"}</p>
          <p className="mt-1 line-clamp-2 text-[14px] leading-relaxed text-[#4d5156]">{s.description || "(deskripsi kosong)"}</p>
        </div>
      </div>
    </div>
  );
}
