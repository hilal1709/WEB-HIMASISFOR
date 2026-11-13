"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CHANNELS, DRAFT_KEY, estimateReady, fmtDate, serviceByKey } from "@/lib/layanan-content";
import { ModalDescription, ModalTitle, ConfirmModal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Banner } from "@/components/ui/banner";
import { useToast } from "@/components/ui/toast";
import { LordIcon } from "@/components/media/lord-icon";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { cn } from "@/lib/utils";
import { ResponsiveDialog } from "./responsive-dialog";
import { useLayanan } from "./layanan-provider";

const STEPS = ["Layanan", "Data diri", "Isian", "Tinjau"];
const EMPTY = { serviceKey: "", name: "", nim: "", email: "", phone: "", fields: {}, attachment: "", confirm: false, website: "" };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const readDraft = () => {
  try {
    const d = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "null");
    return d && typeof d === "object" ? d : null;
  } catch {
    return null;
  }
};

/** Validasi per langkah (cermin validasi server di `lib/layanan-server.js`). */
function validate(step, form, service) {
  const e = {};
  if (step === 0 && !service) e.serviceKey = "Pilih salah satu layanan.";
  if (step === 1) {
    if (form.name.trim().length < 3) e.name = "Tulis nama lengkap sesuai KTM.";
    const nim = form.nim.replace(/\D/g, "");
    if (nim.length < 8 || nim.length > 12) e.nim = "NIM terdiri dari 8–12 angka.";
    if (!EMAIL.test(form.email.trim())) e.email = "Alamat email belum benar.";
    const ph = form.phone.replace(/[^\d+]/g, "");
    if (ph && (ph.length < 9 || ph.length > 16)) e.phone = "Nomor WhatsApp belum benar.";
  }
  if (step === 2 && service) {
    for (const f of service.fields) if (f.required && !String(form.fields[f.name] ?? "").trim()) e[`fields.${f.name}`] = `${f.label} wajib diisi.`;
    if (form.attachment && !/^https?:\/\//i.test(form.attachment.trim())) e.attachment = "Tautan berkas harus diawali http:// atau https://.";
  }
  if (step === 3 && !form.confirm) e.confirm = "Centang pernyataan sebelum mengirim.";
  return e;
}
const stepOfError = (key) => (key === "serviceKey" ? 0 : ["name", "nim", "email", "phone"].includes(key) ? 1 : key === "confirm" ? 3 : 2);

function Field({ id, label, error, hint, children }) {
  return (
    <div>
      <Label htmlFor={id} className="text-[13px] font-semibold text-navy">
        {label}
      </Label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p id={`${id}-err`} className="mt-1 text-[12.5px] text-maroon">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1 text-[12px] text-text/50">{hint}</p>
      )}
    </div>
  );
}

function SuccessCode({ code }) {
  const reduce = useReducedMotion();
  return (
    <p aria-label={code} className="flex justify-center font-mono text-[clamp(1.6rem,6vw,2.4rem)] font-bold tracking-[0.12em] text-navy">
      {code.split("").map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden
          initial={reduce ? false : { y: 24, opacity: 0, rotateX: -90 }}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          transition={{ delay: 0.25 + i * 0.05, type: "spring", stiffness: 380, damping: 22 }}
          className={cn("inline-block", ch === "-" && "px-1 text-gold")}
        >
          {ch}
        </motion.span>
      ))}
    </p>
  );
}

/**
 * Wizard pengajuan 4 langkah (pola 21st.dev Multi-step Form): Layanan → Data diri → Isian khusus + berkas → Tinjau.
 * Bar langkah emas (`motion` layout), isi bergeser searah langkah, draf otomatis di localStorage, konfirmasi saat
 * menutup. Kirim → POST /api/layanan/pengajuan → layar sukses dengan kode tiket (per karakter) + salin + lacak.
 */
export function RequestWizard() {
  const { wizard, closeWizard, services, categories, now, hours, addCode, trackCode } = useLayanan();
  const toast = useToast();
  const reduce = useReducedMotion();
  const [form, setForm] = useState(EMPTY);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [confirmClose, setConfirmClose] = useState(false);
  const [copied, setCopied] = useState(false);
  const body = useRef(null);

  const open = !!wizard;
  const service = serviceByKey(form.serviceKey, services);

  // buka: gabungkan draf + preset (pengajuan ulang membawa isian lama)
  useEffect(() => {
    if (!wizard) return;
    const d = readDraft() ?? {};
    const base = { ...EMPTY, ...d, confirm: false, website: "" };
    const serviceKey = wizard.serviceKey ?? base.serviceKey ?? "";
    const next = {
      ...base,
      serviceKey,
      fields: wizard.fields ?? (serviceKey === d.serviceKey ? d.fields ?? {} : {}),
      attachment: wizard.attachment ?? (serviceKey === d.serviceKey ? d.attachment ?? "" : ""),
    };
    setForm(next);
    setStep(wizard.serviceKey ? 1 : 0);
    setDir(1);
    setErrors({});
    setServerError(null);
    setResult(null);
    setCopied(false);
  }, [wizard]);

  // draf otomatis
  useEffect(() => {
    if (!open || result) return;
    const t = setTimeout(() => {
      try {
        const { confirm, website, ...rest } = form;
        localStorage.setItem(DRAFT_KEY, JSON.stringify(rest));
      } catch {}
    }, 400);
    return () => clearTimeout(t);
  }, [form, open, result]);

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };
  const setField = (k, v) => {
    setForm((f) => ({ ...f, fields: { ...f.fields, [k]: v } }));
    setErrors((e) => ({ ...e, [`fields.${k}`]: undefined }));
  };

  const goto = (n) => {
    setDir(n > step ? 1 : -1);
    setStep(n);
    setServerError(null);
    requestAnimationFrame(() => body.current?.scrollTo?.({ top: 0 }));
  };
  const next = () => {
    const e = validate(step, form, service);
    setErrors(e);
    if (Object.keys(e).length) return;
    goto(step + 1);
  };

  const ready = useMemo(() => (service && now ? estimateReady(service.sla, now, hours) : null), [service, now, hours]);

  const submit = async () => {
    const e = validate(3, form, service);
    setErrors(e);
    if (Object.keys(e).length) return;
    setSending(true);
    setServerError(null);
    try {
      const res = await fetch("/api/layanan/pengajuan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, resubmitOf: wizard?.resubmitOf }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.status === 422 && json.errors) {
        setErrors(json.errors);
        const first = Object.keys(json.errors)[0];
        goto(stepOfError(first));
        setServerError({ variant: "danger", title: json.error, body: Object.values(json.errors)[0] });
        return;
      }
      if (!res.ok || !json.success) {
        setServerError({ variant: res.status === 429 ? "warning" : "danger", title: res.status === 429 ? "Tunggu sebentar" : "Pengajuan belum terkirim", body: json.error ?? "Coba lagi beberapa saat lagi." });
        if (res.status >= 500) toast.error("Pengajuan belum terkirim", { description: "Isianmu aman tersimpan sebagai draf.", action: { label: "Coba lagi", onClick: submit } });
        return;
      }
      setResult({ code: json.code, estimate: json.estimate });
      addCode({ code: json.code, serviceKey: service.key, title: service.title, nim: form.nim.replace(/\D/g, ""), at: new Date().toISOString() });
      try {
        const { name, nim, email, phone } = form;
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ name, nim, email, phone }));
      } catch {}
      toast.success("Pengajuan terkirim", { description: `Kode ${json.code} tersimpan di perangkat ini.` });
    } catch {
      toast.error("Koneksi terputus", { description: "Isianmu aman tersimpan sebagai draf.", action: { label: "Coba lagi", onClick: submit } });
    } finally {
      setSending(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result.code);
      setCopied(true);
      toast.success("Kode disalin");
      setTimeout(() => setCopied(false), 2200);
    } catch {
      toast.warning("Tidak bisa menyalin otomatis", { description: "Catat kodenya secara manual." });
    }
  };

  const dirty = !result && (form.serviceKey || form.name || Object.values(form.fields).some(Boolean)) && step > 0;
  const requestClose = (o) => {
    if (o) return;
    if (dirty) setConfirmClose(true);
    else closeWizard();
  };

  const discard = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}
    setForm(EMPTY);
    setErrors({});
    goto(0);
    toast.info("Draf dihapus");
  };

  const variants = {
    enter: (d) => (reduce ? { opacity: 0 } : { x: d * 40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d) => (reduce ? { opacity: 0 } : { x: d * -40, opacity: 0 }),
  };

  const errId = (k) => (errors[k] ? `${k}-err` : undefined);

  return (
    <>
      <ResponsiveDialog open={open} onOpenChange={requestClose} className="max-w-xl">
        {/* kepala + bar langkah */}
        <header className="border-b border-line px-6 pb-5 pt-7 sm:px-8">
          <ModalTitle className="!text-[1.45rem]">{result ? "Pengajuan terkirim" : wizard?.resubmitOf ? "Ajukan ulang" : "Ajukan layanan"}</ModalTitle>
          <ModalDescription className="mt-1">
            {result ? "Simpan kodenya untuk melacak status." : service ? service.title : "Empat langkah singkat, sekitar dua menit."}
          </ModalDescription>
          {!result && (
            <ol className="mt-5 grid grid-cols-4 gap-2" aria-label="Langkah pengajuan">
              {STEPS.map((label, i) => (
                <li key={label}>
                  <button
                    type="button"
                    disabled={i > step}
                    onClick={() => i < step && goto(i)}
                    aria-current={i === step ? "step" : undefined}
                    className="group w-full text-left disabled:cursor-default"
                  >
                    <span className="relative block h-1.5 overflow-hidden rounded-full bg-cream-2">
                      {i <= step && <motion.span layoutId={i === step ? "wz-bar" : undefined} className="absolute inset-0 rounded-full bg-gold" transition={{ type: "spring", stiffness: 300, damping: 30 }} />}
                    </span>
                    <span className={cn("mt-1.5 block text-[11.5px] font-medium transition-colors", i === step ? "text-navy" : i < step ? "text-text/60 group-hover:text-maroon" : "text-text/35")}>
                      {i + 1}. {label}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          )}
        </header>

        <div ref={body} className="relative min-h-[300px] overflow-hidden px-6 py-6 sm:px-8">
          {serverError && (
            <Banner variant={serverError.variant} title={serverError.title} className="mb-5">
              {serverError.body}
            </Banner>
          )}

          {result ? (
            <div className="flex flex-col items-center text-center">
              <span className="w-28"><LottieIllustration src="/lottie/stamp.json" loop={false} label="Stempel diterima" /></span>
              <p className="kicker mt-2 text-[11px] text-maroon">Kode pengajuan</p>
              <div className="mt-2 w-full rounded-xl border border-dashed border-gold bg-cream px-4 py-5">
                <SuccessCode code={result.code} />
              </div>
              <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-text/70">
                {result.estimate ? (
                  <>
                    Perkiraan siap <strong className="font-semibold text-navy">{fmtDate(result.estimate)}</strong>. Status berubah setiap staf memproses berkasmu.
                  </>
                ) : (
                  "Status berubah setiap staf memproses berkasmu."
                )}
              </p>
              <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
                <Button variant="outline-navy" className="h-11 gap-2" onClick={copy}>
                  <span className="relative grid size-5 place-items-center">
                    <AnimatePresence mode="wait" initial={false}>
                      {copied ? (
                        <motion.span key="ok" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }}>
                          <LordIcon name="check" size={20} trigger="once" colors="primary:#14213d,secondary:#c9a227" />
                        </motion.span>
                      ) : (
                        <motion.svg key="copy" viewBox="0 0 16 16" className="size-4" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }}>
                          <rect x="5" y="5" width="8.5" height="8.5" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
                          <path d="M10.5 3H4a1.5 1.5 0 0 0-1.5 1.5V11" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                        </motion.svg>
                      )}
                    </AnimatePresence>
                  </span>
                  {copied ? "Tersalin" : "Salin kode"}
                </Button>
                <Button variant="maroon" className="h-11" onClick={() => trackCode(result.code)}>
                  Lacak sekarang
                </Button>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              <motion.div key={step} custom={dir} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
                {step === 0 && (
                  <fieldset>
                    <legend className="sr-only">Pilih layanan</legend>
                    <div className="space-y-5">
                      {categories.map((c) => (
                        <div key={c.key}>
                          <p className="kicker text-[11px] text-maroon">{c.label}</p>
                          <div className="mt-2 grid gap-2 sm:grid-cols-2">
                            {services
                              .filter((s) => s.category === c.key)
                              .map((s) => {
                                const on = form.serviceKey === s.key;
                                return (
                                  <label
                                    key={s.key}
                                    className={cn(
                                      "relative flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-3 text-[14px] transition-[border-color,background-color,box-shadow] duration-300",
                                      on ? "border-navy bg-navy text-white shadow-[0_14px_30px_-20px_rgb(20_33_61/0.9)]" : "border-line bg-white text-navy hover:border-navy/30"
                                    )}
                                  >
                                    <input type="radio" name="service" value={s.key} checked={on} onChange={() => set("serviceKey", s.key)} className="sr-only" />
                                    <span className={cn("mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border", on ? "border-gold" : "border-navy/30")}>
                                      {on && <motion.span layoutId="wz-dot" className="size-2 rounded-full bg-gold" />}
                                    </span>
                                    <span className="min-w-0">
                                      <span className="block font-semibold leading-snug">{s.title}</span>
                                      <span className={cn("mt-0.5 block text-[12px]", on ? "text-white/65" : "text-text/50")}>
                                        {s.sla} hari kerja · {CHANNELS[s.channel]}
                                      </span>
                                    </span>
                                  </label>
                                );
                              })}
                          </div>
                        </div>
                      ))}
                    </div>
                    {errors.serviceKey && <p className="mt-3 text-[12.5px] text-maroon">{errors.serviceKey}</p>}
                  </fieldset>
                )}

                {step === 1 && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Field id="name" label="Nama lengkap" error={errors.name}>
                        <Input id="name" autoComplete="name" value={form.name} onChange={(e) => set("name", e.target.value)} invalid={!!errors.name} aria-describedby={errId("name")} />
                      </Field>
                    </div>
                    <Field id="nim" label="NIM" error={errors.nim}>
                      <Input id="nim" inputMode="numeric" value={form.nim} onChange={(e) => set("nim", e.target.value.replace(/[^\d]/g, ""))} invalid={!!errors.nim} aria-describedby={errId("nim")} />
                    </Field>
                    <Field id="phone" label="WhatsApp (opsional)" error={errors.phone} hint="Dipakai bila staf perlu konfirmasi cepat.">
                      <Input id="phone" type="tel" autoComplete="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} invalid={!!errors.phone} aria-describedby={errId("phone")} />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field id="email" label="Email" error={errors.email} hint="Surat daring dikirim ke alamat ini.">
                        <Input id="email" type="email" autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} invalid={!!errors.email} aria-describedby={errId("email")} />
                      </Field>
                    </div>
                    {/* honeypot — disembunyikan dari pengguna */}
                    <input tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] size-px opacity-0" name="website" value={form.website} onChange={(e) => set("website", e.target.value)} />
                  </div>
                )}

                {step === 2 && service && (
                  <div className="space-y-4">
                    {service.fields.map((f) => {
                      const id = `f-${f.name}`;
                      const err = errors[`fields.${f.name}`];
                      const v = form.fields[f.name] ?? "";
                      return (
                        <Field key={f.name} id={id} label={f.label} error={err}>
                          {f.type === "textarea" ? (
                            <Textarea id={id} value={v} placeholder={f.placeholder} onChange={(e) => setField(f.name, e.target.value)} aria-invalid={!!err || undefined} className="min-h-20" />
                          ) : f.type === "select" ? (
                            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={f.label}>
                              {f.options.map((o) => (
                                <button
                                  key={o}
                                  type="button"
                                  role="radio"
                                  aria-checked={v === o}
                                  onClick={() => setField(f.name, o)}
                                  className={cn("h-9 rounded-md border px-3.5 text-[13.5px] font-medium transition-[background-color,border-color,color] duration-300", v === o ? "border-navy bg-navy text-white" : "border-line bg-white text-navy hover:border-navy/30")}
                                >
                                  {o}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <Input id={id} type={f.type === "date" ? "date" : "text"} value={v} placeholder={f.placeholder} onChange={(e) => setField(f.name, e.target.value)} invalid={!!err} />
                          )}
                        </Field>
                      );
                    })}
                    <Field id="attachment" label="Tautan berkas (opsional)" error={errors.attachment} hint="Unggah syarat ke Google Drive / OneDrive, lalu tempel tautannya. Pastikan aksesnya terbuka.">
                      <Input id="attachment" type="url" inputMode="url" placeholder="https://drive.google.com/…" value={form.attachment} onChange={(e) => set("attachment", e.target.value)} invalid={!!errors.attachment} />
                    </Field>
                    <div className="rounded-md bg-cream px-3 py-3 text-[13px] text-text/70">
                      <p className="font-semibold text-navy">Syarat layanan ini</p>
                      <ul className="mt-1 list-inside list-disc space-y-0.5">
                        {service.needs.map((n) => (
                          <li key={n}>{n}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {step === 3 && service && (
                  <div>
                    <dl className="divide-y divide-line rounded-lg border border-line text-[14px]">
                      {[
                        ["Layanan", service.title, 0],
                        ["Nama", form.name, 1],
                        ["NIM", form.nim, 1],
                        ["Email", form.email, 1],
                        ...(form.phone ? [["WhatsApp", form.phone, 1]] : []),
                        ...service.fields.filter((f) => form.fields[f.name]).map((f) => [f.label, form.fields[f.name], 2]),
                        ...(form.attachment ? [["Berkas", form.attachment, 2]] : []),
                      ].map(([k, v, s]) => (
                        <div key={k} className="group flex items-start gap-4 px-4 py-2.5">
                          <dt className="w-28 shrink-0 text-[12.5px] text-text/50">{k}</dt>
                          <dd className="min-w-0 flex-1 whitespace-pre-line break-words text-navy">{v}</dd>
                          <button type="button" onClick={() => goto(s)} className="shrink-0 text-[12px] font-semibold text-maroon opacity-60 transition-opacity group-hover:opacity-100">
                            Ubah
                          </button>
                        </div>
                      ))}
                    </dl>
                    {ready && (
                      <p className="mt-4 text-[13.5px] text-text/70">
                        Perkiraan siap: <strong className="font-semibold text-navy">{fmtDate(ready)}</strong>
                      </p>
                    )}
                    <label className="mt-4 flex cursor-pointer items-start gap-3 text-[13.5px] text-text/75">
                      <input type="checkbox" checked={form.confirm} onChange={(e) => set("confirm", e.target.checked)} className="mt-0.5 size-4 accent-[var(--navy)]" />
                      <span>Data di atas benar dan milikku sendiri. Aku paham pengajuan diproses pada hari kerja.</span>
                    </label>
                    {errors.confirm && <p className="mt-1 text-[12.5px] text-maroon">{errors.confirm}</p>}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {!result && (
          <footer className="sticky bottom-0 flex items-center gap-3 border-t border-line bg-white px-6 py-4 sm:px-8">
            {step > 0 ? (
              <Button variant="outline-navy" className="h-11" onClick={() => goto(step - 1)} disabled={sending}>
                Kembali
              </Button>
            ) : (
              <button type="button" onClick={discard} className="text-[13px] font-semibold text-text/50 transition-colors hover:text-maroon">
                Hapus draf
              </button>
            )}
            {step < 3 ? (
              <Button variant="navy" className="ml-auto h-11 px-6" onClick={next}>
                Lanjut
              </Button>
            ) : (
              <Button variant="maroon" className="ml-auto h-11 px-6" loading={sending} onClick={submit}>
                {sending ? "Mengirim…" : "Kirim pengajuan"}
              </Button>
            )}
          </footer>
        )}
      </ResponsiveDialog>

      <ConfirmModal
        open={confirmClose}
        onOpenChange={setConfirmClose}
        title="Tutup formulir?"
        description="Isianmu tersimpan sebagai draf di perangkat ini dan bisa dilanjutkan kapan saja."
        confirmLabel="Tutup"
        cancelLabel="Lanjut mengisi"
        onConfirm={() => {
          setConfirmClose(false);
          closeWizard();
        }}
      />
    </>
  );
}
