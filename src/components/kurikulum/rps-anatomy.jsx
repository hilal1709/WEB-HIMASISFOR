"use client";
import { useEffect, useState } from "react";
import { BANNER_KEY } from "@/lib/kurikulum-content";
import { Container, SectionHeader } from "@/components/home/shared";
import { Banner } from "@/components/ui/banner";
import { cn } from "@/lib/utils";
import { useKurikulum } from "./kurikulum-provider";

const PARTS = [
  { key: "id", title: "Identitas", body: "Nama, kode, SKS, semester, dan dosen pengampu: memastikan kamu membuka dokumen yang benar." },
  { key: "cpmk", title: "Capaian (CPMK)", body: "Kemampuan yang harus kamu kuasai di akhir semester. Semua tugas dan ujian mengacu ke sini." },
  { key: "minggu", title: "Rencana 16 minggu", body: "Topik tiap pertemuan, termasuk minggu UTS dan UAS. Pakai untuk menyiapkan bacaan lebih awal." },
  { key: "nilai", title: "Penilaian", body: "Komponen nilai beserta bobotnya, supaya kamu tahu bagian mana yang paling menentukan." },
];

/**
 * "Cara membaca RPS": lembar RPS tiruan dengan empat area bernomor. Hover/fokus nomor atau butir penjelasan
 * menyorot area itu (area lain meredup). Di kanan: banner keterangan contoh (ditutup → diingat sesi) dan
 * pintasan ke mata kuliah yang sudah punya ringkasan RPS. Tidak mengulang daftar mata kuliah.
 */
export function RpsAnatomy() {
  const { courses, totals, openRps, openSearch } = useKurikulum();
  const [active, setActive] = useState("cpmk");
  const [banner, setBanner] = useState(false);
  const ready = courses.filter((c) => c.rps);

  useEffect(() => {
    let hidden = false;
    try {
      hidden = sessionStorage.getItem(BANNER_KEY) === "1";
    } catch {}
    setBanner(!hidden);
  }, []);

  const area = (key) => cn("relative rounded-md transition-[opacity,box-shadow,background-color] duration-500 ease-cinematic", active === key ? "bg-gold/10 opacity-100 shadow-[0_0_0_2px_var(--gold)]" : "opacity-35");
  const Dot = ({ k, n }) => (
    <button
      type="button"
      onMouseEnter={() => setActive(k)}
      onFocus={() => setActive(k)}
      onClick={() => setActive(k)}
      aria-label={`Sorot bagian ${PARTS[n - 1].title}`}
      className={cn("absolute -left-3 -top-3 z-10 grid size-7 place-items-center rounded-full text-[12px] font-bold transition-[background-color,transform] duration-300", active === k ? "scale-110 bg-maroon text-white" : "bg-gold text-navy hover:scale-110")}
    >
      {n}
    </button>
  );

  return (
    <section id="rps" className="relative scroll-mt-24 bg-cream py-16 md:py-24">
      <Container>
        <SectionHeader title={["Cara membaca", "RPS"]} body="Rencana Pembelajaran Semester adalah kontrak belajar tiap mata kuliah. Empat bagian ini yang paling sering kamu butuhkan." size="sm" />

        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-16">
          {/* lembar RPS tiruan */}
          <div className="relative mx-auto w-full max-w-[520px]">
            <span aria-hidden className="absolute inset-0 translate-x-4 translate-y-4 rotate-[1.5deg] rounded-lg bg-white/60 shadow-sm" />
            <div className="relative space-y-5 rounded-lg border border-line bg-white p-6 shadow-[0_40px_80px_-50px_rgb(20_33_61/0.55)] sm:p-8" role="img" aria-label="Contoh tata letak dokumen RPS dengan empat bagian bernomor">
              <div className={area("id")}>
                <Dot k="id" n={1} />
                <div className="flex items-start justify-between gap-4 p-3">
                  <div className="space-y-2">
                    <span className="block h-2 w-16 rounded bg-maroon/70" />
                    <span className="block h-4 w-48 rounded bg-navy/80" />
                    <span className="block h-2 w-32 rounded bg-text/15" />
                  </div>
                  <span className="grid size-12 place-items-center rounded border border-line font-serif text-sm text-navy">3 SKS</span>
                </div>
              </div>
              <div className={area("cpmk")}>
                <Dot k="cpmk" n={2} />
                <div className="space-y-2.5 p-3">
                  {[0.92, 0.78, 0.85].map((w, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="font-serif text-xs text-maroon">{i + 1}</span>
                      <span className="block h-2 rounded bg-text/20" style={{ width: `${w * 100}%` }} />
                    </div>
                  ))}
                </div>
              </div>
              <div className={area("minggu")}>
                <Dot k="minggu" n={3} />
                <div className="grid grid-cols-8 gap-1 p-3">
                  {Array.from({ length: 16 }, (_, i) => (
                    <span key={i} className={cn("h-6 rounded-sm", i === 7 || i === 15 ? "bg-gold" : "bg-navy/15")} />
                  ))}
                </div>
              </div>
              <div className={area("nilai")}>
                <Dot k="nilai" n={4} />
                <div className="p-3">
                  <div className="flex h-3 gap-1 overflow-hidden rounded-full">
                    <span className="w-[30%] bg-navy" />
                    <span className="w-[20%] bg-maroon" />
                    <span className="w-[25%] bg-gold" />
                    <span className="flex-1 bg-navy/40" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* penjelasan */}
          <div>
            {banner && (
              <div
                className="mb-8"
                onClickCapture={(e) => {
                  if (e.target.closest?.('[aria-label="Tutup banner"]')) {
                    try {
                      sessionStorage.setItem(BANNER_KEY, "1");
                    } catch {}
                  }
                }}
              >
                <Banner variant="info" dismissible title="Ringkasan bertanda “contoh” masih sementara">
                  Prodi akan menggantinya dengan RPS resmi beserta PDF-nya. Isi yang tampil di sini disusun untuk menunjukkan formatnya.
                </Banner>
              </div>
            )}
            <ol className="space-y-1">
              {PARTS.map((p, i) => (
                <li key={p.key}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(p.key)}
                    onFocus={() => setActive(p.key)}
                    onClick={() => setActive(p.key)}
                    aria-pressed={active === p.key}
                    className="group grid w-full grid-cols-[2rem_1fr] gap-x-3 rounded-lg p-4 text-left transition-colors hover:bg-white"
                  >
                    <span className={cn("font-serif text-xl tabular-nums transition-colors", active === p.key ? "text-maroon" : "text-text/30")}>{i + 1}</span>
                    <span>
                      <span className="block text-[16px] font-semibold text-navy">{p.title}</span>
                      <span className={cn("grid transition-[grid-template-rows,opacity] duration-500 ease-cinematic", active === p.key ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
                        <span className="overflow-hidden">
                          <span className="block pt-1.5 text-[14.5px] leading-relaxed text-text/65">{p.body}</span>
                        </span>
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>

            <div className="mt-8 border-t border-line pt-6">
              <p className="text-[14px] text-text/60">
                <span className="font-semibold text-navy">{totals.rps}</span> dari {courses.length} mata kuliah sudah punya ringkasan RPS:
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {ready.map((c) => (
                  <li key={c.slug}>
                    <button type="button" onClick={() => openRps(c.slug)} className="rounded-full border border-line bg-white px-3.5 py-1.5 text-[13.5px] text-navy transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-gold">
                      {c.nama}
                    </button>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={openSearch} className="mt-5 text-[14.5px] font-semibold text-maroon">
                <span className="u-gold">Cari RPS mata kuliah lain</span>
              </button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
