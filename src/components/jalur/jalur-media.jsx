import Image from "next/image";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { PlaceholderTag } from "@/components/home/shared";
import { fillJalur } from "@/lib/jalur-cms/copy";
import { safeJalurUrl } from "@/lib/jalur-cms/schema";

export function JalurArt({ media, path = "", decorative, replayOnHover }) {
  const src = safeJalurUrl(media.src);
  if (!src || src.startsWith("#")) return null;
  const alt = decorative ? "" : fillJalur(media.alt, { path });
  if (/\.json(?:[?#]|$)/i.test(src)) return <LottieIllustration key={src} src={src} label={alt} replayOnHover={replayOnHover} />;
  return <Image src={src} alt={alt} width={260} height={260} className="aspect-square h-full w-full object-contain" unoptimized />;
}

export function JalurSample({ children, ...props }) {
  return children && <PlaceholderTag {...props}>{children}</PlaceholderTag>;
}
