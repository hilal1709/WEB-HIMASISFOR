# Sisfor DS — Design System Sistem Informasi UISI

Dokumen ini adalah acuan tunggal untuk tampilan dan interaksi website publik maupun CMS. Tujuannya sederhana: siapa pun yang menambah halaman atau fitur baru cukup memakai token dan komponen di sini, sehingga hasilnya otomatis konsisten tanpa perlu menebak warna, ukuran, atau gaya animasi.

Versi visual (live) dari dokumen ini bisa dibuka di **`/design-system`** (hanya untuk admin yang sudah login).

---

## 1. Prinsip

**Tegas dan akademis.** Warna merah UISI dipakai sebagai aksen yang kuat, sedangkan sebagian besar permukaan tetap putih dan zinc yang tenang. Merah dipakai untuk aksi utama dan penanda penting, bukan untuk latar besar di semua tempat.

**Bergerak dengan tujuan.** Animasi membantu pengguna memahami apa yang sedang terjadi (konten muncul, data tersimpan, modal terbuka), bukan sekadar hiasan. Semua animasi otomatis dimatikan bila pengguna mengaktifkan *reduce motion* di perangkatnya.

**Satu cara untuk satu hal.** Ada satu komponen toast, satu modal, satu loader, dan satu pembungkus ikon. `alert()` dan `confirm()` bawaan browser tidak dipakai lagi.

---

## 2. Stack & peran setiap library

| Kebutuhan | Library | Dipakai untuk |
|---|---|---|
| Komponen dasar | **shadcn/ui** (`src/components/ui`) | Button, Input, Textarea, Select, Label, Card, Badge, Dialog, Tabs, Table, Skeleton |
| Efek visual | **Aceternity UI** (`src/components/aceternity`) | Spotlight, Background Beams, Background Grid, Text Generate, Hover Card, Moving Border |
| Animasi utama | **GSAP** + ScrollTrigger + SplitText | Hero, teks besar, animasi saat scroll, masuknya modal & sidebar |
| Micro-interaction | **anime.js** | Counter angka statistik, page loader, titik loading |
| Reveal sederhana | **AOS** | Fade/slide ketika kartu atau list masuk layar |
| Carousel | **Swiper** | Testimoni, galeri prestasi, alumni, logo partner |
| Ikon | **Lordicon** (+ fallback lucide) | Menu CMS, tombol aksi, status toast |
| Ilustrasi | **Lottie** (`lottie-react`) | Empty state, 404, sukses, halaman login, loader |
| Grafik | **Chart.js** (`react-chartjs-2`) | Dashboard CMS |
| Login CMS | **Auth.js v5** (`next-auth`) | Credentials (email + password) memakai tabel `Admin` |

Komponen Aceternity aslinya memakai library `motion`. Di proyek ini semuanya sudah dipindahkan ke GSAP/CSS supaya hanya ada satu mesin animasi utama dan bundle lebih ringan.

---

## 3. Token

Semua token didefinisikan sebagai CSS variable di `src/app/globals.css` lalu dipetakan ke Tailwind lewat `@theme inline`. Artinya Anda bisa memakai `bg-primary`, `text-brand-700`, `rounded-xl`, `shadow-soft`, dan seterusnya.

### Warna

| Token | Nilai | Class Tailwind | Kapan dipakai |
|---|---|---|---|
| `--brand-50 … --brand-900` | merah UISI | `bg-brand-600`, `text-brand-700`… | Palet brand lengkap |
| `--primary` | `brand-600` `#dc2626` | `bg-primary` | Tombol utama, link aktif |
| `--foreground` | `#18181b` | `text-foreground` | Teks utama |
| `--muted-foreground` | `#71717a` | `text-muted-foreground` | Teks sekunder |
| `--border` | `#e4e4e7` | `border` | Garis kartu & input |
| `--success` / `--success-soft` | hijau | `text-success`, `bg-success-soft` | Berhasil |
| `--warning` / `--warning-soft` | amber | `text-warning` | Peringatan |
| `--info` / `--info-soft` | biru | `text-info` | Informasi |
| `--danger` / `--danger-soft` | merah | `text-danger` | Error & aksi hapus |
| `--chart-1 … --chart-5` | merah, zinc, amber, biru, hijau | — | Urutan warna seri chart |

Aturan praktis: jangan menulis kode hex langsung di komponen. Pakai token di atas supaya bila warna brand berubah, cukup ganti satu tempat.

### Tipografi

| Peran | Font | Ukuran | Class |
|---|---|---|---|
| Display / judul hero | Noto Serif Display 300 | 48–72px | `font-serif text-5xl` |
| Heading 1 | Inter bold | 36px | `text-4xl font-bold` |
| Heading 2 | Inter bold | 24px | `text-2xl font-bold` |
| Heading 3 | Inter semibold | 18px | `text-lg font-semibold` |
| Body | Inter | 16px | `text-base` |
| Small / caption | Inter | 14px / 12px | `text-sm`, `text-xs text-muted-foreground` |

### Bentuk, bayangan & gerak

| Token | Nilai | Class |
|---|---|---|
| `--radius` | 12px | `rounded-lg` (sm/md/xl/2xl turunan) |
| `--shadow-soft` | bayangan halus netral | `shadow-soft` |
| `--shadow-lift` | bayangan merah saat hover | `shadow-lift` |
| `--duration-fast / base / slow` | 150 / 300 / 600ms | — |
| `--ease-out` | `cubic-bezier(0.22,1,0.36,1)` | `ease-brand` |

---

## 4. Komponen

Semua komponen custom bisa diimpor dari satu pintu:

```jsx
import { AppIcon, Banner, ChartCard, EmptyState, LottiePlayer, Modal, PageLoader, Spinner, StatCard, useConfirm } from '@/components/ds'
import notify from '@/lib/notify'
```

### Button (shadcn)
Varian: `default` (merah), `dark`, `outline`, `secondary`, `ghost`, `link`, `destructive`. Ukuran: `sm`, `default`, `lg`, `icon`. Untuk link gunakan `asChild`.

```jsx
<Button>Simpan</Button>
<Button variant="outline" size="sm">Batal</Button>
<Button asChild><Link href="/admin">Buka CMS</Link></Button>
```

### Toast — pengganti `alert()`
`<Toaster />` sudah dipasang di root layout, jadi cukup panggil `notify`.

```jsx
notify.success('Galeri berhasil disimpan')
notify.error('Gagal upload', { description: err.message })
notify.promise(saveData(), { loading: 'Menyimpan…', success: 'Tersimpan', error: 'Gagal menyimpan' })
```

### Confirm dialog — pengganti `confirm()`
Berbasis Promise sehingga alurnya tetap sederhana.

```jsx
const confirm = useConfirm()
const ok = await confirm({ title: 'Hapus galeri ini?', description: 'Data tidak bisa dikembalikan.', tone: 'danger' })
if (!ok) return
```
`tone: 'default'` untuk konfirmasi yang bukan penghapusan (misalnya logout).

### Modal
Dibangun di atas shadcn Dialog, dengan isi yang muncul bertahap (GSAP stagger). Ukuran `sm | md | lg | xl`.

```jsx
<Modal open={open} onOpenChange={setOpen} title="Tambah Prestasi" icon={<AppIcon name="trophy" />}
  footer={<><Button variant="outline" onClick={() => setOpen(false)}>Batal</Button><Button>Simpan</Button></>}>
  …form…
</Modal>
```

### Banner
Pengumuman atau status di bagian atas halaman. Varian: `brand`, `info`, `success`, `warning`, `danger`. Dengan `storageKey`, banner yang sudah ditutup tidak muncul lagi di browser yang sama.

```jsx
<Banner variant="brand" title="Pendaftaran dibuka!" dismissible storageKey="pmb-2026" action={<Button size="sm" variant="secondary">Daftar</Button>} />
```

### Loading
- `PageLoader`: loader satu layar penuh (logo berdenyut + titik anime.js + bar shimmer). Otomatis dipakai oleh `app/loading.jsx` dan `app/admin/loading.jsx`.
- `DotsLoader`: tiga titik brand, untuk area kecil.
- `Spinner`: di dalam tombol (`<Button disabled><Spinner /> Menyimpan…</Button>`).
- `Skeleton`: placeholder shimmer saat data belum datang.

### StatCard & CountUp
Kartu angka dashboard; angkanya menghitung naik memakai anime.js.

```jsx
<StatCard title="Total Prestasi" value={stats.achievements} icon="trophy" href="/admin/achievements" />
```

### ChartCard
Pembungkus Chart.js dengan default tema (font Inter, tooltip gelap, legend bulat). Tipe: `bar`, `line`, `doughnut`.

```jsx
<ChartCard type="bar" title="Prestasi per Tahun" data={{ labels, datasets: [{ label: 'Nasional', data, backgroundColor: '#dc2626', borderRadius: 6 }] }} />
```

### EmptyState & LottiePlayer
Ilustrasi bawaan di `public/lottie/`: `loader`, `success`, `empty`, `not-found`, `secure`. Semuanya dibuat khusus dengan palet brand, sehingga tidak bergantung pada CDN luar.

```jsx
<EmptyState title="Belum ada galeri" description="Tambahkan galeri pertama." action={<Button>Tambah</Button>} />
<LottiePlayer name="success" className="w-32" loop={false} />
```

### AppIcon (Lordicon + fallback)
Semua ikon dipanggil lewat nama, misalnya `<AppIcon name="trash" />`. Daftar nama ada di `src/lib/icons.js`.

Cara mengaktifkan animasi Lordicon untuk sebuah ikon:
1. Pilih ikon di [lordicon.com](https://lordicon.com) lalu unduh dalam format **Lottie JSON**.
2. Simpan di `public/icons/lordicon/<nama>.json`.
3. Di `src/lib/icons.js`, isi `lordicon: '/icons/lordicon/<nama>.json'` (atau URL CDN `https://cdn.lordicon.com/<id>.json`).

Selama slot `lordicon` masih kosong, ikon lucide yang dipakai, lengkap dengan efek hover kecil, sehingga tampilan tidak pernah rusak.

### Efek Aceternity
| Komponen | Gunakan di |
|---|---|
| `Spotlight` | Hero gelap, memberi sorotan merah |
| `BackgroundBeams` | Latar hero / panel login |
| `BackgroundGrid` (`grid` / `dot`) | Latar section terang |
| `TextGenerateEffect` | Judul yang muncul per kata |
| `HoverCard` | Kartu fitur/keunggulan |
| `MovingBorderButton` | CTA sekunder yang ingin menonjol |

Batasi maksimal satu efek "besar" (Spotlight/Beams) per layar agar halaman tetap ringan.

---

## 5. Aturan animasi

| Situasi | Pakai | Contoh |
|---|---|---|
| Elemen besar, berurutan, atau terikat scroll | GSAP (`useGSAP`, ScrollTrigger, SplitText) | Hero, judul section, sidebar |
| Angka, ikon kecil, loader | anime.js | Counter dashboard, `DotsLoader` |
| Kartu/list cukup muncul saat terlihat | AOS (`data-aos="fade-up"`) | Kartu prestasi, galeri |
| Geser konten horizontal | Swiper | Testimoni, alumni |

Beberapa aturan supaya animasi konsisten dan tidak bermasalah:
- Selalu pakai `useGSAP` (bukan `useEffect`) agar animasi dibersihkan otomatis saat komponen dilepas.
- Untuk animasi masuk gunakan `gsap.fromTo` dengan nilai akhir eksplisit, bukan `gsap.from`. `from` bisa "macet" di nilai awal bila komponen dirender ulang atau elemen punya CSS transition.
- Jangan pasang `transition-all` pada elemen yang dianimasikan GSAP; tulis properti transisinya secara spesifik.
- Durasi standar 0.3–0.8 detik, easing `power3.out` (GSAP) / `outExpo` (anime.js) / `ease-out-cubic` (AOS).
- GSAP plugins dan AOS sudah diinisialisasi di `src/components/providers/AnimationProvider.jsx`; jangan memanggil `AOS.init` lagi di halaman.

---

## 6. Autentikasi CMS (Auth.js)

- Konfigurasi: `src/auth.config.js` (aman untuk middleware) dan `src/auth.js` (provider Credentials + Prisma + bcrypt).
- Handler: `src/app/api/auth/[...nextauth]/route.js`.
- Proteksi di `src/middleware.js`:
  - `/admin/*` dan `/design-system` wajib login, jika belum diarahkan ke `/admin/login?callbackUrl=…`.
  - Semua API dengan method `POST/PUT/PATCH/DELETE` wajib login (termasuk `/api/auth/register`), jika tidak dibalas `401`.
- Di komponen client: `useSession()`, `signIn('credentials', { email, password, redirect: false })`, `signOut()`.
- Environment: `AUTH_SECRET` (wajib di production; `JWT_SECRET` lama tetap diterima sebagai cadangan).

---

## 7. Aksesibilitas

- Kontras teks minimal setara `text-zinc-500` di atas putih; teks di atas merah selalu putih.
- Semua tombol ikon wajib punya `aria-label`.
- Modal dan confirm memakai Radix Dialog: fokus terkunci di dalam, `Esc` untuk menutup.
- Ilustrasi Lottie diberi `aria-label`; ikon dekoratif memakai `aria-hidden`.
- `prefers-reduced-motion` mematikan animasi CSS, AOS, dan memperpendek transisi.

---

## 8. Struktur folder

```
src/
  app/design-system/page.jsx    # showcase live
  components/
    ui/                          # shadcn/ui (JSX)
    ds/                          # komponen custom Sisfor DS
    aceternity/                  # efek Aceternity (port GSAP/CSS)
    providers/                   # AnimationProvider, AppProviders
  lib/
    utils.js  (cn)   notify.js  (toast)   icons.js  (registry ikon)   chart.js  (setup Chart.js)
  auth.js  auth.config.js
public/lottie/                   # ilustrasi Lottie bertema
components.json                  # konfigurasi shadcn CLI
```

Menambah komponen shadcn baru bisa lewat CLI (`npx shadcn@latest add <komponen>`); file akan masuk ke `src/components/ui` dalam format JSX sesuai `components.json`.
