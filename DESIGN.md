# Design System — Sisfor UISI

Live showcase: `/design-system`. Semua token ada di `src/app/globals.css`.

## Stack

| Kebutuhan | Library | Lokasi |
|---|---|---|
| UI primitives | shadcn/ui (new-york, JS) + Radix | `src/components/ui/` (`components.json` sudah dikonfigurasi, `npx shadcn add <x>` bisa dipakai) |
| UI efek | Aceternity UI | `src/components/aceternity/` (Spotlight, MovingBorderButton, TiltCard) |
| Animasi | GSAP (scroll), anime.js (counter/stagger), AOS (`data-aos`), Swiper, motion | `src/lib/motion.js`, `src/components/motion/` |
| Ikon | Lordicon (animasi) + lucide (statis/fallback) | `src/components/media/lord-icon.jsx` |
| Ilustrasi | Lottie | `src/components/media/lottie-illustration.jsx`, file di `public/lottie/` |
| Chart | Chart.js + react-chartjs-2 | `src/components/charts/charts.jsx` |
| Login CMS | Auth.js v5 (Credentials + Prisma Admin) | `src/auth.js`, `src/auth.config.js`, `src/middleware.js` |

## Token

- **Brand**: `primary` (red-600), `brand-from #C10F11` → `brand-to #E31515`, `brand-deep #94080A`.
- **Netral**: zinc (`foreground`, `muted`, `border`, `input`).
- **Status**: `success`, `warning`, `info`, `danger` (+ `-soft`) — dipakai Toast, Banner, Badge.
- **Chart**: `--chart-1…5`. **Radius**: `--radius` 0.75rem. **Font**: Inter (sans), Noto Serif Display (heading).
- Dark mode: kelas `.dark` di `<html>` sudah memetakan ulang semua token.

## Aturan pakai

1. Warna lewat token (`bg-primary`, `text-muted-foreground`), bukan hex / `red-600`.
2. Aksi utama = `Button variant="brand"` atau `default`; hapus = `destructive` + `ConfirmModal`.
3. Feedback: sukses/gagal singkat → `useToast()`; pesan di dalam form → `Banner`; pengumuman → `Banner variant="brand"`.
4. Loading: tombol → prop `loading`; area → `Skeleton`; halaman → `app/loading.js` (`PageLoader`).
5. Animasi: scroll section → `<Reveal>`; reveal sederhana → `data-aos`; angka → `countUp`. Semua menghormati `prefers-reduced-motion`.
6. Lordicon & Lottie: simpan JSON di `public/` untuk produksi, jangan bergantung CDN.

## Auth.js

`AUTH_SECRET` (fallback `JWT_SECRET`). Sesi JWT 24 jam. `/admin/*` (kecuali `/admin/login`) dijaga middleware.
Login: `signIn('credentials', { email, password, redirect: false })`. Logout: `signOut()`.

---

# Beranda Kampus v3 (2026-11 — menggantikan Premium v2)

Situs kampus dengan sentuhan premium (bukan SaaS). **Maroon adalah identitas SISFOR UISI dan warna dominan.**

## Palet (`globals.css` › KAMPUS v3)
- `--maroon #6E1423` / `--maroon-deep #4E0E19` — warna dominan: top bar, panel hero, section Prestasi, **footer**, kartu video, bar program, tombol utama.
- `--gold #C9A227` / `--gold-soft` — tombol utama di atas maroon (Daftar PMB), garis atas kartu tautan cepat, nomor kartu program, dan aksen tipis: angka statistik, garis pendek di atas judul, garis bawah tautan, tanda kutip, kata italic di permukaan maroon.
- `--navy #14213D` — warna pendukung: **pita CTA PMB**, pita akreditasi, blok tanggal agenda, kartu mega menu, teks judul. Footer tetap maroon (permintaan user).
- `--cream #F7F2EA` / `--cream-2` — latar halaman & section selang-seling; putih untuk kartu.
- Tanpa gradien (termasuk trik garis `linear-gradient`); overlay foto/video = warna solid ber-alpha.

## Tipografi & bentuk
Judul: Noto Serif Display (`font-serif`), frasa aksen *italic*. Isi: Inter. Label kecil: `.kicker` (huruf kapital renggang) hanya di kartu/tanggal — tidak ada label pil di atas judul. Radius 6–10px.

## Urutan (`src/app/page.jsx`, scroll native)
IntroLoader → Topbar (audiens) → SiteHeader (mega menu + cari + PMB) → Hero video (b-roll Mawapres, panel maroon) → QuickLinks (4 audiens, Lordicon) → Tentang (foto kaprodi, kutipan, statistik, keunggulan, video profil dosen) → Pita akreditasi → Bidang keahlian (kartu foto) → Mahasiswa berprestasi (video Mawapres + Tabs CMS) → Berita & Agenda → Alumni (video + slider kutipan) → Mitra → CTA PMB (navy) → Footer (maroon).

## Video (`public/video/`)
`hero-loop.mp4` (18,8 dtk, tanpa suara, 2,1 MB, dipotong dari b-roll tanpa teks), `mawapres.mp4`, `dosen.mp4`, `alumni.mp4` (720p CRF 28, faststart) + poster `.jpg`. Video penuh hanya dimuat saat dialog dibuka. Hero berhenti saat keluar layar, ada tombol jeda, dan memakai poster saat reduced-motion / hemat data.

## Teknis
- Swiper di dalam kolom grid wajib `min-w-0` (kalau tidak, lebarnya meledak).
- AOS menunggu sinyal hidrasi: halaman memasang `data-aos-wait` + `<AosReady/>`.

## Maskot — Si Elvo (v3)
Elvo **tersebar di banyak section** (bukan section sendiri) lewat `home/elvo-peek.jsx`: melayang pelan, saat hover/fokus melompat kecil + balon kata.
Pose per tempat: hero `wave`, statistik Tentang `confident`, Bidang `think`, Prestasi `proud`, Agenda `thumbs-up`, Alumni `laugh`, CTA `run`, tepi atas footer `wave`. Ukuran kecil (78–170px), sebagian hanya tampil di layar lebar agar ponsel tidak sesak.

## Lottie (Kampus v3)
Ilustrasi buatan tangan, dibangkitkan oleh `scripts/lottie/build.py` (`python scripts/lottie/build.py [nama...]`) ke `public/lottie/`.
Palet: `light` = garis navy + aksen maroon/emas (latar cream/putih); `dark` = garis putih + aksen emas (latar maroon/navy) → file `-dark.json`. Warna solid, 260×260, 30 fps, loop 4 dtk.
Penempatan: Tautan cepat — keempat kartu (qa-campus, qa-student, qa-alumni, qa-industry: ikon kecil bergaris tebal di cakram emas, diputar ulang saat kartu di-hover) · Tentang › 4 keunggulan (erp-nodes, lecturer, industry, grad-path) · Akreditasi (badge-dark) · Bidang › ikon di bar maroon, diputar ulang saat kartu di-hover (shield-audit, erp-gears, data-chart, strategy-target -dark) · Prestasi (trophy-dark) · Agenda (calendar; empty-news saat kosong) · Alumni (grad-cap) · CTA (rocket-pmb-dark).
Komponen: `media/lottie-illustration.jsx` — main hanya saat terlihat, `label` untuk teks alternatif, `speed`, `replayOnHover`, `fallback` bila JSON gagal dimuat. Dekoratif murni disembunyikan di ponsel.
