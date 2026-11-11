/**
 * Ilustrasi line-art datar (tanpa gradien) untuk kartu Keunggulan.
 * Garis memakai `currentColor` (ink), aksen memakai var(--primary).
 * Setiap garis bertanda data-line → digambar ulang oleh anime.js saat kartu di-hover.
 */
const line = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };
const accent = { fill: "var(--maroon)" };
const soft = { fill: "var(--gold)", fillOpacity: 0.16 };

function Frame({ children, label }) {
  return (
    <svg viewBox="0 0 160 112" role="img" aria-label={label} className="h-auto w-full text-ink">
      {children}
    </svg>
  );
}

/** Modul ERP saling terhubung ke satu basis data. */
export function ErpIllustration() {
  return (
    <Frame label="Ilustrasi modul ERP yang terintegrasi">
      <rect x="62" y="40" width="36" height="34" rx="4" {...soft} />
      <path data-line {...line} d="M66 46c0-3 6-5 14-5s14 2 14 5v22c0 3-6 5-14 5s-14-2-14-5z" />
      <path data-line {...line} d="M66 46c0 3 6 5 14 5s14-2 14-5M66 57c0 3 6 5 14 5s14-2 14-5" />
      <rect data-line {...line} x="14" y="14" width="34" height="24" rx="4" />
      <rect data-line {...line} x="112" y="14" width="34" height="24" rx="4" />
      <rect data-line {...line} x="14" y="76" width="34" height="24" rx="4" />
      <rect data-line {...line} x="112" y="76" width="34" height="24" rx="4" />
      <path data-line {...line} d="M48 26h8c4 0 6 2 6 6v10M112 26h-8c-4 0-6 2-6 6v10M48 88h8c4 0 6-2 6-6v-6M112 88h-8c-4 0-6-2-6-6v-6" />
      <path data-line {...line} d="M21 22h14M21 28h20M119 22h20M119 28h12M21 84h20M21 90h10M119 84h14M119 90h20" />
      <circle cx="62" cy="42" r="2.4" {...accent} />
      <circle cx="98" cy="42" r="2.4" {...accent} />
    </Frame>
  );
}

/** Dosen di depan papan presentasi berisi grafik. */
export function LecturerIllustration() {
  return (
    <Frame label="Ilustrasi dosen mengajar dengan papan presentasi">
      <rect x="58" y="14" width="88" height="58" rx="4" {...soft} />
      <rect data-line {...line} x="58" y="14" width="88" height="58" rx="4" />
      <path data-line {...line} d="M102 72v14M90 92l12-6 12 6" />
      <path data-line {...line} d="M68 60l16-14 12 8 20-20 18 10" />
      <circle cx="116" cy="34" r="3" {...accent} />
      <path data-line {...line} d="M68 26h22M68 32h14" />
      <circle data-line {...line} cx="30" cy="40" r="10" />
      <path data-line {...line} d="M14 100V72c0-9 7-16 16-16s16 7 16 16v28" />
      <path data-line {...line} d="M44 66l14-12" />
      <path data-line {...line} d="M8 100h144" />
    </Frame>
  );
}

/** Pabrik semen (silo + cerobong) terhubung ke laptop — kolaborasi industri. */
export function IndustryIllustration() {
  return (
    <Frame label="Ilustrasi kolaborasi kampus dan industri">
      <rect x="22" y="38" width="16" height="56" rx="2" {...soft} />
      <path data-line {...line} d="M22 94V42c0-2 2-4 4-4h8c2 0 4 2 4 4v52M42 94V50c0-2 2-4 4-4h8c2 0 4 2 4 4v44" />
      <path data-line {...line} d="M62 94V64l12-8v8l12-8v38M66 26v30M66 26h6v26" />
      <path data-line {...line} d="M74 16c4-4 10-4 14 0" />
      <path data-line {...line} d="M8 94h144" />
      <rect data-line {...line} x="104" y="56" width="40" height="26" rx="3" />
      <path data-line {...line} d="M98 88h52l-4-6h-44z" />
      <path {...line} strokeDasharray="2 5" d="M86 70c6-14 12-18 22-20" />
      <path data-line {...line} d="M112 74l8-8 6 4 10-10" />
      <circle cx="136" cy="60" r="2.6" {...accent} />
    </Frame>
  );
}

/** Tangga karier menuju tas kerja dan bendera. */
export function CareerIllustration() {
  return (
    <Frame label="Ilustrasi jenjang karier lulusan">
      <path d="M20 98h28V78h28V58h28V38h28v60z" {...soft} />
      <path data-line {...line} d="M12 98h36V78h28V58h28V38h28" />
      <path data-line {...line} d="M8 98h144" />
      <path data-line {...line} d="M132 38V12" />
      <path d="M132 12h18l-5 6 5 6h-18z" {...accent} />
      <rect data-line {...line} x="112" y="22" width="14" height="11" rx="2" />
      <path data-line {...line} d="M116 22v-3h6v3" />
      <circle data-line {...line} cx="34" cy="70" r="5" />
      <path data-line {...line} d="M34 75v12M28 81l6-3 6 3M30 98l4-11 4 11" />
    </Frame>
  );
}

export const ILLUSTRATIONS = {
  erp: ErpIllustration,
  lecturer: LecturerIllustration,
  industry: IndustryIllustration,
  career: CareerIllustration,
};
