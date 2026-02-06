# Panduan Kelola Galeri Prestasi

## Masalah di Vercel Production

Vercel memiliki **filesystem read-only**, jadi upload file langsung tidak bisa dilakukan di production. File hanya bisa di-upload di development local.

## Solusi untuk Menambah Galeri

### Opsi 1: Upload Manual ke Folder Public (Recommended)

1. Upload gambar ke folder `/public/img/award/` secara manual melalui:
   - FTP/SFTP
   - Git commit & push
   - VS Code langsung

2. Setelah file ada di folder public, masukkan URL di form:
   ```
   Foto Penghargaan: /img/award/nama-gambar.jpg
   Foto Profil: /img/award/nama-profil.jpg
   ```

### Opsi 2: Gunakan External Storage (Future Implementation)

Untuk production yang lebih baik, pertimbangkan menggunakan:
- **Cloudinary** (Free tier: 25GB storage, 25GB bandwidth/bulan)
- **Vercel Blob Storage** (Berbayar)
- **AWS S3** (Pay as you go)

## Cara Menambah Galeri di Production

1. Buka halaman Admin Gallery → Tambah Galeri
2. Isi form:
   - **Foto Penghargaan (Required)**: Masukkan URL gambar, contoh: `/img/award/piala-2025.jpg`
   - **Foto Profil (Optional)**: Masukkan URL foto profil, contoh: `/img/award/john-doe.jpg`
   - **Judul Prestasi**: Contoh: "Juara 1 Lomba Web Design"
   - **Nama Penerima**: Nama mahasiswa/tim
   - **Tahun**: Tahun prestasi
   - **Deskripsi**: Deskripsi singkat (optional)
   - **Urutan Tampilan**: Angka kecil = tampil lebih awal
   - **Status**: Aktif/Tidak Aktif

3. Klik "Simpan Galeri"

## File Structure

```
public/
├── img/
│   ├── award/          <- Upload gambar prestasi disini
│   │   ├── piala-2025.jpg
│   │   ├── sertifikat-lomba.jpg
│   │   └── john-doe.jpg
│   ├── alumni/
│   ├── dosen/
│   └── ...
```

## Error yang Sudah Diperbaiki

✅ Upload file gagal → Sekarang bisa pakai manual URL
✅ Form submit meski gambar kosong → Sekarang ada validasi
✅ Error 400 Bad Request → Sekarang ada error message yang jelas
✅ Foto profil wajib → Sekarang opsional

## Tips

- Gunakan nama file yang descriptive: `juara1-lomba-web-2025.jpg`
- Gunakan format JPG/PNG
- Kompres gambar sebelum upload (max 500KB untuk performa)
- Gunakan URL relatif yang dimulai dengan `/img/award/...`
