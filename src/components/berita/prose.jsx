"use client";
import { Fragment, useMemo, useState } from "react";
import { inline, parseMarkdown } from "@/lib/markdown";
import { Modal, ModalContent, ModalTitle } from "@/components/ui/modal";
import { Cover } from "./cover";

function Inline({ text }) {
  return inline(text).map((t, i) => {
    if (t.t === "b") return <strong key={i}>{t.v}</strong>;
    if (t.t === "i") return <em key={i}>{t.v}</em>;
    if (t.t === "code") return <code key={i}>{t.v}</code>;
    if (t.t === "a") {
      const ext = /^https?:\/\//.test(t.href);
      return (
        <a key={i} href={t.href} {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
          {t.v}
        </a>
      );
    }
    return <Fragment key={i}>{t.v}</Fragment>;
  });
}

/**
 * Isi tulisan dari Markdown (lib/markdown.js → blok React, aman tanpa HTML mentah).
 * Gambar membuka lightbox (‹ › + panah keyboard). Dipakai halaman baca dan pratinjau editor admin.
 */
export function Prose({ content, className }) {
  const blocks = useMemo(() => parseMarkdown(content), [content]);
  const images = blocks.filter((b) => b.type === "img");
  const [open, setOpen] = useState(-1);
  const img = images[open];

  return (
    <div className={`wt-prose ${className ?? ""}`}>
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h2":
            return (
              <h2 key={i} id={b.id}>
                <Inline text={b.text} />
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} id={b.id}>
                <Inline text={b.text} />
              </h3>
            );
          case "quote":
            return (
              <blockquote key={i}>
                <Inline text={b.text} />
              </blockquote>
            );
          case "list": {
            const L = b.ordered ? "ol" : "ul";
            return (
              <L key={i}>
                {b.items.map((it, k) => (
                  <li key={k}>
                    <Inline text={it} />
                  </li>
                ))}
              </L>
            );
          }
          case "img": {
            const n = images.indexOf(b);
            return (
              <figure key={i} className="!my-9">
                <button type="button" onClick={() => setOpen(n)} className="group block w-full cursor-zoom-in overflow-hidden rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60" aria-label={`Perbesar foto: ${b.alt || "gambar"}`}>
                  <Cover src={b.src} alt={b.alt} sizes="(min-width:1024px) 720px, 100vw" className="aspect-[16/10]" imgClassName="transition-transform duration-700 ease-cinematic group-hover:scale-[1.03]" />
                </button>
                {b.caption && <figcaption className="mt-2.5 border-l-2 border-gold pl-3 text-sm text-text/55">{b.caption}</figcaption>}
              </figure>
            );
          }
          case "hr":
            return <hr key={i} />;
          default:
            return (
              <p key={i}>
                <Inline text={b.text} />
              </p>
            );
        }
      })}

      <Modal open={!!img} onOpenChange={(v) => !v && setOpen(-1)}>
        <ModalContent
          className="max-w-5xl bg-navy-deep p-3 text-white sm:p-4"
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" && open < images.length - 1) setOpen(open + 1);
            if (e.key === "ArrowLeft" && open > 0) setOpen(open - 1);
          }}
        >
          {img && (
            <>
              <ModalTitle className="sr-only">{img.alt || "Foto"}</ModalTitle>
              <div className="relative aspect-[16/10] w-full">
                <Cover src={img.src} alt={img.alt} sizes="90vw" className="absolute inset-0 rounded bg-navy" imgClassName="!object-contain" />
              </div>
              <div className="mt-3 flex items-center justify-between gap-4 text-sm">
                <p className="text-white/70">{img.caption}</p>
                {images.length > 1 && (
                  <div className="flex shrink-0 items-center gap-3">
                    <button type="button" disabled={open === 0} onClick={() => setOpen(open - 1)} className="font-semibold disabled:opacity-30">
                      ‹
                    </button>
                    <span className="tabular text-white/50">
                      {open + 1}/{images.length}
                    </span>
                    <button type="button" disabled={open === images.length - 1} onClick={() => setOpen(open + 1)} className="font-semibold disabled:opacity-30">
                      ›
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
