"use client";
import { useEffect, useMemo, useState } from "react";
import { RegulasiBody } from "@/components/regulasi/regulasi-body";
import { smoothTo } from "@/components/regulasi/regulasi-provider";
import { PREVIEW_EVENT, resolveRegulasi, validateRegulasi } from "@/lib/regulasi-cms/schema";

export function PreviewBridge({ initial, curriculum }) {
  const [value, setValue] = useState(initial);
  const data = useMemo(() => resolveRegulasi(value, curriculum), [value, curriculum]);

  useEffect(() => {
    if (parent === window) return;
    const onMessage = (event) => {
      if (event.origin !== location.origin || event.source !== parent || event.data?.type !== PREVIEW_EVENT) return;
      if (event.data.value) {
        try {
          setValue(validateRegulasi(event.data.value));
        } catch {
          // The editor keeps an invalid field local until it can be previewed safely.
        }
      }
      if (event.data.anchor === "pengantar") window.scrollTo({ top: 0, behavior: "instant" });
      else if (event.data.anchor) smoothTo(event.data.anchor, "instant");
    };
    const keepPreview = (event) => {
      const link = event.target.closest?.("a[href]");
      if (!link) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname) event.preventDefault();
    };
    window.addEventListener("message", onMessage);
    document.addEventListener("click", keepPreview, true);
    parent.postMessage({ type: PREVIEW_EVENT, ready: true }, location.origin);
    return () => {
      window.removeEventListener("message", onMessage);
      document.removeEventListener("click", keepPreview, true);
    };
  }, []);

  return <RegulasiBody data={data} preview />;
}
