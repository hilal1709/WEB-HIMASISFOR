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

export const ILLUSTRATIONS = {
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
