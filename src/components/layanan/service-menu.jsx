"use client";
import { useMemo, useState } from "react";
import { CHANNELS } from "@/lib/layanan-content";
import { Container, PlaceholderTag, SectionHeader } from "@/components/home/shared";
import { LayananBanner } from "./layanan-banner";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { VanishInput } from "./vanish-input";
import { useLayanan } from "./layanan-provider";

const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

function Highlight({ text, q }) {
  if (!q) return text;
  const i = norm(text).indexOf(norm(q));
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark>{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

function Row({ s, q, match, onOpen }) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(s.key)}
        data-match={match || undefined}
        className="la-row group flex w-full flex-col gap-1.5 rounded-md px-3 py-4 text-left outline-none transition-colors hover:bg-white focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-gold/60"
      >
        <span className="flex w-full items-baseline gap-3">
          <span className="font-serif text-[1.12rem] leading-snug text-navy transition-colors group-hover:text-maroon">
            <Highlight text={s.title} q={q} />
          </span>
          <span aria-hidden className="la-leader" />
          <span className="tabular shrink-0 text-[14px] font-semibold text-navy">
            {s.sla} <span className="font-normal text-text/55">hari kerja</span>
          </span>
        </span>
        <span className="flex items-center gap-2 text-[12.5px] text-text/55">
          <span className={cn("rounded px-1.5 py-0.5 font-medium", s.channel === "loket" ? "bg-gold/15 text-warning" : s.channel === "temu" ? "bg-navy/8 text-navy" : "bg-cream-2 text-text/70")}>
            {CHANNELS[s.channel]}
          </span>
          <span className="truncate">{s.output}</span>
        </span>
      </button>
    </li>
  );
}

/**
 * Daftar layanan bergaya "papan menu": tiga kolom kategori, tiap baris nama · titik leader · estimasi hari kerja.
 * Pencarian memakai Vanish Input: mengetik menyaring (baris lain meredup), Enter membuka hasil teratas lalu teks menguap.
 * Ponsel: kategori bisa dibuka/tutup.
 */
export function ServiceMenu() {
  const { services, categories, openService } = useLayanan();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [openCat, setOpenCat] = useState("surat");

  const hits = useMemo(() => {
    const k = norm(q.trim());
    if (!k) return null;
    return new Set(
      services
        .filter((s) => norm([s.title, s.lead, s.output, ...(s.needs ?? []), categories.find((c) => c.key === s.category)?.label ?? ""].join(" ")).includes(k))
        .map((s) => s.key)
    );
  }, [q, services, categories]);

  const submit = (v) => {
    const k = norm(v);
    // nama layanan yang cocok didahulukan daripada kecocokan di syarat / deskripsi
    const first = services.find((s) => norm(s.title).includes(k)) ?? services.find((s) => hits?.has(s.key));
    if (first) openService(first.key);
    else toast.info("Belum ada yang cocok", { description: "Coba kata lain, misalnya “surat”, “KRS”, atau “Kaprodi”." });
  };

  const empty = hits && hits.size === 0;
  const anySample = services.some((s) => s.sample);

  return (
    <section id="layanan" className="scroll-mt-24 bg-cream-2/60 py-16 md:py-24">
      <Container>
        <SectionHeader
          title={["Semua layanan,", "satu papan"]}
          body="Estimasi dihitung dalam hari kerja sejak pengajuan diterima. Pilih layanan untuk melihat syarat dan tanggal siapnya."
          action={anySample && <PlaceholderTag />}
        />
        <LayananBanner className="mt-8" />

        <div className="mt-10 max-w-2xl" data-aos="fade-up">
          <VanishInput
            value={q}
            onChange={setQ}
            onSubmit={submit}
            placeholders={["Cari “surat aktif kuliah”", "Cari “KRS lebih dari batas”", "Cari “janji temu Kaprodi”", "Cari “transkrip”"]}
          />
          <p className="mt-2 pl-5 text-[12.5px] text-text/50" aria-live="polite">
            {hits ? (empty ? "Tidak ada yang cocok." : `${hits.size} layanan cocok · Enter untuk membuka yang teratas`) : "Ketik untuk menyaring, Enter untuk membuka."}
          </p>
        </div>

        {empty ? (
          <div className="mt-10 flex flex-col items-center rounded-lg border border-dashed border-navy/15 bg-white px-6 py-12 text-center">
            <span className="w-40"><LottieIllustration src="/lottie/empty-news.json" label="Tidak ada layanan yang cocok" /></span>
            <p className="mt-4 font-serif text-xl text-navy">Belum ada layanan dengan kata itu</p>
            <button type="button" onClick={() => setQ("")} className="mt-3 text-sm font-semibold text-maroon">
              <span className="u-gold">Tampilkan semua layanan</span>
            </button>
          </div>
        ) : (
          <div className="la-menu mt-10 grid gap-4 lg:grid-cols-3 lg:gap-0 lg:divide-x lg:divide-navy/10" data-searching={hits ? "" : undefined}>
            {categories.map((c, ci) => {
              const items = services.filter((s) => s.category === c.key);
              const expanded = openCat === c.key || !!hits;
              return (
                <div key={c.key} className="rounded-lg border border-line bg-cream/70 lg:rounded-none lg:border-0 lg:bg-transparent lg:px-6 first:lg:pl-0 last:lg:pr-0" data-aos="fade-up" data-aos-delay={ci * 90}>
                  <button
                    type="button"
                    onClick={() => setOpenCat(openCat === c.key ? "" : c.key)}
                    aria-expanded={expanded}
                    className="flex w-full items-end justify-between gap-4 px-4 py-4 text-left lg:pointer-events-none lg:px-3 lg:pb-5 lg:pt-0"
                  >
                    <span>
                      <span className="kicker block text-[11px] text-maroon">{String(ci + 1).padStart(2, "0")} · {items.length} layanan</span>
                      <span className="mt-1.5 block font-serif text-[1.6rem] leading-tight text-navy">{c.label}</span>
                      <span className="mt-1 block text-[13.5px] text-text/55">{c.note}</span>
                    </span>
                    <svg aria-hidden viewBox="0 0 16 16" className={cn("mb-1 size-4 shrink-0 text-navy transition-transform duration-500 ease-cinematic lg:hidden", expanded && "rotate-180")}>
                      <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <div className={cn("grid transition-[grid-template-rows] duration-500 ease-cinematic lg:!grid-rows-[1fr]", expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                    <ul className="min-h-0 overflow-hidden border-t border-navy/10 px-1 lg:px-0">
                      {items.map((s) => (
                        <Row key={s.key} s={s} q={q.trim()} match={hits?.has(s.key)} onOpen={openService} />
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Container>
    </section>
  );
}
