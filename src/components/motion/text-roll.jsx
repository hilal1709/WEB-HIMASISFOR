import { cn } from "@/lib/utils";

/**
 * Teks bergulir saat hover (pola 21st.dev "Text Roll").
 * Induk harus punya class `group/roll` (atau `group/arrow`, lihat globals.css).
 */
export function TextRoll({ children, className }) {
  if (typeof children !== "string") return children;
  return (
    <span className={cn("roll", className)}>
      <span>{children}</span>
      <span aria-hidden>{children}</span>
    </span>
  );
}
