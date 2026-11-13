"use client";
import { useLayoutEffect as useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { STATUSES, fmtDate, fmtStamp, statusOf } from "@/lib/layanan-content";
import { Container, SceneTitle } from "@/components/home/shared";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { DotsLoader, Skeleton } from "@/components/ui/loader";
import { useToast } from "@/components/ui/toast";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { cn } from "@/lib/utils";
import { CodeInput, charsToCode, codeToChars } from "./code-input";
import { useLayanan } from "./layanan-provider";

function Timeline({ data }) {
  const ref = useRef(null);
  const flagged = ["perlu-perbaikan", "ditolak"].includes(data.status);
  const reached = Math.max(0, STATUSES.findIndex((s) => s.key === data.status));
  const lastNormal = flagged
    ? Math.max(0, ...data.events.map((e) => STATUSES.findIndex((s) => s.key === e.status)).filter((i) => i >= 0))
    : reached;
  const eventFor = (key) => [...data.events].reverse().find((e) => e.status === key);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fill = el.querySelector("[data-fill]");
    const pct = STATUSES.length > 1 ? (lastNormal / (STATUSES.length - 1)) * 100 : 0;
    if (prefersReducedMotion()) {
      gsap.set(fill, { height: `${pct}%` });
      return;
    }
    gsap.fromTo(fill, { height: "0%" }, { height: `${pct}%`, duration: 1.2, ease: "power3.inOut", delay: 0.2 });
    gsap.from(el.querySelectorAll("[data-step]"), { x: -12, opacity: 0, duration: 0.5, stagger: 0.08, ease: "expo.out" });
  }, [data, lastNormal]);

  return (
    <ol ref={ref} className="relative mt-6 space-y-6 pl-1">
      <span aria-hidden className="absolute bottom-3 left-[13px] top-3 w-0.5 rounded bg-white/10">
        <span data-fill className="absolute inset-x-0 top-0 rounded bg-gold" />
      </span>
      {STATUSES.map((s, i) => {
        const ev = eventFor(s.key);
        const done = i < lastNormal || (i === lastNormal && (flagged || data.status === "selesai"));
        const now = i === lastNormal && !flagged && data.status !== "selesai";
        return (
          <li key={s.key} data-step className="relative flex gap-4">
            <span
              className={cn(
                "relative z-10 grid size-7 shrink-0 place-items-center rounded-full border-2 text-[11px] font-bold",
                done ? "border-gold bg-gold text-navy" : now ? "la-step-now border-gold bg-navy text-gold" : "border-white/20 bg-navy text-white/40"
              )}
            >
              {done ? (
                <svg aria-hidden viewBox="0 0 16 16" className="size-3.5">
                  <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                i + 1
              )}
            </span>
            <div className={cn("min-w-0 pb-0.5", !done && !now && "opacity-50")}>
              <p className="flex flex-wrap items-baseline gap-x-3 font-semibold text-white">
                {s.label}
                {ev && <span className="text-[12px] font-normal text-white/50">{fmtStamp(ev.at)}</span>}
              </p>
              <p className="mt-0.5 text-[13.5px] text-white/60">{ev?.note && s.key !== "diterima" ? ev.note : s.desc}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Pelacak pengajuan bergaya pelacakan kiriman (papan navy): kode per karakter + NIM → POST /api/layanan/lacak.
 * Chip "di perangkat ini" mengisi cepat. Hasil: kartu status + linimasa (garis emas tumbuh, langkah aktif berdenyut).
 * Status perlu perbaikan / ditolak → Banner catatan staf + "Ajukan ulang" (wizard terisi isian lama).
 */
export function Tracker() {
  const { codes, forgetCode, track, openWizard, services } = useLayanan();
  const toast = useToast();
  const [chars, setChars] = useState("");
  const [nim, setNim] = useState("");
  const [state, setState] = useState({ status: "idle" });
  const result = useRef(null);

  const lookup = async (codeArg, nimArg) => {
    const code = codeArg ?? charsToCode(chars.replace(/ /g, ""));
    const n = (nimArg ?? nim).replace(/\D/g, "");
    if (!code || n.length < 8) {
      setState({ status: "error", message: !code ? "Kode pengajuan belum lengkap (8 karakter setelah LA)." : "NIM terdiri dari 8–12 angka." });
      return;
    }
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/layanan/lacak", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, nim: n }), cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        setState({ status: "error", message: json.error ?? "Pengajuan tidak ditemukan." });
        return;
      }
      setState({ status: "ok", data: json.data });
      requestAnimationFrame(() => result.current?.focus({ preventScroll: true }));
    } catch {
      setState({ status: "error", message: "Koneksi terputus. Coba lagi sebentar lagi." });
    }
  };

  // permintaan dari bagian lain (layar sukses wizard, Tanya Elvo)
  useEffect(() => {
    if (!track) return;
    const saved = codes.find((c) => c.code === track.code);
    if (track.code) setChars(codeToChars(track.code));
    if (saved?.nim) setNim(saved.nim);
    if (track.code && saved?.nim) lookup(track.code, saved.nim);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track]);

  const pick = (c) => {
    setChars(codeToChars(c.code));
    if (c.nim) {
      setNim(c.nim);
      lookup(c.code, c.nim);
    } else setState({ status: "idle" });
  };

  const resubmit = () => {
    const d = state.data;
    openWizard({ serviceKey: d.service.key, fields: d.fields ?? {}, attachment: d.attachment ?? "", resubmitOf: d.code });
  };

  const data = state.status === "ok" ? state.data : null;
  const st = data ? statusOf(data.status) : null;
  const flagged = data && ["perlu-perbaikan", "ditolak"].includes(data.status);

  return (
    <section id="lacak" className="scroll-mt-24 py-16 md:py-24">
      <Container>
        <div className="overflow-hidden rounded-2xl bg-navy text-white shadow-[0_40px_80px_-50px_rgb(14_24_48/0.9)]">
          <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
            {/* formulir lacak */}
            <div className="relative border-b border-white/10 p-6 sm:p-10 lg:border-b-0 lg:border-r">
              <span aria-hidden className="mb-5 block h-[3px] w-10 bg-gold" />
              <SceneTitle title={["Di mana", "berkasku", "sekarang?"]} tone="dark" />
              <p className="mt-4 max-w-md text-[15.5px] leading-relaxed text-white/65">Masukkan kode yang kamu terima saat mengajukan dan NIM yang sama dengan isian pengajuan.</p>

              <form
                className="mt-8 space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  lookup();
                }}
              >
                <div>
                  <label htmlFor="lacak-kode" className="kicker text-[11px] text-gold-soft">
                    Kode pengajuan
                  </label>
                  <div className="mt-2">
                    <CodeInput id="lacak-kode" value={chars} onChange={setChars} invalid={state.status === "error" && !charsToCode(chars.replace(/ /g, ""))} />
                  </div>
                </div>
                <div>
                  <label htmlFor="lacak-nim" className="kicker text-[11px] text-gold-soft">
                    NIM
                  </label>
                  <input
                    id="lacak-nim"
                    inputMode="numeric"
                    autoComplete="off"
                    value={nim}
                    onChange={(e) => setNim(e.target.value.replace(/\D/g, "").slice(0, 12))}
                    className="mt-2 h-12 w-full max-w-[22rem] rounded-md border border-white/15 bg-white/5 px-4 font-mono text-[16px] tracking-wider text-white outline-none transition-colors placeholder:text-white/30 focus:border-gold focus:bg-white/10"
                    placeholder="contoh: 3012310001"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <Button type="submit" className="h-12 rounded-md bg-gold px-6 text-navy hover:bg-gold-soft" loading={state.status === "loading"}>
                    Lacak
                  </Button>
                  {data && (
                    <button type="button" onClick={() => lookup(data.code)} className="text-[14px] font-semibold text-white/70 transition-colors hover:text-white">
                      <span className="u-gold">Muat ulang status</span>
                    </button>
                  )}
                </div>
              </form>

              {codes.length > 0 && (
                <div className="mt-8">
                  <p className="text-[12.5px] text-white/50">Pengajuan di perangkat ini</p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {codes.map((c) => (
                      <li key={c.code} className="group/chip flex items-center overflow-hidden rounded-md border border-white/15 bg-white/5 text-[13px] transition-colors hover:border-gold/60">
                        <button type="button" onClick={() => pick(c)} className="px-3 py-1.5 text-left" title={c.title}>
                          <span className="font-mono font-semibold text-gold-soft">{c.code}</span>
                          <span className="ml-2 hidden text-white/55 sm:inline">{(c.title ?? "").split(" ").slice(0, 3).join(" ")}</span>
                        </button>
                        <button
                          type="button"
                          aria-label={`Lupakan kode ${c.code} dari perangkat ini`}
                          onClick={() => {
                            forgetCode(c.code);
                            toast.info("Kode dilupakan", { description: "Pengajuannya tetap ada di sistem prodi." });
                          }}
                          className="grid h-full place-items-center px-2 py-1.5 text-white/40 transition-colors hover:text-white"
                        >
                          <svg aria-hidden viewBox="0 0 16 16" className="size-3.5">
                            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* hasil */}
            <div ref={result} tabIndex={-1} aria-live="polite" className="relative min-h-[420px] p-6 outline-none sm:p-10">
              {state.status === "loading" && (
                <div>
                  <DotsLoader className="text-gold" />
                  <Skeleton className="mt-6 h-6 w-2/3 bg-white/10" />
                  <Skeleton className="mt-3 h-4 w-1/2 bg-white/10" />
                  <div className="mt-8 space-y-6">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex gap-4">
                        <Skeleton className="size-7 rounded-full bg-white/10" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-1/3 bg-white/10" />
                          <Skeleton className="h-3 w-2/3 bg-white/10" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {state.status === "error" && (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <span className="w-32 opacity-90"><LottieIllustration src="/lottie/empty-news.json" label="Pengajuan tidak ditemukan" /></span>
                  <p className="mt-4 font-serif text-[1.4rem] text-white">{state.message}</p>
                  <p className="mt-2 max-w-sm text-[13.5px] text-white/55">Kode berawalan LA, lalu 4 angka periode dan 4 karakter acak. Bagian acak tidak memakai huruf O, I, atau L.</p>
                </div>
              )}

              {state.status === "idle" && (
                <div className="flex h-full flex-col justify-center">
                  <p className="kicker text-[11px] text-gold-soft">Alur setiap pengajuan</p>
                  <ol className="mt-5 divide-y divide-white/10 border-y border-white/10">
                    {STATUSES.map((s, i) => (
                      <li key={s.key} className="group flex items-baseline gap-4 py-3.5" data-aos="fade-up" data-aos-delay={i * 70}>
                        <span className="tabular w-6 font-serif text-[1.35rem] leading-none text-gold transition-transform duration-500 ease-cinematic group-hover:-translate-y-0.5">{i + 1}</span>
                        <span className="w-28 shrink-0 text-[14.5px] font-semibold">{s.label}</span>
                        <span className="text-[13px] leading-snug text-white/55">{s.desc}</span>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-6 text-[13px] text-white/50">
                    Belum punya kode?{" "}
                    <button type="button" onClick={() => openWizard()} className="font-semibold text-gold-soft">
                      <span className="u-gold">Ajukan layanan dulu</span>
                    </button>
                  </p>
                </div>
              )}

              {data && (
                <div key={data.code + data.status} className="animate-in fade-in-0 duration-500">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-mono text-[13px] font-semibold tracking-wider text-gold-soft">{data.code}</p>
                      <p className="mt-1 font-serif text-[1.55rem] leading-tight">{data.service.title}</p>
                      <p className="mt-1 text-[13px] text-white/55">
                        {data.name} · diajukan {fmtStamp(data.createdAt)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "rounded-md px-3 py-1.5 text-[13px] font-bold",
                        data.status === "ditolak" ? "bg-red-400/15 text-red-300" : flagged ? "bg-gold/20 text-gold-soft" : data.status === "selesai" || data.status === "siap" ? "bg-emerald-400/15 text-emerald-300" : "bg-white/10 text-white"
                      )}
                    >
                      {st.label}
                    </span>
                  </div>

                  {flagged && (
                    <Banner
                      variant="warning"
                      title={data.status === "ditolak" ? "Pengajuan ditolak" : "Ada yang perlu kamu lengkapi"}
                      className="mt-5"
                      action={
                        services.some((s) => s.key === data.service.key) && (
                          <Button size="sm" variant="navy" onClick={resubmit}>
                            Ajukan ulang
                          </Button>
                        )
                      }
                    >
                      {data.staffNote || st.desc}
                    </Banner>
                  )}

                  {!flagged && data.estimate && data.status !== "selesai" && (
                    <p className="mt-5 rounded-md bg-white/5 px-3 py-2.5 text-[13.5px] text-white/75">
                      Perkiraan siap <strong className="font-semibold text-white">{fmtDate(data.estimate)}</strong>
                      {data.service.output && <> · {data.service.output}</>}
                    </p>
                  )}

                  <Timeline data={data} />
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
