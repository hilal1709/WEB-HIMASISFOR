"use client";
import { useEffect, useState } from "react";
import { BANNER_KEY } from "@/lib/regulasi-content";
import { Banner } from "@/components/ui/banner";
import { PlaceholderTag } from "@/components/home/shared";
import { useRegulasi } from "./regulasi-provider";

export function RegulasiBanner({ className }) {
  const { notice, openDoc, docs, copy, preview } = useRegulasi();
  const id = notice ? JSON.stringify([notice.title, notice.body, notice.doc]) : "";
  const [dismissed, setDismissed] = useState("");

  useEffect(() => {
    if (preview) return;
    try {
      setDismissed(sessionStorage.getItem(BANNER_KEY) ?? "");
    } catch {}
  }, [id, preview]);

  if (!notice || dismissed === id) return null;
  const target = docs.findIndex((doc) => doc.key === notice.doc);
  const dismiss = () => {
    setDismissed(id);
    if (!preview) {
      try {
        sessionStorage.setItem(BANNER_KEY, id);
      } catch {}
    }
  };

  return (
    <Banner
      key={id}
      className={className}
      variant="brand"
      dismissible
      dismissLabel={copy.documents.dismissNotice}
      onDismiss={dismiss}
      title={notice.title}
      action={target >= 0 && notice.action ? (
        <button
          type="button"
          onClick={() => openDoc(target)}
          className="hidden h-10 items-center rounded-md bg-gold px-4 text-sm font-semibold text-navy transition-[background-color,transform] duration-300 hover:bg-gold-soft active:scale-[0.98] sm:inline-flex"
        >
          {notice.action}
        </button>
      ) : null}
    >
      {notice.body}
      {notice.sample && <PlaceholderTag tone="dark" className="ml-2 align-middle">{copy.general.sample}</PlaceholderTag>}
    </Banner>
  );
}
