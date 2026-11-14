/** Ilustrasi garis Kartografer (token tema, tanpa hex). Dipakai untuk keadaan kosong, bukan ikon. */

export function EmptyPlatformIllustration({ className }) {
  return (
    <svg viewBox="0 0 220 110" className={className} aria-hidden fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 86h204" stroke="var(--line)" strokeWidth="3" />
      {Array.from({ length: 11 }, (_, i) => (
        <path key={i} d={`M${16 + i * 19} 80v12`} stroke="var(--line)" strokeWidth="3" />
      ))}
      <rect x="34" y="40" width="70" height="34" rx="6" stroke="var(--navy)" strokeWidth="2.4" strokeDasharray="5 6" />
      <path d="M48 57h42" stroke="var(--navy)" strokeOpacity=".35" strokeWidth="2.4" />
      <path d="M150 74V30" stroke="var(--navy)" strokeWidth="2.4" />
      <rect x="136" y="18" width="28" height="16" rx="3" fill="var(--gold)" />
      <path d="M143 26h14" stroke="var(--navy)" strokeWidth="2" />
      <circle cx="186" cy="54" r="8" stroke="var(--maroon)" strokeWidth="2.4" />
      <path d="M186 50v4l3 2" stroke="var(--maroon)" strokeWidth="2" />
    </svg>
  );
}

export function BlankBlueprintIllustration({ className }) {
  return (
    <svg viewBox="0 0 200 140" className={className} aria-hidden fill="none" strokeLinecap="round" strokeLinejoin="round">
      <rect x="30" y="14" width="104" height="116" rx="6" fill="white" stroke="var(--navy)" strokeWidth="2.4" />
      <path d="M44 34h76M44 48h52M44 62h64" stroke="var(--navy)" strokeOpacity=".25" strokeWidth="3" />
      <rect x="44" y="78" width="76" height="36" rx="3" stroke="var(--navy)" strokeOpacity=".3" strokeWidth="2" strokeDasharray="4 5" />
      <path d="M150 30l-26 70" stroke="var(--maroon)" strokeWidth="2.6" />
      <path d="M150 30l20 66" stroke="var(--maroon)" strokeWidth="2.6" />
      <circle cx="150" cy="28" r="6" fill="var(--gold)" stroke="var(--navy)" strokeWidth="2" />
      <path d="M118 108c14 10 40 10 56-4" stroke="var(--gold)" strokeWidth="2.6" strokeDasharray="2 6" />
    </svg>
  );
}

export function TrackForkIllustration({ className }) {
  return (
    <svg viewBox="0 0 220 110" className={className} aria-hidden fill="none" strokeLinecap="round">
      <path d="M10 86h70c40 0 50-50 90-50h40" stroke="var(--maroon)" strokeWidth="4" />
      <path d="M80 86c40 0 50-20 90-20h40" stroke="var(--navy)" strokeWidth="4" strokeDasharray="2 9" />
      <path d="M80 86h130" stroke="var(--gold)" strokeWidth="4" strokeOpacity=".55" />
      <circle cx="80" cy="86" r="9" fill="white" stroke="var(--navy)" strokeWidth="3" />
    </svg>
  );
}
