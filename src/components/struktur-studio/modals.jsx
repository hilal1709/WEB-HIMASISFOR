"use client";
import { useState } from "react";
import { ExternalLink, History, Loader2 } from "lucide-react";
import { Modal, ModalContent, ModalDescription, ModalTitle } from "@/components/ui/modal";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { LAYERS, changedLayers, rosterDiff } from "@/lib/struktur-cms/schema";
import { cn } from "@/lib/utils";
import { Face } from "./canvas";

const SHELL = "max-w-xl border-white/10 bg-[#0f1830] p-0 text-white [&>button]:text-white/50 [&>button:hover]:bg-white/10 [&>button:hover]:text-white";

const fmt = (iso) => (iso ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso)) : "—");

/** Tumpukan wajah bertumpuk + label; maks. 6 wajah, sisanya angka. */
function Stack({ label, people, tone, note }) {
  if (!people.length) return null;
  return (
    <li className="flex items-center gap-3 py-2.5">
      <span className="flex -space-x-2.5">
        {people.slice(0, 6).map((p) => (
          <span key={p.key} className="rounded-xl ring-2 ring-[#0f1830]" title={p.name}>
            <Face p={p} size={32} />
          </span>
        ))}
        {people.length > 6 && <span className="grid size-8 place-items-center rounded-xl bg-white/10 text-[11px] ring-2 ring-[#0f1830]">+{people.length - 6}</span>}
      </span>
      <span className="min-w-0">
        <span className={cn("block text-[13px] font-medium", tone)}>
          {label} · {people.length}
        </span>
        <span className="block truncate text-[12px] text-white/45">{note ?? people.map((p) => p.name).join(", ")}</span>
      </span>
    </li>
  );
}

/**
 * "Rapat pengesahan": ringkasan bergaya agenda rapat sebelum terbit — perubahan susunan orang
 * (bergabung, pindah, diperbarui, keluar), lapisan teks yang berubah, dan catatan pemeriksa.
 * Setelah sah: stempel Lottie lalu tautan ke halaman publik.
 */
export function PublishModal({ open, onOpenChange, live, value, lint, issues, onPublish }) {
  const [phase, setPhase] = useState("review"); // review | sending | done
  const roster = rosterDiff(live?.people, value?.people);
  const layers = changedLayers(live, value).filter((k) => k !== "people");
  const notes = (lint?.length ?? 0) + (issues?.length ?? 0);

  const close = (o) => {
    if (phase === "sending") return;
    onOpenChange(o);
    if (!o) setTimeout(() => setPhase("review"), 300);
  };

  const go = async () => {
    setPhase("sending");
    try {
      await onPublish();
      setPhase("done");
    } catch {
      setPhase("review");
    }
  };

  return (
    <Modal open={open} onOpenChange={close}>
      <ModalContent className={SHELL} hideClose={phase === "sending"}>
        {phase === "done" ? (
          <div className="px-8 pb-8 pt-10 text-center">
            <div className="mx-auto size-40">
              <LottieIllustration src="/lottie/stamp-dark.json" loop={false} label="Stempel sah" />
            </div>
            <ModalTitle className="mt-2 font-serif text-[1.7rem] text-white">Sah, sudah terbit</ModalTitle>
            <ModalDescription className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-white/55">
              Pengunjung yang sedang membuka halaman struktur, dosen, dan bidang keahlian langsung melihat versi ini.
            </ModalDescription>
            <div className="mt-7 flex justify-center gap-2">
              <a href="/struktur-organisasi" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-[13.5px] font-semibold text-navy transition-transform active:scale-95">
                Lihat halaman <ExternalLink className="size-3.5" />
              </a>
              <button type="button" onClick={() => close(false)} className="rounded-xl border border-white/15 px-4 py-2.5 text-[13.5px] text-white/80 hover:bg-white/5">
                Kembali bekerja
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="px-7 pb-2 pt-8">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-gold-soft/80">Rapat pengesahan</p>
              <ModalTitle className="mt-2 font-serif text-[1.6rem] leading-tight text-white">Sahkan susunan baru?</ModalTitle>
              <ModalDescription className="mt-1.5 text-[13.5px] text-white/50">Tinjau agenda berikut sebelum versi ini tampil untuk pengunjung.</ModalDescription>
            </div>

            <ol className="max-h-[56vh] space-y-1 overflow-y-auto px-7 py-4">
              <Agenda n={1} title="Susunan orang">
                {roster.total === 0 ? (
                  <p className="text-[13px] text-white/45">Tidak ada orang yang berubah.</p>
                ) : (
                  <ul className="divide-y divide-white/[0.06]">
                    <Stack label="Bergabung" people={roster.added} tone="text-[#7ad3a8]" />
                    <Stack
                      label="Pindah posisi"
                      people={roster.moved.map((m) => m.person)}
                      tone="text-gold-soft"
                      note={roster.moved.map((m) => `${m.person.name} → ${m.person.group === "staff" ? "jalur staf" : m.to?.name ?? "puncak"}`).join(" · ")}
                    />
                    <Stack label="Diperbarui" people={roster.edited} tone="text-[#9db4ef]" />
                    <Stack label="Keluar" people={roster.removed} tone="text-[#ff9aa8]" />
                  </ul>
                )}
              </Agenda>
              <Agenda n={2} title="Bagian teks">
                {layers.length ? (
                  <ul className="flex flex-wrap gap-1.5">
                    {layers.map((k) => (
                      <li key={k} className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[12.5px] text-white/80">
                        {LAYERS.find((l) => l.key === k)?.label ?? k}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[13px] text-white/45">Tidak ada teks yang berubah.</p>
                )}
              </Agenda>
              <Agenda n={3} title="Catatan pemeriksa" warn={notes > 0}>
                {notes === 0 ? (
                  <p className="text-[13px] text-white/45">Tidak ada kalimat berulang atau data yang kurang.</p>
                ) : (
                  <ul className="space-y-1.5 text-[12.5px] text-white/65">
                    {lint.slice(0, 4).map((r, i) => (
                      <li key={i}>
                        <span className="text-[#f0c27a]">Mirip:</span> {r.a.label} ↔ {r.b.label}
                      </li>
                    ))}
                    {issues.slice(0, 4).map((x) => (
                      <li key={x.path}>
                        <span className="text-[#f0c27a]">Kurang:</span> {x.label}
                      </li>
                    ))}
                    <li className="pt-1 text-white/40">Catatan tidak menghalangi penerbitan.</li>
                  </ul>
                )}
              </Agenda>
            </ol>

            <div className="flex items-center justify-end gap-2 border-t border-white/[0.07] bg-white/[0.02] px-7 py-4">
              <button type="button" onClick={() => close(false)} disabled={phase === "sending"} className="rounded-xl px-4 py-2.5 text-[13.5px] text-white/65 hover:bg-white/5 disabled:opacity-40">
                Tunda
              </button>
              <button
                type="button"
                onClick={go}
                disabled={phase === "sending"}
                className="inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-2.5 text-[13.5px] font-semibold text-navy transition-[transform,background-color] hover:bg-gold-soft active:scale-95 disabled:opacity-70"
              >
                {phase === "sending" && <Loader2 className="size-4 animate-spin" />}
                {phase === "sending" ? "Mengesahkan…" : "Sahkan & terbitkan"}
              </button>
            </div>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

function Agenda({ n, title, warn, children }) {
  return (
    <li className="relative grid grid-cols-[2.25rem_1fr] gap-x-3 pb-4">
      <span className={cn("font-serif text-[1.35rem] leading-none tabular-nums", warn ? "text-[#f0c27a]" : "text-gold-soft/70")}>{String(n).padStart(2, "0")}</span>
      <div>
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-white/55">{title}</p>
        {children}
      </div>
    </li>
  );
}

/** Arsip lima versi terbit terakhir; memulihkan = menyalin ke draf (belum terbit). */
export function HistoryModal({ open, onOpenChange, history, onRestore }) {
  const [busy, setBusy] = useState(null);
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className={SHELL}>
        <div className="px-7 pb-3 pt-8">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-gold-soft/80">Arsip notulen</p>
          <ModalTitle className="mt-2 font-serif text-[1.5rem] text-white">Versi yang pernah terbit</ModalTitle>
          <ModalDescription className="mt-1.5 text-[13.5px] text-white/50">Memulihkan menyalin versi itu ke draf. Halaman publik baru berubah setelah disahkan.</ModalDescription>
        </div>
        <div className="px-7 pb-7">
          {!history?.length ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/10 py-10 text-center text-white/45">
              <History className="size-6" />
              <p className="text-[13px]">Belum ada versi sebelumnya.</p>
            </div>
          ) : (
            <ol className="relative space-y-2 before:absolute before:bottom-4 before:left-[11px] before:top-4 before:w-px before:bg-white/10">
              {history.map((h) => (
                <li key={h.index} className="relative flex items-center gap-4 pl-8">
                  <span className="absolute left-1 top-1/2 size-[15px] -translate-y-1/2 rounded-full border-2 border-gold/60 bg-[#0f1830]" />
                  <div className="min-w-0 flex-1 rounded-xl border border-white/[0.08] px-4 py-3">
                    <p className="text-[13.5px] text-white">{fmt(h.publishedAt)}</p>
                    <p className="text-[12px] text-white/45">
                      oleh {h.publishedBy || "Admin"} · {h.people} orang
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={busy != null}
                    onClick={async () => {
                      setBusy(h.index);
                      try {
                        await onRestore(h.index);
                        onOpenChange(false);
                      } finally {
                        setBusy(null);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 px-3 py-2 text-[12.5px] text-white/80 transition-colors hover:border-gold/60 hover:text-gold-soft disabled:opacity-40"
                  >
                    {busy === h.index && <Loader2 className="size-3.5 animate-spin" />}
                    Pulihkan
                  </button>
                </li>
              ))}
            </ol>
          )}
        </div>
      </ModalContent>
    </Modal>
  );
}
