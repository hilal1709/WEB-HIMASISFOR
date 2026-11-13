"use client";
import Image from "next/image";
import { useState } from "react";
import { Skeleton } from "@/components/ui/loader";
import { cn } from "@/lib/utils";

/**
 * Foto sampul Warta. Lokal → next/image; URL luar → <img>. Skeleton sampai termuat.
 * Tanpa sampul → bidang cream bergaris kolom koran (bukan ikon).
 */
export function Cover({ src, alt = "", sizes = "100vw", priority, className, imgClassName, ...props }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={cn("relative overflow-hidden bg-cream-2", className)} {...props}>
      {src ? (
        <>
          {!loaded && <Skeleton className="absolute inset-0 rounded-none bg-cream-2" />}
          {/^https?:\/\//.test(src) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={alt} loading={priority ? "eager" : "lazy"} onLoad={() => setLoaded(true)} className={cn("absolute inset-0 size-full object-cover", imgClassName)} />
          ) : (
            <Image src={src} alt={alt} fill sizes={sizes} priority={priority} onLoad={() => setLoaded(true)} className={cn("object-cover", imgClassName)} />
          )}
        </>
      ) : (
        <svg aria-hidden viewBox="0 0 120 80" preserveAspectRatio="none" className="absolute inset-0 size-full text-navy/15">
          <rect x="10" y="10" width="100" height="10" fill="var(--maroon)" opacity="0.5" />
          {[30, 40, 50, 60].map((y) => (
            <path key={y} d={`M10 ${y}h46M64 ${y}h46`} stroke="currentColor" strokeWidth="3" />
          ))}
        </svg>
      )}
    </div>
  );
}
