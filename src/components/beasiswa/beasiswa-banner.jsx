"use client";
import { useEffect, useMemo, useState } from "react";
import { BANNER_KEY, fmtDate } from "@/lib/beasiswa-content";
import { Banner } from "@/components/ui/banner";
import { LordIcon } from "@/components/media/lord-icon";
import { useToast } from "@/components/ui/toast";
import { PlaceholderTag } from "@/components/home/shared";
import { downloadDeadlinesIcs } from "@/lib/ics";
import { useBeasiswa } from "./beasiswa-provider";

/**
 * Pengumuman periode pendaftaran terdekat (brand). Isi CMS `notice` didahulukan; bila kosong diturunkan dari
 * jendela pendaftaran: yang sedang buka & paling cepat tutup, atau yang paling cepat buka. Ditutup → hilang selama sesi.
 */
export function BeasiswaBanner({ className }) {
  const { items, notice: cms, open } = useBeasiswa();
  const toast = useToast();
  const [show, setShow] = useState(false);

  useEffect(() => {
    let hidden = false;
    try {
      hidden = sessionStorage.getItem(BANNER_KEY) === "1";
    } catch {}
    setShow(!hidden);
  }, []);

  const target = useMemo(() => {
    const withWin = items.filter((s) => s.window);
    const openNow = withWin.filter((s) => s.window.state === "buka").sort((a, b) => a.window.close - b.window.close);
    return openNow[0] ?? withWin.sort((a, b) => a.window.open - b.window.open)[0] ?? null;
  }, [items]);

  if (!show || (!cms && !target)) return null;

  const w = target?.window;
  const title = cms?.title ?? (w.state === "buka" ? `${target.name} ditutup ${w.days} hari lagi` : `${target.name} dibuka ${w.days} hari lagi`);
  const body =
    cms?.body ??
    (w.state === "buka"
      ? `Pendaftaran ${w.label.toLowerCase()} berakhir ${fmtDate(w.close, { day: "numeric", month: "long" })}. Siapkan berkasnya dari sekarang.`
      : `Periode ${w.label.toLowerCase()}: ${fmtDate(w.open)} – ${fmtDate(w.close, { day: "numeric", month: "short", year: "numeric" })}.`);

  const save = () => {
    if (!w) return;
    const ok = downloadDeadlinesIcs([{ uid: `beasiswa-${target.slug}`, title: `Tenggat ${target.name}`, date: w.close, description: `${target.org} · ${w.label}` }], {
      filename: `tenggat-${target.slug}.ics`,
    });
    if (ok) toast.success("Tenggat tersimpan", { description: "Buka berkas .ics; pengingat muncul 3 hari sebelum tutup." });
  };

  return (
    <div className={className}>
      <div
        onClickCapture={(e) => {
          if (e.target.closest?.('[aria-label="Tutup banner"]')) {
            try {
              sessionStorage.setItem(BANNER_KEY, "1");
            } catch {}
          }
        }}
      >
        <Banner
          variant="brand"
          dismissible
          title={title}
          action={
            w && (
              <button
                type="button"
                onClick={save}
                className="group hidden h-10 items-center gap-2 rounded-md bg-gold px-4 text-sm font-semibold text-navy transition-[background-color,transform] duration-300 hover:bg-gold-soft active:scale-[0.97] sm:inline-flex"
              >
                <LordIcon name="calendar" size={20} target=".group" colors="primary:#14213d,secondary:#6e1423" />
                Ingatkan aku
              </button>
            )
          }
        >
          <span>{body}</span>{" "}
          {target && (
            <button type="button" onClick={() => open(target.slug)} className="font-semibold text-gold-soft underline decoration-gold/50 underline-offset-4">
              Lihat syaratnya
            </button>
          )}
          {w && (
            <button type="button" onClick={save} className="mt-2 block text-[13px] font-semibold text-gold-soft underline decoration-gold/50 underline-offset-4 sm:hidden">
              Ingatkan aku
            </button>
          )}
          {!cms && target?.sample && <PlaceholderTag tone="dark" className="mt-2" />}
        </Banner>
      </div>
    </div>
  );
}
