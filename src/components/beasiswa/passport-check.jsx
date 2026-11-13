"use client";
import { useLayoutEffect as useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { prefersReducedMotion } from "@/lib/motion";
import { ACHIEVEMENT, DEFAULT_PASSPORT, INCOME, KELAS, rupiahLess } from "@/lib/beasiswa-content";
import { Container, SectionHeader } from "@/components/home/shared";
import { SpotlightCard } from "@/components/aceternity/spotlight-card";
import { Banner } from "@/components/ui/banner";
import { ConfirmModal } from "@/components/ui/modal";
import { DotsLoader } from "@/components/ui/loader";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { useBeasiswa } from "./beasiswa-provider";

const STATUS = {
  layak: { label: "Layak" },
  hampir: { label: "Hampir" },
  belum: { label: "Belum" },
};
/** IPK minimum yang paling umum diminta untuk mempertahankan beasiswa. */
const KEEP_IPK = 2.75;
const SHAPES = ["circle", "rect", "oval"];

function Field({ label, children, hint }) {
  return (
    <div className="bs-field">
      <span className="bs-field-label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11.5px] text-text/45">{hint}</span>}
    </div>
  );
}

function Choice({ name, value, options, onChange }) {
  return (
    <div role="radiogroup" aria-label={name} className="mt-1.5 flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          role="radio"
          aria-checked={value === o.key}
          onClick={() => onChange(o.key)}
          className={cn("bs-choice", value === o.key && "bs-choice-on")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Satu cap visa. Saat status berubah, cap "dicap ulang" (anime.js: jatuh dari besar, miring, getar kecil). */
function Stamp({ s, result, inked, index, onOpen }) {
  const ref = useRef(null);
  const prev = useRef(null);
  const key = inked ? result.status : "kosong";

  useEffect(() => {
    const el = ref.current;
    if (!el || prev.current === key) return;
    const first = prev.current === null;
    prev.current = key;
    if (first || !inked || prefersReducedMotion()) return;
    const a = animate(el.querySelector("[data-ink]"), {
      scale: [1.7, 0.94, 1],
      opacity: [0, 1],
      rotate: [`${(index % 2 ? 1 : -1) * 18}deg`, `${(index % 2 ? 1 : -1) * 6}deg`],
      duration: 620,
      ease: "outQuart",
    });
    const b = animate(el, { translateX: [0, -2, 2, -1, 0], duration: 260, delay: 300, ease: "linear" });
    return () => {
      a.revert();
      b.revert();
    };
  }, [key, inked, index]);

  const st = STATUS[result.status];
  return (
    <li ref={ref}>
      <button
        type="button"
        onClick={() => onOpen(s.slug)}
        aria-label={`${s.name}: ${inked ? st.label : "belum dicek"}${inked && result.gap ? `, ${result.gap}` : ""}. Buka rincian`}
        className="group block w-full text-left"
      >
        <span
          data-ink
          className={cn("bs-stamp", `bs-stamp-${SHAPES[index % 3]}`, inked ? `bs-stamp-${result.status}` : "bs-stamp-empty")}
          style={{ "--tilt": `${(index % 2 ? 1 : -1) * 6}deg` }}
        >
          <span className="bs-stamp-name">{s.name}</span>
          <span className="bs-stamp-status">{inked ? st.label : "—"}</span>
        </span>
        <span className="mt-2 block min-h-[2.4em] text-center text-[11.5px] leading-snug text-white/60 transition-colors group-hover:text-white">
          {inked ? (result.status === "layak" ? `Bisa daftar · ${rupiahLess(s)}` : result.gap) : null}
        </span>
      </button>
    </li>
  );
}

/**
 * Paspor kelayakan `#cek`. Buku navy terbuka: halaman kiri (cream) isian data diri bergaris paspor,
 * halaman kanan (navy, SpotlightCard) cap visa per beasiswa — Layak / Hampir (sebut syarat yang kurang) / Belum.
 * Perubahan isian → jeda 300 ms + DotsLoader → cap yang statusnya berubah dicap ulang.
 * Disimpan di perangkat (localStorage), tidak dikirim ke server. Ponsel: halaman ditumpuk.
 */
export function PassportCheck() {
  const { items, passport, setPassport, clearPassport, results, open } = useBeasiswa();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [shown, setShown] = useState(results);
  const [confirm, setConfirm] = useState(false);
  const [ipkText, setIpkText] = useState(null);
  const p = passport ?? DEFAULT_PASSPORT;
  const inked = Boolean(passport);

  useEffect(() => {
    if (!inked) {
      setShown(results);
      return;
    }
    setBusy(true);
    const id = setTimeout(() => {
      setShown(results);
      setBusy(false);
    }, 300);
    return () => clearTimeout(id);
  }, [results, inked]);

  const counts = items.reduce((acc, s) => ((acc[shown[s.slug]?.status] = (acc[shown[s.slug]?.status] ?? 0) + 1), acc), {});
  const ipkValue = ipkText ?? p.ipk.toFixed(2).replace(".", ",");

  const commitIpk = (text) => {
    const v = Number(String(text).replace(",", "."));
    setIpkText(null);
    if (!Number.isFinite(v) || v < 0 || v > 4) {
      toast.warning("IPK di luar rentang", { description: "Tulis angka 0,00 sampai 4,00." });
      return;
    }
    setPassport({ ipk: v });
  };

  return (
    <section id="cek" className="relative scroll-mt-24 py-20 md:py-28">
      <Container>
        <SectionHeader
          title={["Paspor", "kelayakanmu"]}
          body="Isi lima kolom di halaman kiri. Halaman kanan langsung dicap: mana yang bisa kamu daftar sekarang, mana yang tinggal sedikit lagi."
        />

        <div className="bs-passport mt-12 md:mt-16">
          {/* halaman kiri — data diri */}
          <div className="bs-page-left">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="kicker block text-[10.5px] text-maroon">Paspor beasiswa · SISFOR</span>
                <p className="mt-1 font-serif text-[1.4rem] leading-tight text-navy">Data pemegang</p>
              </div>
              <span aria-hidden className="bs-photo">
                <svg viewBox="0 0 48 56" className="h-full w-full text-navy/35">
                  <circle cx="24" cy="20" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 52c2-11 9-17 16-17s14 6 16 17" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </span>
            </div>

            <div className="mt-6 grid gap-5">
              <div className="grid gap-5 sm:grid-cols-[1fr_1.4fr]">
                <Field label="IPK terakhir" hint="Skala 4,00">
                  <input
                    inputMode="decimal"
                    aria-label="IPK terakhir"
                    value={ipkValue}
                    onChange={(e) => setIpkText(e.target.value.replace(/[^\d.,]/g, "").slice(0, 4))}
                    onBlur={(e) => commitIpk(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitIpk(e.currentTarget.value);
                      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                        e.preventDefault();
                        setIpkText(null);
                        setPassport({ ipk: Math.min(4, Math.max(0, p.ipk + (e.key === "ArrowUp" ? 0.05 : -0.05))) });
                      }
                    }}
                    className="bs-input tabular"
                  />
                </Field>
                <Field label="Semester berjalan">
                  <div role="radiogroup" aria-label="Semester berjalan" className="mt-1.5 grid grid-cols-8 gap-1">
                    {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
                      <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={p.semester === n}
                        onClick={() => setPassport({ semester: n })}
                        className={cn("bs-box tabular", p.semester === n && "bs-box-on", n < p.semester && "bs-box-past")}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
              <Field label="Penghasilan orang tua / bulan">
                <Choice name="Penghasilan orang tua per bulan" value={p.income} options={INCOME} onChange={(v) => setPassport({ income: v })} />
              </Field>
              <Field label="Prestasi tertinggi">
                <Choice name="Prestasi tertinggi" value={p.achievement} options={ACHIEVEMENT} onChange={(v) => setPassport({ achievement: v })} />
              </Field>
              <Field label="Kelas">
                <Choice name="Kelas" value={p.kelas} options={KELAS} onChange={(v) => setPassport({ kelas: v })} />
              </Field>
            </div>

            {inked && p.ipk < KEEP_IPK && (
              <Banner variant="warning" title="IPK di bawah batas bertahan" className="mt-6">
                Sebagian besar beasiswa meminta IPK minimal 2,75 selama menerima. Bicarakan rencana studimu dengan dosen wali.
              </Banner>
            )}

            <div className="bs-mrz mt-7" aria-hidden>
              {`P<SISFOR<<${p.kelas.toUpperCase()}<<IPK${p.ipk.toFixed(2).replace(".", "")}<<S${p.semester}<<<<<<<`.slice(0, 44)}
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[12.5px] text-text/55">
              <span>Tersimpan di perangkat ini saja, tidak dikirim ke server.</span>
              {inked && (
                <button type="button" onClick={() => setConfirm(true)} className="font-semibold text-maroon">
                  <span className="u-gold">Hapus data paspor</span>
                </button>
              )}
            </div>
          </div>

          {/* halaman kanan — cap visa */}
          <SpotlightCard className="bs-page-right">
            <span aria-hidden className="pointer-events-none absolute -z-10 size-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/15 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" style={{ left: "var(--mx, 50%)", top: "var(--my, 50%)" }} />
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="kicker block text-[10.5px] text-gold-soft">Halaman visa</span>
                <p aria-live="polite" className="mt-1 font-serif text-[1.4rem] leading-tight text-white">
                  {inked ? (
                    <>
                      <em className="italic text-gold-soft">{counts.layak ?? 0} layak</em>, {counts.hampir ?? 0} hampir
                    </>
                  ) : (
                    "Menunggu data pemegang"
                  )}
                </p>
              </div>
              <span className={cn("transition-opacity duration-200", busy ? "opacity-100" : "opacity-0")}>
                <DotsLoader className="text-gold" />
              </span>
            </div>
            <ul className={cn("mt-7 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3", busy && "bs-stamps-busy")}>
              {items.map((s, i) => (
                <Stamp key={s.slug} s={s} index={i} result={shown[s.slug] ?? results[s.slug]} inked={inked} onOpen={open} />
              ))}
            </ul>
            {!inked && (
              <button
                type="button"
                onClick={() => setPassport({})}
                className="mt-8 inline-flex h-11 items-center rounded-md bg-gold px-5 text-sm font-semibold text-navy transition-[background-color,transform] duration-300 hover:bg-gold-soft active:scale-[0.97]"
              >
                Cap dengan isian contoh
              </button>
            )}
          </SpotlightCard>
        </div>
      </Container>

      <ConfirmModal
        open={confirm}
        onOpenChange={setConfirm}
        title="Hapus data paspor?"
        description="Isian IPK, semester, penghasilan, prestasi, dan kelas dihapus dari perangkat ini. Dompet beasiswamu tidak ikut terhapus."
        confirmLabel="Ya, hapus"
        destructive
        onConfirm={() => {
          clearPassport();
          setConfirm(false);
          toast.info("Data paspor dihapus", { description: "Cap di halaman visa dikosongkan." });
        }}
      />
    </section>
  );
}
