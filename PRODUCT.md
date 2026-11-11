# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences, served equally on the homepage (confirmed by the program team, 2026-11-11):

- **Prospective students** — SMA/SMK students and their parents choosing a study program. Job: understand what Sistem Informasi UISI is, whether it leads to a good career, and register through PMB.
- **Current students** — looking for academic information: curriculum, internship/MBKM, services, news.

## Product Purpose

The official portal of the S1 Sistem Informasi program at Universitas Internasional Semen Indonesia (si.uisi.ac.id). It promotes the program (PMB conversion) and works as the program's information and service portal, managed through the built-in CMS (`/admin`). Success: prospective students reach "Daftar Sekarang"; current students find academic information without asking the program office.

## Positioning

An information-systems program embedded in the Semen Indonesia Group industrial ecosystem: curriculum built around ERP (SAP) with practitioners from the group, accredited "Baik Sekali" by LAM INFOKOM. Four expertise areas: IT Audit & Governance, Enterprise Systems, Data Science, Manajemen SI.

## Operating Context

- Campus: Kompleks PT. Semen Indonesia (Persero) Tbk., Jl. Veteran, Sidokumpul, Gresik, Jawa Timur 61122.
- Sister channel: uisi.ac.id/read/sistem-informasi (institutional summary, managed by UISI IT department).
- PMB link in use: https://s.id/DaftarSisforUISI. Socials: Instagram @sisforuisi, TikTok @sisfor_uisi, YouTube @sisforuisi.
- Strategic reference: "Analisis Audit & Kebutuhan Redesign Website Sistem Informasi UISI" (Aug 2026) — target IA: Profil, Akademik, Fasilitas, Belajar Luar Prodi, Layanan, Berita, PMB.

## Capabilities and Constraints

- Next.js 15 (App Router), Tailwind v4, Prisma CMS (`/api/content` sections such as `about`, `bidang-keahlian`), Auth.js admin.
- Existing routes: `/`, `/profile`, `/curiculum` (slug kept for now), `/achievement`, `/[slug]`, `/admin/*`, `/design-system`.
- Icons: Lordicon only (lucide not to be used in public UI), JSON stored locally in `public/lordicon/`.
- Indonesian language (`lang="id"`).
- Undecided: news module/CMS for Berita; official contact channel (currently falls back to the PMB link).

## Brand Commitments

- UISI red identity and the "Sistem Informasi UISI" logo (`public/img/logo.png`).
- Mascot **Elvo** (eagle with yellow goggles, gold cape, red SISFOR shirt) — 7 poses in `public/mascot/`; tagline "Sisforians — One Team, One Dream".
- Visual direction (updated 2026-11-11 by the user, v3): **look like other university websites, improved** — premium, modern, clean, micro-interactions; **maroon is the SISFOR UISI identity and must dominate**, supported by gold accents, navy text and cream backgrounds. **Rejected:** a SaaS look (floating pill nav, bento, label pills, giant sans display type) and a plain red-and-white palette. Earlier v2 note: **modern and premium**, referencing **horizonx.so** (neutral canvas, floating pill nav, giant display type, curved 3D card carousel, bento tiles, sticky "how it works") and **21st.dev** patterns (word rotate, text roll, testimonial marquee, card stack, scroll-velocity marquee). v1 "professional and clean" was judged too ordinary. Earlier v1 note: **professional and clean**, like serious study-program sites in Indonesia and abroad; content structure follows **si.amikom.ac.id**. Layout follows the approved homepage mockup (navbar → hero → partners → keunggulan → akreditasi → bidang keahlian → alumni → prestasi → berita → CTA → footer). The earlier illustrated-world reference (rajabrawijaya.ub.ac.id) and the road hero are retired.
- Elvo is a small accent only (PMB CTA, loader/404), never a narrator on every section.
- Explicitly rejected by the user: colour gradients (any `*-gradient`), sparkle icons, generic "AI" look, redundant content (the same fact or CTA repeated), check icons used as decoration (only for a real done/valid state), icon overuse where an illustration or photo fits, the full-screen spinner loader.

## Evidence on Hand

- Accreditation: SK No.026/SK/LAM-INFOKOM/Ak/S/IV/2023, valid from 3 April 2023; founding SK 502/E/O/2014 (founded 16 Oct 2014).
- Photos: `public/img/erp.jpeg`, `data.jpeg`, `governance.jpeg` (stock-style meeting photos); alumni avatars `melenia.png`, `rusydani.png`, `rizqi.png` (97px only); lecturer photos `public/img/profil/*.jpg`.
- **Placeholders, not facts** (must stay labelled until the program provides them): 2026 news items, achievement list, testimonial quotes and companies, "50+ mitra industri", "11 prestasi 2026".

## Product Principles

1. Both audiences get a clear path within the first scroll: register, or find academic info.
2. Prove with real program facts (accreditation, ERP practice, expertise areas) — never invented numbers.
3. Illustration or photo before icon; icons only on interactive controls.
4. Everything editable in the CMS stays editable; design never hard-codes content the program updates.

## Accessibility & Inclusion

Public university site: readable on low-end Android phones, respects `prefers-reduced-motion`, one H1 per page, meaningful alt text (audit found missing alts and 10+ H1s on the old site).
