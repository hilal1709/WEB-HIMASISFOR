"use client";
import { downloadEventIcs } from "@/lib/ics";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { LordIcon } from "@/components/media/lord-icon";

/** Hitung mundur agenda (klien). null saat SSR. */
export function countdown(ev, now) {
  if (!now) return null;
  const start = new Date(ev.startAt);
  const end = ev.endAt ? new Date(ev.endAt) : new Date(start.getTime() + 2 * 3600e3);
  if (now >= start && now <= end) return { label: "Sedang berlangsung", live: true };
  if (now > end) return { label: "Sudah lewat", past: true };
  const day = (d) => Math.floor((d.getTime() + 7 * 3600e3) / 86400e3); // hari kalender WIB
  const diff = day(start) - day(now);
  if (diff === 0) {
    const h = Math.max(1, Math.round((start - now) / 3600e3));
    return { label: `Hari ini · ${h} jam lagi`, soon: true };
  }
  if (diff === 1) return { label: "Besok", soon: true };
  return { label: `${diff} hari lagi`, soon: diff <= 7 };
}

/** Tambahkan ke kalender (.ics) + Daftar. Dipakai lembar kalender & brosur. */
export function EventActions({ ev, tone = "light", size = "default" }) {
  const toast = useToast();
  const add = () => {
    const ok = downloadEventIcs({ ...ev, url: `${location.origin}/berita?rubrik=agenda#agenda-${ev.slug}` });
    if (ok) toast.success("Agenda diunduh", { description: "Buka berkas .ics untuk menambahkannya ke kalender ponselmu." });
    else toast.error("Tanggal agenda tidak valid");
  };
  const register = () => {
    if (ev.registerUrl) {
      window.open(ev.registerUrl, "_blank", "noopener,noreferrer");
      toast.info("Formulir pendaftaran dibuka di tab baru");
    } else toast.info("Pendaftaran menyusul", { description: "Tautan akan diumumkan redaksi menjelang acara." });
  };
  const light = tone === "light";
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant={light ? "navy" : "outline-navy"} size={size} onClick={add} className="group">
        <LordIcon name="calendar" size={20} target=".group" colors={light ? "primary:#ffffff,secondary:#e6d3a1" : "primary:#14213d,secondary:#6e1423"} />
        Tambahkan ke kalender
      </Button>
      <Button variant="maroon" size={size} onClick={register}>
        {ev.registerUrl ? "Daftar" : "Info pendaftaran"}
      </Button>
    </div>
  );
}
