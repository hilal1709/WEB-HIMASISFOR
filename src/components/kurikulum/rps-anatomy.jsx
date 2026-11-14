"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { BANNER_KEY, fill } from "@/lib/kurikulum-content";
import { prefersReducedMotion } from "@/lib/motion";
import { Container, SectionHeader } from "@/components/home/shared";
import { Banner } from "@/components/ui/banner";
import { cn } from "@/lib/utils";
import { useKurikulum } from "./kurikulum-provider";



const TH = "border border-navy/20 bg-cream-2 px-2 py-1.5 text-left font-semibold text-navy";
// isi templat = keterangan tiap kolom, bukan data mata kuliah tertentu
const TD = "border border-navy/20 px-2 py-1.5 align-top italic text-text/60";

/** Templat RPS umum (CMS): struktur sama dengan dokumen RPS prodi, isinya menjelaskan apa yang diisi di tiap kolom. */

/**
 * "Cara membaca RPS": miniatur dokumen RPS resmi (kop UISI, tabel identitas, capaian, bahan kajian & pustaka,
 * rencana 16 minggu, rekap penilaian) berupa TEMPLAT umum: tiap kolom berisi keterangan apa yang diisi. Memilih bagian di kanan
 * menggulir lembar ke bagian itu dan menyorotnya; menggulir lembar menyalakan bagian yang sedang terbaca.
 */
export function RpsAnatomy() {
  const { courses, totals, openRps, openSearch, copy } = useKurikulum();
  const t = copy.rps;
  const PARTS = t.parts;
  const r = t.template;
  const [active, setActive] = useState(PARTS[0]?.key ?? "identitas");
  const [banner, setBanner] = useState(false);
  const paper = useRef(null);
  const lock = useRef(0);
  const ready = courses.filter((c) => c.rps);
  const has = (k) => PARTS.some((p) => p.key === k);

  useEffect(() => {
    let hidden = false;
    try {
      hidden = sessionStorage.getItem(BANNER_KEY) === "1";
    } catch {}
    setBanner(!hidden);
  }, []);

  const go = (key) => {
    setActive(key);
    const el = paper.current?.querySelector(`[data-part="${key}"]`);
    if (!el) return;
    lock.current = Date.now() + 700;
    paper.current.scrollTo({ top: el.offsetTop - 16, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  // scroll-spy di dalam lembar
  const onScroll = () => {
    if (Date.now() < lock.current) return;
    const p = paper.current;
    const parts = [...p.querySelectorAll("[data-part]")];
    const atEnd = p.scrollTop + p.clientHeight >= p.scrollHeight - 4;
    const cur = atEnd ? parts[parts.length - 1] : parts.filter((el) => el.offsetTop - 40 <= p.scrollTop).pop() ?? parts[0];
    if (cur && cur.dataset.part !== active) setActive(cur.dataset.part);
  };

  const part = (key) =>
    cn(
      "relative scroll-mt-4 rounded-md p-2 transition-[opacity,box-shadow,background-color] duration-500 ease-cinematic",
      active === key ? "bg-gold/[0.07] opacity-100 shadow-[0_0_0_2px_var(--gold)]" : "opacity-55"
    );
  const badge = (k) => {
    const n = PARTS.findIndex((p) => p.key === k) + 1;
    if (!n) return null;
    return (
      <button
        type="button"
        onClick={() => go(k)}
        aria-label={fill(t.badgeAria, { title: PARTS[n - 1].title })}
        className={cn("absolute -left-3 -top-3 z-10 grid size-6 place-items-center rounded-full text-[11px] font-bold transition-[background-color,transform] duration-300", active === k ? "scale-110 bg-maroon text-white" : "bg-gold text-navy hover:scale-110")}
      >
        {n}
      </button>
    );
  };

  return (
    <section id="rps" className="relative scroll-mt-24 bg-cream py-16 md:py-20">
      <Container>
        <SectionHeader title={t.title} body={t.body} size="sm" />

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-start lg:gap-14">
          {/* lembar RPS */}
          {r ? (
            <figure className="relative min-w-0">
              <span aria-hidden className="absolute inset-0 translate-x-3 translate-y-3 rotate-[1deg] rounded-lg bg-white/60 shadow-sm" />
              <div
                ref={paper}
                onScroll={onScroll}
                tabIndex={0}
                aria-label={t.paperAria}
                className="relative h-[560px] overflow-y-auto overflow-x-hidden rounded-lg border border-line bg-white p-4 text-[11.5px] leading-snug text-text/85 shadow-[0_40px_80px_-50px_rgb(20_33_61/0.55)] outline-none focus-visible:ring-2 focus-visible:ring-gold sm:h-[640px] sm:p-6"
                style={{ scrollbarWidth: "thin" }}
              >
                <div className="space-y-5">
                  {/* 1 · identitas */}
                  <div data-part="identitas" className={part("identitas")}>
                    {badge("identitas")}
                    <div className="flex items-center gap-3 border border-navy/20 p-2.5">
                      {t.logo && <Image src={t.logo} alt={t.logoAlt} width={1400} height={420} className="h-8 w-auto shrink-0 sm:h-10" />}
                      <div className="flex-1 text-center text-[10.5px] font-bold uppercase leading-tight text-navy sm:text-[11.5px]">
                        {t.header.map((line, i) => <p key={i}>{line}</p>)}
                      </div>
                    </div>
                    <table className="mt-2 w-full border-collapse">
                      <tbody>
                        {r.identity.map((row, i) => (
                          <tr key={i}>
                            <th scope="row" className={cn(TH, "w-[38%]")}>{row.label}</th>
                            <td className={TD}>{row.value || "–"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* 2 · deskripsi */}
                  {r.deskripsi && (
                    <div data-part="deskripsi" className={part("deskripsi")}>
                      {badge("deskripsi")}
                      <table className="w-full border-collapse">
                        <tbody>
                          <tr>
                            <th scope="row" className={cn(TH, "w-[24%]")}>{r.deskripsiLabel}</th>
                            <td className={cn(TD, "text-justify")}>{r.deskripsi}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* 3 · capaian */}
                  <div data-part="capaian" className={part("capaian")}>
                    {badge("capaian")}
                    <table className="w-full border-collapse">
                      <tbody>
                        {r.capaian.map(({ label, items: list }) =>
                          list.map((x, i) => (
                            <tr key={label + i}>
                              {i === 0 && (
                                <th scope="rowgroup" rowSpan={list.length} className={cn(TH, "w-[24%]")}>
                                  {label}
                                </th>
                              )}
                              <td className={cn(TD, "w-[19%] whitespace-nowrap font-semibold text-navy")}>
                                {x.kode}
                                {x.bobot ? <span className="block font-normal text-text/55">({x.bobot}%)</span> : null}
                              </td>
                              <td className={TD}>{x.teks}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* 4 · bahan kajian & pustaka */}
                  <div data-part="kajian" className={part("kajian")}>
                    {badge("kajian")}
                    <table className="w-full border-collapse">
                      <tbody>
                        <tr>
                          <th scope="row" className={cn(TH, "w-[24%]")}>{r.kajianLabel}</th>
                          <td className={TD}>
                            <ol className="list-decimal space-y-0.5 pl-4">
                              {r.kajian.map((x, i) => <li key={i}>{x}</li>)}
                            </ol>
                          </td>
                        </tr>
                        <tr>
                          <th scope="row" className={TH}>{r.pustakaLabel}</th>
                          <td className={TD}>
                            {r.pustaka.map(({ label: lb, items: list }) =>
                              list.length ? (
                                <div key={lb} className="mb-1.5 last:mb-0">
                                  <p className="font-semibold text-navy">{lb}</p>
                                  <ol className="list-decimal space-y-0.5 pl-4">
                                    {list.map((x, i) => <li key={i}>{x}</li>)}
                                  </ol>
                                </div>
                              ) : null
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* 5 · rencana mingguan */}
                  <div data-part="minggu" className={part("minggu")}>
                    {badge("minggu")}
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[560px] border-collapse">
                        <thead>
                          <tr>
                            {r.mingguHeaders.map((h, i) => (
                              <th key={i} scope="col" className={cn(TH, "text-center")}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {r.minggu.map((m, i) => (
                            <tr key={i} className={m.ujian ? "bg-gold/10" : undefined}>
                              <td className={cn(TD, "text-center font-semibold not-italic tabular-nums text-navy")}>{m.n}</td>
                              <td className={TD}>{m.subcpmk}</td>
                              <td className={TD}>
                                <span className="font-semibold text-navy">{m.judul}</span>
                                {m.materi && <span className="block">{m.materi}</span>}
                              </td>
                              <td className={TD}>{m.metode}</td>
                              <td className={TD}>{m.penilaian}</td>
                              <td className={cn(TD, "text-center tabular-nums")}>{m.bobot ?? ""}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 6 · rekap penilaian */}
                  {r.nilai.length > 0 && (
                    <div data-part="nilai" className={part("nilai")}>
                      {badge("nilai")}
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[460px] border-collapse">
                          <thead>
                            <tr>
                              {r.nilaiHeaders.map((h, i) => (
                                <th key={i} scope="col" className={cn(TH, "text-center")}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {r.nilai.map((p, i) => (
                              <tr key={i}>
                                <td className={cn(TD, "text-center tabular-nums")}>{i + 1}</td>
                                <td className={TD}>{p.label}</td>
                                <td className={TD}>{p.rencana}</td>
                                <td className={cn(TD, "text-center tabular-nums")}>{p.bobot}</td>
                                <td className={cn(TD, "text-center")}>{p.cpmk}</td>
                              </tr>
                            ))}
                            <tr>
                              <td colSpan={3} className={cn(TH, "text-center")}>{r.totalLabel}</td>
                              <td className={cn(TH, "text-center tabular-nums")}>{r.totalValue}</td>
                              <td className={TH} />
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <figcaption className="relative mt-4 flex flex-wrap items-center justify-between gap-3 text-[13px] text-text/60">
                <span>
                  {t.captionLead} <span className="font-semibold text-navy">{t.captionStrong}</span>
                </span>
                {t.captionNote && <span className="italic text-text/45">{t.captionNote}</span>}
              </figcaption>
            </figure>
          ) : (
            <div />
          )}

          {/* penjelasan */}
          <div>
            {banner && t.banner.show && (
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
                <Banner variant="info" dismissible title={t.banner.title}>
                  {t.banner.body}
                </Banner>
              </div>
            )}
            <ol className="space-y-1">
              {PARTS.map((p, i) => (
                <li key={p.key}>
                  <button
                    type="button"
                    onClick={() => go(p.key)}
                    onFocus={() => go(p.key)}
                    aria-pressed={active === p.key}
                    className="group grid w-full grid-cols-[2rem_1fr] gap-x-3 rounded-lg p-3.5 text-left transition-colors hover:bg-white"
                  >
                    <span className={cn("font-serif text-xl tabular-nums transition-colors", active === p.key ? "text-maroon" : "text-text/30 group-hover:text-navy")}>{i + 1}</span>
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
                {fill(t.ready, { n: totals.rps, total: courses.length })}
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
                <span className="u-gold">{t.more}</span>
              </button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
