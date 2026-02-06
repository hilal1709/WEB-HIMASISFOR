# CMS Kurikulum - Dokumentasi

## Overview
CMS Kurikulum memungkinkan admin untuk mengelola mata kuliah per semester pada halaman kurikulum website Sistem Informasi UISI.

## Fitur Utama

### 1. Kelola Informasi Umum
- **Judul**: Judul utama halaman kurikulum (default: "Kurikulum Program Studi")
- **Subtitle**: Subjudul halaman (default: "Sistem Informasi Bisnis")

### 2. Kelola Semester
- **Tambah Semester Baru**: Menambahkan semester baru secara otomatis dengan nomor semester berikutnya
- **Hapus Semester**: Menghapus semester beserta semua mata kuliah di dalamnya
- **Auto-numbering**: Nomor semester akan otomatis disesuaikan saat ada penghapusan

### 3. Kelola Mata Kuliah
- **Tambah Mata Kuliah**: Menambahkan mata kuliah baru ke semester tertentu dengan nama dan SKS
- **Edit Mata Kuliah**: Mengubah nama dan SKS mata kuliah yang sudah ada
- **Hapus Mata Kuliah**: Menghapus mata kuliah dari semester
- **Total SKS**: Otomatis menghitung total SKS per semester

## Cara Menggunakan

### Akses CMS Kurikulum
1. Login ke admin panel di `/admin/login`
2. Pilih menu **"Kelola Kurikulum"** dari sidebar

### Mengelola Informasi Umum
1. Edit field **Judul** dan **Subtitle** di bagian paling atas
2. Klik tombol **"Simpan Kurikulum"** di bagian bawah untuk menyimpan perubahan

### Menambah Semester Baru
1. Scroll ke bagian bawah halaman
2. Klik tombol **"+ Tambah Semester Baru"**
3. Semester baru akan muncul dengan nomor semester berikutnya
4. Tambahkan mata kuliah ke semester tersebut

### Menghapus Semester
1. Di setiap card semester, klik tombol **"Hapus Semester"** di pojok kanan atas
2. Konfirmasi penghapusan
3. Nomor semester akan otomatis di-renumber

### Menambah Mata Kuliah
1. Pada semester yang diinginkan, klik tombol **"+ Tambah Mata Kuliah"**
2. Form input akan muncul di bagian bawah tabel
3. Isi **Nama Mata Kuliah** dan **SKS** (SKS boleh dikosongkan untuk mata kuliah elective)
4. Klik tombol **"Simpan"** untuk menambahkan
5. Atau klik **"Batal"** untuk membatalkan

### Mengedit Mata Kuliah
1. Klik tombol **"Edit"** pada mata kuliah yang ingin diubah
2. Form edit akan muncul inline di tabel
3. Ubah nama dan/atau SKS
4. Klik **"Simpan"** untuk menyimpan perubahan
5. Atau klik **"Batal"** untuk membatalkan

### Menghapus Mata Kuliah
1. Klik tombol **"Hapus"** pada mata kuliah yang ingin dihapus
2. Konfirmasi penghapusan

### Menyimpan Perubahan
1. Setelah melakukan perubahan, scroll ke bagian bawah
2. Klik tombol **"Simpan Kurikulum"**
3. Pesan sukses akan muncul jika penyimpanan berhasil
4. Perubahan akan langsung terlihat di halaman kurikulum publik

## Struktur Data

Data kurikulum disimpan dalam format JSON dengan struktur:

```json
[
  {
    "semester": 1,
    "matkul": [
      {
        "nama": "Nama Mata Kuliah",
        "sks": 3
      }
    ]
  }
]
```

- **semester**: Nomor semester (1-8)
- **matkul**: Array berisi daftar mata kuliah
  - **nama**: Nama mata kuliah (string)
  - **sks**: Jumlah SKS (number atau null untuk elective)

## API Endpoints

### GET /api/curriculum
Mengambil data kurikulum dari database

**Response:**
```json
{
  "section": "curriculum",
  "title": "Kurikulum Program Studi",
  "subtitle": "Sistem Informasi Bisnis",
  "data": [ /* array semester */ ]
}
```

### PUT /api/curriculum
Update data kurikulum

**Request Body:**
```json
{
  "title": "Kurikulum Program Studi",
  "subtitle": "Sistem Informasi Bisnis",
  "data": [ /* array semester */ ]
}
```

## Halaman Publik

Halaman kurikulum publik dapat diakses di `/curiculum` (perhatikan typo di URL yang sudah ada).

Halaman ini akan menampilkan:
- Judul dan subtitle dari CMS
- Tabel mata kuliah per semester dengan nomor, nama, dan SKS
- Total SKS per semester
- Mata kuliah pilihan (hardcoded, belum terkoneksi dengan CMS)

## Tips & Best Practices

1. **Validasi SKS**: Pastikan SKS yang diinput valid (1-6 SKS untuk mata kuliah normal)
2. **Mata Kuliah Elective**: Gunakan SKS = null atau kosongkan untuk mata kuliah elective
3. **Backup Data**: Sebelum melakukan perubahan besar, simpan data kurikulum terlebih dahulu
4. **Konsistensi**: Gunakan format penulisan yang konsisten untuk nama mata kuliah
5. **Total SKS**: Periksa total SKS per semester (umumnya 18-24 SKS per semester)

## Troubleshooting

### Data tidak muncul di halaman publik
- Pastikan sudah mengklik tombol "Simpan Kurikulum"
- Refresh halaman publik (Ctrl+F5)
- Periksa console browser untuk error

### Tombol tidak berfungsi
- Pastikan tidak ada proses save yang sedang berjalan
- Periksa koneksi internet dan database

### Error saat menyimpan
- Periksa format data (nama dan SKS harus valid)
- Pastikan database terkoneksi dengan baik
- Cek log error di browser console atau server

## Inisialisasi Data Default

Untuk menginisialisasi data kurikulum default, jalankan:

```bash
node prisma/seed-curriculum.js
```

Script ini akan mengisi database dengan data kurikulum default 8 semester jika belum ada.
