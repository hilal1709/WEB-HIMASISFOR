"use client";
import { useEffect, useMemo, useState } from "react";
import { CHANNELS, NEEDS_KEY, estimateReady, fmtDate, serviceByKey } from "@/lib/layanan-content";
import { ModalDescription, ModalTitle } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { PlaceholderTag } from "@/components/home/shared";
import { cn } from "@/lib/utils";
import { ResponsiveDialog } from "./responsive-dialog";
import { useLayanan } from "./layanan-provider";

const readNeeds = () => {
  try {
    return JSON.parse(localStorage.getItem(NEEDS_KEY) ?? "{}") ?? {};
  } catch {
    return {};
  }
};

function Check({ on }) {
  return (
    <svg aria-hidden viewBox="0 0 20 20" className="size-5 shrink-0">
      <rect x="1.5" y="1.5" width="17" height="17" rx="4" className={cn("transition-[fill,stroke] duration-300", on ? "fill-navy stroke-navy" : "fill-white stroke-navy/30")} strokeWidth="1.5" />
      <path d="M5.5 10.5l3 3 6-7" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" pathLength="1" strokeDasharray="1" strokeDashoffset={on ? 0 : 1} className="transition-[stroke-dashoffset] duration-500 ease-cinematic" />
    </svg>
  );
}

/**
 * Modal detail layanan: kepala maroon (Lottie kategori), fakta ringkas, perkiraan "siap paling cepat", syarat yang
 * bisa dicentang (diingat per layanan), langkah bernomor, rujukan halaman terkait. ‹ › + panah kiri/kanan
 * berpindah layanan dalam urutan papan. Lembar bawah di ponsel.
 */
export function ServiceModal() {
  const { services, categories, serviceKey, openService, openWizard, now, hours } = useLayanan();
  const s = serviceByKey(serviceKey, services);
  const [needs, setNeeds] = useState({});
  useEffect(() => setNeeds(readNeeds()), [serviceKey]);

  const idx = s ? services.findIndex((x) => x.key === s.key) : -1;
  const go = (d) => openService(services[(idx + d + services.length) % services.length].key);

  useEffect(() => {
    if (!s) return;
    const onKey = (e) => {
      if (e.target.closest?.("input, textarea, select")) return;
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const ready = useMemo(() => (s && now ? estimateReady(s.sla, now, hours) : null), [s, now, hours]);
  if (!s) return <ResponsiveDialog open={false} onOpenChange={() => {}} />;

  const cat = categories.find((c) => c.key === s.category);
  const checked = needs[s.key] ?? [];
  const toggle = (i) => {
    const next = { ...needs, [s.key]: checked.includes(i) ? checked.filter((x) => x !== i) : [...checked, i] };
    setNeeds(next);
    try {
      localStorage.setItem(NEEDS_KEY, JSON.stringify(next));
    } catch {}
  };
  const dark = cat?.lottie?.endsWith("-dark.json");

  return (
    <ResponsiveDialog open={!!s} onOpenChange={(o) => !o && openService(null)} className="max-w-2xl">
      <div key={s.key} className="animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
        <header className="relative flex items-center gap-5 bg-maroon px-6 pb-6 pt-8 text-white sm:px-8">
          <span className={cn("grid size-20 shrink-0 place-items-center rounded-xl", dark ? "bg-maroon-deep" : "bg-white")}>
            <LottieIllustration src={cat?.lottie} label={`Ilustrasi ${cat?.label}`} className="size-16" />
          </span>
          <div className="min-w-0 pr-6">
            <p className="kicker text-[11px] text-gold-soft">{cat?.label}</p>
            <ModalTitle className="mt-1 !text-[1.55rem] !leading-tight text-white">{s.title}</ModalTitle>
          </div>
        </header>

        <div className="px-6 pb-6 pt-6 sm:px-8">
          <ModalDescription className="!text-[15px]">{s.lead}</ModalDescription>

          <dl className="mt-5 grid grid-cols-3 divide-x divide-line rounded-lg border border-line text-center">
            {[
              ["Estimasi", `${s.sla} hari kerja`],
              ["Kanal", CHANNELS[s.channel]],
              ["Hasil", s.output],
            ].map(([k, v]) => (
              <div key={k} className="px-2 py-3">
                <dt className="text-[11px] text-text/50">{k}</dt>
                <dd className="mt-0.5 text-[13px] font-semibold leading-snug text-navy">{v}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-4 flex items-center gap-2 rounded-md bg-cream px-3 py-2.5 text-[13.5px] text-navy">
            <span aria-hidden className="size-2 rounded-full bg-gold" />
            {ready ? (
              <span>
                Kalau diajukan sekarang, siap paling cepat <strong className="font-semibold">{fmtDate(ready)}</strong>.
              </span>
            ) : (
              <span className="h-4 w-56 animate-shimmer rounded bg-cream-2" />
            )}
          </p>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="kicker text-[11px] text-maroon">Siapkan dulu</h3>
              <ul className="mt-3 space-y-2">
                {s.needs.map((n, i) => (
                  <li key={n}>
                    <button type="button" onClick={() => toggle(i)} aria-pressed={checked.includes(i)} className="flex w-full items-start gap-2.5 rounded-md p-1.5 text-left text-[14px] text-text/80 transition-colors hover:bg-cream">
                      <Check on={checked.includes(i)} />
                      <span className={cn("transition-colors", checked.includes(i) && "text-text/50 line-through decoration-gold/70")}>{n}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <p className="mt-2 pl-1.5 text-[12px] text-text/50">
                {checked.length}/{s.needs.length} siap · centang hanya tersimpan di perangkat ini
              </p>
            </div>
            <div>
              <h3 className="kicker text-[11px] text-maroon">Alurnya</h3>
              <ol className="relative mt-3 space-y-3 before:absolute before:bottom-2 before:left-[11px] before:top-2 before:w-px before:bg-navy/15">
                {s.steps.map((st, i) => (
                  <li key={st} className="relative flex gap-3 text-[14px] text-text/80">
                    <span className="tabular relative z-10 grid size-6 shrink-0 place-items-center rounded-full border border-navy/15 bg-white text-[11px] font-bold text-navy">{i + 1}</span>
                    <span className="pt-0.5">{st}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {s.related && (
            <a href={s.related.href} className="group mt-6 inline-flex items-center gap-2 text-[14px] font-semibold text-maroon">
              <span className="u-gold">{s.related.label}</span>
              <svg aria-hidden viewBox="0 0 16 16" className="size-4 transition-transform duration-300 group-hover:translate-x-0.5">
                <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          )}
          {s.sample && <PlaceholderTag className="mt-4 flex w-fit" />}
        </div>

        <footer className="sticky bottom-0 flex items-center gap-3 border-t border-line bg-white px-6 py-4 sm:px-8">
          <div className="flex items-center gap-1">
            {[
              [-1, "Layanan sebelumnya", "M10 4L6 8l4 4"],
              [1, "Layanan berikutnya", "M6 4l4 4-4 4"],
            ].map(([d, label, p]) => (
              <button key={d} type="button" onClick={() => go(d)} aria-label={label} className="grid size-10 place-items-center rounded-md border border-line text-navy transition-colors hover:border-navy/30 hover:bg-cream">
                <svg aria-hidden viewBox="0 0 16 16" className="size-4">
                  <path d={p} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ))}
            <span className="tabular ml-2 hidden text-[12.5px] text-text/50 sm:inline">
              {idx + 1} / {services.length}
            </span>
          </div>
          <Button variant="maroon" className="ml-auto h-11 px-5" onClick={() => openWizard({ serviceKey: s.key })}>
            Ajukan sekarang
          </Button>
        </footer>
      </div>
    </ResponsiveDialog>
  );
}
