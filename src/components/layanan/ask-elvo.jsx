"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { Container, SceneTitle } from "@/components/home/shared";
import { DotsLoader } from "@/components/ui/loader";
import { cn } from "@/lib/utils";
import { smoothTo, useLayanan } from "./layanan-provider";

const GREETING = "Halo! Aku Elvo. Pilih pertanyaan di samping, nanti kujawab sesuai aturan layanan prodi.";

function Words({ text }) {
  const reduce = useReducedMotion();
  if (reduce) return text;
  return text.split(" ").map((w, i) => (
    <motion.span key={i} initial={{ opacity: 0, filter: "blur(4px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} transition={{ delay: i * 0.035, duration: 0.25 }} className="inline">
      {w}{" "}
    </motion.span>
  ));
}

/**
 * Penutup "Tanya Elvo": FAQ bergaya obrolan. Klik pertanyaan → gelembung pengguna, Elvo "mengetik" (DotsLoader),
 * jawaban muncul per kata. Jawaban bisa membawa tombol aksi (buka wizard dengan layanan terpilih / ke pelacak).
 * Di bawahnya tiga tautan lanjutan ke halaman akademik terkait. Tanpa CTA PMB.
 */
export function AskElvo() {
  const { faq, openWizard } = useLayanan();
  const [thread, setThread] = useState([{ from: "elvo", text: GREETING, id: 0 }]);
  const [typing, setTyping] = useState(false);
  const [asked, setAsked] = useState([]);
  const box = useRef(null);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    const el = box.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [thread, typing]);

  const ask = (i) => {
    if (typing) return;
    const item = faq[i];
    setAsked((a) => (a.includes(i) ? a : [...a, i]));
    setThread((t) => [...t, { from: "me", text: item.q, id: Date.now() }]);
    setTyping(true);
    timer.current = setTimeout(() => {
      setTyping(false);
      setThread((t) => [...t, { from: "elvo", text: item.a, action: item.action, id: Date.now() + 1 }]);
    }, 650 + Math.min(item.a.length * 4, 700));
  };

  const act = (a) => {
    if (a.type === "apply") openWizard({ serviceKey: a.service });
    else if (a.type === "track") smoothTo("lacak");
    else if (a.href) location.href = a.href;
  };

  const links = [
    { href: "/regulasi-akademik#prosedur", kicker: "Cuti, sakit, atau terlambat", title: "Prosedur akademik lengkap" },
    { href: "/jalur-kelulusan", kicker: "Menjelang tugas akhir", title: "Pilih jalur kelulusanmu" },
    { href: "/konversi-sks#kalkulator", kicker: "Kegiatan luar kampus", title: "Hitung SKS yang bisa diakui" },
  ];

  return (
    <section className="relative border-t border-line bg-cream pb-20 pt-16 md:pb-24 md:pt-24">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          <div>
            <span aria-hidden className="mb-5 block h-[3px] w-10 bg-gold" />
            <SceneTitle title={["Masih ragu?", "Tanya Elvo"]} />
            <p className="mt-4 max-w-md text-[16px] leading-relaxed text-text/65">Pertanyaan yang paling sering sampai ke loket, dijawab singkat.</p>
            <ul className="mt-7 flex flex-col items-start gap-2">
              {faq.map((f, i) => (
                <li key={f.q}>
                  <button
                    type="button"
                    onClick={() => ask(i)}
                    disabled={typing}
                    className={cn(
                      "group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-left text-[14px] font-medium transition-[background-color,border-color,color,transform] duration-300 ease-cinematic hover:-translate-y-0.5 disabled:cursor-wait",
                      asked.includes(i) ? "border-line bg-white/60 text-text/50" : "border-navy/15 bg-white text-navy hover:border-maroon/40 hover:text-maroon"
                    )}
                  >
                    {f.q}
                    <svg aria-hidden viewBox="0 0 16 16" className="size-3.5 opacity-50 transition-transform duration-300 group-hover:translate-x-0.5">
                      <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* jendela obrolan */}
          <div className="flex h-[460px] flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-[0_30px_60px_-40px_rgb(20_33_61/0.6)]" data-aos="fade-up">
            <div className="flex items-center gap-3 border-b border-line bg-maroon px-5 py-3.5 text-white">
              <span className="relative size-10 overflow-hidden rounded-full bg-cream">
                <Image src="/mascot/elvo-wave.webp" alt="" width={605} height={720} className="absolute -bottom-1 left-1/2 h-[120%] w-auto max-w-none -translate-x-1/2" />
              </span>
              <div>
                <p className="text-[14.5px] font-semibold">Si Elvo</p>
                <p className="flex items-center gap-1.5 text-[12px] text-white/65">
                  <span className="size-1.5 rounded-full bg-gold" />
                  {typing ? "sedang mengetik…" : "asisten layanan prodi"}
                </p>
              </div>
            </div>
            <div ref={box} className="flex-1 space-y-3 overflow-y-auto px-4 py-5 sm:px-5" aria-live="polite">
              {thread.map((m) => (
                <div key={m.id} className={cn("la-bubble-in flex", m.from === "me" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5 text-[14.5px] leading-relaxed",
                      m.from === "me" ? "rounded-br-md bg-navy text-white" : "rounded-bl-md bg-cream text-text/85"
                    )}
                  >
                    {m.from === "elvo" && m.id !== 0 ? <Words text={m.text} /> : m.text}
                    {m.action && (
                      <button type="button" onClick={() => act(m.action)} className="mt-2 flex items-center gap-1.5 text-[13px] font-semibold text-maroon">
                        <span className="u-gold">{m.action.label}</span>
                        <svg aria-hidden viewBox="0 0 16 16" className="size-3.5">
                          <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="la-bubble-in flex">
                  <span className="rounded-2xl rounded-bl-md bg-cream px-4 py-3">
                    <DotsLoader className="text-maroon [&>span]:size-1.5" />
                  </span>
                </div>
              )}
            </div>
            <p className="border-t border-line px-5 py-3 text-[12px] text-text/45">Jawaban otomatis. Untuk kasusmu sendiri, ajukan layanan Janji Temu dengan Kaprodi.</p>
          </div>
        </div>

        <ul className="mt-16 grid border-t border-navy/10 md:grid-cols-3">
          {links.map((l, i) => (
            <li key={l.href} className="border-b border-navy/10 md:border-b-0 md:border-r md:last:border-r-0" data-aos="fade-up" data-aos-delay={i * 80}>
              <a href={l.href} className="group flex h-full items-center gap-4 py-6 md:px-6 md:first:pl-0">
                <span className="min-w-0 flex-1">
                  <span className="kicker block text-[11px] text-maroon">{l.kicker}</span>
                  <span className="mt-1.5 block font-serif text-[1.3rem] leading-tight text-navy transition-transform duration-500 ease-cinematic group-hover:translate-x-1">{l.title}</span>
                </span>
                <span className="grid size-10 shrink-0 place-items-center rounded-full border border-navy/15 text-maroon transition-[background-color,border-color,color,transform] duration-500 ease-cinematic group-hover:-rotate-45 group-hover:border-maroon group-hover:bg-maroon group-hover:text-white">
                  <svg aria-hidden viewBox="0 0 16 16" className="size-4">
                    <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
