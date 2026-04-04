# Sisfor Financial Management System (finanPro)

Sistem Informasi Keuangan (Sisfor) yang dibangun menggunakan Next.js, Prisma, dan PostgreSQL (Supabase).

## 🚀 Cara Menjalankan Project (Quick Start)

Pilih salah satu metode di bawah ini:

### Metode 1: Menggunakan Docker
Pastikan sudah menginstal **Docker Desktop**.

1. Salin file `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
2. Isi variabel di dalam `.env` (DATABASE_URL, SUPABASE_KEY, dll).
3. Jalankan perintah berikut:
   ```bash
   docker-compose up --build
   ```
4. Buka [http://localhost:3000](http://localhost:3000).

---

### Metode 2: Menjalankan Secara Lokal (Node.js)
Pastikan Anda menggunakan **Node.js 20+**.

1. Salin dan isi file `.env`:
   ```bash
   cp .env.example .env
   ```
2. Instal dependensi:
   ```bash
   npm install
   ```
3. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```
4. Jalankan mode development:
   ```bash
   npm run dev
   ```

---

## 🛠 Konfigurasi Environment (.env)

| Variabel | Deskripsi |
| --- | --- |
| `DATABASE_URL` | URL koneksi PostgreSQL (Supabase) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon Key dari dashboard Supabase |
| `GMAIL_USER` | Email Gmail untuk pengiriman OTP |
| `GMAIL_APP_PASSWORD` | App Password dari akun Google |

---

## 📁 Struktur Folder
- `/app`: Rute dan halaman Next.js (App Router).
- `/components`: Komponen UI reusable.
- `/prisma`: Skema database dan migrasi.
- `/lib`: Utility dan konfigurasi (database connection, auth, dll).

