import Image from "next/image";
import { cn } from "@/lib/utils";

/** Pose resmi maskot Elvo (file di /public/mascot). Pakai sesuai konteks — lihat DESIGN.md. */
export const ELVO_POSES = {
  wave: { src: "/mascot/elvo-wave.webp", w: 605, h: 720, alt: "Elvo melambaikan tangan" },
  "thumbs-up": { src: "/mascot/elvo-thumbs-up.webp", w: 510, h: 720, alt: "Elvo mengacungkan jempol" },
  run: { src: "/mascot/elvo-run.webp", w: 680, h: 720, alt: "Elvo berlari bersemangat" },
  confident: { src: "/mascot/elvo-confident.webp", w: 525, h: 720, alt: "Elvo bersedekap percaya diri" },
  laugh: { src: "/mascot/elvo-laugh.webp", w: 497, h: 720, alt: "Elvo tertawa" },
  think: { src: "/mascot/elvo-think.webp", w: 587, h: 720, alt: "Elvo sedang berpikir" },
  proud: { src: "/mascot/elvo-proud.webp", w: 474, h: 720, alt: "Elvo tersenyum bangga" },
};

/** Gambar Elvo. `height` dalam px; lebar mengikuti rasio asli (jangan di-stretch). */
export function Elvo({ pose = "wave", height = 240, className, priority = false, decorative = false }) {
  const p = ELVO_POSES[pose] ?? ELVO_POSES.wave;
  return (
    <Image
      src={p.src}
      width={Math.round((p.w / p.h) * height)}
      height={height}
      alt={decorative ? "" : p.alt}
      priority={priority}
      draggable={false}
      className={cn("select-none object-contain drop-shadow-[0_18px_30px_rgba(120,10,12,0.25)]", className)}
      style={{ height, width: "auto" }}
    />
  );
}
