"use client";
import { useEffect, useMemo, useState } from "react";
import { Modal, ModalContent, ModalDescription, ModalTitle } from "@/components/ui/modal";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { Spinner } from "@/components/ui/loader";
import { MovingBorder } from "@/components/home-studio/fx";
import { cn } from "@/lib/utils";

const GROUP = { person: "Identitas", curtain: "Tirai", hero: "Sampul", letter: "Surat", signature: "Tanda tangan", profile: "Profil", seo: "Meta" };
const KEY = {
  name: "Nama", credentials: "Gelar", role: "Jabatan", photo: "Foto", photoAlt: "Teks alternatif foto", enabled: "Tampilkan tirai", title: "Judul",
  accent: "Aksen", label: "Label", breadcrumb: "Breadcrumb", titleTop: "Judul", titleAccent: "Judul aksen", subtitle: "Subjudul", readLabel: "Tombol baca",
  profileLabel: "Tombol profil", showLottie: "Animasi Lottie", lottie: "Berkas Lottie", mascot: "Maskot", show: "Tampil", pose: "Pose", say: "Ucapan",
  banner: "Banner", variant: "Gaya", body: "Isi", linkLabel: "Label tautan", href: "Tautan", greeting: "Salam pembuka", paragraphs: "Paragraf", quote: "Kutipan",
  quoteAfter: "Posisi kutipan", closing: "Salam penutup", signOff: "Kalimat sebelum tanda tangan", progressLabels: "Label progres baca",
  profileButtonLabel: "Tombol profil", mode: "Jenis", viewBox: "Kanvas", paths: "Goresan", svgUrl: "Berkas", accentLast: "Goresan emas", intro: "Pengantar",
  researchLabel: "Judul riset", research: "Bidang riset", educationLabel: "Judul pendidikan", education: "Pendidikan", degree: "Gelar", place: "Kampus",
  certificationsLabel: "Judul sertifikasi", certifications: "Sertifikasi", contact: "Kontak", description: "Deskripsi",
};

const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
function flat(v, path = "", out = {}) {
  if (isObj(v)) for (const [k, x] of Object.entries(v)) flat(x, path ? `${path}.${k}` : k, out);
  else if (Array.isArray(v) && path !== "signature.paths" && v.every((x) => typeof x === "string")) v.forEach((x, i) => (out[`${path}.${i}`] = x));
  else out[path] = v;
  return out;
}

function labelOf(path) {
  const parts = path.split(".");
  const named = parts.slice(1).map((p) => (/^\d+$/.test(p) ? `${Number(p) + 1}` : KEY[p] ?? p));
  return { group: GROUP[parts[0]] ?? parts[0], field: named.join(" · ") || GROUP[parts[0]] };
}

/** Diff kata (LCS) → [{t, op: "=", "+", "-"}]. */
function wordDiff(a, b) {
  const A = String(a ?? "").split(/(\s+)/).filter(Boolean);
  const B = String(b ?? "").split(/(\s+)/).filter(Boolean);
  if (A.length * B.length > 160000) return [{ t: String(a ?? ""), op: "-" }, { t: String(b ?? ""), op: "+" }];
  const dp = Array.from({ length: A.length + 1 }, () => new Uint16Array(B.length + 1));
  for (let i = A.length - 1; i >= 0; i--) for (let j = B.length - 1; j >= 0; j--) dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out = [];
  let i = 0;
  let j = 0;
  while (i < A.length && j < B.length) {
    if (A[i] === B[j]) out.push({ t: A[i++], op: "=" }), j++;
    else if (dp[i + 1][j] >= dp[i][j + 1]) out.push({ t: A[i++], op: "-" });
    else out.push({ t: B[j++], op: "+" });
  }
  while (i < A.length) out.push({ t: A[i++], op: "-" });
  while (j < B.length) out.push({ t: B[j++], op: "+" });
  // teks yang hampir seluruhnya baru lebih mudah dibaca utuh: lama dicoret, lalu yang baru
  const same = out.filter((w) => w.op === "=" && w.t.trim()).length;
  const words = Math.max(A.filter((w) => w.trim()).length, B.filter((w) => w.trim()).length, 1);
  if (same / words < 0.4 && A.length && B.length) return [{ t: A.join(""), op: "-" }, { t: " → ", op: "=" }, { t: B.join(""), op: "+" }];
  return out;
}

const show = (v) => (typeof v === "boolean" ? (v ? "ya" : "tidak") : v == null || v === "" ? "—" : typeof v === "string" || typeof v === "number" ? String(v) : null);

export function diffDoc(value, live) {
  const a = flat(live ?? {});
  const b = flat(value ?? {});
  const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])];
  return keys
    .filter((k) => k !== "signature.viewBox" && JSON.stringify(a[k] ?? null) !== JSON.stringify(b[k] ?? null))
    .map((k) => ({ path: k, ...labelOf(k), before: a[k], after: b[k] }));
}

/** Modal terbit: perubahan ditampilkan sebagai "redline" per bab, lalu cap pos saat berhasil. */
export function PublishModal({ open, onOpenChange, value, live, onPublish }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const changes = useMemo(() => (open ? diffDoc(value, live) : []), [open, value, live]);
  const groups = useMemo(() => Object.entries(changes.reduce((m, c) => ((m[c.group] ??= []).push(c), m), {})), [changes]);

  useEffect(() => {
    if (open) {
      setDone(false);
      setBusy(false);
    }
  }, [open]);

  const go = async () => {
    setBusy(true);
    try {
      await onPublish();
      setDone(true);
      setTimeout(() => onOpenChange(false), 1800);
    } catch {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <ModalContent className="max-w-2xl p-0">
        {done ? (
          <div className="grid place-items-center px-8 py-14 text-center">
            <LottieIllustration src="/lottie/stamp.json" loop={false} className="w-40" />
            <ModalTitle className="mt-2 text-2xl">Surat terkirim</ModalTitle>
            <ModalDescription className="mt-1">Pengunjung kini membaca versi terbaru.</ModalDescription>
          </div>
        ) : (
          <>
            <div className="border-b border-line px-6 pb-4 pt-7 sm:px-8">
              <ModalTitle className="text-2xl">Terbitkan sambutan?</ModalTitle>
              <ModalDescription className="mt-1">
                {changes.length ? `${changes.length} perubahan dibanding versi yang sedang tayang.` : "Tidak ada perbedaan dengan versi tayang."}
              </ModalDescription>
            </div>
            <div className="max-h-[52vh] space-y-6 overflow-y-auto px-6 py-5 sm:px-8">
              {groups.map(([g, items]) => (
                <section key={g}>
                  <h3 className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-maroon">
                    <span className="h-px w-5 bg-gold" />
                    {g}
                  </h3>
                  <ul className="space-y-3">
                    {items.map((c) => (
                      <li key={c.path} className="rounded-lg bg-cream/70 px-4 py-3">
                        <p className="text-[12px] font-medium text-text/50">{c.field}</p>
                        <Redline before={c.before} after={c.after} />
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-line px-6 py-4 sm:px-8">
              <button type="button" disabled={busy} onClick={() => onOpenChange(false)} className="h-10 rounded-md border border-navy/20 px-4 text-sm font-semibold text-navy hover:border-navy">
                Nanti dulu
              </button>
              <MovingBorder onClick={go} disabled={busy || !changes.length} className="h-10" inner="px-5">
                {busy && <Spinner className="size-4" />}
                Terbitkan sekarang
              </MovingBorder>
            </div>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

function Redline({ before, after }) {
  const a = show(before);
  const b = show(after);
  if (a === null || b === null) return <p className="mt-1 text-sm text-navy">Diperbarui</p>;
  if (/^\/|^https?:/.test(b) && /\.(png|jpe?g|webp|avif|gif|svg)$/i.test(b))
    return (
      <div className="mt-2 flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {a !== "—" && <img src={a} alt="" className="size-12 rounded object-cover opacity-50 grayscale" />}
        <span className="text-text/40">→</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={b} alt="" className="size-12 rounded object-cover ring-2 ring-gold" />
      </div>
    );
  return (
    <p className="mt-1 text-[14px] leading-relaxed text-text/80">
      {wordDiff(a === "—" ? "" : a, b === "—" ? "" : b).map((w, i) => (
        <span
          key={i}
          className={cn(w.op === "-" && "text-maroon/70 line-through decoration-maroon/60", w.op === "+" && "rounded-sm bg-gold/25 text-navy")}
        >
          {w.t}
        </span>
      ))}
      {b === "—" && <span className="ml-1 text-[12px] text-text/40">(dikosongkan)</span>}
    </p>
  );
}
