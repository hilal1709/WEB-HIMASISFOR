"use client";
import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { parseCredentials } from "@/lib/dosen-content";
import { LEVELS } from "@/lib/dosen-cms/schema";
import { cn } from "@/lib/utils";
import { Field, Folio, ImageField, InheritField, LineList, MiniBtn, TagList, Toggle } from "./fields";

const TABS = [
  ["identitas", "Identitas"],
  ["akademik", "Akademik"],
  ["kontak", "Kontak & tautan"],
];

/**
 * Map berkas (dossier) satu dosen: map manila dengan tab di atas, klip kertas, dan halaman yang
 * "dibalik" (GSAP) saat tab berganti. Tiap field menulis timpaan ke entri Katalog; kosong = ikut bawaan.
 */
export function Dossier({ lecturer: l, entry = {}, fields, certs, modal, onSet, onToggleHidden, onDelete, tab, onTab }) {
  const page = useRef(null);
  const p = (k) => `lecturer.${l.key}.${k}`;
  const set = (k) => (v) => onSet(k, v);

  useLayoutEffect(() => {
    if (!page.current || prefersReducedMotion()) return;
    gsap.fromTo(page.current, { rotateY: -7, x: -14, opacity: 0, transformOrigin: "left center" }, { rotateY: 0, x: 0, opacity: 1, duration: 0.55, ease: "expo.out", clearProps: "transform" });
  }, [tab, l.key]);

  const derived = parseCredentials(l.name, l.credentials, certs);
  const certLabel = Object.fromEntries(certs.map((c) => [c.code.toUpperCase(), c.label]));

  return (
    <div className="relative [perspective:1400px]">
      {/* tab map */}
      <div role="tablist" aria-label="Bagian berkas dosen" className="relative z-10 flex gap-1 pl-4">
        {TABS.map(([k, label]) => (
          <button
            key={k}
            role="tab"
            type="button"
            aria-selected={tab === k}
            onClick={() => onTab(k)}
            className={cn(
              "rounded-t-md px-4 pb-2 pt-2.5 text-[13px] font-semibold transition-[background-color,color,transform] duration-300",
              tab === k ? "bg-[#f3e7c9] text-navy" : "translate-y-1 bg-[#e8d9b2] text-navy/55 hover:translate-y-0.5 hover:text-navy"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="manila relative rounded-md rounded-tl-none bg-[#f3e7c9] p-2 shadow-[0_30px_60px_-40px_rgb(20_33_61/0.7)] sm:p-3">
        {/* klip kertas */}
        <svg aria-hidden viewBox="0 0 24 60" className="absolute -top-5 right-10 z-20 h-14 w-6 text-navy/45">
          <path d="M8 52V12a5 5 0 0 1 10 0v36a8 8 0 0 1-16 0V16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>

        <div ref={page} className="rounded-[4px] bg-[#fffdf7] p-5 shadow-[0_1px_0_rgb(20_33_61/0.06)] sm:p-7">
          {/* kepala berkas */}
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-dashed border-navy/15 pb-5">
            <div className="min-w-0">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-maroon/70">
                Berkas · {l.custom ? "dosen tamu" : "dari Studio Bagan"} · /{l.slug}
              </p>
              <h2 className="mt-1.5 truncate font-serif text-[1.7rem] leading-tight text-navy">{l.name || "Tanpa nama"}</h2>
              <p className="text-[13.5px] text-text/55">{[l.role, l.credentials].filter(Boolean).join(" · ")}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onToggleHidden}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors",
                  l.hidden ? "border-maroon bg-maroon text-white hover:bg-maroon-deep" : "border-navy/20 text-navy/70 hover:border-navy/50"
                )}
              >
                {l.hidden ? "Tersembunyi · tampilkan" : "Sembunyikan"}
              </button>
              {l.custom && (
                <button type="button" onClick={onDelete} className="rounded-full border border-maroon/30 px-3.5 py-1.5 text-[12.5px] font-semibold text-maroon hover:bg-maroon/5">
                  Hapus berkas
                </button>
              )}
            </div>
          </div>

          {tab === "identitas" && (
            <div className="space-y-8">
              <Folio no="01" title="Identitas" desc={l.custom ? "Dosen tamu diisi penuh di sini." : "Kosongkan field untuk kembali ikut Studio Bagan."}>
                <div className="grid gap-5 sm:grid-cols-[112px_1fr]">
                  <ImageField path={p("photo")} label="Foto" value={entry.photo} fallback={l.base?.photo} onChange={set("photo")} />
                  <div className="space-y-4">
                    <InheritField path={p("name")} label="Nama" value={entry.name} inherited={l.base?.name} onChange={set("name")} max={120} custom={l.custom} />
                    <InheritField path={p("credentials")} label="Gelar" value={entry.credentials} inherited={l.base?.credentials} onChange={set("credentials")} custom={l.custom} />
                    <InheritField path={p("role")} label="Jabatan" value={entry.role} inherited={l.base?.role} onChange={set("role")} custom={l.custom} />
                  </div>
                </div>
                <Field path={p("photoAlt")} label="Teks alternatif foto" value={entry.photoAlt} onChange={set("photoAlt")} max={200} placeholder={`Foto ${l.name}`} />
                <Field path={p("slug")} label="Alamat profil (#dosen-…)" value={entry.slug} onChange={(v) => set("slug")(v === "" ? undefined : v.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} max={60} placeholder={l.slug} hint="tautan langsung modal profil" />
              </Folio>
              <Folio no="02" title="Kutipan" desc="Tampil di tab Profil modal. Kosongkan bila tidak ada.">
                <Field path={p("quote")} label="Kutipan" value={entry.quote ?? l.quote ?? ""} onChange={set("quote")} multiline rows={2} max={280} />
              </Folio>
            </div>
          )}

          {tab === "akademik" && (
            <div className="space-y-8">
              <Folio no="03" title="Rumpun keahlian" desc="Menentukan filter direktori & peta rumpun.">
                <div className="flex flex-wrap gap-2" id={`ruang-lecturer-${l.key}-fields`}>
                  {fields.map((f) => {
                    const on = l.fields.includes(f.key);
                    return (
                      <button
                        key={f.key}
                        type="button"
                        aria-pressed={on}
                        onClick={() => set("fields")(on ? l.fields.filter((x) => x !== f.key) : [...l.fields, f.key])}
                        className={cn(
                          "rounded-full border px-3.5 py-1.5 text-[13px] transition-[background-color,border-color,color,transform] duration-300 active:scale-95",
                          on ? "border-maroon bg-maroon text-white" : "border-navy/15 bg-white text-navy hover:border-navy/40"
                        )}
                      >
                        {f.name}
                      </button>
                    );
                  })}
                </div>
              </Folio>
              <Folio no="04" title="Keahlian, ajar & riset">
                <TagList path={p("expertise")} label={modal.labels.expertise} value={l.expertise} onChange={set("expertise")} max={16} hint={entry.expertise === undefined && !l.custom ? "ikut Bagan" : undefined} />
                <LineList path={p("courses")} label={`${modal.labels.courses}${l.sample.courses ? " · masih contoh" : ""}`} value={l.courses} onChange={set("courses")} max={16} itemMax={100} addLabel="Tambah mata kuliah" />
                <LineList path={p("research")} label={`${modal.labels.research}${l.sample.research ? " · masih contoh" : ""}`} value={l.research} onChange={set("research")} max={12} addLabel="Tambah topik riset" />
              </Folio>
              <Folio no="05" title={modal.labels.education} desc="Otomatis dibaca dari gelar. Isi manual hanya bila perlu meralat.">
                <Education value={entry.education ?? []} derived={derived.education} onChange={(v) => set("education")(v.length ? v : undefined)} path={p("education")} />
                <div>
                  <p className="mb-1.5 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-navy/60">{modal.labels.certs} terbaca</p>
                  {derived.certs.length ? (
                    <ul className="flex flex-wrap gap-1.5">
                      {derived.certs.map((c) => (
                        <li key={c} className="rounded border border-gold/50 bg-gold/10 px-2 py-1 text-[12.5px] text-navy">
                          <b className="font-serif text-maroon">{c}</b> {certLabel[c]}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[13px] text-text/50">Belum ada kode sertifikasi di gelar. Kamus kode diatur di loker Profil.</p>
                  )}
                </div>
              </Folio>
            </div>
          )}

          {tab === "kontak" && (
            <div className="space-y-8">
              <Folio no="06" title="Kontak">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field path={p("nuptk")} label={modal.labels.nuptk} value={entry.nuptk} onChange={set("nuptk")} max={30} placeholder={modal.labels.pending} />
                  <Field path={p("email")} label={modal.labels.email} type="email" value={entry.email} onChange={set("email")} max={120} placeholder={modal.labels.pending} />
                </div>
              </Folio>
              <Folio no="07" title="Profil akademik" desc="Tautan kosong tampil sebagai “menyusul”.">
                {["scholar", "scopus", "sinta"].map((k) => (
                  <Field
                    key={k}
                    path={p(`links.${k}`)}
                    label={modal.links[k] || k}
                    type="url"
                    value={entry.links?.[k]}
                    onChange={(v) => onSet("links", { ...(entry.links ?? {}), [k]: v })}
                    max={300}
                    placeholder="https://…"
                  />
                ))}
              </Folio>
              <Toggle label="Tampilkan di halaman publik" checked={!l.hidden} onChange={onToggleHidden} hint="Dosen tersembunyi tetap tersimpan di sini." />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Education({ value, derived, onChange, path }) {
  const [manual, setManual] = useState(value.length > 0);
  const rows = manual ? value : derived;
  return (
    <div id={`ruang-${path.replace(/[^a-z0-9]+/gi, "-")}`}>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-navy/60">{manual ? "Diisi manual" : "Terbaca dari gelar"}</p>
        <button
          type="button"
          onClick={() => {
            if (manual) onChange([]);
            else onChange(derived.length ? derived : [{ level: "S1", label: "" }]);
            setManual(!manual);
          }}
          className="text-[12px] font-semibold text-maroon hover:underline"
        >
          {manual ? "Kembali otomatis" : "Ralat manual"}
        </button>
      </div>
      <ol className="relative space-y-2 border-l border-navy/15 pl-4">
        {rows.map((e, i) => (
          <li key={i} className="relative flex items-center gap-2">
            <span aria-hidden className={cn("absolute -left-[21px] size-2.5 rounded-full border-2 border-white", i === 0 ? "bg-maroon" : "bg-gold")} />
            {manual ? (
              <>
                <select
                  value={e.level}
                  onChange={(ev) => onChange(value.map((x, j) => (j === i ? { ...x, level: ev.target.value } : x)))}
                  className="h-8 rounded border border-navy/15 bg-white px-1.5 font-serif text-[14px] text-maroon"
                  aria-label="Jenjang"
                >
                  {LEVELS.map((lv) => (
                    <option key={lv}>{lv}</option>
                  ))}
                </select>
                <input
                  value={e.label}
                  maxLength={120}
                  onChange={(ev) => onChange(value.map((x, j) => (j === i ? { ...x, label: ev.target.value } : x)))}
                  placeholder="Magister Komputer — Institut …"
                  className="h-8 min-w-0 flex-1 rounded border border-navy/15 bg-white px-2 text-[13.5px] text-navy outline-none focus:border-maroon/40"
                />
                <MiniBtn label="Hapus jenjang" danger onClick={() => onChange(value.filter((_, j) => j !== i))}>
                  ×
                </MiniBtn>
              </>
            ) : (
              <span className="text-[14px] text-navy">
                <b className="font-serif font-normal text-maroon">{e.level}</b> {e.label}
              </span>
            )}
          </li>
        ))}
        {!rows.length && <li className="text-[13px] text-text/50">Belum ada gelar yang dikenali.</li>}
      </ol>
      {manual && value.length < 6 && (
        <button type="button" onClick={() => onChange([...value, { level: "S2", label: "" }])} className="mt-2 text-[12.5px] font-semibold text-navy/60 hover:text-maroon">
          + Tambah jenjang
        </button>
      )}
    </div>
  );
}
