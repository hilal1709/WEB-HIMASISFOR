/** Glyph UI minimal (inline SVG) untuk kontrol — PRODUCT.md: lucide tidak dipakai di UI publik. */
const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };

export const ArrowGlyph = ({ className, dir = "right" }) => (
  <svg aria-hidden viewBox="0 0 16 16" className={className} style={dir === "left" ? { transform: "scaleX(-1)" } : undefined}>
    <path {...base} d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);
export const ChevronGlyph = ({ className }) => (
  <svg aria-hidden viewBox="0 0 16 16" className={className}>
    <path {...base} d="M4 6l4 4 4-4" />
  </svg>
);
export const MenuGlyph = ({ className }) => (
  <svg aria-hidden viewBox="0 0 20 20" className={className}>
    <path {...base} d="M3 6h14M3 10h14M3 14h9" />
  </svg>
);
export const CloseGlyph = ({ className }) => (
  <svg aria-hidden viewBox="0 0 16 16" className={className}>
    <path {...base} d="M4 4l8 8M12 4l-8 8" />
  </svg>
);
export const ArrowUpGlyph = ({ className }) => (
  <svg aria-hidden viewBox="0 0 16 16" className={className}>
    <path {...base} d="M8 13V3M4 7l4-4 4 4" />
  </svg>
);
