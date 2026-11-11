"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LordIcon } from "@/components/media/lord-icon";
import { ParallaxScene } from "./parallax";
import { ElvoSays } from "./elvo-says";
import {
  ABOUT, ACCREDITATION, ACHIEVEMENTS, ALUMNI, ELVO_LINES, EXPERTISE, FOOTER, NEWS, PLACEHOLDER_NOTE, PMB_URL, WHY, CONTACT_URL,
} from "@/lib/home-content";

const WHY_ICONS = ["document", "consultation", "globe", "suitcase"];
const ACH_ICONS = { globe: "globe", flask: "target", book: "book", chart: "bar-chart", trophy: "target", pen: "tool" };

function Placeholder() {
  return <p className="placeholder-note">{PLACEHOLDER_NOTE}</p>;
}

/* 1 · Kampus: perkenalan + plakat akreditasi */
function Campus() {
  return (
    <ParallaxScene id="kampus" aria-labelledby="kampus-title" className="scene scene--campus">
      <div className="scene__bg" data-depth="-10" data-zoom="0.06">
        <Image src="/plates/campus.webp" alt="" fill sizes="100vw" className="object-cover" />
      </div>
      <div className="scene__inner campus">
        <div className="campus__copy" data-rise>
          <h2 id="kampus-title" className="scene-title">{ABOUT.title}</h2>
          {ABOUT.body.map((p) => (
            <p key={p.slice(0, 20)} className="scene-text">{p}</p>
          ))}
        </div>
        <div className="plaque" data-rise data-depth="12">
          <LordIcon name="check" size={56} trigger="once" colors="primary:#a80a0b,secondary:#0b1b45" />
          <p className="plaque__issuer">Akreditasi {ACCREDITATION.issuer}</p>
          <p className="plaque__grade">{ACCREDITATION.grade}</p>
          <dl className="plaque__rows">
            {ACCREDITATION.rows.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <ElvoSays {...ELVO_LINES.kampus} height={230} className="campus__elvo" />
      </div>
    </ParallaxScene>
  );
}

/* 2 · Empat bidang: berhenti di tiap papan arah sepanjang jalan */
function Expertise({ items }) {
  return (
    <ParallaxScene id="bidang" aria-labelledby="bidang-title" className="scene scene--road">
      <div className="road-strip" data-depth="-6" aria-hidden="true" />
      <div className="scene__inner">
        <header className="road-head" data-rise>
          <h2 id="bidang-title" className="scene-title">{EXPERTISE.title.join(" ")}</h2>
          <p className="scene-text">{EXPERTISE.body}</p>
        </header>
        <ElvoSays {...ELVO_LINES.bidang} height={200} side="right" className="road__elvo" />
        <ol className="stops">
          {items.map((it, i) => (
            <li key={it.slug} id={`bidang-${it.slug}`} className={`stop${i % 2 ? " stop--right" : ""}`} data-rise>
              <div className="stop__photo" data-depth={i % 2 ? "8" : "-8"}>
                <Image src={it.image} alt="" fill sizes="(min-width: 768px) 30vw, 90vw" className={it.contain ? "object-contain bg-white p-4" : "object-cover"} />
              </div>
              <div className="stop__text">
                <h3 className="stop__board">{it.title}</h3>
                <p className="scene-text">{it.body}</p>
                <ul className="stop__careers" aria-label="Contoh karier">
                  {it.careers.map((c) => <li key={c}>{c}</li>)}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </ParallaxScene>
  );
}

/* 3 · Keunggulan: di tepi laut */
function Why() {
  return (
    <ParallaxScene id="keunggulan" aria-labelledby="keunggulan-title" className="scene scene--sea">
      <div className="sea-waves" data-depth="-14" aria-hidden="true" />
      <div className="scene__inner why">
        <div className="why__head" data-rise>
          <h2 id="keunggulan-title" className="scene-title scene-title--light">{WHY.title.join(" ")}</h2>
          <p className="scene-text scene-text--light">{WHY.body}</p>
          <ElvoSays {...ELVO_LINES.keunggulan} height={210} className="why__elvo" />
        </div>
        <ul className="why__list">
          {WHY.items.map((it, i) => (
            <li key={it.title} className={`why__item why__item--${i}`} data-rise>
              <LordIcon name={WHY_ICONS[i]} size={64} trigger="hover" target={`.why__item--${i}`} colors="primary:#ffffff,secondary:#f6b91e" />
              <h3>{it.title}</h3>
              <p>{it.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </ParallaxScene>
  );
}

/* 4 · Alumni: pelabuhan, kutipan sebagai bubble dialog */
function Alumni() {
  return (
    <ParallaxScene id="alumni" aria-labelledby="alumni-title" className="scene scene--harbor">
      <div className="scene__bg" data-depth="-12" data-zoom="0.06">
        <Image src="/plates/harbor.webp" alt="" fill sizes="100vw" className="object-cover" />
      </div>
      <div className="scene__inner harbor">
        <div data-rise>
          <h2 id="alumni-title" className="scene-title">{ALUMNI.title}</h2>
          <p className="scene-text">{ALUMNI.body}</p>
          <Placeholder />
        </div>
        <ul className="quotes">
          {ALUMNI.items.map((q, i) => (
            <li key={q.name} className={`quote quote--${i}`} data-rise data-depth={["-6", "10", "-2", "14"][i]}>
              <blockquote className="speech-bubble quote__bubble">“{q.quote}”</blockquote>
              <p className="quote__who">
                {q.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={q.photo} alt="" className="quote__photo" />
                ) : (
                  <span className="quote__photo quote__photo--init" aria-hidden="true">{q.name.split(/[\s.,]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("")}</span>
                )}
                <span><b>{q.name}</b><br />{q.role}</span>
              </p>
            </li>
          ))}
        </ul>
        <ElvoSays {...ELVO_LINES.alumni} height={200} side="right" className="harbor__elvo" />
      </div>
    </ParallaxScene>
  );
}

/* 5 · Prestasi: papan prestasi di hutan pinus */
function Achievements() {
  const [tab, setTab] = useState("dosen");
  return (
    <ParallaxScene id="prestasi" aria-labelledby="prestasi-title" className="scene scene--pine">
      <div className="pine-hills" data-depth="-10" aria-hidden="true" />
      <div className="scene__inner trophies">
        <div data-rise>
          <h2 id="prestasi-title" className="scene-title scene-title--light">{ACHIEVEMENTS.title}</h2>
          <p className="scene-text scene-text--light">{ACHIEVEMENTS.body}</p>
          <div role="tablist" aria-label="Kategori prestasi" className="seg">
            {[["dosen", "Dosen"], ["mahasiswa", "Mahasiswa"]].map(([k, l]) => (
              <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className="seg__btn">{l}</button>
            ))}
          </div>
          <Placeholder />
        </div>
        <ul className="trophy-list" role="tabpanel">
          {ACHIEVEMENTS.tabs[tab].map((a, i) => (
            <li key={tab + a.title} className={`trophy trophy--${i}`}>
              <LordIcon name={ACH_ICONS[a.icon] ?? "target"} size={48} trigger="once" colors="primary:#0b1b45,secondary:#a80a0b" />
              <div>
                <span className="trophy__level">{a.level}</span>
                <h3>{a.title}</h3>
                <p>{a.body}</p>
              </div>
            </li>
          ))}
        </ul>
        <ElvoSays {...ELVO_LINES.prestasi} height={210} side="right" className="trophies__elvo" />
        <Link href="/achievement" className="text-link text-link--light">Lihat semua prestasi</Link>
      </div>
    </ParallaxScene>
  );
}

/* 6 · Berita: papan pengumuman */
function News() {
  return (
    <ParallaxScene id="berita" aria-labelledby="berita-title" className="scene scene--board">
      <div className="scene__inner noticeboard-wrap">
        <div data-rise>
          <h2 id="berita-title" className="scene-title">{NEWS.title}</h2>
          <p className="scene-text">{NEWS.body}</p>
          <Placeholder />
          <ElvoSays {...ELVO_LINES.berita} height={200} className="board__elvo" />
        </div>
        <div className="noticeboard" data-depth="6">
          {NEWS.items.map((n, i) => (
            <article key={n.title} className={`note note--${i}`} data-rise>
              <span className="note__pin" aria-hidden="true" />
              <p className="note__meta">
                <LordIcon name="calendar" size={20} trigger="hover" target={`.note--${i}`} colors="primary:#0b1b45,secondary:#a80a0b" />
                {n.date} · {n.tag}
              </p>
              <h3>{n.title}</h3>
              <p>{n.body}</p>
            </article>
          ))}
        </div>
      </div>
    </ParallaxScene>
  );
}

/* 7 · Gerbang: ajakan PMB + footer */
function Join() {
  return (
    <ParallaxScene id="gabung" aria-labelledby="gabung-title" className="scene scene--gate">
      <div className="scene__inner gate">
        <div data-rise>
          <h2 id="gabung-title" className="gate__title">Mari Bergabung<br />Bersama Kami</h2>
          <p className="gate__text">Wujudkan kariermu di bidang sistem informasi bersama Universitas Internasional Semen Indonesia.</p>
          <div className="gate__actions">
            <a href={PMB_URL} className="hero-cta hero-cta--light">
              Daftar PMB
              <LordIcon name="arrow-right" size={28} trigger="hover" target=".hero-cta--light" colors="primary:#a80a0b,secondary:#a80a0b" />
            </a>
            <a href={CONTACT_URL} className="hero-cta hero-cta--ghost">Hubungi Kami</a>
          </div>
        </div>
        <ElvoSays {...ELVO_LINES.gabung} height={300} side="right" className="gate__elvo" />
      </div>
      <footer className="site-foot">
        <div className="site-foot__inner">
          <div>
            <div className="site-foot__logo">
              <Image src="/plates/logo.png" alt="Sistem Informasi UISI, Universitas Internasional Semen Indonesia" width={280} height={84} className="h-auto w-[15rem]" />
            </div>
            <p className="site-foot__addr">
              <LordIcon name="location" size={22} trigger="hover" colors="primary:#f7ece1,secondary:#f6b91e" />
              {FOOTER.address}
            </p>
          </div>
          <div className="site-foot__cols">
            {FOOTER.columns.map((c) => (
              <div key={c.title}>
                <p className="site-foot__h">{c.title}</p>
                <ul>
                  {c.links.map(([l, h]) => (
                    <li key={l}><Link href={h}>{l}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <p className="site-foot__h">Ikuti kami</p>
              <ul>
                {FOOTER.socials.map(([n, h]) => (
                  <li key={n}><a href={h} target="_blank" rel="noopener noreferrer">{n}</a></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <p className="site-foot__base">© {new Date().getFullYear()} Sistem Informasi · Universitas Internasional Semen Indonesia</p>
      </footer>
    </ParallaxScene>
  );
}

export function Story({ expertise = EXPERTISE.items }) {
  return (
    <>
      <Campus />
      <Expertise items={expertise} />
      <Why />
      <Alumni />
      <Achievements />
      <News />
      <Join />
    </>
  );
}
