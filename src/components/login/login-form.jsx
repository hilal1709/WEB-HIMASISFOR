"use client";
import { useId, useState } from "react";
import { Banner } from "@/components/ui/banner";
import { Magnetic } from "@/components/motion/magnetic";
import { LordIcon } from "@/components/media/lord-icon";
import { Spinner } from "@/components/ui/loader";
import { cn } from "@/lib/utils";

/** Input ber-floating label; garis emas tumbuh dari kiri saat fokus. */
function Field({ label, error, trailing, className, ...props }) {
  const id = useId();
  return (
    <div className={cn("group relative", className)}>
      <input
        id={id}
        placeholder=" "
        aria-invalid={error || undefined}
        className="peer h-14 w-full border-0 border-b border-navy/25 bg-transparent pb-1 pt-5 pr-24 text-base text-navy outline-none transition-colors placeholder:text-transparent aria-[invalid=true]:border-maroon"
        {...props}
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-0 top-1/2 origin-left -translate-y-1/2 text-base text-text/55 transition-all duration-300 ease-[var(--ease-cinematic,cubic-bezier(0.22,1,0.36,1))] peer-focus:top-3 peer-focus:scale-[0.78] peer-focus:text-maroon peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:scale-[0.78]"
      >
        {label}
      </label>
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gold transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] peer-focus:scale-x-100" />
      {trailing && <div className="absolute right-0 top-1/2 -translate-y-1/2">{trailing}</div>}
    </div>
  );
}

export function LoginForm({ email, setEmail, password, setPassword, error, loading, busy, capsOn, setCapsOn, onSubmit, onHelp, formRef }) {
  const [show, setShow] = useState(false);
  const caps = (e) => setCapsOn(e.getModifierState?.("CapsLock") ?? false);

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-6" aria-busy={loading}>
      {(error || capsOn) && (
        <div className="space-y-2">
          {error && <Banner variant="danger">{error}</Banner>}
          {capsOn && <Banner variant="warning">Caps Lock sedang aktif.</Banner>}
        </div>
      )}

      <Field
        label="Email"
        type="email"
        name="email"
        autoComplete="username"
        inputMode="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={!!error}
        disabled={busy}
        autoFocus
        required
      />

      <Field
        label="Kata sandi"
        type={show ? "text" : "password"}
        name="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyUp={caps}
        onKeyDown={caps}
        error={!!error}
        disabled={busy}
        required
        trailing={
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-pressed={show}
            className="rounded px-1 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-navy/60 transition-colors hover:text-maroon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon/40"
          >
            {show ? "Sembunyikan" : "Tampilkan"}
          </button>
        }
      />

      <div className="flex items-center justify-between gap-4 pt-1">
        <Magnetic strength={0.25}>
          <button
            type="submit"
            disabled={busy}
            className="group relative inline-flex h-12 min-w-40 items-center justify-center gap-2 overflow-hidden rounded-md bg-maroon px-7 text-sm font-semibold text-white transition-colors hover:bg-maroon-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:cursor-wait active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Spinner className="size-4" />
                Memeriksa…
              </>
            ) : (
              <>
                Masuk
                <LordIcon name="arrow-right" size={20} trigger="hover" target="button" colors="primary:#ffffff,secondary:#E6D3A1" />
              </>
            )}
            {loading && <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left animate-[login-bar_1.4s_ease-in-out_infinite] bg-gold" />}
          </button>
        </Magnetic>
        <button
          type="button"
          onClick={onHelp}
          className="text-sm text-navy/70 underline decoration-gold decoration-2 underline-offset-[6px] transition-colors hover:text-maroon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon/40"
        >
          Lupa kata sandi?
        </button>
      </div>
    </form>
  );
}
