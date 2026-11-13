"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { useToast } from "@/components/ui/toast";
import { Banner } from "@/components/ui/banner";
import { BrandLoader } from "@/components/ui/loader";
import { AosReady } from "@/components/motion/aos-provider";
import { LoginStage } from "@/components/login/login-stage";
import { LoginForm } from "@/components/login/login-form";
import { HelpModal } from "@/components/login/help-modal";

function strengthOf(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.max(s, 1);
}

export function LoginShell() {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const formRef = useRef(null);
  const curtain = useRef(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fails, setFails] = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [help, setHelp] = useState(false);
  const [verdict, setVerdict] = useState(null); // 'fail' sementara setelah gagal

  const expired = params.get("expired") === "1" || params.has("callbackUrl");
  const status = done ? "ok" : loading ? "checking" : verdict ?? (email || password ? "typing" : "idle");

  // gagal → kembali ke "typing" begitu pengguna mengetik lagi
  useEffect(() => {
    if (verdict) setVerdict(null);
  }, [email, password]); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    if (!done) return;
    const el = curtain.current;
    if (prefersReducedMotion()) {
      gsap.set(el, { clipPath: "inset(0 0 0 0)" });
      return;
    }
    gsap.fromTo(el, { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 0.9, ease: "expo.inOut" });
  }, [done]);

  const fail = (msg) => {
    setError(msg);
    setVerdict("fail");
    setFails((n) => n + 1);
    toast.error("Gagal masuk", { description: msg });
    if (!prefersReducedMotion() && formRef.current) {
      gsap.fromTo(formRef.current, { x: -14 }, { x: 0, duration: 0.6, ease: "elastic.out(1, 0.3)" });
    }
    formRef.current?.querySelector("input[name=password]")?.focus();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading || done) return;
    setError("");
    if (!email.trim() || !password) {
      fail("Isi email dan kata sandi lebih dulu.");
      return;
    }
    setLoading(true);
    try {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) {
        fail("Email atau kata sandi tidak cocok.");
        return;
      }
      setDone(true);
      toast.success("Selamat datang kembali", { description: "Membuka dashboard…" });
      setTimeout(() => {
        router.push("/admin/dashboard");
        router.refresh();
      }, prefersReducedMotion() ? 500 : 1700);
    } catch {
      fail("Server tidak merespons. Coba lagi sebentar lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="kampus min-h-dvh" data-aos-wait>
      <div className="grid min-h-dvh lg:grid-cols-[5fr_7fr]">
        <LoginStage status={status} strength={strengthOf(password)} email={email} />

        <main className="relative flex flex-col px-6 py-8 sm:px-12 lg:px-20 lg:py-10">
          <div data-aos="fade" className="flex justify-end">
            <Link href="/" className="u-gold text-sm text-navy/70 hover:text-maroon">
              Kembali ke situs
            </Link>
          </div>

          <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-10">
            <h1 data-aos="fade-up" className="font-serif text-4xl leading-[1.1] text-navy sm:text-5xl">
              Masuk, <span className="italic text-maroon">kelola isinya</span>
            </h1>
            <span data-aos="fade-up" data-aos-delay="80" className="mt-5 block h-0.5 w-12 bg-gold" />

            {expired && (
              <div data-aos="fade-up" data-aos-delay="120" className="mt-8">
                <Banner variant="info" dismissible>
                  Sesi sebelumnya sudah berakhir. Masuk lagi untuk melanjutkan.
                </Banner>
              </div>
            )}

            <div data-aos="fade-up" data-aos-delay="160" className="mt-8">
              <LoginForm
                formRef={formRef}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                error={error}
                loading={loading}
                busy={loading || done}
                capsOn={capsOn}
                setCapsOn={setCapsOn}
                onSubmit={onSubmit}
                onHelp={() => setHelp(true)}
              />
            </div>

            {fails >= 3 && (
              <div className="mt-6">
                <Banner variant="warning" action={<button onClick={() => setHelp(true)} className="font-semibold underline underline-offset-4">Lihat caranya</button>}>
                  Sudah {fails} kali gagal. Butuh bantuan memulihkan akun?
                </Banner>
              </div>
            )}
          </div>
        </main>
      </div>

      <HelpModal open={help} onOpenChange={setHelp} />

      {done && (
        <div ref={curtain} className="fixed inset-0 z-[100] grid place-items-center bg-paper" style={{ clipPath: "inset(100% 0 0 0)" }}>
          <BrandLoader label="Membuka dashboard…" />
        </div>
      )}
      <AosReady />
    </div>
  );
}
