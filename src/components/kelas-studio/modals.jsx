"use client";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { SECTIONS, keysOf } from "@/lib/program-kelas-cms/schema";
import { Modal, ModalContent, ModalDescription, ModalTitle } from "@/components/ui/modal";
import { LordIcon } from "@/components/media/lord-icon";
import { cn } from "@/lib/utils";

/** Ratakan objek → { "a.b.0": "teks" }. Array teks digabung supaya daftar terbaca utuh. */
function flatten(v, path = "", out = {}) {
  if (Array.isArray(v) && v.every((x) => typeof x !== "object")) out[path] = v.join(" · ");
  else if (Array.isArray(v)) v.forEach((x, i) => flatten(x, `${path}.${i}`, out));
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) flatten(x, path ? `${path}.${k}` : k, out);
  else out[path] = typeof v === "boolean" ? (v ? "ya" : "tidak") : String(v ?? "");
  return out;
}

/** Nama ramah untuk kunci isian di daftar perubahan. */
const WORD = {
  items: "", week: "blok", day: "hari", start: "mulai", end: "selesai", label: "label", kind: "jenis", title: "judul", body: "isi",
  rows: "baris", values: "sel", text: "teks", questions: "pertanyaan", options: "opsi", scores: "poin", points: "poin", q: "pertanyaan", a: "jawaban",
  name: "nama", short: "nama tab", tagline: "tagline", fee: "biaya", seats: "kuota", reason: "alasan kuis", highlights: "keunggulan", forWho: "cocok untuk", requirements: "persyaratan",
};
const pretty = (p) =>
  p
    .split(".")
    .slice(1)
    .map((x) => (/^\d+$/.test(x) ? `#${Number(x) + 1}` : WORD[x] ?? x))
    .filter(Boolean)
    .join(" › ");

function diffDoc(value, live) {
  const a = flatten(live);
  const b = flatten(value);
  const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])];
  return SECTIONS.map((s) => ({
    ...s,
    rows: keys.filter((k) => keysOf(s.key).includes(k.split(".")[0]) && (a[k] ?? "") !== (b[k] ?? "")).map((k) => ({ path: k, from: a[k] ?? "", to: b[k] ?? "" })),
  })).filter((s) => s.rows.length);
}

/** Jam dinding kelas; `ring` memicu jarum berputar ke angka 12 dan bel bergetar. */
function WallClock({ ring }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      if (!ring) {
        gsap.set("[data-min]", { rotate: 150, svgOrigin: "60 72" });
        gsap.set("[data-hour]", { rotate: 230, svgOrigin: "60 72" });
        if (!prefersReducedMotion()) gsap.to("[data-sec]", { rotate: "+=360", svgOrigin: "60 72", duration: 60, ease: "none", repeat: -1 });
        return;
      }
      if (prefersReducedMotion()) {
        gsap.set("[data-min],[data-hour]", { rotate: 360, svgOrigin: "60 72" });
        return;
      }
      gsap.timeline()
        .to("[data-min]", { rotate: 360, svgOrigin: "60 72", duration: 0.9, ease: "power3.inOut" })
        .to("[data-hour]", { rotate: 360, svgOrigin: "60 72", duration: 0.9, ease: "power3.inOut" }, "<")
        .to("[data-bell]", { rotate: 14, svgOrigin: "60 8", duration: 0.06, repeat: 9, yoyo: true, ease: "none" })
        .fromTo("[data-wave]", { scale: 0.6, opacity: 0.8, svgOrigin: "60 72" }, { scale: 1.3, opacity: 0, svgOrigin: "60 72", duration: 0.8, stagger: 0.15, ease: "power2.out" }, "<");
    }, ref.current);
    return () => ctx.revert();
  }, [ring]);
  return (
    <svg ref={ref} viewBox="0 0 120 132" className="h-28 w-28" aria-hidden>
      <g data-bell>
        <path d="M52 10h16l-2 6H54z" fill="var(--gold)" />
        <circle cx="60" cy="8" r="3" fill="var(--gold)" />
      </g>
      {[0, 1].map((i) => (
        <circle key={i} data-wave cx="60" cy="72" r="46" fill="none" stroke="var(--gold)" strokeWidth="2" opacity="0" />
      ))}
      <circle cx="60" cy="72" r="46" fill="#fffdf7" stroke="#14213d" strokeWidth="3" />
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1="60" y1="32" x2="60" y2={i % 3 ? 36 : 40} stroke="#14213d" strokeWidth={i % 3 ? 1.5 : 2.5} strokeLinecap="round" transform={`rotate(${i * 30} 60 72)`} />
      ))}
      <line data-hour x1="60" y1="72" x2="60" y2="50" stroke="#14213d" strokeWidth="4" strokeLinecap="round" />
      <line data-min x1="60" y1="72" x2="60" y2="38" stroke="#6e1423" strokeWidth="3" strokeLinecap="round" />
      <line data-sec x1="60" y1="78" x2="60" y2="36" stroke="var(--gold)" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="60" cy="72" r="3.5" fill="#6e1423" />
    </svg>
  );
}

/**
 * Modal terbit "Bel masuk": jam dinding berdetak sementara admin meninjau perubahan per bagian;
 * saat diterbitkan jarum berputar ke angka 12 dan bel berdering.
 */
export function BellModal({ open, onOpenChange, value, live, redundancy = [], onPublish, onJump, by }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const changes = useMemo(() => (open ? diffDoc(value, live) : []), [open, value, live]);
  const total = changes.reduce((n, s) => n + s.rows.length, 0);

  const go = async () => {
    setBusy(true);
    try {
      await onPublish();
      setDone(true);
      setTimeout(() => {
        onOpenChange(false);
        setDone(false);
      }, 1800);
    } catch {
      // toast dikirim pemanggil
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <ModalContent className="max-w-2xl overflow-hidden border-0 bg-[#fffdf7] p-0 sm:p-0" hideClose>
        <div className="grid sm:grid-cols-[180px_1fr]">
          <div className="relative flex flex-col items-center justify-center gap-3 bg-navy px-6 py-8 text-center text-white">
            <WallClock ring={done} />
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-soft">{done ? "Bel berbunyi" : "Menunggu bel"}</p>
            <p className="text-[12px] text-white/55">{done ? "Versi baru tayang." : "Tinjau sebelum kelas dimulai."}</p>
          </div>
          <div className="max-h-[86vh] overflow-y-auto px-6 pb-6 pt-7 sm:px-8">
            <ModalTitle className="font-serif text-[1.75rem] leading-tight text-navy">
              Terbitkan <em className="text-maroon">jadwal</em>
            </ModalTitle>
            <ModalDescription className="mt-1 text-[13px] text-text/60">
              {total ? `${total} perubahan di ${changes.length} bagian akan langsung terlihat pengunjung.` : "Tidak ada perubahan dibanding versi tayang."}
            </ModalDescription>

            {redundancy.length > 0 && (
              <div className="mt-4 rounded-md border border-orange-200 bg-orange-50 px-4 py-3 text-[13px] text-orange-900">
                <p className="font-semibold">{redundancy.length} kalimat kembar masih ada</p>
                <ul className="mt-1 space-y-1">
                  {redundancy.slice(0, 3).map((r, i) => (
                    <li key={i}>
                      <button type="button" onClick={() => (onOpenChange(false), onJump(r.b.path))} className="text-left underline decoration-orange-400 underline-offset-2">
                        {r.a.label} ↔ {r.b.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-5 max-h-[40vh] min-h-12 space-y-4 overflow-y-auto pr-1">
              {changes.map((s, si) => (
                <section key={s.key}>
                  <p className="flex items-center gap-2 text-[13px] font-semibold text-navy">
                    <span className="grid size-5 place-items-center rounded-full bg-gold/25 text-[10.5px] tabular-nums text-navy">{si + 1}</span>
                    {s.label}
                    <span className="text-[11px] font-normal text-text/45">{s.rows.length} isian</span>
                  </p>
                  <ul className="mt-2 space-y-1.5 border-l-2 border-dashed border-navy/10 pl-4">
                    {s.rows.slice(0, 6).map((r) => (
                      <li key={r.path} className="text-[12.5px] leading-relaxed">
                        <span className="block text-[10.5px] uppercase tracking-[0.12em] text-text/40">{pretty(r.path) || s.label}</span>
                        {r.from && <span className="block text-text/45 line-through decoration-maroon/40">{r.from.slice(0, 140)}</span>}
                        <span className="block text-navy">{r.to ? r.to.slice(0, 140) : <em className="text-text/40">dihapus</em>}</span>
                      </li>
                    ))}
                    {s.rows.length > 6 && <li className="text-[12px] text-text/45">+ {s.rows.length - 6} perubahan lain</li>}
                  </ul>
                </section>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-navy/10 pt-4">
              <p className="text-[12.5px] text-text/50">Oleh {by || "Admin"}</p>
              <div className="flex gap-2">
                <button type="button" disabled={busy} onClick={() => onOpenChange(false)} className="rounded-md px-4 py-2 text-[13px] font-semibold text-navy hover:bg-navy/5">
                  Batal
                </button>
                <button
                  type="button"
                  disabled={busy || !total || done}
                  onClick={go}
                  className="lord-bell inline-flex items-center gap-2 rounded-md bg-maroon px-5 py-2 text-[13px] font-semibold text-white transition-[background-color,transform] hover:bg-maroon-deep active:scale-95 disabled:opacity-40"
                >
                  <LordIcon name="check" size={18} trigger="hover" target=".lord-bell" colors="primary:#ffffff,secondary:#e6d3a1" />
                  {busy ? "Menerbitkan…" : done ? "Tayang" : "Bunyikan bel"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}

const fmt = (d) => (d ? new Date(d).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—");

/** Riwayat: semester-semester terbitan sebagai baris jadwal; pulihkan satu ke draf. */
export function HistoryModal({ open, onOpenChange, history = [], publishedAt, publishedBy, onRestore }) {
  const [busy, setBusy] = useState(null);
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-lg bg-[#fffdf7]">
        <ModalTitle className="font-serif text-2xl text-navy">
          Arsip <em className="text-maroon">jadwal</em>
        </ModalTitle>
        <ModalDescription className="text-text/60">Lima versi terakhir disimpan. Memulihkan hanya mengisi draf; terbitkan untuk menayangkannya.</ModalDescription>
        <ol className="mt-4 divide-y divide-navy/10 rounded-md border border-navy/10 bg-white">
          <li className="flex items-center gap-3 px-4 py-3">
            <span aria-hidden className="size-3 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgb(16_185_129/0.15)]" />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-navy">Sedang tayang</p>
              <p className="text-[12px] text-text/50">
                {fmt(publishedAt)} · {publishedBy || "belum pernah terbit"}
              </p>
            </div>
          </li>
          {history.map((h, i) => (
            <li key={h.index} className="group flex items-center gap-3 px-4 py-3">
              <span className="w-5 text-[12px] tabular-nums text-text/35">{String(i + 1).padStart(2, "0")}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] text-navy">{fmt(h.publishedAt)}</p>
                <p className="text-[12px] text-text/45">{h.publishedBy || "Admin"}</p>
              </div>
              <button
                type="button"
                disabled={busy != null}
                onClick={async () => {
                  setBusy(h.index);
                  try {
                    await onRestore(h.index);
                    onOpenChange(false);
                  } catch {
                  } finally {
                    setBusy(null);
                  }
                }}
                className={cn("rounded-md border border-navy/15 px-3 py-1 text-[12px] font-semibold text-navy transition-colors hover:border-maroon hover:bg-maroon hover:text-white disabled:opacity-40")}
              >
                {busy === h.index ? "Memulihkan…" : "Pulihkan"}
              </button>
            </li>
          ))}
          {!history.length && <li className="px-4 py-6 text-center text-[13px] text-text/45">Belum ada versi lama.</li>}
        </ol>
      </ModalContent>
    </Modal>
  );
}
