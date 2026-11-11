import Image from "next/image";
import { cn } from "@/lib/utils";

const W = { wave: 605, "thumbs-up": 510, confident: 525, proud: 474, run: 680, think: 587, laugh: 497 };

/**
 * Si Elvo kecil yang "mampir" di berbagai section: melayang pelan (CSS animate-float,
 * mati otomatis saat reduced-motion), saat di-hover/fokus balon kata muncul dan Elvo sedikit melompat.
 * `side` = posisi balon kata (kiri/kanan).
 */
export function ElvoPeek({ pose = "wave", say, size = 120, side = "left", tone = "light", className, delay = 0 }) {
  return (
    <span
      tabIndex={say ? 0 : -1}
      aria-label={say ? `Si Elvo: ${say}` : undefined}
      role={say ? "img" : undefined}
      aria-hidden={say ? undefined : true}
      className={cn("group/elvo pointer-events-auto inline-block outline-none", className)}
      style={{ width: size }}
    >
      <span className="block animate-float" style={{ animationDelay: `${delay}s` }}>
        <Image
          src={`/mascot/elvo-${pose}.webp`}
          alt=""
          width={W[pose] ?? 520}
          height={720}
          className="h-auto w-full drop-shadow-[0_10px_14px_rgb(78_14_25/0.28)] transition-transform duration-500 ease-[cubic-bezier(.34,1.56,.64,1)] group-hover/elvo:-translate-y-2 group-hover/elvo:rotate-[-4deg] group-focus-visible/elvo:-translate-y-2"
        />
      </span>
      {say && (
        <span
          className={cn(
            "pointer-events-none absolute bottom-[88%] z-20 w-52 translate-y-2 scale-95 rounded-lg border px-3 py-2 text-xs font-medium leading-snug opacity-0 shadow-[0_14px_30px_-18px_rgb(20_33_61/0.55)] transition-[opacity,transform] duration-300 ease-cinematic group-hover/elvo:translate-y-0 group-hover/elvo:scale-100 group-hover/elvo:opacity-100 group-focus-visible/elvo:translate-y-0 group-focus-visible/elvo:scale-100 group-focus-visible/elvo:opacity-100",
            side === "left" ? "right-[55%]" : "left-[55%]",
            tone === "light" ? "border-line bg-white text-navy" : "border-white/20 bg-white text-maroon"
          )}
        >
          {say}
        </span>
      )}
    </span>
  );
}
