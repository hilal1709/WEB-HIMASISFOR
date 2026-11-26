"use client";
import { useEffect, useState } from "react";
import { Banner } from "@/components/ui/banner";
import { useToast } from "@/components/ui/toast";
import { LordIcon } from "@/components/media/lord-icon";
import { BANNER_KEY } from "@/lib/magang-content";
import { downloadEventIcs, downloadIcs } from "@/lib/ics";
import { PlaceholderTag } from "@/components/home/shared";
import { useMagang } from "./magang-provider";

export function MagangBanner({ className }) {
  const { notice, copy, preview, link } = useMagang();
  const labels = copy.notice;
  const toast = useToast();
  const [dismissed, setDismissed] = useState(null);
  const signature = notice ? JSON.stringify([notice.title, notice.body, notice.actionLabel, notice.actionHref, notice.startAt, notice.place]) : "";
  useEffect(() => {
    if (preview) return;
    try {
      setDismissed(sessionStorage.getItem(BANNER_KEY));
    } catch {}
  }, [preview]);

  if (!notice || !notice.title || dismissed === signature) return null;
  const calendar = notice.startAt || notice.legacyEvent;
  const href = link(notice.actionHref);
  const canLink = href && notice.actionLabel;

  function save() {
    if (preview) return;
    const saved = notice.startAt
      ? downloadEventIcs({ slug: "info-session-magang", title: notice.title, startAt: notice.startAt, place: notice.place, summary: notice.body })
      : notice.legacyEvent && downloadIcs({ ...notice.legacyEvent, title: notice.title }, { filename: "info-session-magang.ics", uid: "magang" });
    if (saved) toast.success(labels.saved, { description: labels.savedBody });
    else toast.warning(labels.unavailable, { description: labels.unavailableBody });
  }

  return (
    <div className={className}>
      <Banner
        key={signature}
        variant="brand"
        dismissible
        dismissLabel={labels.dismiss}
        title={notice.title}
        onDismiss={() => {
          setDismissed(signature);
          if (!preview) {
            try { sessionStorage.setItem(BANNER_KEY, signature); } catch {}
          }
        }}
        action={calendar && !canLink && (
          <button type="button" onClick={save} disabled={preview} className="group hidden h-10 items-center gap-2 rounded-md bg-gold px-4 text-sm font-semibold text-navy transition-colors hover:bg-gold-soft sm:inline-flex">
            <LordIcon name="calendar" size={20} target=".group" colors="primary:#14213d,secondary:#6e1423" />
            {labels.calendar}
          </button>
        )}
      >
        {notice.body && <span>{notice.body}</span>}
        {calendar && <button type="button" onClick={save} disabled={preview} className={canLink ? "mt-2 mr-4 text-sm font-semibold text-gold-soft underline" : "mt-2 block text-sm font-semibold text-gold-soft underline sm:hidden"}>{labels.calendar}</button>}
        {canLink && <a href={href} className="mt-2 inline-block text-sm font-semibold text-gold-soft underline underline-offset-4">{notice.actionLabel}</a>}
        {notice.sample && <PlaceholderTag tone="dark" className="mt-2">{copy.jobs.sample}</PlaceholderTag>}
      </Banner>
    </div>
  );
}
