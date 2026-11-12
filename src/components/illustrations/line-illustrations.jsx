/**
 * Ilustrasi line-art datar (tanpa gradien) untuk kartu Keunggulan.
 * Garis memakai `currentColor` (ink), aksen memakai var(--primary).
 * Setiap garis bertanda data-line → digambar ulang oleh anime.js saat kartu di-hover.
 */
const line = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };
const accent = { fill: "var(--maroon)" };
const soft = { fill: "var(--gold)", fillOpacity: 0.16 };
const node = { fill: "var(--maroon)", style: { transformBox: "fill-box", transformOrigin: "center" } };

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

/** Tiga orang di sekitar buku terbuka + balon gagasan — budaya berbagi pengetahuan. */
export function KnowledgeIllustration() {
  return (
    <Frame label="Ilustrasi sivitas akademika berbagi pengetahuan">
      <path d="M50 70l30 8 30-8v22l-30 8-30-8z" {...soft} />
      <path data-line {...line} d="M50 70l30 8 30-8v22l-30 8-30-8zM80 78v22" />
      <circle data-line {...line} cx="80" cy="40" r="8" />
      <path data-line {...line} d="M68 66c0-7 5-12 12-12s12 5 12 12" />
      <circle data-line {...line} cx="30" cy="54" r="7" />
      <path data-line {...line} d="M18 84c0-7 5-12 12-12s12 5 12 12" />
      <circle data-line {...line} cx="130" cy="54" r="7" />
      <path data-line {...line} d="M118 84c0-7 5-12 12-12s12 5 12 12" />
      <path data-line {...line} d="M100 14h34a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4h-24l-8 6v-6h-2a4 4 0 0 1-4-4V18a4 4 0 0 1 4-4z" />
      <path {...line} strokeDasharray="2 5" d="M40 46c10-10 20-12 30-10M120 46c-6-6-10-8-14-8" />
      <circle cx="112" cy="24" r="2.4" {...accent} />
      <circle cx="120" cy="24" r="2.4" {...accent} />
      <circle cx="128" cy="24" r="2.4" {...accent} />
    </Frame>
  );
}

/**
 * Lanskap "Horizon 2030": matahari terbit di garis cakrawala, jalan perspektif menuju
 * kampus & silo, bendera 2030 di ujung jalan. Lebar (viewBox 520×300) untuk hero.
 */
export function HorizonIllustration({ className }) {
  return (
    <svg viewBox="0 0 520 300" role="img" aria-label="Ilustrasi jalan menuju cakrawala 2030" className={className ?? "h-auto w-full text-ink"}>
      {/* matahari */}
      <path d="M200 196a60 60 0 0 1 120 0z" {...soft} />
      <path data-line {...line} d="M200 196a60 60 0 0 1 120 0" />
      <path data-line {...line} d="M260 112v-14M214 128l-9-10M306 128l9-10M186 162l-13-5M334 162l13-5" />
      {/* cakrawala */}
      <path data-line {...line} d="M10 196h500" />
      {/* jalan perspektif */}
      <path data-line {...line} d="M252 196L150 296M268 196L370 296" />
      <path {...line} strokeDasharray="6 10" d="M260 200v96" />
      {/* kampus kiri */}
      <path data-line {...line} d="M48 196v-46l34-20 34 20v46M64 196v-24h14v24M90 164h12v12H90zM58 158h12v10H58z" />
      <path data-line {...line} d="M82 130v-14M82 116h12l-4 4 4 4H82" />
      {/* silo + cerobong kanan */}
      <path data-line {...line} d="M396 196v-62c0-3 2-5 5-5h12c3 0 5 2 5 5v62M424 196v-50c0-3 2-5 5-5h12c3 0 5 2 5 5v50M454 196v-30l14-9v39" />
      <path data-line {...line} d="M462 157v-40h7v34" />
      <path {...line} strokeDasharray="2 6" d="M466 110c6-8 14-10 22-6" />
      {/* bendera 2030 di ujung jalan */}
      <path data-line {...line} d="M260 186v-46" />
      <path d="M260 140h34l-7 8 7 8h-34z" {...accent} />
      {/* awan */}
      <path data-line {...line} d="M110 72c0-8 6-14 14-14 6 0 11 4 13 9 2-1 4-1 6-1 7 0 12 5 12 12h-45" />
      <path data-line {...line} d="M372 54c0-7 5-12 12-12 5 0 9 3 11 8 7 0 12 5 12 12h-35" />
      <circle cx="260" cy="196" r="3.2" {...accent} />
    </svg>
  );
}

/**
 * "Jalur lulusan": gedung kampus di kiri → toga di tengah → jalan bercabang ke tiga tujuan
 * (gedung kantor, pabrik/silo, layar data). Lebar (viewBox 520×300) untuk hero Profil Lulusan.
 * Titik tujuan bertanda data-node agar bisa "menyala" bergantian.
 */
export function GraduatePathIllustration({ className }) {
  return (
    <svg viewBox="0 0 520 300" role="img" aria-label="Ilustrasi jalur lulusan dari kampus menuju beragam karier" className={className ?? "h-auto w-full text-ink"}>
      {/* tanah */}
      <path data-line {...line} d="M10 262h500" />
      {/* kampus kiri */}
      <path d="M34 262v-70l44-26 44 26v70z" {...soft} />
      <path data-line {...line} d="M34 262v-70l44-26 44 26v70M58 262v-30h18v30M90 204h16v14H90zM46 204h16v14H46z" />
      <path data-line {...line} d="M78 166v-20M78 146h16l-5 5 5 5H78" />
      {/* jalan dari kampus ke toga */}
      <path {...line} strokeDasharray="5 8" d="M122 236c30 0 44-10 70-10s34 6 58 6" />
      {/* toga di tengah */}
      <path d="M232 152l38-16 38 16-38 16z" {...soft} />
      <path data-line {...line} d="M232 152l38-16 38 16-38 16zM248 159v20c0 6 10 11 22 11s22-5 22-11v-20M308 152v26" />
      <circle cx="308" cy="180" r="3.4" {...accent} />
      <path data-line {...line} d="M270 190v40M258 232h24" />
      {/* cabang ke tiga tujuan */}
      <path {...line} strokeDasharray="5 8" d="M286 232c26 0 40-46 82-70M290 234c34 0 54-8 90-8M286 236c30 0 52 14 84 22" />
      {/* tujuan 1: gedung kantor */}
      <rect x="378" y="96" width="44" height="66" rx="3" {...soft} />
      <path data-line {...line} d="M378 162V100c0-2 2-4 4-4h36c2 0 4 2 4 4v62M390 110h6M404 110h6M390 124h6M404 124h6M390 138h6M404 138h6M396 162v-12h8v12" />
      <circle data-node cx="372" cy="160" r="4" {...node} />
      {/* tujuan 2: silo pabrik */}
      <path data-line {...line} d="M392 262v-44c0-2 2-4 4-4h10c2 0 4 2 4 4v44M414 262v-32c0-2 2-4 4-4h10c2 0 4 2 4 4v32M436 262v-20l14-8v28" />
      <path {...line} strokeDasharray="2 6" d="M444 228c5-8 12-10 20-6" />
      <circle data-node cx="384" cy="226" r="4" {...node} />
      {/* tujuan 3: layar data */}
      <rect data-line {...line} x="452" y="150" width="54" height="38" rx="3" />
      <path data-line {...line} d="M462 178l10-10 8 6 16-14M470 196h18M479 188v8" />
      <circle data-node cx="446" cy="200" r="4" {...node} />
      {/* bintang kecil & awan */}
      <path data-line {...line} d="M160 70c0-7 5-12 12-12 5 0 9 3 11 8 7 0 12 5 12 12h-35" />
      <path data-line {...line} d="M270 96v-12M262 90h16" />
      <path data-line {...line} d="M214 58v-8M210 54h8M336 64v-8M332 60h8" />
    </svg>
  );
}

/**
 * Bagan organisasi line-art: satu simpul pimpinan bercabang ke koordinator lalu ke tim.
 * Lebar (viewBox 520×300) untuk hero Struktur Organisasi. Simpul bertanda data-node agar bisa berdenyut.
 */
export function OrgTreeIllustration({ className }) {
  const person = (cx, cy, r = 12) => (
    <g key={`${cx}-${cy}`}>
      <circle cx={cx} cy={cy} r={r + 10} {...soft} />
      <circle data-line {...line} cx={cx} cy={cy - r * 0.35} r={r * 0.42} />
      <path data-line {...line} d={`M${cx - r * 0.75} ${cy + r * 0.8}c0-${r * 0.6} ${r * 0.34}-${r * 0.95} ${r * 0.75}-${r * 0.95}s${r * 0.75} ${r * 0.35} ${r * 0.75} ${r * 0.95}`} />
      <circle data-line {...line} cx={cx} cy={cy} r={r + 10} />
    </g>
  );
  return (
    <svg viewBox="0 0 520 300" role="img" aria-label="Ilustrasi bagan organisasi program studi" className={className ?? "h-auto w-full text-ink"}>
      {/* konektor */}
      <path data-line {...line} d="M260 74v26M110 100h300M110 100v30M260 100v30M410 100v30" />
      <path data-line {...line} d="M110 182v22M60 204h100M60 204v24M160 204v24M410 182v22M360 204h100M360 204v24M460 204v24" />
      <path {...line} strokeDasharray="4 7" d="M260 182v46" />
      {/* pimpinan */}
      <rect x="214" y="18" width="92" height="56" rx="8" {...soft} />
      <rect data-line {...line} x="214" y="18" width="92" height="56" rx="8" />
      <circle data-line {...line} cx="240" cy="40" r="7" />
      <path data-line {...line} d="M229 62c0-7 5-11 11-11s11 4 11 11M260 36h32M260 46h22M260 56h26" />
      <path data-line {...line} d="M252 18l8-8 8 8" />
      {/* koordinator */}
      {person(110, 156)}
      {person(260, 156)}
      {person(410, 156)}
      {/* tim */}
      {[60, 160, 360, 460].map((x) => (
        <g key={x}>
          <rect data-line {...line} x={x - 22} y="228" width="44" height="34" rx="6" />
          <path data-line {...line} d={`M${x - 12} 240h24M${x - 12} 250h14`} />
        </g>
      ))}
      <rect data-line {...line} x="236" y="228" width="48" height="34" rx="6" />
      <path data-line {...line} d="M248 240h24M248 250h14" />
      {/* titik simpul */}
      <circle data-node cx="260" cy="100" r="4" {...node} />
      <circle data-node cx="110" cy="100" r="4" {...node} />
      <circle data-node cx="410" cy="100" r="4" {...node} />
      <circle data-node cx="110" cy="204" r="3.4" {...node} />
      <circle data-node cx="410" cy="204" r="3.4" {...node} />
      <circle cx="300" cy="22" r="3" {...accent} />
      <path data-line {...line} d="M10 286h500" />
      <path data-line {...line} d="M486 40v-12M480 34h12M30 70v-8M26 66h8" />
    </svg>
  );
}

/**
 * "Tiga jalur kelas": gedung kampus di tengah dengan tiga jalan menuju
 * (0) matahari + ruang kelas pagi, (1) bulan + laptop (malam/akhir pekan), (2) silo pabrik (kemitraan industri).
 * Tiap jalur dibungkus <g data-path="i"> agar bisa disorot sesuai kelas aktif; titik tujuan bertanda data-node.
 */
export function ClassPathsIllustration({ className }) {
  return (
    <svg viewBox="0 0 520 300" role="img" aria-label="Ilustrasi kampus dengan tiga jalur kelas: pagi, malam, dan industri" className={className ?? "h-auto w-full text-ink"}>
      {/* tanah */}
      <path data-line {...line} d="M10 268h500" />
      {/* kampus tengah */}
      <path d="M210 268v-92l50-30 50 30v92z" {...soft} />
      <path data-line {...line} d="M210 268v-92l50-30 50 30v92M246 268v-34h28v34M224 190h18v16h-18zM278 190h18v16h-18zM224 214h18v14h-18zM278 214h18v14h-18z" />
      <path data-line {...line} d="M260 146v-26M260 120h18l-6 6 6 6h-18" />
      <path data-line {...line} d="M196 268v-8h128v8" />

      {/* jalur 0 — pagi */}
      <g data-path="0">
        <path {...line} strokeDasharray="5 8" d="M210 248c-34 0-48-24-86-30" />
        <circle data-line {...line} cx="72" cy="78" r="18" />
        <path data-line {...line} d="M72 46v-10M72 120v-10M40 78H30M114 78h-10M49 55l-7-7M102 108l-7-7M95 55l7-7M42 108l7-7" />
        <rect x="40" y="196" width="72" height="44" rx="3" {...soft} />
        <path data-line {...line} d="M40 268v-72h72v72M52 210h48M52 222h32M76 240v28" />
        <circle data-node cx="120" cy="216" r="4.5" {...node} />
      </g>

      {/* jalur 1 — malam & akhir pekan */}
      <g data-path="1">
        <path {...line} strokeDasharray="5 8" d="M300 150c26-30 52-44 92-50" />
        <path data-line {...line} d="M440 38a22 22 0 1 0 22 30 17 17 0 0 1-22-30z" />
        <path data-line {...line} d="M404 34v-8M400 30h8M488 92v-8M484 88h8" />
        <rect x="372" y="104" width="70" height="44" rx="3" {...soft} />
        <path data-line {...line} d="M372 148v-40c0-2 2-4 4-4h62c2 0 4 2 4 4v40M362 148h90l-6 8h-78zM386 118h26M386 130h40" />
        <circle data-node cx="394" cy="98" r="4.5" {...node} />
      </g>

      {/* jalur 2 — kemitraan industri */}
      <g data-path="2">
        <path {...line} strokeDasharray="5 8" d="M310 248c30 0 48-4 78-8" />
        <path d="M402 268v-62h20v62zM428 268v-46h20v46z" {...soft} />
        <path data-line {...line} d="M402 268v-58c0-2 2-4 4-4h12c2 0 4 2 4 4v58M428 268v-42c0-2 2-4 4-4h12c2 0 4 2 4 4v42M454 268v-24l18-10v34l18-10v10" />
        <path data-line {...line} d="M412 206v-26h4v26M412 180c4-10 14-12 22-6" />
        <circle data-node cx="392" cy="240" r="4.5" {...node} />
      </g>

      {/* awan kecil */}
      <path data-line {...line} d="M176 66c0-7 5-12 12-12 5 0 9 3 11 8 7 0 12 5 12 12h-35" />
      <path data-line {...line} d="M300 54v-8M296 50h8" />
    </svg>
  );
}

/**
 * "Jejaring keahlian dosen": sosok dosen di podium di tengah, terhubung ke empat simpul rumpun —
 * (tata-kelola) perisai, (enterprise) roda gigi, (data) grafik, (strategi) target.
 * Tiap simpul dibungkus <g data-field="key"> agar bisa disorot sesuai filter aktif; titik konektor bertanda data-node.
 */
export function LecturerNetworkIllustration({ className }) {
  return (
    <svg viewBox="0 0 520 320" role="img" aria-label="Ilustrasi dosen terhubung ke empat rumpun keahlian: tata kelola, enterprise, data, dan strategi" className={className ?? "h-auto w-full text-ink"}>
      {/* lantai */}
      <path data-line {...line} d="M30 292h460" />
      {/* dosen + podium */}
      <circle cx="260" cy="150" r="64" {...soft} />
      <circle data-line {...line} cx="260" cy="118" r="17" />
      <path data-line {...line} d="M226 186c0-22 15-36 34-36s34 14 34 36" />
      <path data-line {...line} d="M250 152l10 14 10-14" />
      <path d="M222 186h76l-8 106h-60z" {...soft} />
      <path data-line {...line} d="M216 186h88M222 186l8 106h60l8-106M240 214h40" />
      <circle cx="260" cy="232" r="5" {...accent} />
      {/* papan presentasi kecil di belakang */}
      <path data-line {...line} d="M300 96h44v30h-44zM322 126v12M310 104h22M310 112h14" />

      {/* rumpun: tata kelola — perisai */}
      <g data-field="tata-kelola">
        <path {...line} strokeDasharray="4 7" d="M228 132C180 110 150 92 118 84" />
        <circle cx="86" cy="74" r="34" {...soft} />
        <path data-line {...line} d="M86 50l22 8v16c0 14-10 24-22 28-12-4-22-14-22-28V58z" />
        <path data-line {...line} d="M76 76l7 7 13-14" />
        <circle data-node cx="120" cy="84" r="4.5" {...node} />
      </g>

      {/* rumpun: enterprise — roda gigi */}
      <g data-field="enterprise">
        <path {...line} strokeDasharray="4 7" d="M292 132c48-22 78-40 110-48" />
        <circle cx="434" cy="74" r="34" {...soft} />
        <circle data-line {...line} cx="434" cy="74" r="14" />
        <circle data-line {...line} cx="434" cy="74" r="5" />
        <path data-line {...line} d="M434 52v-6M434 102v-6M412 74h-6M462 74h-6M418 58l-4-4M454 94l-4-4M450 58l4-4M414 94l4-4" />
        <circle data-node cx="400" cy="84" r="4.5" {...node} />
      </g>

      {/* rumpun: data — grafik */}
      <g data-field="data">
        <path {...line} strokeDasharray="4 7" d="M222 210c-40 10-70 18-102 20" />
        <circle cx="86" cy="232" r="34" {...soft} />
        <path data-line {...line} d="M64 252h44M68 252v-14M80 252v-24M92 252v-18M104 252v-30" />
        <path data-line {...line} d="M66 226l14-10 12 8 14-16" />
        <circle data-node cx="120" cy="230" r="4.5" {...node} />
      </g>

      {/* rumpun: strategi — target */}
      <g data-field="strategi">
        <path {...line} strokeDasharray="4 7" d="M298 210c40 10 70 18 102 20" />
        <circle cx="434" cy="232" r="34" {...soft} />
        <circle data-line {...line} cx="434" cy="232" r="20" />
        <circle data-line {...line} cx="434" cy="232" r="11" />
        <circle cx="434" cy="232" r="3.5" {...accent} />
        <path data-line {...line} d="M434 232l20-20M448 210h8v8" />
        <circle data-node cx="400" cy="230" r="4.5" {...node} />
      </g>

      {/* bintang kecil */}
      <path data-line {...line} d="M190 50v-10M185 45h10M352 40v-8M348 36h8M496 160v-8M492 156h8" />
    </svg>
  );
}

/**
 * Podium prestasi: tiga anak tangga = tiga tingkat (tengah internasional, kiri nasional, kanan regional).
 * Piala di puncak, medali di anak tangga lain, konfeti & daun salam. `[data-level]` dipakai `.podium`
 * untuk menyalakan tingkat aktif; `[data-node]` berdenyut.
 */
export function PodiumIllustration({ className }) {
  return (
    <svg viewBox="0 0 520 320" role="img" aria-label="Ilustrasi podium juara dengan piala dan medali untuk tingkat internasional, nasional, dan regional" className={className ?? "h-auto w-full text-ink"}>
      {/* lantai & bayangan */}
      <path data-line {...line} d="M40 292h440" />
      <path data-line {...line} strokeDasharray="2 8" d="M70 302h380" />

      {/* konfeti */}
      <g>
        <path data-line {...line} d="M150 74l8 6M372 62l-6 8M118 128l10-2M404 118l9 3M196 40l2 9M330 34l-3 9" />
        <circle cx="176" cy="96" r="3.5" {...accent} />
        <circle cx="352" cy="92" r="3" fill="var(--gold)" />
        <rect x="262" y="22" width="7" height="7" rx="1.5" fill="var(--gold)" transform="rotate(20 265 25)" />
        <rect x="130" y="162" width="6" height="6" rx="1.5" {...accent} transform="rotate(-18 133 165)" />
        <circle cx="420" cy="166" r="3" {...accent} />
      </g>

      {/* nasional — kiri */}
      <g data-level="nasional">
        <path d="M92 210h108v82H92z" {...soft} />
        <path data-line {...line} d="M92 292v-82h108v82" />
        <path data-line {...line} d="M139 238c1-6 13-7 14 0 1 6-14 12-14 18h14" />
        {/* medali */}
        <path data-line {...line} d="M134 148l12 24 12-24" />
        <circle data-line {...line} cx="146" cy="184" r="13" />
        <path data-line {...line} d="M140 184l4 4 8-8" />
        <circle data-node cx="146" cy="210" r="4.5" {...node} />
      </g>

      {/* regional — kanan */}
      <g data-level="regional">
        <path d="M320 236h108v56H320z" {...soft} />
        <path data-line {...line} d="M320 292v-56h108v56" />
        <path data-line {...line} d="M367 252h13l-7 8c5 0 8 3 8 7s-4 7-8 7c-3 0-6-1-7-4" />
        <path data-line {...line} d="M362 178l12 22 12-22" />
        <circle data-line {...line} cx="374" cy="210" r="12" />
        <circle cx="374" cy="210" r="4" fill="var(--gold)" />
        <circle data-node cx="374" cy="236" r="4.5" {...node} />
      </g>

      {/* internasional — tengah */}
      <g data-level="internasional">
        <path d="M200 170h120v122H200z" {...soft} />
        <path data-line {...line} d="M200 292V170h120v122" />
        <path data-line {...line} d="M254 206l8-6v40M252 240h20" />
        {/* piala */}
        <path d="M234 82h52l-4 34c-2 14-12 22-22 22s-20-8-22-22z" fill="var(--gold)" fillOpacity="0.32" />
        <path data-line {...line} d="M234 82h52l-4 34c-2 14-12 22-22 22s-20-8-22-22zM234 92c-14 0-18 8-16 16 2 8 10 12 18 10M286 92c14 0 18 8 16 16-2 8-10 12-18 10M260 138v14M244 162h32M248 152h24v10h-24z" />
        <path data-line {...line} d="M252 102l8-6 8 6-3 9h-10z" />
        {/* daun salam */}
        <path data-line {...line} d="M206 150c-12-14-14-34-6-50M314 150c12-14 14-34 6-50M202 128l-10-4M200 112l-9-7M318 128l10-4M320 112l9-7" />
        <circle data-node cx="260" cy="170" r="4.5" {...node} />
      </g>

      {/* globe kecil (internasional) */}
      <circle data-line {...line} cx="446" cy="74" r="16" />
      <path data-line {...line} d="M430 74h32M446 58c-8 9-8 23 0 32M446 58c8 9 8 23 0 32" />
      <path data-line {...line} strokeDasharray="4 7" d="M430 84c-40 24-90 26-134 10" />
    </svg>
  );
}

/**
 * "Tangga delapan semester": tumpukan buku di kiri menjadi tangga 8 anak tangga menuju toga.
 * Tiap anak tangga dibungkus <g data-step="n" data-on> — anak tangga ≤ `active` menyala; yang aktif berdenyut (data-node).
 */
export function CurriculumMapIllustration({ className, active = 0 }) {
  const steps = Array.from({ length: 8 }, (_, i) => {
    const x = 150 + i * 36;
    const top = 268 - (i + 1) * 22;
    return { n: i + 1, x, top };
  });
  return (
    <svg viewBox="0 0 520 320" role="img" aria-label="Ilustrasi tumpukan buku yang menjadi tangga delapan semester menuju toga wisuda" className={className ?? "h-auto w-full text-ink"}>
      <path data-line {...line} d="M14 268h492" />
      {/* tumpukan buku */}
      <rect x="34" y="236" width="104" height="32" rx="3" {...soft} />
      <path data-line {...line} d="M34 268v-32h104v32M44 252h70M34 236l8-26h88l8 26M52 222h60" />
      <path data-line {...line} d="M48 210l10-30h64l8 30M66 196h44" />
      <path data-line {...line} d="M128 180l-8-24M120 156l-26 6" />
      {/* tangga */}
      {steps.map((s) => (
        <g key={s.n} data-step={s.n} data-on={s.n <= active ? "" : undefined} data-current={s.n === active ? "" : undefined}>
          <rect x={s.x} y={s.top} width="36" height={268 - s.top} {...soft} />
          <path data-line {...line} d={`M${s.x} ${s.top}h36v${268 - s.top}`} />
          <text x={s.x + 18} y={s.top + 17} textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor" fillOpacity="0.6">{s.n}</text>
          <circle data-node cx={s.x + 18} cy={s.top - 9} r="4" {...node} />
        </g>
      ))}
      {/* toga di puncak */}
      <g transform="translate(436 40)">
        <path data-line {...line} d="M0 22L34 8l34 14-34 14z" />
        <path data-line {...line} d="M14 28v14c0 6 40 6 40 0V28M62 25v18" />
        <circle cx="62" cy="46" r="3" {...accent} />
      </g>
      <path data-line {...line} strokeDasharray="4 7" d="M150 200c60-70 150-120 270-140" />
      <path data-line {...line} d="M88 104v-10M83 99h10M300 70v-8M296 66h8" />
    </svg>
  );
}

/**
 * "Empat jalur kelulusan": satu jalan dari bawah bercabang empat — (skripsi) buku, (lomba) piala,
 * (pkm) bola lampu, (bisnis) toko. Dipakai di permukaan maroon: garis putih, aksen emas.
 * Tiap cabang dibungkus <g data-branch="key">; titik tujuan bertanda data-node.
 */
export function GraduationForkIllustration({ className }) {
  const gold = { fill: "var(--gold)", style: { transformBox: "fill-box", transformOrigin: "center" } };
  const glow = { fill: "var(--gold)", fillOpacity: 0.14 };
  return (
    <svg viewBox="0 0 520 300" role="img" aria-label="Ilustrasi jalan yang bercabang empat menuju skripsi, lomba, PKM, dan bisnis" className={className ?? "h-auto w-full text-white"}>
      <path data-line {...line} d="M206 300c20-44 40-80 50-104M314 300c-20-44-40-80-50-104" />
      <path data-line {...line} strokeDasharray="6 9" d="M260 294v-86" />
      <circle cx="260" cy="190" r="6" {...gold} />

      <g data-branch="skripsi">
        <path {...line} strokeDasharray="5 8" d="M260 190c-60-20-120-40-176-92" />
        <rect x="50" y="34" width="66" height="50" rx="3" {...glow} />
        <path data-line {...line} d="M50 84V40c12-6 22-6 33 0 11-6 21-6 33 0v44c-12-6-22-6-33 0-11-6-21-6-33 0zM83 40v44" />
        <circle data-node cx="84" cy="98" r="5" {...gold} />
      </g>
      <g data-branch="lomba">
        <path {...line} strokeDasharray="5 8" d="M260 190c-30-30-50-60-60-104" />
        <rect x="174" y="22" width="52" height="52" rx="3" {...glow} />
        <path data-line {...line} d="M184 28h32v14c0 10-7 18-16 18s-16-8-16-18zM184 34h-8c0 10 4 14 10 14M216 34h8c0 10-4 14-10 14M200 60v8M190 74h20v-6h-20z" />
        <circle data-node cx="200" cy="86" r="5" {...gold} />
      </g>
      <g data-branch="pkm">
        <path {...line} strokeDasharray="5 8" d="M260 190c30-30 50-60 60-104" />
        <circle cx="320" cy="44" r="24" {...glow} />
        <path data-line {...line} d="M320 22c-12 0-20 9-20 20 0 8 5 12 8 17v7h24v-7c3-5 8-9 8-17 0-11-8-20-20-20zM310 72h20M314 66v-8l6-6 6 6v8" />
        <circle data-node cx="320" cy="86" r="5" {...gold} />
      </g>
      <g data-branch="bisnis">
        <path {...line} strokeDasharray="5 8" d="M260 190c60-20 120-40 176-92" />
        <rect x="404" y="36" width="66" height="46" rx="3" {...glow} />
        <path data-line {...line} d="M400 50l8-16h58l8 16zM400 50c0 6 6 10 12 10s12-4 12-10c0 6 6 10 12 10s12-4 12-10c0 6 6 10 12 10s12-4 12-10M406 60v22h62V60M430 82V68h14v14" />
        <circle data-node cx="436" cy="98" r="5" {...gold} />
      </g>
    </svg>
  );
}

/** Roda gigi sebagai path garis (gigi = garis pendek radial). */
function gearTeeth(cx, cy, r, len, n = 8) {
  let d = "";
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const c = Math.cos(a), s = Math.sin(a);
    d += `M${(cx + c * r).toFixed(1)} ${(cy + s * r).toFixed(1)}L${(cx + c * (r + len)).toFixed(1)} ${(cy + s * (r + len)).toFixed(1)}`;
  }
  return d;
}

/**
 * "Kompas bidang keahlian": dua sumbu (proses bisnis ↔ teknologi & data, kendali ↔ strategi) membagi
 * empat kuadran — (0) target strategi, (1) grafik data, (2) roda gigi enterprise, (3) perisai audit.
 * Tiap kuadran dibungkus <g data-quadrant="i"> agar bisa disorot (`.compass[data-active-quadrant]`);
 * jarum di tengah (`data-needle`) diputar dari luar (GSAP, svgOrigin 260 210). `compact` = tanpa cincin luar (mini).
 */
export function CompassQuadrantIllustration({ className, compact = false }) {
  const gold = { fill: "var(--gold)", style: { transformBox: "fill-box", transformOrigin: "center" } };
  return (
    <svg viewBox="0 0 520 420" role="img" aria-label="Ilustrasi kompas empat bidang keahlian: manajemen SI, data science, enterprise systems, dan IT audit" className={className ?? "h-auto w-full text-ink"}>
      {!compact && (
        <>
          <circle {...line} cx="260" cy="210" r="186" strokeDasharray="2 7" opacity="0.5" />
          <circle data-line {...line} cx="260" cy="210" r="128" opacity="0.35" />
        </>
      )}
      {/* sumbu */}
      <path data-line {...line} d="M44 210h432M260 30v360" />
      <path data-line {...line} d="M468 203l9 7-9 7M52 203l-9 7 9 7M253 38l7-9 7 9M253 382l7 9 7-9" />
      <path {...line} d="M250 120h20M250 300h20M170 200v20M350 200v20" opacity="0.5" />

      {/* 0 — kiri atas: strategi (target + anak panah) */}
      <g data-quadrant="0">
        <circle cx="140" cy="112" r="36" {...soft} />
        <circle data-line {...line} cx="140" cy="112" r="36" />
        <circle data-line {...line} cx="140" cy="112" r="22" />
        <circle data-line {...line} cx="140" cy="112" r="9" />
        <path data-line {...line} d="M198 54l-52 52M198 54v14M198 54h-14M190 46l8 8" />
        <circle data-node cx="140" cy="112" r="4.5" {...gold} />
      </g>

      {/* 1 — kanan atas: data (batang + tren) */}
      <g data-quadrant="1">
        <rect x="346" y="92" width="72" height="50" rx="3" {...soft} />
        <path data-line {...line} d="M336 142h92" />
        <rect data-line {...line} x="348" y="116" width="12" height="26" rx="2" />
        <rect data-line {...line} x="368" y="102" width="12" height="40" rx="2" />
        <rect data-line {...line} x="388" y="88" width="12" height="54" rx="2" />
        <path data-line {...line} d="M344 100l22-14 22-10 30-20" />
        <path {...line} strokeDasharray="3 6" d="M418 56l14-8" />
        <circle data-node cx="418" cy="56" r="4.5" {...gold} />
      </g>

      {/* 2 — kiri bawah: enterprise (dua roda gigi + modul) */}
      <g data-quadrant="2">
        <circle cx="124" cy="300" r="18" {...soft} />
        <circle data-line {...line} cx="124" cy="300" r="18" />
        <circle data-line {...line} cx="124" cy="300" r="6" />
        <path data-line {...line} d={gearTeeth(124, 300, 18, 7)} />
        <circle data-line {...line} cx="163" cy="331" r="12" />
        <circle data-line {...line} cx="163" cy="331" r="4" />
        <path data-line {...line} d={gearTeeth(163, 331, 12, 6)} />
        <rect data-line {...line} x="72" y="338" width="34" height="22" rx="3" />
        <path {...line} strokeDasharray="3 6" d="M106 349h24c6 0 10-4 12-8" />
        <circle data-node cx="124" cy="300" r="4.5" {...gold} />
      </g>

      {/* 3 — kanan bawah: audit (perisai + centang + kaca pembesar) */}
      <g data-quadrant="3">
        <path d="M378 268l32 12v30c0 20-14 34-32 42-18-8-32-22-32-42v-30z" {...soft} />
        <path data-line {...line} d="M378 268l32 12v30c0 20-14 34-32 42-18-8-32-22-32-42v-30z" />
        <path data-line {...line} d="M364 310l10 10 20-23" />
        <circle data-line {...line} cx="430" cy="350" r="12" />
        <path data-line {...line} d="M439 359l12 12" />
        <circle data-node cx="410" cy="280" r="4.5" {...gold} />
      </g>

      {/* jarum */}
      <g data-needle>
        <path d="M260 146l11 64h-22z" fill="var(--maroon)" />
        <path d="M249 210h22l-11 64z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <circle cx="260" cy="210" r="7" fill="var(--gold)" />
        <circle cx="260" cy="210" r="2.4" fill="currentColor" />
      </g>
    </svg>
  );
}

/**
 * "Buku pedoman": buku terbuka dengan enam pita pembatas yang menjuntai dari bawah — satu pita per bab.
 * Dipakai di permukaan maroon: garis putih, aksen emas. Pita dibungkus <g data-ribbon="key"> (urut `keys`)
 * agar bisa dinyalakan dari luar (`.rulebook [data-ribbon][data-on]`). Pita digambar sebelum halaman
 * sehingga pangkalnya tertutup buku.
 */
export function RulebookIllustration({ className, keys = ["1", "2", "3", "4", "5", "6"] }) {
  const xs = [96, 150, 204, 316, 370, 424];
  const glow = { fill: "var(--gold)", fillOpacity: 0.12 };
  const page = "M260 84C206 62 118 58 44 72v188c74-14 162-10 216 12z";
  const pageR = "M260 84c54-22 142-26 216-12v188c-74-14-162-10-216 12z";
  return (
    <svg viewBox="0 0 520 320" role="img" aria-label="Ilustrasi buku pedoman terbuka dengan enam pita pembatas" className={className ?? "h-auto w-full text-white"}>
      {keys.slice(0, 6).map((k, i) => (
        <g key={k} data-ribbon={k} style={{ transformBox: "fill-box", transformOrigin: "50% 0%" }}>
          <path data-rib d={`M${xs[i] - 9} 238V${300 - (i % 3) * 8}l9-8 9 8V238z`} />
        </g>
      ))}
      {/* tumpukan halaman */}
      <path data-line {...line} d="M44 260v10c74-14 162-10 216 12 54-22 142-26 216-12v-10" />
      <path {...line} opacity="0.45" d="M44 270v8c74-14 162-10 216 12 54-22 142-26 216-12v-8" />
      <path d={page} fill="var(--maroon)" />
      <path d={pageR} fill="var(--maroon)" />
      <path d={page} {...glow} />
      <path data-line {...line} d={page} />
      <path data-line {...line} d={pageR} />
      <path data-line {...line} d="M260 84v188" />
      {/* halaman kiri: judul bab + baris teks */}
      <path data-line {...line} strokeWidth="3" d="M78 104c40-6 88-6 128 2" />
      <path data-line {...line} opacity="0.7" d="M78 132c52-6 104-4 150 6M78 152c52-6 104-4 150 6M78 172c52-6 104-4 150 6M78 192c40-5 80-4 112 3M78 220c52-6 104-4 150 6" />
      <circle cx="70" cy="132" r="2.5" fill="var(--gold)" />
      {/* halaman kanan: tanda pasal + butir bercentang */}
      <text x="296" y="128" fill="var(--gold)" fontFamily="var(--font-noto-serif), serif" fontSize="38" fontStyle="italic">§</text>
      <path data-line {...line} d="M330 112c40-8 84-8 114-2M330 126c30-5 60-5 84-1" />
      <rect data-line {...line} x="296" y="150" width="14" height="14" rx="3" />
      <path data-line {...line} stroke="var(--gold)" strokeWidth="2.2" d="M299 157l3.5 3.5 6-7" />
      <path data-line {...line} opacity="0.7" d="M322 158c40-6 80-6 120-1" />
      <rect data-line {...line} x="296" y="180" width="14" height="14" rx="3" />
      <path data-line {...line} stroke="var(--gold)" strokeWidth="2.2" d="M299 187l3.5 3.5 6-7" />
      <path data-line {...line} opacity="0.7" d="M322 188c40-6 80-6 120-1" />
      <rect data-line {...line} x="296" y="210" width="14" height="14" rx="3" />
      <path data-line {...line} opacity="0.7" d="M322 218c30-5 62-5 92-1" />
    </svg>
  );
}

/**
 * Kawasan industri Gresik untuk hero Magang: silo semen, kiln miring, cerobong, ban berjalan, derek pelabuhan,
 * dan gedung kantor. Garis `[data-line]` digambar anime.js; asap `[data-smoke]` dianimasikan dari luar;
 * jendela kantor `[data-window]` bisa dinyalakan bergiliran. Warna garis = currentColor.
 */
export function IndustrySkylineIllustration({ className }) {
  const gold = { fill: "var(--gold)" };
  const glow = { fill: "var(--gold)", fillOpacity: 0.14 };
  return (
    <svg viewBox="0 0 560 240" role="img" aria-label="Ilustrasi kawasan industri: silo semen, kiln, cerobong, ban berjalan, derek pelabuhan, dan gedung kantor" className={className ?? "h-auto w-full text-navy"}>
      <circle cx="430" cy="62" r="34" {...glow} />
      <circle cx="430" cy="62" r="14" {...gold} fillOpacity="0.55" />
      {/* tanah */}
      <path data-line {...line} d="M8 222h544" />
      <path data-line {...line} strokeDasharray="4 8" opacity="0.5" d="M30 232h500" />
      {/* silo */}
      <path data-line {...line} d="M40 222V108c0-8 26-8 26 0v114M66 222V96c0-8 26-8 26 0v126M92 222V116c0-8 26-8 26 0v106" />
      <path data-line {...line} opacity="0.6" d="M40 140h26M66 130h26M92 148h26M40 180h78" />
      <rect x="66" y="96" width="26" height="126" {...glow} />
      {/* cerobong + asap */}
      <path data-line {...line} d="M140 222V60h14v162M136 60h22" />
      <path data-line {...line} opacity="0.6" d="M140 90h14M140 120h14" />
      <g data-smoke>
        <circle cx="150" cy="44" r="7" {...line} opacity="0.55" />
        <circle cx="162" cy="30" r="9" {...line} opacity="0.4" />
        <circle cx="178" cy="18" r="6" {...line} opacity="0.3" />
      </g>
      {/* kiln miring */}
      <path data-line {...line} d="M168 200l120-34M172 214l120-34M168 200c-6 2-4 16 4 14M288 166c8-2 10 12 4 14" />
      <path data-line {...line} d="M196 222v-20M262 222v-38" />
      <circle cx="204" cy="198" r="4" {...gold} />
      <circle cx="252" cy="184" r="4" {...gold} />
      {/* ban berjalan ke gudang */}
      <path data-line {...line} d="M296 176l74-64M304 184l74-64" />
      <path data-line {...line} strokeDasharray="3 7" d="M300 180l74-64" />
      <path data-line {...line} d="M370 222v-62h46v62M366 160l27-18 27 18" />
      {/* gedung kantor */}
      <path data-line {...line} d="M432 222V118h56v104M424 118h72" />
      {[0, 1, 2, 3].map((r) =>
        [0, 1, 2].map((c) => <rect key={`${r}${c}`} data-window x={442 + c * 14} y={130 + r * 20} width="8" height="10" rx="1" fill="var(--gold)" fillOpacity="0.18" />)
      )}
      <path data-line {...line} d="M452 222v-16h16v16" />
      {/* derek pelabuhan */}
      <path data-line {...line} d="M516 222V92M506 222l10-20 10 20M516 96h-56M516 96l26 8M478 96v34" />
      <rect x="470" y="130" width="16" height="12" rx="1.5" {...gold} />
    </svg>
  );
}

/**
 * Meja tukar untuk hero Konversi SKS: jam dinding + tumpukan blok jam kegiatan (kiri) → lengkung jalur bertitik →
 * lembar transkrip bertumpuk dengan stempel (kanan). `[data-line]` digambar anime.js; `[data-route]` = jalur
 * yang dilalui keping `[data-coin]` (dianimasikan dari luar); `[data-hand]` = jarum jam yang berputar;
 * `[data-row]` = baris transkrip yang menyala bergiliran. Warna garis = currentColor.
 */
export function CreditExchangeIllustration({ className }) {
  const gold = { fill: "var(--gold)" };
  const glow = { fill: "var(--gold)", fillOpacity: 0.14 };
  return (
    <svg viewBox="0 0 520 170" role="img" aria-label="Ilustrasi jam kegiatan yang ditukar menjadi baris SKS di lembar transkrip" className={className ?? "h-auto w-full text-white"}>
      {/* lantai meja */}
      <path data-line {...line} d="M10 156h500" />
      <path data-line {...line} strokeDasharray="3 8" opacity="0.45" d="M40 165h440" />
      {/* jam dinding */}
      <circle cx="74" cy="58" r="34" {...glow} />
      <circle data-line cx="74" cy="58" r="34" {...line} />
      <path data-line {...line} opacity="0.6" d="M74 28v6M74 82v6M44 58h6M98 58h6" />
      <g data-hand style={{ transformBox: "view-box", transformOrigin: "74px 58px" }}>
        <path {...line} strokeWidth="2.4" d="M74 58V38" />
      </g>
      <path {...line} strokeWidth="2.4" d="M74 58l12 7" />
      <circle cx="74" cy="58" r="3" {...gold} />
      {/* blok jam kegiatan bertumpuk */}
      <path data-line {...line} d="M40 156v-22h28v22M68 156v-34h28v34M96 156v-14h28v14" />
      <rect x="68" y="122" width="28" height="34" {...glow} />
      <path data-line {...line} opacity="0.55" d="M40 145h28M68 133h28M68 145h28" />
      {/* jalur tukar */}
      <path data-route data-line {...line} strokeDasharray="2 7" d="M128 120C190 30 320 30 382 106" />
      <path data-line {...line} d="M372 98l10 8 2-13" />
      {[0, 1, 2].map((i) => (
        <g key={i} data-coin opacity="0">
          <circle r="9" fill="var(--gold)" />
          <path d="M-3.5 -1.5h7M-3.5 1.5h7" stroke="var(--navy)" strokeWidth="1.4" strokeLinecap="round" />
        </g>
      ))}
      {/* lembar transkrip bertumpuk */}
      <path data-line {...line} opacity="0.45" d="M408 64l84 -4 4 96" />
      <path data-line {...line} opacity="0.7" d="M402 60h86v96" />
      <rect data-line x="394" y="54" width="88" height="102" rx="4" {...line} />
      <path data-line {...line} strokeWidth="3" d="M406 70h40" />
      {[0, 1, 2, 3].map((r) => (
        <g key={r}>
          <path data-line {...line} opacity="0.7" d={`M406 ${90 + r * 15}h44`} />
          <rect data-row x="458" y={85 + r * 15} width="14" height="9" rx="1.5" fill="var(--gold)" fillOpacity="0.2" />
        </g>
      ))}
      <circle cx="470" cy="146" r="13" {...line} stroke="var(--gold)" />
      <path {...line} stroke="var(--gold)" strokeWidth="2" d="M464 146l4 4 8-8" />
    </svg>
  );
}


/**
 * Hero Bootcamp & Course: dua adegan dalam satu kanvas, dipilih lewat `mode`.
 * - bootcamp: lintasan lari menuju garis finis — gawang = minggu, bendera finis = sertifikat, pelari = titik emas `[data-runner]`
 * - course  : rak terbuka — buku berdiri dengan tinggi berbeda, satu buku ditarik, jalur bebas berliku ke lampu baca
 * Garis `[data-line]` di adegan aktif digambar ulang anime.js saat mode berganti (dikendalikan dari luar).
 */
export function SprintTrackIllustration({ className, mode = "bootcamp", hurdles = 8 }) {
  const gold = { fill: "var(--gold)" };
  const glow = { fill: "var(--gold)", fillOpacity: 0.14 };
  const on = (m) => ({ "data-scene": m, style: { opacity: mode === m ? 1 : 0, transition: "opacity .45s ease" }, "aria-hidden": mode !== m });
  return (
    <svg viewBox="0 0 520 260" role="img" aria-label={mode === "bootcamp" ? "Ilustrasi lintasan lari: gawang per minggu menuju garis finis bersertifikat" : "Ilustrasi rak buku terbuka dengan jalur belajar yang bebas"} className={className ?? "h-auto w-full text-navy"}>
      <path data-line {...line} d="M10 238h500" />
      <g {...on("bootcamp")}>
        <path data-line {...line} d="M30 226C170 222 300 186 470 104" />
        <path data-line {...line} opacity="0.5" d="M30 238C170 236 310 208 490 132" />
        <path data-line {...line} strokeDasharray="5 9" opacity="0.45" d="M30 232C170 229 305 197 480 118" />
        {Array.from({ length: hurdles }, (_, i) => {
          const t = (i + 1) / (hurdles + 1);
          const x = 30 + t * 440;
          const y = 226 - (4 + Math.pow(t, 1.7) * 118);
          return (
            <g key={i} data-hurdle>
              <path data-line {...line} d={`M${x} ${y + 8}v-22M${x + 12} ${y + 5}v-22M${x - 2} ${y - 12}h16`} />
              <text x={x + 6} y={y - 20} textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.5" fontFamily="var(--font-sans)">{i + 1}</text>
            </g>
          );
        })}
        <path data-line {...line} d="M470 104V30" />
        <path data-line {...line} d="M470 32h40l-10 14 10 14h-40" />
        <rect x="470" y="32" width="34" height="28" {...glow} />
        <circle cx="487" cy="46" r="6" {...gold} />
        <circle data-runner cx="30" cy="226" r="7" {...gold} />
      </g>
      <g {...on("course")}>
        <path data-line {...line} d="M40 238V96h300v142M40 168h300M40 96h300" />
        {[[56, 30], [82, 46], [104, 22], [132, 40], [160, 54]].map(([x, h], i) => (
          <path key={`a${i}`} data-line {...line} d={`M${x} 168v-${h}h18v${h}`} />
        ))}
        <rect x="104" y="146" width="18" height="22" {...glow} />
        {[[200, 36], [224, 50], [252, 28]].map(([x, h], i) => (
          <path key={`b${i}`} data-line {...line} d={`M${x} 238v-${h}h18v${h}`} />
        ))}
        <path data-line {...line} d="M290 168l20-52 16 6-20 52" />
        <rect x="224" y="188" width="18" height="50" {...glow} />
        <path data-line {...line} strokeDasharray="4 8" d="M360 228c30-10 10-50 50-60s20-60 60-70" />
        <path data-line {...line} d="M460 238v-120M440 118h40l-8-22h-24z" />
        <circle cx="460" cy="124" r="22" {...glow} />
        <circle cx="460" cy="110" r="5" {...gold} />
      </g>
    </svg>
  );
}

export const ILLUSTRATIONS = {
  "sprint-track": SprintTrackIllustration,
  "credit-exchange": CreditExchangeIllustration,
  "industry-skyline": IndustrySkylineIllustration,
  rulebook: RulebookIllustration,
  compass: CompassQuadrantIllustration,
  "curriculum-map": CurriculumMapIllustration,
  "graduation-fork": GraduationForkIllustration,
  podium: PodiumIllustration,
  "lecturer-network": LecturerNetworkIllustration,
  "class-paths": ClassPathsIllustration,
  erp: ErpIllustration,
  lecturer: LecturerIllustration,
  industry: IndustryIllustration,
  career: CareerIllustration,
  knowledge: KnowledgeIllustration,
  "graduate-path": GraduatePathIllustration,
  "org-tree": OrgTreeIllustration,
};
