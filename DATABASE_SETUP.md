# Web Sisfor - Next.js dengan PostgreSQL

## Setup Database PostgreSQL

### 1. Konfigurasi Database
Edit file `.env` dan sesuaikan dengan konfigurasi PostgreSQL Anda:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name?schema=public"
```

Contoh:
```env
DATABASE_URL="postgresql://postgres:password123@localhost:5432/sisfor_db?schema=public"
```

### 2. Generate Prisma Client
Setelah mengkonfigurasi `.env`, jalankan:

```bash
npx prisma generate
```

### 3. Migrasi Database
Untuk membuat tabel di database PostgreSQL:

```bash
npx prisma migrate dev --name init
```

Atau jika database sudah ada dan ingin sync schema:

```bash
npx prisma db push
```

### 4. Prisma Studio (GUI Database)
Untuk melihat dan mengelola data dengan GUI:

```bash
npx prisma studio
```

## API Endpoints

Setelah setup selesai, Anda dapat mengakses:

- **Test Koneksi Database**: `GET http://localhost:3000/api/test-db`
- **Alumni API**: 
  - `GET http://localhost:3000/api/alumni` - Get all alumni
  - `POST http://localhost:3000/api/alumni` - Create alumni baru
- **Achievements API**: 
  - `GET http://localhost:3000/api/achievements` - Get all achievements
  - `POST http://localhost:3000/api/achievements` - Create achievement baru

## Database Schema

Schema yang sudah dibuat di `prisma/schema.prisma`:

- **User** - Data pengguna
- **Alumni** - Data alumni (nama, nim, tahun lulus, pekerjaan, foto)
- **Achievement** - Data prestasi (title, description, category, date, image)

## Cara Menggunakan

1. Pastikan PostgreSQL sudah running
2. Update kredensial database di `.env`
3. Generate Prisma client: `npx prisma generate`
4. Migrate database: `npx prisma migrate dev`
5. Run development server: `npm run dev`
6. Test koneksi: buka `http://localhost:3000/api/test-db`

## Troubleshooting

- Jika error "prisma client not generated", jalankan: `npx prisma generate`
- Jika error koneksi database, cek kredensial di `.env`
- Jika tabel belum ada, jalankan: `npx prisma migrate dev` atau `npx prisma db push`
