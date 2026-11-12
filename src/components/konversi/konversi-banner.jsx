"use client";
import { useEffect, useState } from "react";
import { BANNER_KEY } from "@/lib/konversi-content";
import { downloadIcs } from "@/lib/ics";
import { Banner } from "@/components/ui/banner";
import { LordIcon } from "@/components/media/lord-icon";
import { useToast } from "@/components/ui/toast";
import { PlaceholderTag } from "@/components/home/shared";
import { useKonversi } from "./konversi-provider";

/** Pengumuman periode pengajuan konversi (brand). Ditutup → tidak muncul lagi selama sesi. */
export function KonversiBanner({ className }) {
  const { notice } = useKonversi();
  const toast = useToast();
  const [show, setShow] = useState(false);

  useEffect(() => {
    let hidden = false;
    try {
      hidden = sessionStorage.getItem(BANNER_KEY) === "1";
    } catch {}
    setShow(!hidden);
  }, []);

  if (!show || !notice) return null;

  const save = () => {
    if (notice.event && downloadIcs(notice.event, { filename: "sesi-konversi-sks.ics", uid: "konversi" })) {
      toast.success("Jadwal tersimpan", { description: "Buka berkas .ics untuk menambahkannya ke kalendermu." });
    } else {
      toast.warning("Tanggal belum pasti", { description: "Pantau papan agenda prodi untuk jadwal resminya." });
    }
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
          title={notice.title}
          action={
            notice.event && (
              <button
                type="button"
                onClick={save}
                className="group hidden h-10 items-center gap-2 rounded-md bg-gold px-4 text-sm font-semibold text-navy transition-[background-color,transform] duration-300 hover:bg-gold-soft active:scale-[0.97] sm:inline-flex"
              >
                <LordIcon name="calendar" size={20} target=".group" colors="primary:#14213d,secondary:#6e1423" />
                Simpan ke kalender
              </button>
            )
          }
        >
          <span>{notice.body}</span>
          {notice.event && (
            <button type="button" onClick={save} className="mt-2 block text-[13px] font-semibold text-gold-soft underline decoration-gold/50 underline-offset-4 sm:hidden">
              Simpan ke kalender
            </button>
          )}
          {notice.sample && <PlaceholderTag tone="dark" className="mt-2" />}
        </Banner>
      </div>
    </div>
  );
}
