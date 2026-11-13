"use client";
import { useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { GROUPS, sectionOf } from "@/lib/home-cms/schema";
import { cn } from "@/lib/utils";
import { Fields } from "./fields";

/** Lembar "kertas" tempat isi section disunting, dikelompokkan per jenis isian. */
export function Inspector({ sectionKey, entry, group, onGroup, onChange, onDiscard, status }) {
  const meta = sectionOf(sectionKey);
  const groups = useMemo(() => GROUPS.filter((g) => meta.fields.some((f) => (f.group ?? "teks") === g.key)), [meta]);
  const current = groups.some((g) => g.key === group) ? group : groups[0]?.key;
  const fields = meta.fields.filter((f) => (f.group ?? "teks") === current);

  useEffect(() => {
    if (current !== group) onGroup(current);
  }, [current, group, onGroup]);

  return (
    <article className="flex h-full min-h-0 flex-col overflow-hidden rounded-[20px] bg-paper text-ink shadow-[0_40px_80px_-40px_rgb(0_0_0/0.8)]">
      <header className="shrink-0 border-b border-ink/[0.07] px-6 pb-4 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-maroon/70">
              {meta.global ? "Tampil di semua halaman" : "Section beranda"}
              {entry.dirty && <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] tracking-normal text-maroon normal-case">Draf belum terbit</span>}
            </p>
            <h2 className="mt-1 truncate font-serif text-[1.7rem] leading-tight text-ink">{meta.label}</h2>
          </div>
          {entry.dirty && (
            <button type="button" onClick={onDiscard} className="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium text-ink/55 transition-colors hover:bg-ink/5 hover:text-ink">
              Kembalikan ke live
            </button>
          )}
        </div>
        {meta.note && <p className="mt-2 rounded-lg bg-navy/[0.05] px-3 py-2 text-xs leading-relaxed text-navy/75">{meta.note}</p>}
        {groups.length > 1 && (
          <div role="tablist" aria-label="Jenis isian" className="mt-4 inline-flex rounded-full bg-ink/[0.05] p-1">
            {groups.map((g) => (
              <button
                key={g.key}
                role="tab"
                type="button"
                aria-selected={current === g.key}
                onClick={() => onGroup(g.key)}
                className={cn("relative rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors", current === g.key ? "text-white" : "text-ink/55 hover:text-ink")}
              >
                {current === g.key && <motion.span layoutId="inspector-tab" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                <span className="relative">{g.label}</span>
              </button>
            ))}
          </div>
        )}
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5" data-inspector-scroll>
        <motion.div key={sectionKey + current} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="space-y-5">
          <Fields fields={fields} path={sectionKey} value={entry.value} onChange={onChange} />
        </motion.div>
      </div>
      <footer className="shrink-0 border-t border-ink/[0.07] px-6 py-3 text-[11px] text-ink/45">
        {status === "error" ? (
          <span className="text-red-600">Draf gagal tersimpan. Perubahan masih ada di layar.</span>
        ) : entry.publishedAt ? (
          <>Terakhir terbit {new Date(entry.publishedAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}{entry.publishedBy ? ` oleh ${entry.publishedBy}` : ""}</>
        ) : (
          "Belum pernah diterbitkan dari Studio — pengunjung melihat isi bawaan."
        )}
      </footer>
    </article>
  );
}
