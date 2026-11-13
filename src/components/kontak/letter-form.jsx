"use client";
import { useLayoutEffect as useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { DRAFT_KEY, LIMITS, ROLES, composeLetter, deskOf, letterSubject } from "@/lib/kontak-content";
import { Container, SectionHeader } from "@/components/home/shared";
import { KontakBanner } from "./kontak-banner";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { useKontak } from "./kontak-provider";
import { Postmark } from "./postmark";
import { LetterModal } from "./letter-modal";

const EMPTY = { name: "", role: "", email: "", message: "" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(v, topic) {
  const e = {};
  if (!topic) e.topic = "Pilih tujuan surat.";
  if (!v.name.trim()) e.name = "Tulis namamu.";
  if (v.email.trim() && !EMAIL_RE.test(v.email.trim())) e.email = "Format email belum benar.";
  if (v.message.trim().length < LIMITS.minMessage) e.message = `Isi surat minimal ${LIMITS.minMessage} karakter.`;
  return e;
}

/** Kolom bergaya garis tulis di atas kertas. */
const lineField =
  "h-auto rounded-none border-0 border-b border-navy/20 bg-transparent px-0 py-1.5 text-[15.5px] text-navy shadow-none placeholder:text-text/35 focus-visible:border-maroon focus-visible:ring-0 aria-[invalid=true]:border-danger";

function Choice({ value, placeholder, options, onPick, invalid, id, label }) {
  return (
    <Popover>
      <PopoverTrigger
        id={id}
        aria-label={label}
        aria-invalid={invalid || undefined}
        className={cn(
          "group inline-flex max-w-full items-center gap-2 border-b border-dashed py-1 text-left font-serif text-[clamp(1.05rem,1.8vw,1.3rem)] italic transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon/30",
          value ? "border-maroon/50 text-maroon" : "border-navy/30 text-text/40",
          invalid && "border-danger text-danger"
        )}
      >
        <span className="truncate">{value || placeholder}</span>
        <svg aria-hidden viewBox="0 0 16 16" className="size-3.5 shrink-0 transition-transform duration-300 group-data-[state=open]:rotate-180">
          <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-1.5">
        <ul role="listbox" aria-label={label}>
          {options.map((o) => (
            <li key={o.key}>
              <PopoverClose
                role="option"
                aria-selected={o.active}
                onClick={() => onPick(o.key)}
                className={cn("flex w-full flex-col rounded-md px-3 py-2 text-left transition-colors hover:bg-cream focus-visible:bg-cream focus-visible:outline-none", o.active && "bg-cream")}
              >
                <span className="text-[14.5px] font-medium text-navy">{o.label}</span>
                {o.note && <span className="text-[12.5px] text-text/55">{o.note}</span>}
              </PopoverClose>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Formulir "surat" di atas kertas bergaris. Kirim → tautan email/WhatsApp dibuka (atau surat disalin) saat itu
 * juga, lalu kertas mengecil masuk ke amplop, tutup amplop melipat, dan perangko dicap (Lottie) sebelum modal
 * konfirmasi muncul. Draf tersimpan di perangkat agar tidak hilang saat halaman dimuat ulang.
 */
export function LetterForm() {
  const { topics, desks, topicKey, pick, channels, hasChannel } = useKontak();
  const toast = useToast();
  const [v, setV] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [date, setDate] = useState(null);
  const [phase, setPhase] = useState("idle"); // idle | sending | sent
  const [sent, setSent] = useState(null);
  const stage = useRef(null);
  const sheet = useRef(null);
  const env = useRef(null);
  const flap = useRef(null);
  const tl = useRef(null);
  const restored = useRef(false);

  const topic = topics.find((t) => t.key === topicKey) ?? null;
  const desk = topic ? deskOf(topic.desk, desks) : null;

  // pulihkan draf + tanggal klien
  useEffect(() => {
    setDate(new Date());
    try {
      const d = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "null");
      if (d && typeof d === "object") {
        setV({ ...EMPTY, ...Object.fromEntries(Object.entries(d).filter(([k, x]) => k in EMPTY && typeof x === "string")) });
        if (typeof d.topicKey === "string" && topics.some((t) => t.key === d.topicKey)) pick(d.topicKey);
      }
    } catch {}
    restored.current = true;
  }, [topics, pick]);

  // simpan draf
  useEffect(() => {
    if (!restored.current) return;
    const t = setTimeout(() => {
      try {
        const empty = !v.name && !v.email && !v.message && !v.role;
        if (empty && !topicKey) localStorage.removeItem(DRAFT_KEY);
        else localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...v, topicKey }));
      } catch {}
    }, 400);
    return () => clearTimeout(t);
  }, [v, topicKey]);

  const set = (k) => (e) => {
    const val = typeof e === "string" ? e : e.target.value;
    setV((p) => ({ ...p, [k]: val }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const shake = (keys) => {
    if (prefersReducedMotion()) return;
    keys.forEach((k) => {
      const el = stage.current?.querySelector(`[data-field="${k}"]`);
      if (el) animate(el, { translateX: [0, -7, 6, -4, 3, 0], duration: 420, ease: "outQuad" });
    });
  };

  const fold = () =>
    new Promise((resolve) => {
      if (prefersReducedMotion() || !sheet.current || !env.current) return resolve();
      const s = sheet.current.getBoundingClientRect();
      const e = env.current.getBoundingClientRect();
      tl.current?.kill();
      tl.current = gsap
        .timeline({ onComplete: resolve })
        .set(env.current, { visibility: "visible" })
        .fromTo(env.current, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "expo.out" })
        .to(sheet.current, { scaleY: 0.34, duration: 0.45, ease: "power2.inOut", transformOrigin: "50% 0%" }, "<0.05")
        .to(sheet.current, {
          scaleX: (e.width * 0.86) / s.width,
          scaleY: (e.height * 0.5) / s.height,
          x: e.left + e.width / 2 - (s.left + s.width / 2),
          y: e.top + e.height * 0.42 - s.top,
          duration: 0.6,
          ease: "power3.inOut",
          transformOrigin: "50% 0%",
        })
        .to(sheet.current, { opacity: 0, duration: 0.2 }, "-=0.15")
        .fromTo(flap.current, { rotateX: 180 }, { rotateX: 0, duration: 0.55, ease: "back.out(1.6)" })
        .add(() => setPhase("sent"))
        .to({}, { duration: 1.1 });
    });

  const unfold = () => {
    tl.current?.kill();
    gsap.set(sheet.current, { clearProps: "transform,opacity" });
    gsap.set(env.current, { visibility: "hidden", opacity: 0 });
    gsap.set(flap.current, { rotateX: 180 });
  };

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  };

  const send = async (via) => {
    if (phase !== "idle") return;
    const errs = validate(v, topic);
    const bad = Object.keys(errs).filter((k) => errs[k]);
    if (bad.length) {
      setErrors(errs);
      shake(bad);
      toast.error("Surat belum lengkap", { description: errs[bad[0]] });
      return;
    }
    const text = composeLetter({ desk, topic, ...v, date: date ?? new Date() });
    // aksi dijalankan langsung di dalam klik (popup & clipboard butuh gestur pengguna)
    if (via === "email") {
      location.href = `mailto:${channels.email}?subject=${encodeURIComponent(letterSubject(topic))}&body=${encodeURIComponent(text)}`;
    } else if (via === "whatsapp") {
      window.open(`https://wa.me/${channels.whatsapp}?text=${encodeURIComponent(`${letterSubject(topic)}\n\n${text}`)}`, "_blank", "noopener,noreferrer");
    } else if (!(await copy(text))) {
      toast.error("Gagal menyalin", { description: "Izinkan akses papan klip, lalu coba lagi." });
      return;
    }
    setPhase("sending");
    await fold();
    setPhase("sent");
    setSent({ via, text, desk, topic, name: v.name.trim() });
  };

  const reset = () => {
    setSent(null);
    setV(EMPTY);
    setErrors({});
    pick(null);
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}
    unfold();
    setPhase("idle");
    if (!prefersReducedMotion() && sheet.current) gsap.from(sheet.current, { y: 30, opacity: 0, duration: 0.7, ease: "expo.out" });
  };

  const topicOptions = topics.map((t) => ({ key: t.key, label: deskOf(t.desk, desks).name, note: t.label, active: t.key === topicKey }));
  const roleOptions = ROLES.map((r) => ({ key: r, label: r, active: r === v.role }));
  const tgl = date?.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  const left = LIMITS.message - v.message.length;
  const busy = phase !== "idle";

  return (
    <section id="surat" className="scroll-mt-24 bg-cream-2 py-16 md:py-24">
      <Container>
        <SectionHeader title={["Tulis", "suratmu", ""]} body="Kertasnya sudah siap. Tujuan dan perihal terisi dari papan sambung, tinggal ceritakan keperluanmu." />
        <KontakBanner className="mt-8" />

        <div ref={stage} className="relative mx-auto mt-10 max-w-[780px] md:mt-14">
          <form
            ref={sheet}
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              send(channels.email ? "email" : channels.whatsapp ? "whatsapp" : "copy");
            }}
            aria-busy={busy}
            className="relative rounded-[4px] bg-white px-6 py-8 shadow-[0_30px_70px_-40px_rgb(20_33_61/0.6)] will-change-transform sm:px-12 sm:py-12"
          >
            {/* lipatan kertas */}
            <span aria-hidden className="pointer-events-none absolute inset-x-0 top-1/3 border-t border-dashed border-navy/[0.07]" />
            <span aria-hidden className="pointer-events-none absolute inset-x-0 top-2/3 border-t border-dashed border-navy/[0.07]" />
            <span aria-hidden className="absolute right-6 top-6 sm:right-10 sm:top-9">
              <Postmark className="size-16 opacity-40 sm:size-20" tone="navy" center="SURAT" />
            </span>

            <p className="text-right text-[14px] text-text/55 sm:pr-24">{tgl ? `Gresik, ${tgl}` : <span className="inline-block h-4 w-36 animate-shimmer rounded bg-cream-2" />}</p>

            <div data-field="topic" className="mt-8 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <label htmlFor="kt-topic" className="font-serif text-[clamp(1.05rem,1.8vw,1.3rem)] font-normal text-navy">
                Kepada Yth.
              </label>
              <Choice id="kt-topic" label="Tujuan surat" value={desk?.name} placeholder="pilih meja tujuan" options={topicOptions} onPick={(k) => { pick(k); setErrors((p) => ({ ...p, topic: undefined })); }} invalid={!!errors.topic} />
            </div>
            <p className="mt-1 text-[14px] text-text/55">Program Studi Sistem Informasi UISI</p>
            {errors.topic && <p className="mt-1.5 text-[13px] text-danger">{errors.topic}</p>}

            <p className="mt-6 text-[14.5px] text-navy">
              <span className="text-text/55">Perihal:</span> {topic ? topic.label : <span className="text-text/35">mengikuti tujuan</span>}
            </p>

            <div data-field="message" className="mt-7">
              <label htmlFor="kt-message" className="sr-only">Isi surat</label>
              <Textarea
                id="kt-message"
                value={v.message}
                onChange={set("message")}
                maxLength={LIMITS.message}
                rows={7}
                aria-invalid={!!errors.message || undefined}
                aria-describedby="kt-message-hint"
                placeholder="Dengan hormat, saya ingin menanyakan…"
                className="kt-ruled field-sizing-content min-h-[224px] resize-none rounded-none border-0 bg-transparent px-0 py-0 text-[16px] leading-8 text-navy shadow-none placeholder:text-text/35 focus-visible:ring-0 aria-[invalid=true]:text-danger"
              />
              <div id="kt-message-hint" className="mt-2 flex justify-between gap-4 text-[12.5px]">
                <span className="text-danger">{errors.message}</span>
                <span className={cn("tabular shrink-0", left < 100 ? "text-maroon" : "text-text/45")}>{left} karakter tersisa</span>
              </div>
            </div>

            {/* salam penutup */}
            <div className="mt-8 grid gap-6 sm:ml-auto sm:w-[62%]">
              <p className="font-serif text-[17px] italic text-navy">Hormat saya,</p>
              <div data-field="name">
                <label htmlFor="kt-name" className="text-[12.5px] font-medium text-text/55">Nama lengkap</label>
                <Input id="kt-name" value={v.name} onChange={set("name")} maxLength={LIMITS.name} autoComplete="name" invalid={!!errors.name} placeholder="Nama kamu" className={lineField} />
                {errors.name && <p className="mt-1.5 text-[13px] text-danger">{errors.name}</p>}
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <div data-field="role">
                  <label htmlFor="kt-role" className="block text-[12.5px] font-medium text-text/55">Saya seorang</label>
                  <Choice id="kt-role" label="Peran pengirim" value={v.role} placeholder="pilih peran" options={roleOptions} onPick={set("role")} />
                </div>
                <div data-field="email">
                  <label htmlFor="kt-email" className="text-[12.5px] font-medium text-text/55">Email balasan <span className="text-text/40">(opsional)</span></label>
                  <Input id="kt-email" type="email" value={v.email} onChange={set("email")} autoComplete="email" inputMode="email" invalid={!!errors.email} placeholder="nama@email.com" className={lineField} />
                  {errors.email && <p className="mt-1.5 text-[13px] text-danger">{errors.email}</p>}
                </div>
              </div>
            </div>
          </form>

          {/* amplop (muncul saat dikirim) */}
          <div aria-hidden ref={env} className="invisible absolute left-1/2 top-[18%] z-10 w-[min(440px,82%)] -translate-x-1/2 opacity-0 [perspective:900px]">
            <div className="relative aspect-[1.6] rounded-[4px] border border-navy/15 bg-white shadow-[0_30px_60px_-30px_rgb(20_33_61/0.6)]">
              <svg viewBox="0 0 160 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
                <path d="M0 100L64 52M160 100L96 52" fill="none" stroke="var(--navy)" strokeOpacity="0.2" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
              </svg>
              <div ref={flap} className="absolute inset-x-0 top-0 h-[58%] origin-top [transform:rotateX(180deg)] [transform-style:preserve-3d]">
                <svg viewBox="0 0 160 58" preserveAspectRatio="none" className="size-full">
                  <path d="M0 0L80 58L160 0Z" fill="var(--cream-2)" stroke="var(--navy)" strokeOpacity="0.2" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
                </svg>
              </div>
              <span className="kt-perf absolute right-3 top-3 grid h-14 w-11 place-items-center bg-maroon font-serif text-lg italic text-gold-soft">Si</span>
              {phase === "sent" && (
                <span className="absolute -right-6 -top-8 size-24">
                  <LottieIllustration src="/lottie/stamp.json" loop={false} speed={1.4} className="size-full" />
                </span>
              )}
              <p className="absolute bottom-4 left-5 max-w-[60%] font-serif text-[13px] italic leading-snug text-navy">{desk?.name}</p>
            </div>
          </div>

          {/* aksi kirim */}
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
            {!hasChannel && <p className="text-[13.5px] text-text/55 sm:mr-auto">Email & WhatsApp resmi menyusul.</p>}
            <Button
              type="button"
              variant={channels.email ? "maroon" : "outline-navy"}
              size="lg"
              disabled={!channels.email || busy}
              onClick={() => send("email")}
              title={channels.email ? undefined : "Menyusul"}
            >
              Kirim lewat email
            </Button>
            <Button type="button" variant={channels.whatsapp ? "navy" : "outline-navy"} size="lg" disabled={!channels.whatsapp || busy} onClick={() => send("whatsapp")} title={channels.whatsapp ? undefined : "Menyusul"}>
              Kirim lewat WhatsApp
            </Button>
            <Button type="button" variant={hasChannel ? "outline-navy" : "maroon"} size="lg" loading={phase === "sending"} onClick={() => send("copy")}>
              {phase === "sending" ? "Melipat surat…" : "Salin surat"}
            </Button>
          </div>
        </div>
      </Container>

      <LetterModal sent={sent} onCopy={copy} onReset={reset} onClose={() => { setSent(null); unfold(); setPhase("idle"); }} />
    </section>
  );
}
