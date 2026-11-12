/**
 * Sampul kursus: line-art SVG per topik (bukan ikon), variasinya ditentukan dari slug sehingga tiap kursus
 * berbeda tapi tetap seragam gayanya. Navy di atas cream, satu aksen emas, satu maroon. Tanpa gradien.
 */
const line = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" };

function seed(slug) {
  let h = 7;
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) % 9973;
  return (i) => ((h * (i + 3) * 17) % 97) / 97;
}

function Enterprise({ r }) {
  const xs = [24, 84, 144];
  return (
    <>
      {xs.map((x, i) => (
        <rect key={x} x={x} y={44 + r(i) * 18} width="40" height="28" rx="4" {...line} />
      ))}
      <path {...line} d={`M64 ${58 + r(0) * 18}h20M124 ${58 + r(1) * 18}h20`} />
      <path {...line} strokeDasharray="3 6" d="M44 100c40 20 90 20 120 0" />
      <rect x={xs[1]} y={44 + r(1) * 18} width="40" height="28" rx="4" fill="var(--gold)" fillOpacity="0.22" />
      <circle cx="164" cy="100" r="5" fill="var(--maroon)" />
    </>
  );
}
function Data({ r }) {
  const bars = [0, 1, 2, 3, 4];
  return (
    <>
      <path {...line} d="M24 112h160M24 112V28" />
      {bars.map((i) => {
        const h = 18 + r(i) * 60;
        return <rect key={i} x={36 + i * 28} y={112 - h} width="16" height={h} rx="2" {...line} fill={i === 3 ? "var(--gold)" : "none"} fillOpacity={i === 3 ? 0.35 : 0} />;
      })}
      <path {...line} d={`M40 ${70 - r(5) * 20}C80 ${40 + r(6) * 20} 120 ${80 - r(7) * 30} 172 ${36 + r(8) * 14}`} />
      <circle cx="172" cy={36 + r(8) * 14} r="4.5" fill="var(--maroon)" />
    </>
  );
}
function Governance({ r }) {
  return (
    <>
      <path {...line} d="M104 22l46 16v30c0 26-20 42-46 50-26-8-46-24-46-50V38z" />
      <path {...line} d="M86 70l12 12 24-26" />
      {[0, 1, 2].map((i) => (
        <path key={i} {...line} opacity="0.55" d={`M${18 + r(i) * 8} ${40 + i * 24}h${22 + r(i + 3) * 14}`} />
      ))}
      <circle cx="104" cy="70" r="30" fill="var(--gold)" fillOpacity="0.16" />
      <circle cx="178" cy={34 + r(4) * 60} r="4.5" fill="var(--maroon)" />
    </>
  );
}
function Dev({ r }) {
  const rows = [0, 1, 2, 3];
  return (
    <>
      <rect x="28" y="24" width="152" height="92" rx="6" {...line} />
      <path {...line} d="M28 40h152" />
      <circle cx="40" cy="32" r="2.5" fill="var(--maroon)" />
      {rows.map((i) => (
        <path key={i} {...line} opacity={i === 2 ? 1 : 0.55} d={`M${48 + (i % 2) * 14} ${58 + i * 14}h${36 + r(i) * 60}`} />
      ))}
      <rect x={112 + r(5) * 20} y="80" width="34" height="10" rx="2" fill="var(--gold)" fillOpacity="0.35" />
      <path {...line} d="M150 62l10 8-10 8" />
    </>
  );
}

const ART = { enterprise: Enterprise, data: Data, "tata-kelola": Governance, dev: Dev };

export function CoverArt({ topic, slug, className }) {
  const Art = ART[topic] ?? Dev;
  return (
    <svg viewBox="0 0 208 136" aria-hidden className={className ?? "h-auto w-full text-navy"}>
      <Art r={seed(slug)} />
    </svg>
  );
}
