"use client";
import { useEffect, useState } from "react";
import { BANNER_KEY } from "@/lib/konversi-content";
import { downloadEventIcs } from "@/lib/ics";
import { Banner } from "@/components/ui/banner";
import { LordIcon } from "@/components/media/lord-icon";
import { useToast } from "@/components/ui/toast";
import { Container, PlaceholderTag } from "@/components/home/shared";
import { useKonversi } from "./konversi-provider";

export function KonversiBanner({ className, standalone = false }) {
  const { notice, preview, copy: { notice: c, feedback } } = useKonversi();
  const toast = useToast();
  const [show, setShow] = useState(false);
  const storageKey = BANNER_KEY + ":" + notice.title + ":" + notice.calendarAt;
  useEffect(() => {
    try {
      setShow(preview || sessionStorage.getItem(storageKey) !== "1");
    } catch {
      setShow(true);
    }
  }, [storageKey, preview]);

  if (!show || !notice.title.trim()) return null;

  const save = () => {
    const start = new Date(notice.calendarAt + ":00+07:00");
    const ok = !Number.isNaN(start.valueOf()) && downloadEventIcs({
      startAt: start,
      slug: "sesi-konversi-sks",
      title: notice.calendarTitle || notice.title,
      place: notice.place,
    });
    if (ok) toast.success(c.saved, { description: c.savedBody });
    else toast.warning(c.unavailable, { description: c.unavailableBody });
  };
  const dismiss = () => {
    setShow(false);
    if (!preview) {
      try { sessionStorage.setItem(storageKey, "1"); } catch {}
    }
  };

  const action = notice.calendarAt || (notice.href && notice.action);
  function Actions({ mobile }) {
    const styles = mobile ? "text-[13px] font-semibold text-gold-soft underline decoration-gold/50 underline-offset-4"
      : "group inline-flex h-10 items-center gap-2 rounded-md bg-gold px-4 text-sm font-semibold text-navy transition-[background-color,transform] duration-300 hover:bg-gold-soft active:scale-[0.97]";
    return <>
      {notice.href && notice.action && <a href={notice.href} className={styles}>{notice.action}</a>}
      {notice.calendarAt && <button type="button" onClick={save} className={styles}>
        {!mobile && <LordIcon name="calendar" size={20} target=".group" colors="primary:#14213d,secondary:#6e1423" />}
        {c.calendar}
      </button>}
    </>;
  }

  const banner = (
    <Banner className={className} variant="brand" dismissible dismissLabel={c.dismiss} onDismiss={dismiss} title={notice.title}
      action={action && <div className="hidden flex-wrap gap-2 sm:flex"><Actions /></div>}>
      <span>{notice.body}</span>
      {action && <div className="mt-2 flex flex-wrap gap-2 sm:hidden"><Actions mobile /></div>}
      {notice.sample && <PlaceholderTag tone="dark" className="mt-2">{feedback.example}</PlaceholderTag>}
    </Banner>
  );
  return standalone ? <section className="bg-cream py-8"><Container>{banner}</Container></section> : banner;
}
