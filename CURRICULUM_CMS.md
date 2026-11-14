# CMS Kurikulum & RPS — Kartografer Kurikulum

Halaman publik `/curiculum` dan CMS `/admin/kurikulum` (layar penuh). Tidak ada teks yang ditulis di komponen:
semua judul, label, daftar, mata kuliah, RPS, rumpun, blok Body of Knowledge, bidang pilihan, templat RPS,
catatan kaki, palet cari, label laci RPS, dan meta SEO diatur dari Kartografer.

## Alur kerja
1. Ubah isi di salah satu dari 11 **stasiun** (rel di atas): Pembuka, Rumpun, Body of Knowledge, Peta studi,
   Jadwal semester, Bidang pilihan, Cara membaca RPS, Penutup, Pencarian, Laci RPS, Meta.
2. Draf tersimpan otomatis (1,2 dtk setelah berhenti mengetik; Ctrl S untuk paksa). Ctrl Z / Ctrl Shift Z = urungkan/ulangi.
3. **Uji jalan** (ikon globe di dok) membuka pratinjau draf (desktop/tablet/ponsel).
4. **Terbitkan** → papan keberangkatan per stasiun → halaman publik dan halaman turunannya diperbarui langsung
   (`revalidatePath` + Pusher `refreshSite`).
5. **Jejak versi** menyimpan 5 versi terbit terakhir; memulihkan menyalinnya ke draf.

Admin lain yang membuka Kartografer bersamaan menerima draf terbaru lewat Pusher; bila keduanya mengetik, muncul banner konflik.

## Papan jadwal & Lembar RPS
- Tiap semester / bidang pilihan = satu baris karcis. Seret karcis antar baris untuk memindahkan mata kuliah
  (atau pakai "Pindah ke" di Lembar RPS). Slot "Elective N" hanya boleh di semester.
- Klik karcis → **Lembar RPS**: identitas (kode, SKS, rumpun, tautan), lalu langkah Identitas · Capaian ·
  Kajian & pustaka · 16 minggu (pita film, seret bingkai untuk menukar minggu) · Penilaian (bar bertumpuk,
  seret batas atau ←/→ per 5%) · Body of Knowledge. Kanan: miniatur dokumen RPS yang langsung berubah.
- PDF RPS diunggah ke `public/rps/` lewat `/api/upload`.

### Aturan tautan `#rps-<slug>`
Slug dibuat sekali. Selama mata kuliah belum pernah terbit, slug ikut nama; setelah terbit slug **beku** agar
tautan dari Konversi SKS, Bidang Keahlian, Jalur Kelulusan, dan Magang tidak putus. Mengubahnya harus lewat
"Buka kunci" (ada peringatan).

## Sinyal pemeriksa
Dok menampilkan lampu sinyal + jumlah temuan (`src/lib/kurikulum-cms/lint.js`):
- **redundansi** — kalimat sama/nyaris sama di dua teks halaman;
- **integritas** — slug/kode ganda, rumpun atau blok BoK yang sudah dihapus, bobot penilaian ≠ 100%,
  rencana ≠ 16 minggu, semester kosong, blok BoK tanpa mata kuliah.
Klik temuan untuk melompat ke field-nya (atau membuka Lembar RPS mata kuliahnya).

## Data
`PageContent` (Prisma):
| section | isi |
|---|---|
| `kurikulum` | `{ value, publishedAt, publishedBy, history[≤5] }` — versi terbit |
| `kurikulum-draft` | `{ value }` — draf kerja |
| `curriculum` | baris lama; hanya dibaca sebagai sumber migrasi (`migrate.js`) sampai terbit pertama |

Bentuk `value` ada di `src/lib/kurikulum-cms/schema.js` (`SHAPE`, dibersihkan server dengan `cleanKurikulum`).
Bawaan: `defaults.js` (teks) + `seed.js` (semester, bidang pilihan, RPS Kota Cerdas, rumpun, BoK).
Token di teks (`{sks}`, `{n}`, `{count}`, `{q}`, …) diganti angka saat render (`fill()` di `src/lib/kurikulum-content.js`).

Pembaca:
- `getKurikulumContent()` — isi mentah (draf saat pratinjau, terbit untuk pengunjung).
- `getKurikulumData()` — bentuk turunan (`semesters`, `electives`, `courses`, `totals`, `bok`, `rumpun`, `copy`)
  dipakai `/curiculum`, `/konversi-sks`, `/bidang-keahlian`, `/jalur-kelulusan`, `/regulasi-akademik`, `/magang`.

## API
| rute | metode | catatan |
|---|---|---|
| `/api/kurikulum-cms` | GET / PUT / DELETE | snapshot · autosave draf · buang draf (admin) |
| `/api/kurikulum-cms/publish` | POST | terbitkan draf (admin) |
| `/api/kurikulum-cms/history` | POST `{index}` | pulihkan versi ke draf (admin) |
| `/api/kurikulum-cms/preview` | GET (`?off=1`) | nyalakan/matikan draft mode lalu buka `/curiculum` |
| `/api/curriculum` | GET | baca saja (versi terbit); PUT/POST/DELETE → 401 tanpa login, 410 dengan login |

`/admin/curriculum` dialihkan ke `/admin/kurikulum`.
