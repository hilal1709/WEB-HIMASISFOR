# 🚀 Panduan Deploy ke Vercel dengan Database

Panduan lengkap untuk deploy aplikasi Next.js + Prisma ke Vercel dengan database PostgreSQL.

## 📋 Persiapan Sebelum Deploy

### 1. Push Code ke GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

## 🗄️ Setup Database PostgreSQL

Anda perlu database PostgreSQL yang bisa diakses dari internet. Pilih salah satu opsi:

### Opsi A: Vercel Postgres (Rekomendasi - Paling Mudah)
1. Gratis untuk starter
2. Terintegrasi otomatis dengan Vercel
3. Setup langsung dari Vercel Dashboard

### Opsi B: Neon (Gratis + Generous Free Tier)
1. Kunjungi [neon.tech](https://neon.tech)
2. Sign up gratis
3. Create new project
4. Copy connection string

### Opsi C: Supabase (Gratis)
1. Kunjungi [supabase.com](https://supabase.com)
2. Sign up gratis  
3. Create new project
4. Database → Settings → Connection String
5. Copy connection string dengan password

### Opsi D: Railway (Gratis $5 credit)
1. Kunjungi [railway.app](https://railway.app)
2. Sign up gratis
3. New Project → Deploy PostgreSQL
4. Copy connection string

## 🌐 Deploy ke Vercel

### Step 1: Import Project ke Vercel

1. Kunjungi [vercel.com](https://vercel.com)
2. Sign up / Login dengan GitHub
3. Klik **"Add New..."** → **"Project"**
4. Import repository GitHub Anda
5. Vercel akan otomatis detect Next.js

### Step 2: Configure Environment Variables

Di Vercel Dashboard, sebelum deploy, tambahkan environment variables:

#### Jika pakai Vercel Postgres:
1. Klik tab **"Storage"**
2. Klik **"Create Database"** → **"Postgres"**
3. Environment variable `POSTGRES_URL` akan otomatis ditambahkan
4. Tambahkan variable lain:
   ```
   DATABASE_URL = $POSTGRES_PRISMA_URL
   JWT_SECRET = [generate random string di https://generate-secret.vercel.app]
   ```

#### Jika pakai database eksternal (Neon/Supabase/Railway):
1. Klik tab **"Settings"** → **"Environment Variables"**
2. Tambahkan:
   ```
   DATABASE_URL = postgresql://user:password@host:5432/database?schema=public
   JWT_SECRET = [generate random string]
   ```

**PENTING**: 
- Untuk database eksternal, tambahkan `?connection_limit=1&pool_timeout=0` atau `?pgbouncer=true` di akhir DATABASE_URL jika pakai serverless
- Contoh: `postgresql://user:pass@host:5432/db?schema=public&connection_limit=1`

### Step 3: Deploy Settings

Di **"Build & Development Settings"**:
- Framework Preset: **Next.js** (auto-detected)
- Build Command: `prisma generate && next build` (sudah ada di package.json)
- Output Directory: `.next` (default)
- Install Command: `npm install` (default)

Klik **"Deploy"** dan tunggu proses selesai (3-5 menit untuk first deploy).

## 🔄 Migrasi Database

Setelah deploy pertama kali, Anda perlu menjalankan migration:

### Opsi 1: Dari Local (Rekomendasi)

1. Copy DATABASE_URL dari Vercel Environment Variables
2. Buat file `.env` di local:
   ```
   DATABASE_URL="postgresql://..."
   ```
3. Jalankan migration:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed  # jika ada seed
   ```

### Opsi 2: Via Prisma Studio
```bash
npx prisma studio
```
Tambahkan data secara manual via UI.

### Opsi 3: Dari Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Pull environment variables
vercel env pull

# Run migration
npx prisma migrate deploy
```

## 🔐 Membuat Admin User

Setelah migration, buat user admin:

### Via Script (Rekomendasi)
```bash
# Pastikan DATABASE_URL sudah di .env
node setup-admin.mjs
```

### Manual via Prisma Studio
```bash
npx prisma studio
```
Buat record di tabel `Admin`.

## ✅ Verifikasi Deployment

1. **Cek Database Connection**: 
   - Buka `https://your-app.vercel.app/api/test-db`
   - Harus return sukses

2. **Test Login Admin**:
   - Buka `https://your-app.vercel.app/admin/login`
   - Login dengan credential yang dibuat

3. **Cek Error Logs**:
   - Di Vercel Dashboard → Project → Deployments
   - Klik deployment → "Runtime Logs"

## 🔧 Troubleshooting

### Error: "Can't reach database server"
- ✅ Pastikan DATABASE_URL benar
- ✅ Cek koneksi database masih aktif (tidak sleep/paused)
- ✅ Tambahkan `?connection_limit=1` di connection string
- ✅ Whitelist IP Vercel di database firewall (jika ada)

### Error: "Error: P1001"
Database connection timeout:
```bash
DATABASE_URL="postgresql://...?connection_limit=1&pool_timeout=0"
```

### Error: "Error: P3009"
Migration belum jalan. Run:
```bash
npx prisma migrate deploy
```

### Error: "PrismaClient is unable to run in this browser environment"
Prisma di-import di client component. Pastikan:
- API routes pakai Prisma, bukan client components
- Server components pakai `'use server'` directive

### Build Error: "prisma:client" not found
Tambahkan `postinstall` script di package.json (sudah ditambahkan):
```json
"postinstall": "prisma generate"
```

### Slow Performance
Untuk production, consider:
1. Connection pooling (PgBouncer)
2. Prisma Accelerate
3. Edge runtime untuk API routes

## 🔄 Update/Redeploy

Setelah push ke GitHub, Vercel otomatis deploy:
```bash
git add .
git commit -m "Update feature"
git push origin main
```

Jika ada perubahan schema database:
```bash
# 1. Buat migration di local
npx prisma migrate dev --name nama_migration

# 2. Push ke GitHub
git add .
git commit -m "Add migration"
git push

# 3. Setelah Vercel deploy, run migration
vercel env pull
npx prisma migrate deploy
```

## 📚 Resources

- [Vercel Docs](https://vercel.com/docs)
- [Prisma + Vercel Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

## 🎉 Tips Production

1. **Environment Variables**: Jangan commit file `.env` ke Git
2. **Database Backup**: Setup automated backup di provider database
3. **Monitoring**: Gunakan Vercel Analytics
4. **Custom Domain**: Hubungkan domain di Vercel Settings
5. **SSL**: Otomatis dari Vercel
6. **CDN**: Otomatis untuk static assets

---

**Selamat! Aplikasi Anda sudah live di Vercel! 🎊**
