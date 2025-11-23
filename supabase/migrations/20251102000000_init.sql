-- Tabel users untuk menyimpan data pengguna
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  nama_lengkap TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT,
  googleId TEXT UNIQUE,
  tanggal_registrasi TIMESTAMP DEFAULT NOW()
);

-- Tabel kategori untuk menyimpan kategori
CREATE TABLE kategori (
  id_kategori uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_kategori text NOT NULL,
  jenis_kategori NOT NULL
);
CREATE TYPE jenis_kategori AS ENUM ('pemasukan', 'pengeluaran');